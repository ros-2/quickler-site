import { chromium } from "playwright";
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage({viewport:{width:1280,height:860}});
await pg.goto("https://quickler.co/?x="+Date.now()%9999,{waitUntil:"networkidle"});
await pg.waitForTimeout(700);
const d=await pg.evaluate(()=>{
  const inner=document.querySelector('.story-hero .story-inner');
  const cs=getComputedStyle(inner);
  return {maxH:cs.maxHeight, overflowY:cs.overflowY, innerScrollH:inner.scrollHeight, innerClientH:inner.clientHeight, innerScrollable:inner.scrollHeight>inner.clientHeight};
});
console.log(JSON.stringify(d,null,1));
await b.close();
