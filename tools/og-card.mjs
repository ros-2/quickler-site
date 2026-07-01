// Generate the default social-share card (assets/og/default.png), 1200x630.
// This is the preview WhatsApp / LinkedIn / X show when the link is pasted.
// Design goals:
//  - Brand-forward: "Quickler" leads (capitalised, matches current positioning).
//  - Survives WhatsApp's small centre-crop: key text is centred, not left-flush,
//    so the thumbnail never chops the message mid-phrase.
//  - On-brand gradient identity, high contrast, readable at thumbnail size.
// Run: node tools/og-card.mjs
import sharp from "sharp";

const W = 1200, H = 630;

// Brand gradient (matches the site's blue->violet->pink top bar) as a dark card
// with a bright gradient rule top and bottom so it reads as "Quickler" instantly.
const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3B5BFF"/>
      <stop offset="0.5" stop-color="#7C4DFF"/>
      <stop offset="1" stop-color="#FF4D9D"/>
    </linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#0C1B3A"/>
      <stop offset="1" stop-color="#0A1226"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="10" fill="url(#bar)"/>
  <rect y="${H - 10}" width="${W}" height="10" fill="url(#bar)"/>

  <!-- Everything centred so WhatsApp's square crop keeps the message -->
  <text x="${W / 2}" y="205" text-anchor="middle"
        font-family="Space Grotesk, Arial, sans-serif" font-size="120"
        font-weight="700" fill="#FFFFFF" letter-spacing="-2">Quickler</text>

  <text x="${W / 2}" y="330" text-anchor="middle"
        font-family="Space Grotesk, Arial, sans-serif" font-size="58"
        font-weight="600" fill="#FFFFFF">Field compliance, done on WhatsApp.</text>

  <text x="${W / 2}" y="420" text-anchor="middle"
        font-family="Space Grotesk, Arial, sans-serif" font-size="40"
        font-weight="400" fill="#9DB0D6">Your team answers on the app they already use.</text>

  <text x="${W / 2}" y="480" text-anchor="middle"
        font-family="Space Grotesk, Arial, sans-serif" font-size="40"
        font-weight="400" fill="#9DB0D6">Replies and photos become a finished report.</text>

  <!-- pill: the anchor benefit -->
  <rect x="${W / 2 - 210}" y="530" width="420" height="60" rx="30"
        fill="none" stroke="url(#bar)" stroke-width="2"/>
  <text x="${W / 2}" y="569" text-anchor="middle"
        font-family="Space Grotesk, Arial, sans-serif" font-size="30"
        font-weight="600" fill="#FFFFFF">No app. No paperwork.</text>
</svg>`;

// Versioned filename: WhatsApp/LinkedIn cache OG images aggressively, so a new
// design must ship under a new URL to force a refetch. Bump the suffix when the
// card design changes and update the references in head.njk + index.njk.
const OUT = "assets/og/default-v2.png";
await sharp(Buffer.from(svg)).png().toFile(OUT);
const meta = await sharp(OUT).metadata();
console.log(`Wrote ${OUT}  ${meta.width}x${meta.height}`);
