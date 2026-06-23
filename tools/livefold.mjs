import { chromium } from "playwright";
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1320,height:740}});
await pg.goto("https://quickler.co/?cb="+Date.now(),{waitUntil:"networkidle",timeout:30000});
await pg.evaluate(()=>document.fonts?document.fonts.ready:null).catch(()=>{});
await pg.waitForTimeout(1500);
await pg.screenshot({path:"tools/shots/live-fold-now.png"});
await b.close();
