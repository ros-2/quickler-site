// Generate the default social-share card (assets/og/default-v2.png), 1200x630.
// This is the preview WhatsApp / LinkedIn / X show when the link is pasted.
//
// Design goals (learned from a bad WhatsApp thumbnail):
//  - WhatsApp shows a TINY ~80px thumbnail and centre-crops it. Busy cards with
//    several lines of small text turn to mush at that size. So keep it SIMPLE:
//    the real quickler logo, big and centred, one short line, nothing else.
//  - Use the actual logo artwork (assets/logos/quickler-logo.svg), not a text
//    render, so the wordmark always matches the brand file exactly.
//  - On-brand: the card must match the SITE, which is light (--surface #f6f9ff)
//    with #2f6bff as the one accent and the gradient used SPARINGLY. The old
//    card was dark navy with full gradient bars top and bottom, a relic of the
//    pre-2026-06 design; it no longer looked like anything on quickler.co.
//  - Everything centred so the square crop keeps the message whole.
//
// FONT: the tagline is set in Space Grotesk, the brand font. The repo only ships
// woff2 (for the browser), which librsvg cannot read, so this script converts
// the woff2 to a TTF in a temp dir and points fontconfig at it for the duration
// of the run. No system install is needed and the card can never silently fall
// back to Arial, which is what the previous version did.
//
// KNOWN LIMITATION, found 2026-09-11: assets/fonts/space-grotesk-{400,500,600,
// 700}.woff2 are BYTE-IDENTICAL. All four are subsets of the LIGHT master
// (name records say family "Space Grotesk Light", usWeightClass 300, and the
// glyf tables hash the same). So there is no real bold on disk. Asking librsvg
// for font-weight:700 matched nothing and it fell back to a SERIF.
// We therefore ask for the family that actually exists and let the renderer
// synthesise emphasis, and we carry the weight with SIZE and COLOUR instead.
// The browser does the same synthesis for every bold heading on the site.
// Fixing that properly means sourcing genuine weight files; see the note left
// for Philip.
//
// Run: node tools/og-card.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const W = 1200, H = 630;

// ---- Brand tokens, kept in step with src/css/tokens.css -------------------
const INK_STRONG = "#0c1734"; // headings
const INK_SOFT = "#67789e"; // secondary / labels
const SURFACE = "#f6f9ff"; // page background
const BLUE = "#2f6bff"; // THE Quickler blue
const VIOLET = "#7c3aed";
const PINK = "#f43f8c";

// The one line, and who it is for. Must match the site's current positioning
// (care homes, nurseries, schools, cleaning firms and trades), NOT the retired
// "Field compliance, done on WhatsApp." trades line, which was the last place
// the old construction-only wording survived and the FIRST thing anyone saw
// when the link was pasted into WhatsApp.
//
// Set on TWO lines. A single 41-character line at a readable size overruns the
// 630px square safe window, and WhatsApp's centre-crop chopped it to "ons and
// audits, done on Wh". Verified by simulating the crop, not by eye.
const TAGLINE = ["Inspections and audits,", "done on WhatsApp."];
// Kept short enough to fit the 630px square safe window too, so the crop never
// slices it mid-word. Measured, not guessed: the full list of sectors ran to
// 713px and was cut on both sides. The long list still appears in the page
// description, which is what LinkedIn and X show beside the card.
const SUBLINE = "Care, nurseries, schools, cleaning, trades";

// ---- Make Space Grotesk visible to librsvg --------------------------------
// woff2 -> ttf via fontTools, into a throwaway fontconfig dir. If anything in
// this chain is missing we FAIL rather than quietly rendering Arial.
function prepareFont() {
    const woff2 = "assets/fonts/space-grotesk-700.woff2";
    if (!existsSync(woff2)) {
        throw new Error(`Missing ${woff2}; cannot render the card in the brand font.`);
    }
    const dir = mkdtempSync(join(tmpdir(), "quickler-og-font-"));
    const ttf = join(dir, "SpaceGrotesk-Bold.ttf");

    // fontTools does the woff2 -> ttf unpack. Some systems (PEP 668) refuse a
    // plain `pip install`, so allow an override: OG_PYTHON=/path/to/venv/bin/python
    const python = process.env.OG_PYTHON || "python3";
    try {
        execFileSync(python, ["-c", `
from fontTools.ttLib import TTFont
f = TTFont(${JSON.stringify(woff2)})
f.flavor = None
f.save(${JSON.stringify(ttf)})
`], { stdio: "pipe" });
    } catch (e) {
        throw new Error(
            `Could not convert ${woff2} with ${python}.\n` +
            "fontTools and brotli are needed. Either install them, or make a venv:\n" +
            "  python3 -m venv /tmp/ogfont && /tmp/ogfont/bin/pip install fonttools brotli\n" +
            "  OG_PYTHON=/tmp/ogfont/bin/python node tools/og-card.mjs\n" +
            `Underlying error: ${e.stderr?.toString().trim() || e.message}`
        );
    }

    // A minimal fontconfig that sees ONLY this dir plus the system dirs.
    const conf = join(dir, "fonts.conf");
    writeFileSync(conf, `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${dir}</dir>
  <dir>/usr/share/fonts</dir>
  <cachedir>${dir}/cache</cachedir>
</fontconfig>
`);
    process.env.FONTCONFIG_FILE = conf;
    return dir;
}

prepareFont();

