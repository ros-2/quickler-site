import { chromium } from "playwright";
const b=await chromium.launch({ executablePath: "/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell" });
const pg=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
try{
  await pg.goto("https://godaylight.com/?ref=siteinspire",{waitUntil:"domcontentloaded",timeout:45000});
  await pg.waitForTimeout(3500);
  await pg.screenshot({path:"tools/shots/ref-daylight-top.png"});
  await pg.evaluate(()=>window.scrollTo(0,1000)); await pg.waitForTimeout(1500);
  await pg.screenshot({path:"tools/shots/ref-daylight-mid.png"});
  const facts=await pg.evaluate(()=>{const c=getComputedStyle(document.body);const h1=document.querySelector("h1");return{bodyBg:c.backgroundColor,bodyColor:c.color,font:c.fontFamily,h1:h1?{size:getComputedStyle(h1).fontSize,weight:getComputedStyle(h1).fontWeight,text:h1.textContent.trim().slice(0,80)}:null};});
  console.log("FACTS",JSON.stringify(facts));
}catch(e){console.log("ERR",String(e).slice(0,200));}
await b.close();
