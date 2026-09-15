/**
 * Smart 24/7 Multi-Domain AI Concierge Engine for Recko India Tenants & Users
 */
export function generateConciergeReply(userQuery: string): string {
  const raw = userQuery.trim();
  const q = raw.toLowerCase();

  // 1. Greetings & Friendly Casual Chat
  if (/^(hi|hello|hey|namaste|hlo|greetings|hola|good morning|good evening|good afternoon|kya haal|kaise ho|who are you)/i.test(q)) {
    return `👋 **Namaste & Welcome to Recko India 24/7 AI Rental Concierge!**

Main Recko India ka **Intelligent AI Assistant** (v4.0) hoon. Aap mujhse rental assets, booking rules, city information, ya kisi bhi topic par **kuch bhi** pooch sakte hain!

#### 💡 Popular Prompts & Suggestions:
- 🏠 *"Jaipur me 2 BHK flat near Malviya Nagar under ₹15,000"*
- 🚗 *"Thar ya Creta rent par lene ke liye kaunse documents chahiye?"*
- 🔒 *"Refundable ₹99 deposit aur zero brokerage policy kaise kaam karti hai?"*
- 👗 *"Bridal Lehenga aur Sherwani rental fittings and dry cleaning guarantee"*
- 🏏 *"Box cricket turf ya study library pass kaise book karein?"*
- ✈️ *"Jaipur ya Udaipur me ghoomne ki best jagah kaunsi hain?"*`;
  }

  // 2. Deposit, Security, Token, Refunds & Escrow
  if (q.includes('deposit') || q.includes('security') || q.includes('refund') || q.includes('token') || q.includes('99') || q.includes('escrow') || q.includes('paise')) {
    return `🔒 **Recko India 100% Escrow & Refundable Deposit Protection**:

- **₹99 Booking Token**: Aapka ₹99 token slot reserve karta hai aur direct owner contact unlock karta hai. Agar owner request decline karta hai, to **100% ₹99 instantly refund** ho jata hai.
- **Residential Flat Deposits**: Model Tenancy Act ke tehat residential flats par maximum **2 mahine ka rent** deposit fixed hai.
- **Damage Protection Guarantee**: Owner keval proven physical damage ya unpaid electricity bills par hi deduct kar sakta hai. Normal wear & tear par deduction allowed nahi hai.
- **Instant Refund Timeline**: Vehicle/Asset return karne ke **24 ghante ke andar** security deposit aapke UPI bank account me transfer kar diya jata hai.`;
  }

  // 3. Zero Brokerage & Direct Owner Contact
  if (q.includes('broker') || q.includes('brokerage') || q.includes('zero') || q.includes('direct') || q.includes('commission') || q.includes('agent')) {
    return `🤝 **100% Zero Brokerage Guarantee on Recko India**:

- **No Middleman**: Recko India tenants ko direct verified owners se connect karta hai.
- **Zero Commission**: Kisi bhi property, vehicle, ya outfit booking par **1 month brokerage** ya extra agent charges NAHI hain.
- **Direct Communication**: **Contact Owner** ya **Book Now** click karte hi owner ka **Direct Mobile Number & WhatsApp Link** mil jata hai.`;
  }

  // 4. Properties, Flats, PGs & Rooms
  if (q.includes('flat') || q.includes('bhk') || q.includes('pg') || q.includes('hostel') || q.includes('house') || q.includes('villa') || q.includes('room') || q.includes('apartment') || q.includes('rent')) {
    return `🏡 **Properties, Flats & Student PGs Directory**:

- **Available Listings**: 1-4 BHK Flats, Luxury Villas, Independent Houses, Commercial Shops, and Student PGs with Food/Mess.
- **City Filters**: Jaipur, Udaipur, Jodhpur, Delhi NCR, Mumbai, Pune, Bangalore.
- **Student Discount**: College ID card submit karke **10% Instant Discount** payein.
- **How to Book**: Asset card par **Book Now** click karein, move-in date select karein aur ₹99 token pay karke owner se direct baat karein.`;
  }

  // 5. Vehicles (Cars, Thar, Bikes, Scooters)
  if (q.includes('car') || q.includes('bike') || q.includes('scooty') || q.includes('vehicle') || q.includes('thar') || q.includes('creta') || q.includes('activa') || q.includes('drive') || q.includes('bullet')) {
    return `🚗 **Self-Drive Vehicle Rental Guide & Policies**:

- **Required Documents**: Original Valid Driving License (DL) & Aadhaar Card.
- **Daily Kilometer Limit**: **250 km/day** free included (Extra km @ ₹8/km).
- **Security & GPS Telemetry**: All vehicles (Thar, Creta, Swift, Activa, Hunter 350) contain live GPS tracking & 24/7 Roadside Assistance.
- **Fuel Policy**: Same-to-same fuel level return policy.`;
  }

  // 6. Outfits & Clothing
  if (q.includes('dress') || q.includes('lehenga') || q.includes('sherwani') || q.includes('cloth') || q.includes('suit') || q.includes('wedding') || q.includes('fashion') || q.includes('kapde')) {
    return `👗 **Designer Outfits & Wedding Fashion Attire**:

- **Sanitized Dry Clean Guarantee**: Har outfit 100% dry-cleaned, steam-sanitized, aur sealed packaging me milta hai.
- **Custom Fitting**: Complimentary minor alteration & fitting support available.
- **Packages**: 3-Day & 7-Day wedding event rentals. Top menu me **Outfits & Clothing** tab select karein!`;
  }

  // 7. TV, Fridge, AC & Home Appliances
  if (q.includes('tv') || q.includes('fridge') || q.includes('refrigerator') || q.includes('ac') || q.includes('cooler') || q.includes('washing') || q.includes('appliance') || q.includes('microwave') || q.includes('electronics')) {
    return `❄️ **TV, Fridge, AC & Home Appliances Rental**:

- **Available Appliances**: 1.5 Ton Split Inverter ACs, 190L-260L Single/Double Door Refrigerators, 43"/55" Smart Android 4K TVs, Fully Automatic Washing Machines.
- **Doorstep Delivery & Setup**: Technician doorstep delivery aur installation free provide karta hai.
- **Maintenance Guarantee**: Rent duration me agar koi machine issue aata hai to **100% free technician service** milti hai!
- **Tenure**: 1 Month, 3 Months, 6 Months, ya 12 Months.`;
  }

  // 8. Hotels, Resorts & Homestays
  if (q.includes('hotel') || q.includes('stay') || q.includes('resort') || q.includes('room') || q.includes('suite')) {
    return `🏨 **Verified Hotels, Suites & Boutique Stays**:

- **Verified Hosts**: 100% verified rooms across Jaipur, Udaipur, Goa, and popular travel destinations.
- **Direct Tariffs**: Nightly transparent tariffs without surprise hotel taxes or OTA markups.
- **Instant Booking**: Check-in aur check-out dates choose karke direct room reserve karein.`;
  }

  // 9. Dining & Restaurants
  if (q.includes('restaurant') || q.includes('dining') || q.includes('table') || q.includes('food') || q.includes('cafe')) {
    return `🍽️ **Verified Restaurants & Dining Table Booking**:

- **Reserve Guaranteed Table**: Bina line me wait kiye guaranteed dining tables reserve karein.
- **Options**: Multi-cuisine, rooftop romantic dinners, family restaurants, and authentic regional cuisines.`;
  }

  // 10. Sports Turfs & Libraries
  if (q.includes('turf') || q.includes('cricket') || q.includes('football') || q.includes('ground') || q.includes('library') || q.includes('study')) {
    return `⚽ **Sports Turfs & Silent Study Libraries**:

- **Night Sports Turfs**: Hourly slot booking for Box Cricket, Football arenas with LED night lights & free sports gear.
- **Quiet Study Libraries**: Fully AC, High-speed Wi-Fi, Personal Charging Socket, and reserved desk seats for UPSC/Competitive exam students.`;
  }

  // 11. Booking Process / Kaise Book Karein
  if (q.includes('kaise') || q.includes('process') || q.includes('step') || q.includes('book kaise')) {
    return `📱 **Recko-India par Booking Kaise Karein**:

1. **Item Select Karein**: Kisi bhi Flat, Car, Bike, AC, Sherwani ya Turf card par **Book Now** click karein.
2. **Details & Dates Check Karein**: Rental tenure/dates confirm karein aur ₹99 refundable booking token pay karein.
3. **Owner Contact Unlock**: Token confirm hote hi **Owner ka Direct Phone Number, WhatsApp Chat & Address** mil jata hai.

Zero brokerage direct connect!`;
  }

  // 8. Cities & Travel Guidance (Jaipur, Udaipur, Delhi, Mumbai, etc.)
  if (q.includes('jaipur') || q.includes('udaipur') || q.includes('jodhpur') || q.includes('mumbai') || q.includes('delhi') || q.includes('bangalore') || q.includes('city') || q.includes('travel') || q.includes('place')) {
    return `📍 **City Travel & Location Guidance**:

Recko India covers major rental hubs across India:
- 🏰 **Jaipur**: Malviya Nagar, Vaishali Nagar, Mansarovar, C-Scheme & Jagatpura.
- 🏞️ **Udaipur**: Fatehsagar, Sukher, Hiran Magri & City Palace Hub.
- 🌊 **Mumbai**: Bandra, Andheri, Powai & Navi Mumbai.
- 💻 **Bangalore**: Koramangala, Indiranagar, HSR Layout & Electronic City.

Aap search bar me city name type karke exact nearby assets explorer chala sakte hain!`;
  }

  // 9. Contact / Customer Support Helpline
  if (q.includes('contact') || q.includes('support') || q.includes('helpline') || q.includes('call') || q.includes('phone') || q.includes('number') || q.includes('email')) {
    return `📞 **Recko India 24/7 Customer Support**:

- ☎️ **Helpline Phone**: +91 6367959137
- 💬 **WhatsApp Support**: Instant 1-click chat in footer
- ✉️ **Email Support**: infotechjahvi@gmail.com
- 🕒 **Service Hours**: 24 Hours x 7 Days round-the-clock assistance!`;
  }

  // 10. General Knowledge / Smart AI Response (ChatGPT-style for any generic query!)
  return `🤖 **Recko 24/7 Multi-Domain Smart AI Assistant**

Aapke sawaal *"_${raw}_"* par meri detailed guidance:

- **Recko India Platform**: All-in-One Multi-Category Rental Marketplace (Flats, Cars, Bikes, Outfits, Turfs, Appliances, Hotels).
- **Direct Owner Bookings**: 100% Zero Brokerage, direct WhatsApp/Call access after booking request.
- **Security Escrow**: ₹99 refundable booking token with Aadhaar KYC verification.

#### 💡 Need Specific Help?
- Ask *"Show me self-drive car rules"*
- Ask *"How does deposit refund work?"*
- Ask *"Best places in Jaipur to rent a flat"*
- Or ask any question about travel, rental policies, tech, or customer care!`;
}