// Pull the logo's artwork straight from the brand SVG so the card stays in sync
// with the real wordmark. The logo is authored in an 850x200 viewBox; we scale
// and centre it in the upper half of the card.
//
// NOTE: the light card needs the PRIMARY logo (quickler-logo.svg), not the white
// one. The white wordmark on the old navy card is why this file used to read
// assets/logos/quickler-logo-white.svg. The primary mark fills its letterforms
// with gradients declared in its OWN <defs>, so we must carry those defs across
// too: copying the <path> elements alone would resolve every fill to nothing and
// render an empty card.
const logoSrc = readFileSync("assets/logos/quickler-logo.svg", "utf8");
const logoPaths = (logoSrc.match(/<path[\s\S]*?\/>/g) || []).join("\n    ");
if (!logoPaths) {
    throw new Error("No <path> found in the logo SVG; the card would render empty.");
}
const logoDefs = (logoSrc.match(/<defs>([\s\S]*?)<\/defs>/) || [, ""])[1];
// Every gradient the paths reference must have arrived with the defs.
for (const id of new Set([...logoPaths.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]))) {
    if (!logoDefs.includes(`id="${id}"`)) {
        throw new Error(`Logo path references #${id} but it is not in <defs>; the mark would render blank.`);
    }
}

// Logo target: keep it inside WhatsApp's SQUARE centre-crop (a 630x630 window
// centred on the 1200-wide card, i.e. x from 285 to 915). So cap logo width at
// ~440px and centre it, leaving safe margin so no letter is clipped in the
// thumbnail. Keeps the 850:200 aspect.
const LOGO_W = 440;
const scale = LOGO_W / 850;
const LOGO_H = 200 * scale;
const logoX = (W - LOGO_W) / 2;

// Type sizes. The tagline is capped so the LONGEST line fits the 630px square
// safe window with margin; at ~0.52em average advance in Space Grotesk, a
// 23-character line at 42px is about 500px wide, comfortably inside.
const TAGLINE_SIZE = 42;
const TAGLINE_LEADING = 54;
const SUBLINE_SIZE = 26;

// Centre the whole stack (logo + tagline lines + subline) vertically rather
// than hardcoding a top offset. Offsets are baseline gaps from the logo bottom,
// so adding or removing a tagline line keeps the card balanced automatically.
const TAGLINE_GAP = 86; // logo bottom -> FIRST tagline baseline
const SUBLINE_GAP = TAGLINE_GAP + (TAGLINE.length - 1) * TAGLINE_LEADING + 58;
const BLOCK_H = LOGO_H + SUBLINE_GAP + 10; // +10 for the subline's descenders
const logoY = Math.round((H - BLOCK_H) / 2);

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${BLUE}"/>
      <stop offset="0.35" stop-color="#5a4fcf"/>
      <stop offset="0.65" stop-color="${VIOLET}"/>
      <stop offset="1" stop-color="${PINK}"/>
    </linearGradient>
    ${logoDefs}
  </defs>

  <!-- Light card, matching the surface token on the live site. -->
  <rect width="${W}" height="${H}" fill="${SURFACE}"/>

  <!-- The gradient as a SPARING accent: one thin rule at the top only, the way
       the site uses it. The old card had heavy 12px bars top AND bottom. -->
  <rect width="${W}" height="6" fill="url(#bar)"/>

  <!-- The real quickler logo, scaled and centred. -->
  <g transform="translate(${logoX}, ${logoY}) scale(${scale})">
    ${logoPaths}
  </g>

  <!-- One short line, in the brand font. Big enough to read in the thumbnail.
       font-family must be the family that is actually ON DISK ("Space Grotesk
       Light", see the KNOWN LIMITATION note at the top of this file), otherwise
       librsvg finds no match and silently falls back to a serif. -->
  ${TAGLINE.map((line, i) => `<text x="${W / 2}" y="${logoY + LOGO_H + TAGLINE_GAP + i * TAGLINE_LEADING}" text-anchor="middle"
        font-family="Space Grotesk Light, Space Grotesk" font-size="${TAGLINE_SIZE}"
        fill="${INK_STRONG}">${line}</text>`).join("\n  ")}

  <!-- Who it is for. Smaller, secondary ink, so it drops away in the tiny crop
       but reads on LinkedIn/X where the full card is shown. -->
  <text x="${W / 2}" y="${logoY + LOGO_H + SUBLINE_GAP}" text-anchor="middle"
        font-family="Space Grotesk Light, Space Grotesk" font-size="${SUBLINE_SIZE}"
        fill="${INK_SOFT}">${SUBLINE}</text>
</svg>`;

// A "--" inside an XML comment is illegal and sharp reports it only as the
// baffling "Input buffer has corrupt header". Easy to hit when a comment
// mentions a CSS custom property. Catch it here with a message that says what
// is actually wrong.
for (const c of svg.match(/<!--[\s\S]*?-->/g) || []) {
    if (c.slice(4, -3).includes("--")) {
        throw new Error(
            "Illegal '--' inside an XML comment; rewrite it (for example say " +
            `"the surface token" rather than the property name):\n${c.split("\n")[0]}`
        );
    }
}

const OUT = "assets/og/default-v2.png";
await sharp(Buffer.from(svg)).png().toFile(OUT);
const meta = await sharp(OUT).metadata();
console.log(`Wrote ${OUT}  ${meta.width}x${meta.height}`);
