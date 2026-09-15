import { Property, PropertyDistanceMatrix, PropertyTransitTimes } from '../types';

export interface ParsedAISearch {
  rawQuery: string;
  detectedCity?: string;
  maxBudget?: number;
  detectedCategory?: 'residential' | 'commercial' | 'student' | 'vehicle';
  detectedType?: string;
  genderPreference?: 'Boys' | 'Girls' | 'Unisex' | 'Any';
  petFriendly?: boolean;
  acAvailable?: boolean;
  nearLandmark?: string;
  summaryReasoning: string;
}

export const CITY_COORDINATES_MAP: Record<string, { lat: number; lng: number }> = {
  udaipur: { lat: 24.5854, lng: 73.7125 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  kota: { lat: 25.2138, lng: 75.8648 },
  ajmer: { lat: 26.4499, lng: 74.6399 },
  bikaner: { lat: 28.0229, lng: 73.3119 },
  bhilwara: { lat: 25.3407, lng: 74.6313 },
  alwar: { lat: 27.5530, lng: 76.6346 },
  sikar: { lat: 27.6094, lng: 75.1398 },
  chittorgarh: { lat: 24.8887, lng: 74.6269 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  noida: { lat: 28.5355, lng: 77.3910 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  faridabad: { lat: 28.4089, lng: 77.3178 },
  ghaziabad: { lat: 28.6692, lng: 77.4538 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  pune: { lat: 18.5204, lng: 73.8567 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  nashik: { lat: 20.0059, lng: 73.7898 },
  thane: { lat: 19.2183, lng: 72.9781 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  surat: { lat: 21.1702, lng: 72.8311 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  rajkot: { lat: 22.3039, lng: 70.8022 },
  indore: { lat: 22.7196, lng: 75.8577 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  gwalior: { lat: 26.2183, lng: 78.1828 },
  ujjain: { lat: 23.1765, lng: 75.7885 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  ludhiana: { lat: 30.9010, lng: 75.8573 },
  amritsar: { lat: 31.6340, lng: 74.8723 },
  dehradun: { lat: 30.3165, lng: 78.0322 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  agra: { lat: 27.1767, lng: 78.0081 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  patna: { lat: 25.5941, lng: 85.1376 },
  ranchi: { lat: 23.3441, lng: 85.3096 },
  bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  guwahati: { lat: 26.1445, lng: 91.7362 },
  goa: { lat: 15.2993, lng: 74.1240 },
  panaji: { lat: 15.4909, lng: 73.8278 }
};

export function getCityCoordinates(cityName?: string, locationName?: string): { lat: number; lng: number } {
  const combined = `${cityName || ''} ${locationName || ''}`.toLowerCase();
  
  for (const [key, coords] of Object.entries(CITY_COORDINATES_MAP)) {
    if (combined.includes(key)) {
      return coords;
    }
  }

  // Default to Udaipur center (24.5854, 73.7125) instead of Bangalore
  return { lat: 24.5854, lng: 73.7125 };
}

export function parseAINaturalSearch(query: string): ParsedAISearch {
  const q = query.toLowerCase();
  let detectedCity: string | undefined = undefined;
  let maxBudget: number | undefined = undefined;
  let detectedCategory: 'residential' | 'commercial' | 'student' | 'vehicle' | undefined = undefined;
  let detectedType: string | undefined = undefined;
  let genderPreference: 'Boys' | 'Girls' | 'Unisex' | 'Any' | undefined = undefined;
  let petFriendly: boolean | undefined = undefined;
  let acAvailable: boolean | undefined = undefined;
  let nearLandmark: string | undefined = undefined;

  // City detection
  if (q.includes('udaipur')) detectedCity = 'Udaipur';
  else if (q.includes('jaipur')) detectedCity = 'Jaipur';
  else if (q.includes('bangalore') || q.includes('bengaluru')) detectedCity = 'Bangalore';
  else if (q.includes('pune')) detectedCity = 'Pune';
  else if (q.includes('mumbai')) detectedCity = 'Mumbai';
  else if (q.includes('delhi')) detectedCity = 'Delhi';
  else if (q.includes('kota')) detectedCity = 'Kota';
  else if (q.includes('hyderabad')) detectedCity = 'Hyderabad';

  // Budget detection (e.g. "7000", "7k", "₹7000", "15000")
  const budgetMatch = q.match(/(?:₹|rs\.?|under|below|budget|max|ke andar)?\s*(\d+)\s*(k|thousand|000)?/i);
  if (budgetMatch) {
    let num = parseInt(budgetMatch[1], 10);
    if (budgetMatch[2] === 'k') num *= 1000;
    if (num >= 1000 && num <= 200000) {
      maxBudget = num;
    }
  }

  // Type & category detection
  if (q.includes('pg') || q.includes('hostel')) {
    detectedCategory = 'student';
    if (q.includes('pg')) detectedType = 'College PG';
    else detectedType = 'Student Hostel';
  } else if (q.includes('flat') || q.includes('apartment') || q.includes('bhk') || q.includes('room') || q.includes('villa')) {
    detectedCategory = 'residential';
    if (q.includes('villa')) detectedType = 'Villa';
    else if (q.includes('house')) detectedType = 'Independent House';
    else detectedType = 'Apartment';
  } else if (q.includes('office') || q.includes('shop') || q.includes('commercial')) {
    detectedCategory = 'commercial';
  } else if (q.includes('car') || q.includes('bike') || q.includes('scooty') || q.includes('scooter') || q.includes('vehicle')) {
    detectedCategory = 'vehicle';
  }

  // Gender preference
  if (q.includes('girl') || q.includes('girls') || q.includes('female')) genderPreference = 'Girls';
  else if (q.includes('boy') || q.includes('boys') || q.includes('male')) genderPreference = 'Boys';

  // Amenities & Features
  if (q.includes('pet') || q.includes('dog') || q.includes('cat')) petFriendly = true;
  if (q.includes('ac') || q.includes('air conditioner')) acAvailable = true;

  // Landmark
  if (q.includes('college') || q.includes('university') || q.includes('mlsu')) nearLandmark = 'College / University';
  else if (q.includes('station') || q.includes('railway')) nearLandmark = 'Railway Station';
  else if (q.includes('hospital')) nearLandmark = 'Hospital';
  else if (q.includes('tech park') || q.includes('it job')) nearLandmark = 'IT Tech Park';

  // Build natural explanation
  const parts: string[] = [];
  if (detectedCity) parts.push(`City: ${detectedCity}`);
  if (maxBudget) parts.push(`Max Budget: ₹${maxBudget.toLocaleString('en-IN')}`);
  if (detectedType) parts.push(`Type: ${detectedType}`);
  if (genderPreference) parts.push(`Preference: ${genderPreference}`);
  if (petFriendly) parts.push('Pet Friendly');
  if (acAvailable) parts.push('AC Included');
  if (nearLandmark) parts.push(`Near: ${nearLandmark}`);

  const summaryReasoning = parts.length > 0 
    ? `AI parsed criteria: ${parts.join(' • ')}`
    : 'Showing all relevant verified listings matching your natural search.';

  return {
    rawQuery: query,
    detectedCity,
    maxBudget,
    detectedCategory,
    detectedType,
    genderPreference,
    petFriendly,
    acAvailable,
    nearLandmark,
    summaryReasoning
  };
}

export function calculateTransitTimes(km: number): PropertyTransitTimes {
  // Average speeds: Walk = 4.5 km/h (13.3 min/km), Bike = 25 km/h (2.4 min/km), Car = 30 km/h (2.0 min/km)
  const walkMin = Math.round(km * 13.3);
  const bikeMin = Math.max(1, Math.round(km * 2.4));
  const carMin = Math.max(1, Math.round(km * 2.0));

  return { walkMin, bikeMin, carMin };
}

export function auditAIFakeListing(item: {
  title: string;
  rent: number;
  category?: string;
  images: string[];
  ownerContact: string;
  ownerVerified?: boolean;
}): { score: number; flags: string[]; riskLevel: 'Low Risk' | 'Review Required' | 'High Risk' } {
  let score = 98;
  const flags: string[] = [];

  // Rent check
  if (item.rent < 1000 && item.category !== 'vehicle') {
    score -= 35;
    flags.push('Unrealistically Low Rent (< ₹1,000)');
  }

  // Contact check
  if (!item.ownerContact || item.ownerContact.length < 10 || item.ownerContact.includes('0000000000')) {
    score -= 25;
    flags.push('Unverified / Suspicious Phone Number');
  }

  // Image check
  if (item.images.length === 0) {
    score -= 20;
    flags.push('No Photos Uploaded');
  } else if (item.images.length === 1) {
    score -= 5;
    flags.push('Single Photo Listing');
  }

  // Unverified owner
  if (item.ownerVerified === false) {
    score -= 10;
    flags.push('Landlord ID Proof Pending');
  }

  const clampedScore = Math.min(100, Math.max(0, score));
  const riskLevel: 'Low Risk' | 'Review Required' | 'High Risk' =
    clampedScore >= 80 ? 'Low Risk' : clampedScore >= 50 ? 'Review Required' : 'High Risk';

  return {
    score: clampedScore,
    flags,
    riskLevel
  };
}
