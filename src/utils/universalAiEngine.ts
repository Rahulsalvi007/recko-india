import { Property, Vehicle, ClothingItem, SportsTurfItem, GeneralItem, Hotel, Restaurant, Library, LandlordUser, RentalBooking } from '../types';

export interface AllSystemInventory {
  properties: Property[];
  vehicles?: Vehicle[];
  clothing?: ClothingItem[];
  sportsTurfs?: SportsTurfItem[];
  generalItems?: GeneralItem[];
  hotels?: Hotel[];
  restaurants?: Restaurant[];
  libraries?: Library[];
  landlords?: LandlordUser[];
  bookings?: RentalBooking[];
  tokenAmount?: number;
}

/**
 * Universal Ultra-Accurate Real-Data-Connected AI Engine
 */
export function queryUniversalAIEngine(
  userQuery: string,
  inventory: AllSystemInventory,
  mode: 'tenant' | 'admin' = 'tenant'
): string {
  const raw = (userQuery || '').trim();
  if (!raw) {
    return '👋 Hello! Main Recko India AI Assistant hoon. Aap mujhse rental listings, prices, policies, ya kisi bhi topic par pooch sakte hain!';
  }

  const q = raw.toLowerCase();

  // Safely extract inventory arrays
  const props = inventory.properties || [];
  const vehs = inventory.vehicles || [];
  const cloths = inventory.clothing || [];
  const turfs = inventory.sportsTurfs || [];
  const gens = inventory.generalItems || [];
  const hots = inventory.hotels || [];
  const rests = inventory.restaurants || [];
  const libs = inventory.libraries || [];
  const hosts = inventory.landlords || [];
  const books = inventory.bookings || [];
  const defaultToken = inventory.tokenAmount || 99;

  const totalAssetsCount = props.length + vehs.length + cloths.length + turfs.length + gens.length + hots.length + rests.length + libs.length;

  // Detect city in user query
  const knownCities = ['jaipur', 'udaipur', 'jodhpur', 'kota', 'delhi', 'mumbai', 'bangalore', 'pune', 'goa', 'indore', 'ahmedabad'];
  const matchedCity = knownCities.find(c => q.includes(c));
  const cityNameCap = matchedCity ? matchedCity.charAt(0).toUpperCase() + matchedCity.slice(1) : '';

  // Detect language (Hinglish/Hindi vs English)
  const isHinglish = /^(hi|hello|hey|namaste|kya|kaise|kitna|chahiye|hai|batao|par|me|bhk|bhojo|kaun|milega)/i.test(q) || 
    q.includes('hai') || q.includes('chahiye') || q.includes('kitne') || q.includes('karo') || q.includes('kya');

  // -------------------------------------------------------------
  // MODE 1: ADMIN MODE SPECIFIC RESPONSES
  // -------------------------------------------------------------
  if (mode === 'admin') {
    const listingFeeTotal = totalAssetsCount * 128.62;
    const gstTotal = listingFeeTotal * (19.62 / 128.62);
    const tokenTotal = books.reduce((acc, b) => acc + (b.tokenPaidAmount || defaultToken), 0);
    const grandTotalRevenue = listingFeeTotal + tokenTotal;

    if (q.includes('revenue') || q.includes('earning') || q.includes('kamai') || q.includes('fee') || q.includes('gst') || q.includes('total') || q.includes('financial')) {
      return `### 💰 Real-Time Financial & Revenue Intelligence Report

Here is the exact live financial status of **Recko India**:

- **Total Active Listings**: \`${totalAssetsCount}\` listed items across 8 categories
- **Listing Verification Revenue (₹128.62/item)**: \`₹${listingFeeTotal.toLocaleString('en-IN')}\`
- **18% GST Tax Collected (CGST 9% + SGST 9%)**: \`₹${gstTotal.toFixed(2)}\`
- **Escrow Token Earnings**: \`₹${tokenTotal.toLocaleString('en-IN')}\`
- **Grand Total Platform Revenue**: \`₹${grandTotalRevenue.toLocaleString('en-IN')}\`

#### 📋 Fee Breakdown (Per Asset Listing):
- **Base Verification Fee**: ₹99.00
- **Platform Convenience Fee**: ₹10.00
- **18% GST Tax**: ₹19.62 (CGST ₹9.81 + SGST ₹9.81)`;
    }

    if (q.includes('fake') || q.includes('fraud') || q.includes('duplicate') || q.includes('security') || q.includes('stolen') || q.includes('audit')) {
      return `### 🛡️ AI Security & Fake Owner Detection Rules

Recko Engine inspects all listings for security violations:

1. **Duplicate Photo Signature**: Scans base64 image data to flag stolen images uploaded across different hosts.
2. **Invalid Phone Numbers**: Auto-flags dummy numbers (e.g. \`1234567890\`, \`0000000000\`, \`9999999999\`).
3. **Fake Owner Names**: Flags test accounts (e.g. \`Fake\`, \`Test\`, \`Dummy\`, \`Unknown\`).
4. **Unrealistic Pricing**: Flags rent <= ₹10 per month/day.

👉 **Admin Action**: Open **"Fake Listings / AI Audit"** tab to delete flagged items in 1-click.`;
    }

    if (q.includes('landlord') || q.includes('owner') || q.includes('host') || q.includes('approve') || q.includes('verify')) {
      const pendingHosts = hosts.filter(h => h.status === 'Pending').length;
      return `### 👥 Host Verification Queue Status

- **Total Registered Hosts**: \`${hosts.length}\` landlords
- **Pending Review**: \`${pendingHosts}\` hosts awaiting Admin approval

#### 🛠️ Host Approval Flow:
Go to Admin Portal -> **"Landlord Verification Queue"** tab -> Review Aadhaar/PAN ID proof, UPI VPA & City -> Click **"Approve & Authorize Host"**.`;
    }
  }

  // -------------------------------------------------------------
  // MODE 2: TENANT / USER REAL DATABASE ASSET SEARCH
  // -------------------------------------------------------------

  // A) Property Search (Flats, BHK, PG, Room, House)
  if (q.includes('flat') || q.includes('bhk') || q.includes('pg') || q.includes('house') || q.includes('room') || q.includes('apartment') || q.includes('villa') || q.includes('property')) {
    let matched = props;
    if (matchedCity) {
      matched = props.filter(p => (p.city || '').toLowerCase().includes(matchedCity) || (p.location || '').toLowerCase().includes(matchedCity));
    }

    if (matched.length > 0) {
      const sampleList = matched.slice(0, 4).map((p, i) => 
        `${i + 1}. 🏠 **${p.title}** (${p.bhk || p.category || 'Flat'})\n   • Rent: **₹${p.rentPerMonth?.toLocaleString('en-IN')}/month** | Deposit: ₹${p.securityDeposit?.toLocaleString('en-IN') || '2 Months'}\n   • Location: ${p.location}, ${p.city}\n   • Owner: ${p.ownerName} (${p.ownerContact || 'Verified Host'})`
      ).join('\n\n');

      return `### 🏡 Real Database Results: Properties & Flats ${cityNameCap ? `in ${cityNameCap}` : ''}

Found **${matched.length} verified listings** matching your search:

${sampleList}

---
💡 **Zero Brokerage Guarantee**: Recko India par 100% direct owner contact milta hai. Booking request par **Book Now** click karein!`;
    } else {
      const allSample = props.slice(0, 3).map((p, i) => 
        `${i + 1}. 🏠 **${p.title}** in **${p.city}** - ₹${p.rentPerMonth}/mo (Owner: ${p.ownerName})`
      ).join('\n');

      return `### 🏠 Property Search Update

${cityNameCap ? `Currently **0 listings found in ${cityNameCap}**, but we have active properties in other cities:` : 'Here are top active properties on Recko India:'}

${allSample}

💡 Aap main homepage par **City Dropdown** change karke direct explore kar sakte hain!`;
    }
  }

  // B) Vehicle Search (Car, Bike, Scooty, Thar, Creta, Activa, Hunter)
  if (q.includes('car') || q.includes('bike') || q.includes('scooty') || q.includes('vehicle') || q.includes('thar') || q.includes('creta') || q.includes('activa') || q.includes('drive') || q.includes('scooter')) {
    let matched = vehs;
    if (matchedCity) {
      matched = vehs.filter(v => (v.city || '').toLowerCase().includes(matchedCity) || (v.location || '').toLowerCase().includes(matchedCity));
    }

    if (matched.length > 0) {
      const sampleList = matched.slice(0, 4).map((v, i) => 
        `${i + 1}. 🚗 **${v.title}** (${v.brand || v.type})\n   • Daily Rate: **₹${v.rentPerDay?.toLocaleString('en-IN')}/day** | Deposit: ₹${v.deposit?.toLocaleString('en-IN') || '2,000'}\n   • Location: ${v.location}, ${v.city}\n   • Owner: ${v.ownerName} (${v.ownerContact || 'Verified Owner'})`
      ).join('\n\n');

      return `### 🚗 Real Database Results: Self-Drive Vehicles ${cityNameCap ? `in ${cityNameCap}` : ''}

Found **${matched.length} self-drive vehicles**:

${sampleList}

---
📄 **Required Documents**: Valid Driving License (DL) & Original Aadhaar Card. Free **250 km/day** included!`;
    } else {
      const allSample = vehs.slice(0, 3).map((v, i) => 
        `${i + 1}. 🚗 **${v.title}** in **${v.city}** - ₹${v.rentPerDay}/day (Owner: ${v.ownerName})`
      ).join('\n');

      return `### 🚗 Self-Drive Vehicles Search Update

${cityNameCap ? `Currently **0 vehicles listed in ${cityNameCap}**, but we have live vehicles in nearby cities:` : 'Here are live self-drive vehicles available on Recko India:'}

${allSample}

📄 Required Documents: Indian Driving License & Aadhaar Card.`;
    }
  }

  // C) Clothing & Outfits Search (Sherwani, Lehenga, Dress, Suit)
  if (q.includes('dress') || q.includes('lehenga') || q.includes('sherwani') || q.includes('cloth') || q.includes('suit') || q.includes('wedding') || q.includes('outfit')) {
    const matched = cloths;
    if (matched.length > 0) {
      const sampleList = matched.slice(0, 3).map((c, i) => 
        `${i + 1}. 👗 **${c.title}** (Size: ${c.size || 'L'}, ${c.gender})\n   • Rate: **₹${c.rentPerDay}/day** | Deposit: ₹${c.deposit || '500'}\n   • Boutique: ${c.ownerName} (${c.city})`
      ).join('\n\n');

      return `### 👗 Designer Clothing & Wedding Outfits

Found **${matched.length} verified designer outfits**:

${sampleList}

---
✨ **Hygiene Guarantee**: Every outfit is 100% steam-sanitized, dry-cleaned, and sealed before delivery!`;
    }
  }

  // D) Sports Turfs Search
  // D) Sports Turfs Search
  if (q.includes('turf') || q.includes('cricket') || q.includes('football') || q.includes('ground') || q.includes('sports')) {
    const matched = turfs;
    if (matched.length > 0) {
      const sampleList = matched.slice(0, 3).map((t, i) => 
        `${i + 1}. ⚽ **${t.title}**\n   • Hourly Rate: **₹${t.rentPerHour}/hour**\n   • Location: ${t.location}, ${t.city}\n   • Host: ${t.ownerName}`
      ).join('\n\n');

      return `### 🏏 Sports Turfs & Night Arenas

Found **${matched.length} sports turfs**:

${sampleList}

---
💡 Free bats, balls, bibs, and stumps provided at venue with 24/7 LED floodlights!`;
    }
  }

  // E) TV, Fridge, AC & Home Appliances Search
  if (q.includes('tv') || q.includes('fridge') || q.includes('refrigerator') || q.includes('ac') || q.includes('cooler') || q.includes('washing') || q.includes('appliance') || q.includes('microwave') || q.includes('ps5') || q.includes('electronics') || q.includes('general')) {
    let matched = gens;
    if (matchedCity) {
      matched = gens.filter(g => (g.city || '').toLowerCase().includes(matchedCity) || (g.location || '').toLowerCase().includes(matchedCity));
    }

    if (matched.length > 0) {
      const sampleList = matched.slice(0, 4).map((g, i) => 
        `${i + 1}. ❄️ **${g.title}** (${g.subType || 'Appliance'})\n   • Rent: **₹${g.rentPerMonth ? g.rentPerMonth.toLocaleString('en-IN') + '/month' : (g.rentPerDay || 500) + '/day'}** | Deposit: ₹${g.deposit?.toLocaleString('en-IN') || '1,000'}\n   • Location: ${g.location || 'Local Hub'}, ${g.city || 'City Center'}\n   • Host: ${g.ownerName} (${g.ownerContact || 'Verified Host'})`
      ).join('\n\n');

      return `### ❄️ Verified TV, Fridge, AC & Appliances ${cityNameCap ? `in ${cityNameCap}` : ''}

Found **${matched.length} appliances available for rent**:

${sampleList}

---
🚚 **Free Doorstep Installation**: 1, 3, 6, ya 12 mahine ke flexible rental tenures par doorstep installation aur 100% free repair warranty shamil hai!`;
    } else {
      const allSample = gens.slice(0, 3).map((g, i) => 
        `${i + 1}. ❄️ **${g.title}** - ₹${g.rentPerMonth || 800}/mo (${g.city})`
      ).join('\n');

      return `### ❄️ Home Appliances & Electronics Update

${cityNameCap ? `Currently **0 appliance listings in ${cityNameCap}**, but available in nearby hubs:` : 'Top active appliance listings on Recko India:'}

${allSample || '• Split ACs (1.5 Ton Inverter) - ₹1,499/mo\n• Double Door Refrigerators - ₹899/mo\n• 43" Smart 4K TVs - ₹799/mo'}

💡 Top navigation me **"TV, Fridge & AC"** tab se 1-click book karein!`;
    }
  }

  // F) Hotels & Homestays Search
  if (q.includes('hotel') || q.includes('stay') || q.includes('resort') || q.includes('room booking') || q.includes('suite') || q.includes('homestay')) {
    let matched = hots;
    if (matchedCity) {
      matched = hots.filter(h => (h.city || '').toLowerCase().includes(matchedCity) || (h.location || '').toLowerCase().includes(matchedCity));
    }

    if (matched.length > 0) {
      const sampleList = matched.slice(0, 4).map((h, i) => 
        `${i + 1}. 🏨 **${h.title}** (${h.rating || 4}★ Hotel)\n   • Night Tariff: **₹${(h.pricePerNight || 2000).toLocaleString('en-IN')}/night**\n   • Location: ${h.location}, ${h.city}\n   • Host: ${h.ownerName || 'Verified Host'}`
      ).join('\n\n');

      return `### 🏨 Verified Hotels & Stays ${cityNameCap ? `in ${cityNameCap}` : ''}

Found **${matched.length} verified stays**:

${sampleList}

---
✨ **Transparent Tariff**: Zero hidden fees, direct check-in verification, and instant confirmation!`;
    } else {
      return `### 🏨 Hotel & Homestay Search
${cityNameCap ? `Currently checking live rooms in ${cityNameCap}.` : 'Verified boutique hotels and luxury rooms are active across Jaipur, Udaipur, and major tourist hubs.'}
Aap top navigation bar se **"Hotels & Stays"** tab select karke dates ke according direct book kar sakte hain!`;
    }
  }

  // G) Silent Study Libraries Search
  if (q.includes('library') || q.includes('study') || q.includes('padhai') || q.includes('reading') || q.includes('desk') || q.includes('seat')) {
    let matched = libs;
    if (matchedCity) {
      matched = libs.filter(l => (l.city || '').toLowerCase().includes(matchedCity) || (l.location || '').toLowerCase().includes(matchedCity));
    }

    if (matched.length > 0) {
      const sampleList = matched.slice(0, 4).map((l, i) => 
        `${i + 1}. 📚 **${l.title}**\n   • Monthly Fee: **₹${(l.monthlyFee || 1000).toLocaleString('en-IN')}/month** | Day Pass: ₹${l.dailyPassPrice || 80}/day\n   • Location: ${l.location}, ${l.city}\n   • Amenities: Fully AC, High-Speed Wi-Fi, Personal Sockets`
      ).join('\n\n');

      return `### 📚 24/7 Silent Study Libraries ${cityNameCap ? `in ${cityNameCap}` : ''}

Found **${matched.length} verified study hubs**:

${sampleList}

---
💡 UPSC, NEET, JEE aur competitive exam aspirants ke liye reserved seats aur 24/7 soundproof reading zones!`;
    } else {
      return `### 📚 24/7 Study Libraries
Fully AC, personal charging plug aur high-speed optical Wi-Fi study hubs available hain. Top navigation me **"Libraries"** tab par click karein!`;
    }
  }

  // H) Restaurants & Dining
  if (q.includes('restaurant') || q.includes('dining') || q.includes('table') || q.includes('food') || q.includes('cafe')) {
    const matched = rests;
    if (matched.length > 0) {
      const sampleList = matched.slice(0, 3).map((r, i) => 
        `${i + 1}. 🍽️ **${r.title}**\n   • Avg Cost: **₹${r.averageCostForTwo || 800} for two** | Cuisine: ${Array.isArray(r.cuisine) ? r.cuisine.join(', ') : 'Multi-Cuisine'}\n   • Location: ${r.location}, ${r.city}`
      ).join('\n\n');

      return `### 🍽️ Verified Restaurants & Dining Spots

Found **${matched.length} dining places**:

${sampleList}

---
🥂 Instant table booking with verified seating!`;
    }
  }

  // I) How to Book / Process (Hindi & Hinglish)
  if (q.includes('kaise') || q.includes('process') || q.includes('step') || q.includes('book kaise') || q.includes('booking')) {
    return `📱 **Recko-India par Booking Kaise Karein (Simple 3 Steps):**

1. **Listing Chunein**: Kisi bhi Flat, Car, Bike, AC, Sherwani ya Turf card par **Book Now** click karein.
2. **Dates & Token Details**: Apni rental dates / duration select karein aur ₹99 refundable booking token pay karein.
3. **Direct Owner Connect**: Token confirm hote hi **Owner ka Direct Phone Number, WhatsApp Chat & Google Map Location** instant mil jaata hai!
   
🤝 **100% Zero Brokerage**: Beech me koi agent ya commission nahi lagta!`;
  }

  // J) Security Deposit & Booking Fee Policies
  if (q.includes('deposit') || q.includes('security') || q.includes('refund') || q.includes('token') || q.includes('99') || q.includes('escrow') || q.includes('paise')) {
    return `🔒 **Recko India 100% Escrow & Refund Policy**:

1. **₹${defaultToken} Booking Token**: Aapka token booking request reserve karta hai. Agar owner request reject karta hai, to **100% ₹${defaultToken} instantly refund** hota hai.
2. **Residential Deposit Cap**: Model Tenancy Act ke tehat residential flats par deposit maximum **2 months rent** tak hi allowable hai.
3. **Refund Timeline**: Vehicles & Outfits ke security deposits return ke **24 ghante ke andar** aapke bank UPI me credit kar diye jaate hain.`;
  }

  // K) Zero Brokerage Guarantee
  if (q.includes('broker') || q.includes('brokerage') || q.includes('zero') || q.includes('commission') || q.includes('agent')) {
    return `🤝 **100% Zero Brokerage Policy**:

Recko India par 1 month brokerage ya hidden agent fees **NIL (₹0)** hain.
Aapko **Book Now** click karte hi direct owner ka Mobile Number & WhatsApp Link mil jata hai!`;
  }

  // L) Contact & Helpline Support
  if (q.includes('contact') || q.includes('support') || q.includes('helpline') || q.includes('call') || q.includes('phone') || q.includes('number') || q.includes('email') || q.includes('owner number')) {
    return `📞 **Recko India 24/7 Customer Support & Owner Contact**:

- ☎️ **Phone Support**: +91 6367959137
- 💬 **WhatsApp Chat**: Website footer me direct WhatsApp icon click karein
- ✉️ **Email Support**: infotechjahvi@gmail.com
- 👤 **Owner Phone Number**: Kisi bhi asset card par **Book Now** click karke token confirm karte hi Owner ka number aur WhatsApp link instant unlock ho jata hai!`;
  }

  // M) Intelligent General Fallback Answer (Accurate Conversational AI)
  if (isHinglish) {
    return `🤖 **Recko India Smart AI Assistant (v4.0)**

Aapke sawaal *"_${raw}_"* par meri guidance:

- **Recko Platform**: India ka All-in-One Multi-Category Rental Portal jahan Flats, PGs, Cars, Bikes, Outfits, Turfs, TV/Fridge/AC aur Hotels book kar sakte hain.
- **Current Live Inventory**: Platform par total **${totalAssetsCount} active listings** aur **${hosts.length} verified hosts** hain.
- **Zero Brokerage**: Har booking par **₹0 brokerage** aur direct owner phone/WhatsApp contact milta hai.
- **100% Escrow**: Refundable ₹99 token protection.

#### 💡 AAP MUJHSE POOCH SAKTE HAIN:
- *"Show me 2 BHK flats in Jaipur"*
- *"AC ya fridge rent par kitne ka milega?"*
- *"Self-drive Thar ya Creta car booking rules"*
- *"Booking kaise karein aur owner ka number kaise milega?"*`;
  }

  return `🤖 **Recko India Smart AI Assistant (v4.0)**

Here is the exact information for your request *"_${raw}_"*:

- **Platform Scope**: Unified Multi-Asset Rental Portal for Properties, Vehicles, TV/AC Appliances, Clothing, Turfs, Hotels & Libraries.
- **Live Inventory**: \`${totalAssetsCount} active listings\` across India with \`${hosts.length} verified landlords\`.
- **Zero Brokerage**: Direct owner connection with 100% Bank Escrow security token protection.

*Feel free to ask a specific question like "Find 2 BHK in Jaipur", "Rent an AC", or "Vehicle deposit rules"!*`;
}
