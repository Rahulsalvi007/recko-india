import { Property, Vehicle, Hotel, Restaurant, Library, ClothingItem, SportsTurfItem, GeneralItem, AppNotification, LandlordUser } from '../types';

export interface DuplicateImageMatch {
  assetId: string;
  assetTitle: string;
  assetType: 'property' | 'vehicle' | 'hotel' | 'restaurant' | 'library' | 'clothing' | 'sports_turf' | 'general';
  ownerId?: string;
  ownerName: string;
  ownerContact: string;
  city: string;
  category: string;
  isFirstSeen: boolean;
  imageRemoved?: boolean;
}

export interface DuplicateImageIncident {
  id: string;
  imageUrl: string;
  imageSignature: string;
  detectedAt: string;
  severity: 'High' | 'Medium' | 'Low';
  reason: string;
  flagType: 'Cross-Owner Duplicate' | 'Reused Photos Across Listings' | 'Stock / Stolen Image Pattern';
  originalAsset: DuplicateImageMatch;
  duplicateAssets: DuplicateImageMatch[];
  status: 'Detected' | 'Removed & Owner Notified' | 'Resolved';
  actionTakenAt?: string;
  notificationSent?: boolean;
  notifiedOwnerContact?: string;
  notificationMessage?: string;
}

/**
 * Normalizes an image URL or base64 string to a reliable fingerprint signature
 */
