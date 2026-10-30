# Rahamalapd

# RAHAMA PROPERTY HUB — FULL ARCHITECTURE & SYSTEM SPECIFICATION



Act as my senior full-stack engineering partner. Build the complete production-grade real estate sales website and back-office admin portal for **Rahama Land and Property Development Ltd.**, located in Azare, Katagum LGA, Bauchi State, Nigeria (RC NO. 9871926).



---



### 1. CORE BRAND IDENTITY & BUSINESS RULES

- **Company Name**: Rahama Land and Property Development Ltd.

- **Registration**: RC NO. 9871926 (Katagum LGA, Bauchi State)

- **Official Address**: No. 12, Old Kano Road, Azare, Katagum LGA, Bauchi State, Nigeria

- **Phone Numbers**: +234 806 378 4070, +234 703 780 7271 (08063784070, 07037807271)

- **WhatsApp**: +2348063784070 (for all direct chat and inquiry actions)

- **Email**: rahmalapd@gmail.com

- **Currency**: Nigerian Naira (₦) formatted cleanly (e.g., ₦12,500,000)

- **Reference Code Format**: RHM-AZR-### (Azare) and RHM-BAU-### (Bauchi)

- **Plot Measurement Standard**: Local plot standard measured in feet: 50ft × 100ft (5,000 sq ft ≈ 464.5 m² per standard plot).

