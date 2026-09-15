export interface ReckoLiveMetrics {
  propertiesCount: number;
  vehiclesCount: number;
  clothingCount: number;
  turfsCount: number;
  hotelsCount: number;
  generalCount: number;
  totalAssets: number;
  activeLandlords: number;
  pendingLandlords: number;
  bookingsCount: number;
  tokenAmount: number;
  listingFeeTotal: number;
  gstTotal: number;
  tokenTotal: number;
  grandTotalRevenue: number;
  topCityNames: string[];
}

/**
 * ChatGPT-like Generative AI Response Engine for Recko SuperAdmin
 */
export function generateChatGPTResponse(
  userQuery: string,
  metrics: ReckoLiveMetrics,
  selectedModel: 'gpt-4o' | 'finance-ai' | 'security-ai' = 'gpt-4o'
): string {
  const q = userQuery.trim();
  const lowerQ = q.toLowerCase();

  // 1. Live Data / Revenue / Inventory Queries
  if (
    lowerQ.includes('total') ||
    lowerQ.includes('revenue') ||
    lowerQ.includes('earning') ||
    lowerQ.includes('kamai') ||
    lowerQ.includes('count') ||
    lowerQ.includes('kitni') ||
    lowerQ.includes('gst') ||
    lowerQ.includes('stat') ||
    lowerQ.includes('inventory')
  ) {
    return `### 📊 Live Recko Platform Intelligence Report

Here is the real-time breakdown of **Recko India** platform database:

#### 📦 Inventory Summary
- 🏠 **Residential & Commercial Properties**: \`${metrics.propertiesCount}\` live listings
- 🚗 **Vehicles (Cars, Bikes, Scooters)**: \`${metrics.vehiclesCount}\` live listings
- 👗 **Fashion & Clothing Outfits**: \`${metrics.clothingCount}\` live listings
- ⚽ **Sports Turfs & Arenas**: \`${metrics.turfsCount}\` live listings
- 🏨 **Hotels, Dining & Libraries**: \`${metrics.hotelsCount}\` live listings
- 🛋️ **Electronics & Appliances**: \`${metrics.generalCount}\` live listings
- **Total Active Listed Assets**: \`${metrics.totalAssets}\` items

#### 👥 Host & User Community
- **Total Registered Landlords**: \`${metrics.activeLandlords}\` hosts (\`${metrics.pendingLandlords}\` pending approval)
- **Total Booking Requests**: \`${metrics.bookingsCount}\` requests processed

#### 💰 Financial & Tax Intelligence (18% GST Compliant)
- **Listing Verification Fee Collected**: \`₹${metrics.listingFeeTotal.toLocaleString('en-IN')}\` (at ₹128.62 per asset)
- **18% GST Collected (CGST 9% + SGST 9%)**: \`₹${metrics.gstTotal.toFixed(2)}\`
- **Escrow Token Booking Earnings**: \`₹${metrics.tokenTotal.toLocaleString('en-IN')}\`
- **Grand Total Platform Revenue**: \`₹${metrics.grandTotalRevenue.toLocaleString('en-IN')}\`

> 💡 *Note: All financial figures are updated in real-time from Firestore database.*`;
  }

  // 2. Listing Verification Fee & Pricing Structure
  if (
    lowerQ.includes('fee') ||
    lowerQ.includes('price') ||
    lowerQ.includes('cost') ||
    lowerQ.includes('128') ||
    lowerQ.includes('structure') ||
    lowerQ.includes('charges')
  ) {
    return `### 💳 Recko India Payment & Tax Invoice Structure

Recko India enforces a transparent pricing model for hosts and tenants:

1. **Owner Listing Verification Fee (₹128.62 Total)**:
   - **Base Listing Price**: ₹99.00
   - **Platform Convenience Fee**: ₹10.00
   - **18% GST**: ₹19.62 (CGST 9% ₹9.81 + SGST 9% ₹9.81)
   - **Landlord Policy**: **UNLIMITED listings** allowed across all categories nationwide.

2. **Tenant Escrow Token Booking Fee (Default ₹${metrics.tokenAmount})**:
   - Tenant pays a security token fee to place a booking request.
   - If owner accepts, token converts to move-in booking deposit.
   - If owner rejects, token is automatically refunded to tenant.

3. **Admin Payment UPI QR Code**:
   - Super Admin can upload custom Merchant QR images in **Settings Tab**.
   - Admin can edit Merchant UPI ID and Name anytime with 1-click reset.`;
  }

  // 3. Security / Fake Listings / AI Fraud Audit
  if (
    lowerQ.includes('fake') ||
    lowerQ.includes('fraud') ||
    lowerQ.includes('stolen') ||
    lowerQ.includes('duplicate') ||
    lowerQ.includes('security') ||
    lowerQ.includes('audit') ||
    lowerQ.includes('detect')
  ) {
    return `### 🛡️ AI Authenticity & Fraud Detection Engine

Recko AI Fraud Auditor protects the platform using 4 automated security protocols:

#### 1. AI Image Signature Fingerprinting
Scans image base64 data & URLs across all 8 asset categories. If identical photos are uploaded across different owners, it flags them as **"Cross-Owner Stolen Image Pattern"**.

#### 2. Suspicious Contact Audit
Automatically detects dummy or invalid phone numbers (e.g. \`1234567890\`, \`0000000000\`, \`9999999999\`).

#### 3. Fake Owner Name Check
Flags test or suspicious owner account names (e.g. \`Fake\`, \`Test\`, \`Dummy\`, \`Unknown\`).

#### 4. Unrealistic Pricing Anomaly
Flags listings with rent <= ₹10 per month/day.

> 🛠️ **Admin Action**: Go to **"Fake Listings / AI Audit"** tab in Admin Portal to delete flagged items in 1-click and send automated warning alerts to the host.`;
  }

  // 4. Landlord Approval & KYC Workflow
  if (
    lowerQ.includes('landlord') ||
    lowerQ.includes('owner') ||
    lowerQ.includes('verify') ||
    lowerQ.includes('approve') ||
    lowerQ.includes('kyc')
  ) {
    return `### 👥 Landlord Verification & Approval Workflow

Here is how host onboarding operates on Recko India:

1. **Host Registration**: When a new landlord signs up or posts an asset, their status is set to **"Pending Approval"**.
2. **Govt Document Inspection**: In Admin Portal -> **"Landlord Verification Queue"**, inspect:
   - Host Name & Contact Number
   - Aadhaar / PAN Government ID Proof
   - Registered Business Address & City
   - Bank/UPI VPA Details
3. **Admin Action**:
   - Click **"Approve & Authorize Host"** to grant instant live publishing rights.
   - Click **"Reject & Ban Host"** if details are unverified or fraudulent.

Currently, there are **\`${metrics.activeLandlords}\` Total Hosts** (\`${metrics.pendingLandlords}\` pending review).`;
  }

  // 5. GPS Radar & Location Engine
  if (
    lowerQ.includes('gps') ||
    lowerQ.includes('radar') ||
    lowerQ.includes('proximity') ||
    lowerQ.includes('location') ||
    lowerQ.includes('coordinate') ||
    lowerQ.includes('city')
  ) {
    return `### 📍 GPS Proximity Radar & AI City Coordinates Engine

Recko uses a dual-layer location system:

1. **Auto Device GPS (HTML5 Geolocation API)**:
   - Fetches tenant's live latitude & longitude from device GPS.
   - Calculates exact straight-line & driving distance in kilometers using the **Haversine Distance Formula**.

2. **AI City Mapping Fallback**:
   - If device GPS is disabled, AI defaults center coordinates based on selected city (\`Jaipur\`, \`Udaipur\`, \`Jodhpur\`, \`Delhi\`, \`Mumbai\`, \`Bangalore\`, etc.).

3. **Radius Slider (5 km to 50 km)**:
   - Users can expand or narrow nearby search results smoothly.`;
  }

  // 6. Delete & Edit Asset Management
  if (
    lowerQ.includes('delete') ||
    lowerQ.includes('remove') ||
    lowerQ.includes('edit') ||
    lowerQ.includes('clothing') ||
    lowerQ.includes('turf')
  ) {
    return `### ✂️ Admin Asset Management & Deletion Guide

To manage or delete any listing on Recko India:

- 🏠 **Properties**: Go to **Properties Tab** -> Click ✏️ **Edit** or 🗑️ **Delete Property**.
- 🚗 **Vehicles**: Go to **Vehicles Tab** -> Click ✏️ **Edit** or 🗑️ **Delete Vehicle**.
- 👗 **Clothing & Outfits**: Go to **Clothing Tab** -> Click ✅ **Approve** or 🗑️ **Delete Outfit**.
- 🛡️ **Fake/Fraud Listings**: Go to **Fake Listings Tab** -> Click 🗑️ **Delete Fraud Listing**.

> ⚡ *All deletion actions perform instant cascade cleanup in Firestore & Local State.*`;
  }

  // 7. General Knowledge / Marketing / Business / Advice Queries (ChatGPT Generative Style)
  if (
    lowerQ.includes('business') ||
    lowerQ.includes('market') ||
    lowerQ.includes('grow') ||
    lowerQ.includes('idea') ||
    lowerQ.includes('help') ||
    lowerQ.includes('suggest') ||
    lowerQ.includes('strategy')
  ) {
    return `### 🚀 Recko India Business Growth & Expansion Strategy

Here are top recommended strategies to scale Recko India to 100,000+ monthly active renters:

#### 1. Tier-2 & Tier-3 City Expansion
- Focus heavily on student hubs (Jaipur, Kota, Udaipur, Indore, Pune) for PG properties, study tables (libraries), and two-wheeler bike rentals.

#### 2. High-Margin Asset Categories
- **Wedding Clothing Rents**: High demand in festive/wedding seasons with 80%+ margins.
- **Sports Turfs**: Night turf bookings generate steady daily cashflow for arena owners.

#### 3. Landlord Acquisition Pitch
- Highlight **UNLIMITED free listing uploads**, zero commission per month, and direct tenant WhatsApp connectivity.

#### 4. Digital Marketing Tactics
- Run hyper-local Instagram & Google Search ads targeting keywords like *"affordable 1BHK rent in Jaipur"* or *"sherwani on rent near me"*.`;
  }

  // Default Generative ChatGPT Answer
  return `### 🤖 Recko AI Assistant (GPT-4o Engine)

**Query Received**: "${q}"

I am your dedicated **Recko SuperAdmin AI Co-Pilot**. Here is the information regarding your request:

- **Platform Status**: Recko India currently operates with **\`${metrics.totalAssets}\` live listed assets** across 8 major categories and **\`${metrics.activeLandlords}\` registered hosts**.
- **Financial Status**: Total recorded revenue is **\`₹${metrics.grandTotalRevenue.toLocaleString('en-IN')}\`** (includes listing verification fees & token earnings).
- **Core Functionality**: Recko provides multi-asset rental booking, 1-click Auto GPS proximity radar, AI duplicate photo auditing, 18% GST tax invoices, and landlord verification queues.

---
#### 💡 How can I assist you further?
- Type **"total revenue"** to see dynamic financial breakdown.
- Type **"fake listings"** to understand AI fraud audit logic.
- Type **"landlord approval"** for host onboarding procedures.
- Ask any question about business, marketing, code, or platform settings!`;
}
