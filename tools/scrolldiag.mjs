import { chromium } from "playwright";
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage({viewport:{width:1280,height:860}});
await pg.goto("https://quickler.co/?d="+Date.now()%99999,{waitUntil:"networkidle"});
await pg.waitForTimeout(800);
const d=await pg.evaluate(()=>{
  const sc=document.querySelector('.story-scroll');
  const cs=getComputedStyle(sc);
  const before=sc.scrollTop;
  sc.scrollBy(0,500);
  const after=sc.scrollTop;
  return {found:!!sc,overflowY:cs.overflowY,height:cs.height,scrollH:sc.scrollHeight,clientH:sc.clientHeight,canScroll:sc.scrollHeight>sc.clientHeight,before,after,moved:after>before,snapType:cs.scrollSnapType};
});
console.log(JSON.stringify(d,null,1));
await b.close();