- **Design Tokens**: Deep forest green primary (#0D3B2E / #0F4A38), clean white, warm neutrals, and crisp lime green accents matching the corporate house emblem. Fonts: Sora for headings and Manrope for body text.

- **Zero-Budget Guarantee**: Zero paid APIs, zero external tokens, zero recurring subscriptions. All calculations, lead intelligence, mapping, and printable receipts must run client-side in-code at ₦0 ongoing cost.



---



### 2. GEOGRAPHIC HIERARCHY (ZONES & SUB-ZONES)

- Structured 6-zone hierarchy: Main Zones → Sub-Zones → Neighborhood Layout Areas.

- Admin management screen (`/admin/locations`) to create, rename, and manage zones, sub-zones, and areas.

- Cascading dropdowns in the property upload/edit form: selecting a Zone dynamically filters only the corresponding Sub-Zones and areas.

- Seed data centered around Azare and Bauchi (e.g., GRA Azare, Federal Low Cost, Jama'are Road, Potiskum Road, Federal University Axis, Chora Chara, Yelwa).



---



### 3. MAP-BASED LAND MEASUREMENT (ITEM 3 SPECIFICATION)

- **Zero-Cost Interactive Map**: Leaflet + OpenStreetMap (no API key required), centered by default on Azare Central (11.6738°N, 10.1878°E).

- **Boundary Drawer**: Authorized staff click to drop pins and draw property boundary polygons. Includes Add Point, Undo Last Point, and Clear Boundary actions.

- **Real-Time Geodesic Area Calculation**: Calculates area from spherical coordinates into:

  - Square Feet (sq ft) & Standard Azare Plots (50ft × 100ft)

  - Square Metres (m²)

  - Hectares & Acres

- **Integrity Checks**: Validates minimum 3 points; warns on invalid or self-intersecting boundaries.

- **Legal Cadastral Disclaimer**: Mandatory prominent notice: "Estimated Map Boundary Calculation — For indicative planning only. Not a certified cadastral survey."

- **Separate Certified Survey Fields**: Independent staff inputs for:

  - Verified Surveyor Area (m²)

  - Survey Plan / Beacon Number (e.g., BAU/AZR/2026/SP-104)

  - Survey Authority / Source (e.g., Licensed Surveyor / Bauchi State Ministry of Lands)

  - Date of Certified Survey

- **Integration**: Plotted boundaries and area calculations are saved to the listing and displayed on `/properties/:slug` alongside official survey badges.



---



### 4. PUBLIC REAL ESTATE PORTAL

- **Homepage (`/`)**:

  - Hero search bar (Property Type, Zone/Sub-Zone, Budget range in ₦).

  - Trust metrics (Verified Title Deeds, Plots Delivered, RC Registration badge).

  - Featured Property Cards (with status badges: Available, Reserved, Sold).

  - Services Overview (Land Sales, Property Development, Title Documentation, Site Inspections).

  - "How You Buy Land with Rahama" 4-step buyer guide (Inspect, Verify, Pay Securely, Receive Title Deeds).

  - Dedicated Diaspora Buyer section (remote inspection, video walk-throughs, verified legal documentation).

  - Quick WhatsApp CTA button with pre-filled message.

- **Catalogue (`/properties`)**:

  - Filterable by transaction type (For Sale, For Rent), property category (Residential Land, Commercial Land, House/Villa, Farm, Shop), Zone & Sub-Zone, price range, and size unit.

  - Responsive mobile drawer with active filter counts.

- **Property Details (`/properties/:slug`)**:

  - High-res photo gallery with thumbnail strip.

  - Price in ₦, reference code, quick specs (plots/sqm, bedrooms/bathrooms for houses).

  - Interactive land boundary map and dimensions breakdown.

  - Verified title document badges (C-of-O, R-of-O, Survey Plan, Deed of Assignment).

  - Installment Calculator (down payment percentage, 3/6/12-month payment schedules).

  - Site Inspection Booking modal.

  - Direct WhatsApp button generating a pre-filled chat: "Hello Rahama Property, I am inquiring about [Title] (Ref: [RHM-AZR-###])."

- **Company Pages**: `/services`, `/about` (mission, leadership, RC credentials), `/contact` (enquiry form + office map and contact details), `/privacy` (legal disclaimer).



---



### 5. AGENT MANAGEMENT & ANNUAL LEADERBOARD (`/admin/agents`)

- **Agent Directory**:

  - Register and manage agents: Full Name, Phone, WhatsApp, Email, Assigned Zone, Agent ID (`RHM-AGT-001`), and Active/Inactive toggle.

  - Summary metrics: Total active agents, top-performing agent, and total sales volume handled.

- **Record Sale Flow**:

  - Admin modal to record deals: link selected property (automatically updates status to "Sold") to the responsible agent.

  - Capture buyer name, phone, agreed sale price, amount paid, balance remaining, payment method (Bank Transfer, Cash, Cheque, POS), and agent commission.

- **Annual Best-Seller Award & Leaderboard**:

  - Filter by year (`2026`, `2025`, `All Time`).

  - Criteria toggle: Rank by "Completed Deals Count" or "Total Sales Volume (₦)".

  - Prominent "Top Seller of the Year" Trophy Card celebrating the #1 agent.

  - Full ranked leaderboard table with deal histories and tie-breaking indicators.



---



### 6. BRANDED PRINTABLE SALES INVOICE & OFFICIAL RECEIPT

- Accessible whenever a sale is recorded or viewed from the sales history.

- **Official Letterhead**: Rahama Land and Property Development Ltd., RC NO. 9871926, No. 12, Old Kano Road, Azare, Katagum LGA, Bauchi State, official phone numbers, and email.

- **Receipt Metadata**: Unique sequential receipt number (format: `RHM-RCP-YYYY-####`), transaction timestamp.

- **Particulars**: Buyer details, property reference code, title, zone/sub-zone, plot dimensions in feet, and survey reference.

- **Ledger Breakdown**: Total agreed price, amount previously paid, current payment received, outstanding balance, and payment method.

- **Dual Official Sign-Off Blocks**:

  1. Managing Director

  2. Company Secretary / Legal Adviser

- **A4 Browser Print Layout**: Clean `@media print` styling that hides all navigation bars, sidebars, and buttons for clean 1-click A4 printing or PDF saving (`window.print()`).



---



### 7. ADMIN CRM & ZERO-COST LEAD ADVISOR

- **Authentication**: Single-tenant admin sign-in (`admin@rahamaproperty.ng` / password `rahama2026`).

- **Dashboard Overview (`/admin`)**: Active inventory valuation, available listings, pending enquiries, recent activity logs.

- **Properties Table (`/admin/properties`)**: Search, status toggle (Draft, Published, Reserved, Sold, Archived), Create/Edit listing dialog with image management.

- **Enquiries Pipeline (`/admin/enquiries`)**:

  - Buyer submissions table with status tracking (New, Contacted, Viewing Scheduled, Closed).

  - Built-in Smart Lead Advisor (client-side keyword/intent heuristic, ₦0 external cost):

    - Priority scoring (High/Medium/Low badge with rationale).

    - Tone-switchable tailored reply drafts (Formal, Warm, Haus
a-courtesy greeting).

    - Quick actions: "Reply on WhatsApp", "Copy Reply", and "Save to Internal Notes".

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rahamalapd.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b79d9f5a-c357-4fef-8641-06fba0048bce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
