import { chromium } from "playwright";
const b=await chromium.launch();
for(const [w,h] of [[1440,1000],[1320,740]]){
  const pg=await b.newPage({viewport:{width:w,height:h}});
  await pg.goto("https://quickler.co/?cb="+Date.now(),{waitUntil:"networkidle",timeout:30000});await pg.waitForTimeout(1200);
  const m=await pg.evaluate(()=>{const nav=document.querySelector("nav").getBoundingClientRect();const pill=document.querySelector(".hero-label").getBoundingClientRect();return Math.round(pill.top-nav.bottom);});
  console.log(`LIVE ${w}x${h} -> gap: ${m}px`);
  await pg.close();
}
await b.close();
