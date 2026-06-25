import { chromium } from "playwright";
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage({viewport:{width:1280,height:860}});
const errs=[];
pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
pg.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
await pg.goto("https://quickler.co/?fresh="+Date.now(),{waitUntil:"networkidle"});
await pg.waitForTimeout(1000);
// try several scroll methods
const r=await pg.evaluate(async()=>{
  const sc=document.querySelector('.story-scroll');
  const results={};
  // method 1: scrollTop set
  sc.scrollTop=400; await new Promise(r=>setTimeout(r,100));
  results.setScrollTop=Math.round(sc.scrollTop);
  sc.scrollTop=0;
  // is anything overlaying with pointer-events covering it?
  const mid=document.elementFromPoint(640,430);
  results.elementAtCentre=mid?mid.className+' / '+mid.tagName:'none';
  // computed
  const cs=getComputedStyle(sc);
  results.overflowY=cs.overflowY; results.height=cs.height; results.touchAction=cs.touchAction;
  results.bodyOverflow=getComputedStyle(document.body).overflow;
  results.scrollH=sc.scrollHeight; results.clientH=sc.clientHeight;
  return results;
});
console.log("DIAG:",JSON.stringify(r,null,1));
console.log("JS ERRORS:",errs.length?errs.join('\n'):'none');
// real wheel
await pg.mouse.move(640,430); await pg.mouse.wheel(0,600); await pg.waitForTimeout(600);
console.log("after wheel:",await pg.evaluate(()=>Math.round(document.querySelector('.story-scroll').scrollTop)));
await b.close();
