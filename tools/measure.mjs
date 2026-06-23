import { chromium } from "playwright";
const b = await chromium.launch();
const pg = await b.newPage({ viewport:{width:1440,height:1000} });
await pg.goto("https://quickler.co/", { waitUntil:"networkidle", timeout:30000 });
await pg.waitForTimeout(1200);
const m = await pg.evaluate(() => {
  const out = {};
  const nav = document.querySelector("nav");
  const pill = document.querySelector(".home-funnel-chip, .hero-label, .eyebrow, [class*='chip']");
  const sec = document.querySelector("section#top, body > section:first-of-type, main > section:first-of-type");
  const panel = document.querySelector(".home-hero-panel");
  const r = el => el ? (()=>{const x=el.getBoundingClientRect();return{top:Math.round(x.top),bottom:Math.round(x.bottom),h:Math.round(x.height),cls:el.className.slice(0,40)};})() : null;
  out.nav = r(nav);
  out.firstSection = r(sec);
  out.pill = r(pill);
  out.panel = r(panel);
  if (sec) { const cs=getComputedStyle(sec); out.sectionPad={top:cs.paddingTop,bottom:cs.paddingBottom,minH:cs.minHeight}; }
  if (panel) { const cs=getComputedStyle(panel); out.panelPad={top:cs.paddingTop,align:cs.alignItems,minH:cs.minHeight}; }
  // what's the tag/class of the first child of section that has real height before the pill?
  return out;
});
console.log(JSON.stringify(m,null,2));
await b.close();
