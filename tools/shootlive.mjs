import { chromium } from "playwright";
const b = await chromium.launch();
for (const [name,w,h,full] of [["live-home-desktop",1440,1100,true],["live-home-fold",1440,900,false],["live-home-mobile",390,844,false]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:1 });
  const pg = await ctx.newPage();
  await pg.goto("https://quickler.co/",{waitUntil:"networkidle",timeout:30000}).catch(()=>{});
  await pg.evaluate(()=>document.fonts?document.fonts.ready:null).catch(()=>{});
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path:`tools/shots/${name}.png`, fullPage:full });
  await ctx.close(); console.log("shot",name);
}
await b.close();
