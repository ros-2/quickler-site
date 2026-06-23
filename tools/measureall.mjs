import { chromium } from "playwright";
const b = await chromium.launch();
const pg = await b.newPage({ viewport:{width:1440,height:1000} });
await pg.goto("https://quickler.co/?cb="+Date.now(), { waitUntil:"networkidle", timeout:30000 });
await pg.waitForTimeout(1500);
const m = await pg.evaluate(() => {
  const pick = (sel) => { const el=document.querySelector(sel); if(!el) return null; const r=el.getBoundingClientRect(); const cs=getComputedStyle(el); return { sel, top:Math.round(r.top), bottom:Math.round(r.bottom), h:Math.round(r.height), padT:cs.paddingTop, padB:cs.paddingBottom, marT:cs.marginTop, marB:cs.marginBottom, gap:cs.gap, minH:cs.minHeight }; };
  return {
    nav: pick("nav"),
    section: pick("section#top, body>section:first-of-type, main>section:first-of-type"),
    centre: pick(".home-hero-centre"),
    pill: pick(".hero-label"),
    h1: pick(".home-hero-centre h1, section#top h1"),
    main: pick("main"),
  };
});
console.log(JSON.stringify(m,null,2));
await b.close();
