// Render the reduced-motion stills of the rabbit (public/img/rabbit-{hero,press,steps,finale}.webp) from the live
// 3D rabbit, at rest, with the exact framing of each slot. Run after changing the model or a slot's framing.
//   npm i --no-save puppeteer-core@23        (once)
//   npx vite --port 5181                      (in another terminal)
//   node design/scripts/stills.mjs [url]
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const URL = process.argv[2] || 'http://localhost:5181/';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/img');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 }); // 2x, so the stills stay sharp on retina screens
await page.goto(URL, { waitUntil: 'networkidle0' });
await sleep(7000); // loader, cup drop, his entrance

async function grab(name) {
  // pointer straight in front of him, any action finished, idle moves off, then let him settle
  const [x, y] = await page.evaluate(() => { const c = document.querySelector('.mascot-canvas').getBoundingClientRect(); return [c.left + c.width / 2, c.top + c.height * 0.3]; });
  await page.mouse.move(x, y);
  await page.evaluate(() => { const m = window.mascot; m.rabbit.action?.kill(); m.rabbit.rest(0); m.idleAt = 1e9; });
  await sleep(1500);
  const url = await page.evaluate(() => window.mascot.snapshot('image/webp', 0.88));
  const file = path.join(OUT, `rabbit-${name}.webp`);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote', file);
}

await grab('hero');
// the other sections: jump into each pin, let him drop in (or pop up), then grab
for (const [id, at] of [['press', 0.02], ['steps', 0.3], ['finale', 0.9]]) {
  const y = await page.evaluate(([id, at]) => { const t = window.ScrollTrigger.getAll().find(t => t.pin && t.trigger.id === id); return t.start + (t.end - t.start) * at; }, [id, at]);
  await page.evaluate(v => window.lenis.scrollTo(v, { immediate: true, force: true }), y);
  await sleep(2800);
  await grab(id);
}
await browser.close();