export function generateImageSignature(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  
  // If base64 data URI
  if (trimmed.startsWith('data:image')) {
    const commaIdx = trimmed.indexOf(',');
    const payload = commaIdx !== -1 ? trimmed.slice(commaIdx + 1, commaIdx + 160) : trimmed.slice(0, 160);
    return `b64_${payload.replace(/[^a-zA-Z0-9]/g, '').slice(0, 48)}`;
  }

  try {
    const urlObj = new URL(trimmed);
    // Strip dynamic resize query parameters for Unsplash / Cloudinary / etc.
    const cleanPath = `${urlObj.hostname}${urlObj.pathname}`.toLowerCase();
    return `url_${cleanPath.replace(/[^a-zA-Z0-9]/g, '_')}`;
  } catch {
    // Plain string or relative path
    return `str_${trimmed.split('?')[0].toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
}

export interface AllSystemAssets {
  properties: Property[];
  vehicles: Vehicle[];
  hotels?: Hotel[];
  restaurants?: Restaurant[];
  libraries?: Library[];
  clothing?: ClothingItem[];
  sportsTurfs?: SportsTurfItem[];
  generalItems?: GeneralItem[];
}

/**
 * Scans all listed assets across every category for duplicate or fraudulent images
 */
export function scanAllAssetsForDuplicateImages(assets: AllSystemAssets): DuplicateImageIncident[] {
  const imageMap = new Map<string, { url: string; occurrences: DuplicateImageMatch[] }>();

  const registerImage = (
    url: string | undefined,
    item: { id: string; title: string; ownerName?: string; ownerContact?: string; ownerId?: string; city?: string; category?: string },
    type: DuplicateImageMatch['assetType']
  ) => {
    if (!url || typeof url !== 'string' || url.length < 5) return;
    const sig = generateImageSignature(url);
    if (!sig) return;

    const entry = imageMap.get(sig) || { url, occurrences: [] };
    
    // Check if already registered for same asset
    const alreadyPresent = entry.occurrences.some(o => o.assetId === item.id);
    if (!alreadyPresent) {
      entry.occurrences.push({
        assetId: item.id,
        assetTitle: item.title || 'Untitled Asset',
        assetType: type,
        ownerId: item.ownerId || '',
        ownerName: item.ownerName || 'Verified Host',
        ownerContact: item.ownerContact || '+91 98765 43210',
        city: item.city || 'India',
        category: item.category || type,
        isFirstSeen: entry.occurrences.length === 0
      });
    }
    imageMap.set(sig, entry);
  };

  // 1. Properties
  (assets.properties || []).forEach((p) => {
    (p.images || []).forEach((img) => registerImage(img, p, 'property'));
  });

  // 2. Vehicles
  (assets.vehicles || []).forEach((v) => {
    (v.images || []).forEach((img) => registerImage(img, v, 'vehicle'));
  });

  // 3. Hotels
  (assets.hotels || []).forEach((h) => {
    (h.images || []).forEach((img) => registerImage(img, h, 'hotel'));
    (h.rooms || []).forEach(r => (r.images || []).forEach(img => registerImage(img, { ...h, title: `${h.title} (${r.roomType})` }, 'hotel')));
  });

  // 4. Restaurants
  (assets.restaurants || []).forEach((r) => {
    (r.images || []).forEach((img) => registerImage(img, r, 'restaurant'));
  });

  // 5. Libraries
  (assets.libraries || []).forEach((l) => {
    (l.images || []).forEach((img) => registerImage(img, l, 'library'));
  });

  // 6. Clothing
  (assets.clothing || []).forEach((c) => {
    (c.images || []).forEach((img) => registerImage(img, c, 'clothing'));
  });

  // 7. Sports Turfs
  (assets.sportsTurfs || []).forEach((s) => {
    (s.images || []).forEach((img) => registerImage(img, s, 'sports_turf'));
  });

  // 8. General Items
  (assets.generalItems || []).forEach((g) => {
    (g.images || []).forEach((img) => registerImage(img, g, 'general'));
  });

  // Filter out unique images, keep duplicates
  const incidents: DuplicateImageIncident[] = [];
  let incidentCount = 0;

  imageMap.forEach((entry, sig) => {
    if (entry.occurrences.length > 1) {
      incidentCount++;
      const original = entry.occurrences[0];
      const duplicates = entry.occurrences.slice(1);

      // Check if different owners
      const uniqueOwnerContacts = new Set(entry.occurrences.map(o => o.ownerContact));
      const isCrossOwner = uniqueOwnerContacts.size > 1;

      const incident: DuplicateImageIncident = {
        id: `dup-${sig.slice(0, 16)}-${incidentCount}-${Math.random().toString(36).slice(2, 7)}`,
        imageUrl: entry.url,
        imageSignature: sig,
        detectedAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        severity: isCrossOwner ? 'High' : 'Medium',
        flagType: isCrossOwner ? 'Cross-Owner Duplicate' : 'Reused Photos Across Listings',
        reason: isCrossOwner 
          ? `Same photo is uploaded across ${entry.occurrences.length} listings by different owners (${entry.occurrences.map(o => o.ownerName).join(', ')}). High risk of unverified / copied content.`
          : `Reused identical photo in ${entry.occurrences.length} separate listings owned by ${original.ownerName}.`,
        originalAsset: original,
        duplicateAssets: duplicates,
        status: 'Detected'
      };

      incidents.push(incident);
    }
  });

  // 9. AI Fake Owner & Suspicious Contact Auditor
  const allItemsList: { item: any; type: DuplicateImageMatch['assetType'] }[] = [
    ...(assets.properties || []).map(p => ({ item: p, type: 'property' as const })),
    ...(assets.vehicles || []).map(v => ({ item: v, type: 'vehicle' as const })),
    ...(assets.hotels || []).map(h => ({ item: h, type: 'hotel' as const })),
    ...(assets.restaurants || []).map(r => ({ item: r, type: 'restaurant' as const })),
    ...(assets.libraries || []).map(l => ({ item: l, type: 'library' as const })),
    ...(assets.clothing || []).map(c => ({ item: c, type: 'clothing' as const })),
    ...(assets.sportsTurfs || []).map(s => ({ item: s, type: 'sports_turf' as const })),
    ...(assets.generalItems || []).map(g => ({ item: g, type: 'general' as const }))
  ];

  allItemsList.forEach(({ item, type }) => {
    const ownerName = (item.ownerName || '').toLowerCase();
    const ownerContact = item.ownerContact || '';
    const rentVal = item.rentPerMonth || item.rentPerDay || item.price || item.rentPerHour || 0;
    const isFakeName = ['fake', 'test', 'dummy', 'unknown', 'user123', 'admin123', 'abc'].some(k => ownerName.includes(k));
    const isFakeContact = !ownerContact || ownerContact.length < 10 || ['0000000000', '1234567890', '9999999999', '1111111111'].some(k => ownerContact.includes(k));
    const isUnrealisticRent = rentVal > 0 && rentVal <= 10;

    if (isFakeName || isFakeContact || isUnrealisticRent) {
      incidentCount++;
      const matchObj: DuplicateImageMatch = {
        assetId: item.id,
        assetTitle: item.title || 'Suspicious Asset',
        assetType: type,
        ownerId: item.ownerId || '',
        ownerName: item.ownerName || 'Unverified Host',
        ownerContact: item.ownerContact || 'Missing Phone',
        city: item.city || 'India',
        category: item.category || type,
        isFirstSeen: true
      };

      const reasons = [];
      if (isFakeName) reasons.push(`Suspicious Owner Name (${item.ownerName})`);
      if (isFakeContact) reasons.push(`Invalid/Dummy Phone Number (${item.ownerContact || 'None'})`);
      if (isUnrealisticRent) reasons.push(`Unrealistically Low Rent (₹${rentVal})`);

      incidents.push({
        id: `fake-owner-${item.id}-${incidentCount}`,
        imageUrl: (item.images && item.images[0]) ? item.images[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80',
        imageSignature: `fake_sig_${item.id}`,
        detectedAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        severity: 'High',
        flagType: 'Stock / Stolen Image Pattern',
        reason: `AI Fraud Engine Flagged: ${reasons.join(', ')}. High risk of fake listing / unverified owner account.`,
        originalAsset: matchObj,
        duplicateAssets: [matchObj],
        status: 'Detected'
      });
    }
  });

  return incidents;
}

/**
 * Pre-upload real-time check for single image against entire database
 */
export function checkSingleImageDuplicate(
  imageUrl: string,
  allAssets: AllSystemAssets,
  currentAssetId?: string,
  currentOwnerName?: string
): { isDuplicate: boolean; matchedAsset?: DuplicateImageMatch; warningText?: string } {
  if (!imageUrl || imageUrl.length < 5) return { isDuplicate: false };

  const targetSig = generateImageSignature(imageUrl);
  if (!targetSig) return { isDuplicate: false };

  const allIncidents = scanAllAssetsForDuplicateImages(allAssets);
  const match = allIncidents.find(inc => inc.imageSignature === targetSig);

  if (match) {
    const otherMatch = match.duplicateAssets.find(d => d.assetId !== currentAssetId) || 
      (match.originalAsset.assetId !== currentAssetId ? match.originalAsset : undefined);

    if (otherMatch) {
      const isDifferentOwner = currentOwnerName && otherMatch.ownerName.toLowerCase() !== currentOwnerName.toLowerCase();
      return {
        isDuplicate: true,
        matchedAsset: otherMatch,
        warningText: isDifferentOwner
          ? `⚠️ Warning: This image is already used in "${otherMatch.assetTitle}" (${otherMatch.category}) listed by ${otherMatch.ownerName} (${otherMatch.city}). Recko India requires 100% original photos.`
          : `⚠️ Notice: This image is already active in your other listing "${otherMatch.assetTitle}". Upload fresh unique angles for better tenant trust.`
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Generates official formatted notification and WhatsApp message for owner
 */
export function composeOwnerDuplicateImageNotice(params: {
  ownerName: string;
  ownerContact: string;
  assetTitle: string;
  assetType: string;
  reason: string;
  removedImageUrl: string;
}): { notification: AppNotification; whatsappUrl: string; messageText: string } {
  const cleanPhone = params.ownerContact.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const messageText = `🚨 *RECKO INDIA AI SAFETY NOTICE* 🚨\n\nDear *${params.ownerName}*,\n\nOur AI Image Authenticity Scanner detected a *Duplicate / Copied Photo* on your listing:\n📍 *Listing:* ${params.assetTitle} (${params.assetType})\n\n⚠️ *Reason:* ${params.reason}\n\n🛡️ *Action Taken:* The duplicate photo has been automatically *REMOVED* from your listing to maintain platform integrity and 100% verified trust.\n\n📸 *Next Steps:* Please log in to your Recko India Owner Dashboard and upload clear, original photos of your property.\n\nThank you,\n*Recko India Trust & Safety Team*`;

  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageText)}`;

  const notification: AppNotification = {
    id: `notif-dup-${Date.now()}`,
    title: `⚠️ Duplicate Photo Removed: ${params.assetTitle}`,
    message: `Recko India AI Safety Engine detected & removed a duplicate photo on "${params.assetTitle}". Please upload original genuine photos in your Owner Dashboard.`,
    type: 'ai_alert',
    timestamp: 'Just now',
    read: false
  };

  return {
    notification,
    whatsappUrl,
    messageText
  };
}
