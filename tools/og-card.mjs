// Generate the default social-share card (assets/og/default-v2.png), 1200x630.
// This is the preview WhatsApp / LinkedIn / X show when the link is pasted.
//
// Design goals (learned from a bad WhatsApp thumbnail):
//  - WhatsApp shows a TINY ~80px thumbnail and centre-crops it. Busy cards with
//    several lines of small text turn to mush at that size. So keep it SIMPLE:
//    the real quickler logo, big and centred, one short line, nothing else.
//  - Use the actual logo artwork (assets/logos/quickler-logo-white.svg), not a
//    text render, because Space Grotesk is not installed for librsvg here and a
//    text "Quickler" would silently fall back to Arial and look off-brand.
//  - On-brand: dark navy card, gradient rule top and bottom, white logo.
//  - Everything centred so the square crop keeps the message whole.
// Run: node tools/og-card.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";

const W = 1200, H = 630;

// Pull the logo's <path> elements straight from the brand SVG so the card stays
// in sync with the real wordmark. The logo artwork is authored in an 850x200
// viewBox; we scale and centre it near the top third of the card.
const logoSrc = readFileSync("assets/logos/quickler-logo-white.svg", "utf8");
const logoPaths = (logoSrc.match(/<path[\s\S]*?\/>/g) || []).join("\n    ");

// Logo target: keep it inside WhatsApp's SQUARE centre-crop (a 630x630 window
// centred on the 1200-wide card, i.e. x from 285 to 915). So cap logo width at
// ~440px and centre it, leaving safe margin so no letter is clipped in the
// thumbnail. Keeps the 850:200 aspect.
const LOGO_W = 440;
const scale = LOGO_W / 850;
const LOGO_H = 200 * scale;
const logoX = (W - LOGO_W) / 2;
const logoY = 225;

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2f6bff"/>
      <stop offset="0.5" stop-color="#7c3aed"/>
      <stop offset="1" stop-color="#f43f8c"/>
    </linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#0c1734"/>
      <stop offset="1" stop-color="#080f22"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="12" fill="url(#bar)"/>
  <rect y="${H - 12}" width="${W}" height="12" fill="url(#bar)"/>

  <!-- The real quickler logo, scaled and centred. -->
  <g transform="translate(${logoX}, ${logoY}) scale(${scale})">
    ${logoPaths}
  </g>

  <!-- One short line. Big enough to read in the small thumbnail. -->
  <text x="${W / 2}" y="${logoY + LOGO_H + 90}" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="52"
        font-weight="700" fill="#FFFFFF">Field compliance, done on WhatsApp.</text>
</svg>`;

const OUT = "assets/og/default-v2.png";
await sharp(Buffer.from(svg)).png().toFile(OUT);
const meta = await sharp(OUT).metadata();
console.log(`Wrote ${OUT}  ${meta.width}x${meta.height}`);
