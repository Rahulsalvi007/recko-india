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
}): { score: number; flags: string[] } {
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

  return {
    score: Math.max(15, score),
    flags
  };
}
