import { chromium } from "playwright";
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const w of [1920,1440,390]) {
  const pg=await b.newPage({viewport:{width:w,height:900}});
  await pg.goto("https://quickler.co/?cb="+w,{waitUntil:"networkidle"});
  await pg.waitForTimeout(800);
  const d=await pg.evaluate(()=>{const n=document.querySelector("nav");const r=n.getBoundingClientRect();const cs=getComputedStyle(n);return {scrolled:n.classList.contains("nav-scrolled"),left:Math.round(r.left),width:Math.round(r.width),vw:innerWidth,radius:cs.borderTopLeftRadius,top:Math.round(r.top)};});
  console.log("LIVE @"+w, JSON.stringify(d));
  await pg.close();
}
await b.close();
