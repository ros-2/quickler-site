import { chromium } from "playwright";
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage({viewport:{width:1440,height:520}});
await pg.goto("https://quickler.co/?z=2",{waitUntil:"networkidle"});
await pg.waitForTimeout(900);
const d=await pg.evaluate(()=>{
  const n=document.querySelector("nav");
  const r=n.getBoundingClientRect();
  const cs=getComputedStyle(n);
  // what element is at the very top-left corner (x=2,y=20)?
  const corner=document.elementFromPoint(2,20);
  const cc=corner?getComputedStyle(corner):null;
  return {
    navLeft:Math.round(r.left), navWidth:Math.round(r.width),
    navBg:cs.backgroundImage.slice(0,60), navRadius:cs.borderTopLeftRadius,
    cornerTag:corner?corner.tagName+"."+corner.className:null,
    cornerBg:cc?cc.backgroundImage.slice(0,60):null,
    cornerRect: corner?JSON.stringify({l:Math.round(corner.getBoundingClientRect().left),w:Math.round(corner.getBoundingClientRect().width)}):null
  };
});
console.log(JSON.stringify(d,null,2));
await b.close();
