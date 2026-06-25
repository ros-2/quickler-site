import { chromium } from "playwright";
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const path of ["/","/pages/help/index.html","/pages/about.html"]) {
  const pg=await b.newPage({viewport:{width:1280,height:860}});
  await pg.goto("https://quickler.co"+path+"?n="+Date.now()%9999,{waitUntil:"networkidle"});
  await pg.waitForTimeout(700);
  const d=await pg.evaluate(()=>{const n=document.querySelector('nav');if(!n)return{exists:false};const cs=getComputedStyle(n);const r=n.getBoundingClientRect();return{exists:true,display:cs.display,opacity:cs.opacity,visibility:cs.visibility,top:Math.round(r.top),height:Math.round(r.height),bg:cs.backgroundImage.slice(0,30),scrolled:n.classList.contains('nav-scrolled')};});
  console.log(path.padEnd(28), JSON.stringify(d));
  await pg.close();
}
await b.close();
