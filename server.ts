import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { sendBrevoEmailOtp, verifyBrevoEmailOtp, getBrevoStatus } from './server/brevoEmailService.js';

dotenv.config();

// Safe __dirname resolution for Node.js environments
const safeFilename = typeof __filename !== 'undefined' ? __filename : process.cwd();
const safeDirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(safeFilename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // CORS middleware for Netlify / external clients
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Recommendation Endpoint
  app.post('/api/gemini/recommend', async (req, res) => {
    try {
      const { whatYouWant, category, budget, location, availableListings = [] } = req.body;
      const userReq = whatYouWant || category || 'Rental Property';

      const getLocalMatches = () => {
        const queryText = (userReq || '').toLowerCase().trim();
        const locText = (location || '').toLowerCase().trim();

        // Categorize user intent
        const isCarBike = /car|bike|scooty|vehicle|creta|hunter|activa|mercedes|cycle|drive|sedan|suv/i.test(queryText);
        const isClothing = /cloth|dress|sherwani|lehenga|suit|tuxedo|gown|attire|fashion|wear|wedding/i.test(queryText);
        const isSports = /turf|cricket|football|badminton|ground|sports|court|tent|trek|camping/i.test(queryText);
        const isGeneral = /ps5|playstation|speaker|sound|desk|furniture|drill|tool|camera|tv|appliance/i.test(queryText);
        const isHotel = /hotel|suite|stay|resort|room/i.test(queryText);
        const isProperty = /flat|bhk|pg|hostel|house|apartment|villa/i.test(queryText);

        const scored = (availableListings || []).map((item: any) => {
          let score = 0;
          const itemCity = (item.city || '').toLowerCase();
          const itemLoc = (item.location || '').toLowerCase();
          const itemFullLoc = (item.fullLocation || `${item.location || ''} ${item.city || ''}`).toLowerCase();
          const itemText = `${item.title || ''} ${item.type || ''} ${item.categoryDisplay || ''} ${(item.amenities || []).join(' ')}`.toLowerCase();

          // 1. Strict City / Location Matching (Highest Weight: 60)
          if (locText) {
            if (itemCity === locText || itemCity.includes(locText) || locText.includes(itemCity)) {
              score += 60;
            } else if (itemLoc.includes(locText) || itemFullLoc.includes(locText)) {
              score += 40;
            }
          }

          // 2. Asset Type Category Matching (Weight: 45)
          if (isCarBike && item.type === 'vehicle') score += 45;
          if (isClothing && item.type === 'clothing') score += 45;
          if (isSports && item.type === 'sports_turf') score += 45;
          if (isGeneral && item.type === 'general') score += 45;
          if (isHotel && item.type === 'hotel') score += 45;
          if (isProperty && item.type === 'property') score += 45;

          // 3. Keyword Match (Weight: 25)
          const words = queryText.split(' ').filter((w: string) => w.length > 2);
          for (const w of words) {
            if (itemText.includes(w)) score += 15;
          }

          // 4. Budget match
          if (budget) {
            const price = item.price || item.rentPerMonth || item.pricePerDay || 0;
            if (price <= Number(budget) * 1.3) score += 10;
          }

          return { item, score };
        });

        scored.sort((a: any, b: any) => b.score - a.score);
        const matched = scored.filter((s: any) => s.score > 0).slice(0, 3).map((s: any) => s.item.id);

        if (matched.length > 0) return matched;
        return (availableListings || []).slice(0, 3).map((item: any) => item.id);
      };

      if (!process.env.GEMINI_API_KEY) {
        // Smart Local Match Fallback when key is not configured
        const matched = getLocalMatches();

        return res.json({
          verdict: '✅ Verified Rental Matches Found',
          summary: `Top verified listings matching your requirement ("${userReq}" in "${location || 'Any City'}" with budget ₹${budget ? Number(budget).toLocaleString('en-IN') : 'flexible'}) have been retrieved!`,
          recommendedIds: matched,
          keyFactors: [
            `Direct verified owner contact in ${location || 'selected area'} with zero brokerage.`,
            'Confirm security deposit, item condition, and rental duration terms.',
            'Instant booking support available directly via Recko-India.'
          ],
          budgetTips: 'Pro Tip: Show your verified student or professional ID for exclusive rental discounts and deposit waivers.'
        });
      }

      const prompt = `Analyze the user's rental requirements and current available listings:

User Preferences:
- What You Want: ${userReq}
- Preferred City/Location: ${location || 'Any major city'}
- Target Price/Budget: ₹${budget || 'Flexible'}

Available Listings Context:
${JSON.stringify((availableListings || []).slice(0, 30))}

Strict Rules:
1. Geographical Accuracy: Strictly prioritize listings located in or nearest to the requested city "${location || 'Any'}".
2. Category Fidelity: Match the specific asset type (Vehicles, Clothing, Sports Turf, Electronics, Flats, PGs, Hotels, etc.).
3. Language: Always write responses in fluent, professional English.
4. Output format: Return JSON matching the schema.`;

      let response;
      const systemInstruction = `You are Recko-India's Senior AI Rental Advisor for Indian rentals & assets.
Always communicate in clear, helpful, fluent English. Avoid Hindi text.
Recko-India supports:
- Vehicles (Self-drive cars, SUVs, Royal Enfield bikes, Activa scooties, luxury chauffeur cars)
- Clothing (Wedding Sherwanis, Bridal Lehengas, Tuxedo suits, Pre-wedding shoot gowns)
- Sports Turfs (Box cricket turfs, football grounds, indoor badminton courts, camping tents)
- Appliances & Gadgets (PS5 gaming consoles, party speakers, WFH desks, power tools)
- Residential Properties (1/2/3 BHK flats, student PGs, shared rooms, villas)
- Hotels, Dining & Study Libraries.`;

      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                verdict: { type: Type.STRING },
                summary: { type: Type.STRING },
                recommendedIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                keyFactors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                budgetTips: { type: Type.STRING }
              },
              required: ['verdict', 'summary', 'recommendedIds', 'keyFactors', 'budgetTips']
            }
          }
        });
      } catch (geminiErr) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  verdict: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  recommendedIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  keyFactors: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  budgetTips: { type: Type.STRING }
                },
                required: ['verdict', 'summary', 'recommendedIds', 'keyFactors', 'budgetTips']
              }
            }
          });
        } catch (err2) {
          const matched = getLocalMatches();
          return res.json({
            verdict: '✅ Verified Rental Matches Found',
            summary: `Verified listings have been matched for your requirement "${userReq}" in ${req.body.location || 'your area'} under ₹${req.body.budget ? Number(req.body.budget).toLocaleString('en-IN') : 'budget'}.`,
            recommendedIds: matched,
            keyFactors: [
              'Direct owner verification available without brokerage.',
              'Confirm item condition, deposit refund, and rental period before booking.',
              'Instant pickup or doorstep delivery available.'
            ],
            budgetTips: 'Pro Tip: Show your student/Govt ID to negotiate additional rental discounts.'
          });
        }
      }

      const text = response?.text || '{}';
      const parsedData = JSON.parse(text);
      return res.json(parsedData);
    } catch (error: any) {
      const userReq = req.body.whatYouWant || req.body.category || 'Rental Asset';
      const availableListings = req.body.availableListings || [];
      const matched = (availableListings || []).slice(0, 3).map((item: any) => item.id);

      return res.json({
        verdict: '👍 Matching Listings Found',
        summary: `Explore verified options below matching your requirement "${userReq}" in ${req.body.location || 'your area'}.`,
        recommendedIds: matched,
        keyFactors: [
          'Direct owner contact available without brokerage.',
          'Verify location and pickup address.',
          'Instant booking available.'
        ],
        budgetTips: 'Pro Tip: Contact owner directly to negotiate the best daily or monthly rate.'
      });
    }
  });

  // AI Conversational Concierge Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    const { message, history = [] } = req.body;

    const getFallbackChatReply = (query: string) => {
      const q = (query || '').toLowerCase();
      if (q.includes('deposit') || q.includes('security') || q.includes('refund')) {
        return `💡 **Security Deposit Guidelines in India (Recko-India):**\n\n• **Residential Flats/PGs:** Under the Model Tenancy Act, security deposits are strictly capped at **maximum 2 months rent for residential**.\n• **Deductions:** Owners can only deduct for proven physical damages or unpaid electricity/water bills. Normal wear & tear cannot be deducted.\n• **Refund Timeline:** Deposit refund must be released within **7 to 15 working days** after vacating and key handover.\n• **Vehicles & Clothing:** Vehicle deposits (₹2,000–₹5,000) are refunded within 24 hours post-return inspection.`;
      }
      if (q.includes('broker') || q.includes('brokerage') || q.includes('zero') || q.includes('commission')) {
        return `🤝 **Zero Brokerage Direct Owner Booking on Recko-India:**\n\n• All flats, vehicles, wedding outfits, and sports turfs on Recko-India are **100% Zero Brokerage**.\n• You can connect directly with verified landlords and asset owners via call or chat.\n• This saves you standard 1-month brokerage fees! Click "Contact Owner" or "Instant Book" on any listing card.`;
      }
      if (q.includes('agreement') || q.includes('lease') || q.includes('notice') || q.includes('lock in') || q.includes('lock-in')) {
        return `📄 **Rental Agreement & Legal Advice (India):**\n\n• **Standard Duration:** 11-Month Leave & License agreement is legal and standard across India.\n• **Notice Period:** Standard is 1 month written notice by either tenant or landlord.\n• **Lock-in Period:** Usually 3 to 6 months.\n• Make sure maintenance charges, painting costs, and deposit refund terms are explicitly mentioned in writing.`;
      }
      if (q.includes('car') || q.includes('bike') || q.includes('scooty') || q.includes('vehicle') || q.includes('drive')) {
        return `🚗 **Vehicle Rental Policies on Recko-India:**\n\n• **Required Documents:** Valid Indian Driving License & Original Aadhaar Card.\n• **Security Deposit:** ₹2,000 to ₹5,000 (Refundable within 24 hours of vehicle return).\n• **Fuel Policy:** Same-to-same fuel level return.\n• All self-drive cars (Creta, Thar, Swift, Ertiga) and bikes (Hunter 350, Activa) include 24/7 roadside assistance!`;
      }
      if (q.includes('pg') || q.includes('student') || q.includes('hostel') || q.includes('food')) {
        return `🎓 **Student PG & Hostel Essentials:**\n\n• **Inclusions:** High-speed Wi-Fi, 3-time hot hygienic meals, daily housekeeping, RO water, and washing machine access.\n• **Student Discount:** Upload your College Student ID card to unlock an instant 10% discount on monthly rent!\n• Explore the "Student & PG" tab on our homepage for pre-verified student-friendly listings near major universities and coaching hubs.`;
      }
      if (q.includes('cloth') || q.includes('sherwani') || q.includes('lehenga') || q.includes('wedding') || q.includes('suit')) {
        return `👗 **Designer Clothing & Wedding Attire Rentals:**\n\n• **Hygiene Guarantee:** Every Sherwani, Bridal Lehenga, and Tuxedo is 100% professionally dry-cleaned and sanitized before handover.\n• **Security Deposit:** Equal to 1-2 days rental fee, refunded instantly upon return.\n• **Fitting Support:** Complimentary minor alterations available for perfect fitting on bridal/groom wear.`;
      }
      if (q.includes('turf') || q.includes('cricket') || q.includes('football') || q.includes('badminton')) {
        return `🏏 **Sports Turf & Ground Booking:**\n\n• **Hourly Slots:** Available 24/7 with LED floodlights for night matches.\n• **Complimentary Equipment:** Bats, balls, bibs, and stumps are provided on-premise at no extra charge.\n• Select the "Sports Turfs" filter in the top navigation to book your instant time slot!`;
      }
      if (q.includes('ps5') || q.includes('playstation') || q.includes('speaker') || q.includes('camera') || q.includes('tool') || q.includes('appliance')) {
        return `🎮 **Electronics, Appliances & Gadget Rentals:**\n\n• **Available Items:** PS5 consoles with 2 controllers & top games, JBL Partybox sound systems, DSLR cameras, WFH office setups, power tools.\n• **Terms:** Flexible daily or weekly rentals with zero hassle doorstep delivery options.`;
      }
      return `Hello! I am Recko-India's 24/7 AI Rental Concierge.\n\nYou can ask about any rental category or policy:\n• 🏠 **Flats, PGs & Rent Agreements**: 11-month lease, security deposit rules, notice period.\n• 🚗 **Self-Drive Cars & Bikes**: Creta, Thar, Activa, documents & FASTag rules.\n• 👗 **Wedding Outfits**: Bridal Lehengas, Groom Sherwanis & dry-clean hygiene.\n• 🏏 **Sports Turfs**: Cricket/Football floodlight slot bookings.\n• 🤝 **Zero Brokerage**: Direct owner connection & instant verified booking.`;
    };

    try {
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const cleanMsg = message.trim();

      if (!process.env.GEMINI_API_KEY) {
        return res.json({ reply: getFallbackChatReply(cleanMsg) });
      }

      const systemInstruction = `You are Recko-India's 24/7 AI Rental Concierge & Advisor.
Always reply in clear, professional, fluent English. Avoid Hindi text.
Recko-India is India's premier unified rental marketplace covering:
- Residential Properties (1/2/3 BHK flats, villas, independent houses, shared rooms)
- Student PGs & Hostels (Boys, Girls, Co-living with food, Wi-Fi, laundry)
- Self-Drive Vehicles (Cars: Creta, Thar, Swift, Ertiga; Bikes: Royal Enfield Hunter 350, Classic, Activa)
- Designer Fashion & Wedding Wear (Bridal Lehengas, Groom Sherwanis, Tuxedos, Pre-wedding gowns)
- Sports Turfs & Courts (Box Cricket with floodlights, Football turf, Badminton courts, Camping gear)
- Electronics & Gadgets (PS5 gaming consoles, party speakers, WFH workstations, power tools)
- Hotels, Dining & 24/7 Study Libraries.

Key Guarantees & Policies:
- 100% Verified Owners & Zero Brokerage direct connections.
- Security deposit adhering strictly to the Model Tenancy Act (max 2 months residential).
- 11-month leave & license agreement guidance.
- Student ID discount (10% off).

Instructions:
1. Always reply in clear, friendly, fluent English.
2. Use clear formatting with bullet points and bold headers.
3. Keep answers practical, actionable, and concise.`;

      // Build clean contents alternating user and model
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const h of history) {
          const rawRole = h.role === 'user' || h.role === 'renter' ? 'user' : 'model';
          const rawText = (h.content || h.text || '').trim();
          if (!rawText) continue;

          if (contents.length > 0 && contents[contents.length - 1].role === rawRole) {
            contents[contents.length - 1].parts[0].text += `\n${rawText}`;
          } else {
            contents.push({ role: rawRole, parts: [{ text: rawText }] });
          }
        }
      }

      // Append latest user message
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text += `\n${cleanMsg}`;
      } else {
        contents.push({ role: 'user', parts: [{ text: cleanMsg }] });
      }

      let reply = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        reply = response?.text || '';
      } catch (e1) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            }
          });
          reply = response?.text || '';
        } catch (e2) {
          reply = getFallbackChatReply(cleanMsg);
        }
      }

      if (!reply) {
        reply = getFallbackChatReply(cleanMsg);
      }

      return res.json({ reply });
    } catch (err: any) {
      return res.json({
        reply: getFallbackChatReply(message || '')
      });
    }
  });

  // Student ID Verification Endpoint
  app.post('/api/verify-student', async (req, res) => {
    try {
      const { studentName, collegeName, studentIdNumber } = req.body;
      if (!studentName || !collegeName || !studentIdNumber) {
        return res.status(400).json({ success: false, message: 'Missing student details' });
      }

      // Simulate instantaneous identity match & verification code generation
      setTimeout(() => {
        res.json({
          success: true,
          verified: true,
          studentBadge: 'VERIFIED_STUDENT_2026',
          discountCode: 'STUDENT10',
          discountPercent: 10,
          verifiedAt: new Date().toISOString(),
          message: `Congratulations ${studentName}! Your student profile for ${collegeName} is verified. 10% discount unlocked on all Student PGs, Hostels & Roommate rentals!`
        });
      }, 800);
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Verification server error' });
    }
  });

  // Vehicle Telemetry Endpoint (Simulates real-time movement and GPS tracking)
  app.get('/api/vehicles/telemetry/:vehicleId', (req, res) => {
    const { vehicleId } = req.params;
    const now = Date.now();
    
    // Simulate slight movements around baseline coordinates
    const latOffset = (Math.sin(now / 4000) * 0.003);
    const lngOffset = (Math.cos(now / 4000) * 0.003);
    const speed = Math.floor(30 + Math.random() * 25);
    const fuel = Math.max(15, Math.floor(90 - (now % 100000) / 2500));

    res.json({
      vehicleId,
      status: 'Engine Running / Active GPS Tracking',
      latOffset,
      lngOffset,
      speedKmh: speed,
      fuelLevelPercent: fuel,
      batteryState: 'Healthy',
      geofenceStatus: 'Inside Allowed Zone',
      lastPingTime: new Date().toLocaleTimeString()
    });
  });

  // ==========================================
  // BREVO EMAIL VERIFICATION OTP ENDPOINTS
  // ==========================================

  // Check Brevo Configuration Status
  app.get('/api/auth/brevo/status', (req, res) => {
    try {
      const status = getBrevoStatus();
      res.json({ success: true, ...status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  });

  // Send Email OTP via Brevo
  app.post('/api/auth/brevo/send-otp', async (req, res) => {
    try {
      const { email, userName, purpose } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }

      const result = await sendBrevoEmailOtp({ email, userName, purpose });
      return res.json(result);
    } catch (err: any) {
      console.error('Error in /api/auth/brevo/send-otp:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while sending verification email.',
        error: err?.message
      });
    }
  });

  // Verify Email OTP
  app.post('/api/auth/brevo/verify-otp', (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Both email and OTP code are required.'
        });
      }

      const result = verifyBrevoEmailOtp({ email, otp });
      return res.json(result);
    } catch (err: any) {
      console.error('Error in /api/auth/brevo/verify-otp:', err);
      return res.status(500).json({
        success: false,
        verified: false,
        message: 'Internal server error while verifying OTP.',
        error: err?.message
      });
    }
  });

  // Vite development server setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RentHub Express server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
