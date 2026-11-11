// Drive the pages behind the landing page in Edge (see check.mjs for the landing page itself).
//   npm i --no-save puppeteer-core@23        (once)
//   npx vite --port 5181                      (in another terminal)
//   node design/scripts/pages.mjs [url] [outDir] [all|pages|flow|rm]
// pages: loads every #page directly at desktop and phone size, screenshots a few scroll positions, reports page
//        height and horizontal overflow.
// flow:  clicks through every page transition (orange, pour, wave, splash, sun, awning) with mid-flight screenshots,
//        the order form (validation, slot, place), browser back, and "How it's made" landing on the pinned steps.
// rm:    prefers-reduced-motion: every page fully visible, links swap with no transition.
// Screenshots go to <temp>/russruss-pages unless outDir is given. Prints console errors and warnings at the end.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = (process.argv[2] || 'http://localhost:5181/').replace(/#.*$/, '');
const OUT = process.argv[3] || path.join(os.tmpdir(), 'russruss-pages');
const ONLY = process.argv[4] || 'all';
fs.mkdirSync(OUT, { recursive: true });
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
const VIEW = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844, isMobile: true, hasTouch: true } };

const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new' });
async function open(hash, view, rm = false) {
  const page = await browser.newPage();
  await page.setViewport(VIEW[view]);
  if (rm) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${view}${rm ? '/rm' : ''} ${hash}: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`${view} ${hash}: pageerror ${e.message}`));
  await page.goto(BASE + hash, { waitUntil: 'networkidle0' });
  return page;
}
const lenisTo = (page, y) => page.evaluate(v => (window.lenis ? window.lenis.scrollTo(v, { immediate: true, force: true }) : scrollTo(0, v)), y);

if (ONLY === 'all' || ONLY === 'pages') {
  for (const view of ['desktop', 'phone']) {
    for (const r of ['menu', 'juice/sun-up', 'juice/not-a-juice', 'visit', 'order', 'confirm']) {
      const page = await open('#' + r, view);
      await sleep(4500); // loader
      const name = `${view[0]}-${r.replace('/', '-')}`;
      await page.screenshot({ path: path.join(OUT, `${name}-0.png`) });
      const { H, over } = await page.evaluate(() => ({ H: document.documentElement.scrollHeight, over: document.documentElement.scrollWidth - innerWidth }));
      const h = VIEW[view].height, steps = Math.min(4, Math.ceil(H / h) - 1);
      for (let k = 1; k <= steps; k++) {
        await lenisTo(page, Math.min(H - h, k * h * 0.9));
        await sleep(1300);
        await page.screenshot({ path: path.join(OUT, `${name}-${k}.png`) });
      }
      console.log(`${view} #${r}: height ${H}, x-overflow ${over}`);
      await page.close();
    }
  }
}

if (ONLY === 'all' || ONLY === 'flow') {
  for (const view of ['desktop', 'phone']) {
    const page = await open('', view);
    await sleep(6500); // loader and cup drop
    const v = view[0];
    const shoot = async (tag, times) => { let t0 = 0; for (const t of times) { await sleep(t - t0); t0 = t; await page.screenshot({ path: path.join(OUT, `${v}-flow-${tag}-${t}.png`) }); } };
    const state = () => page.evaluate(() => `${location.hash || '(none)'} · ${document.querySelector('main').className} · ${document.querySelector('.bag').textContent}`);
    // scroll the target to mid-screen (its scroll-in animation runs), then click it
    const click = async sel => {
      const el = await page.waitForSelector(sel, { timeout: 5000 });
      await el.evaluate(e => { if (e.closest('.nav')) return; const y = e.getBoundingClientRect().top + (window.lenis?.scroll ?? scrollY) - innerHeight / 2; window.lenis ? window.lenis.scrollTo(Math.max(0, y), { immediate: true, force: true }) : scrollTo(0, y); });
      await sleep(1400);
      await el.click();
    };
    const step = async (label, sel, tag, times) => { await click(sel); await shoot(tag, times); console.log(`${view} ${label.padEnd(28)} ${await state()}`); };

    await step('nav → menu (orange)', '.nav li:nth-child(1) a', '1-menu', [250, 650, 2400]);
    await step('menu → juice (pour)', '.board-row:nth-child(3) .br-art', '2-juice', [200, 600, 1500, 2600]);
    await click('.buy .btn'); await sleep(600);
    await step('next juice (pour)', '.next', '3-next', [300, 900, 2600]);
    await step('bag → order (wave)', '.bag', '4-order', [250, 700, 2400]);
    await click('.quick-btn:nth-child(2)'); await sleep(300);
    await click('.place'); await sleep(500);
    console.log(`${view} validation: ${await page.$eval('.rc-problem', e => e.textContent).catch(() => '(none shown)')}`);
    await page.type('.field input', 'Sam');
    await click('.slot-btn:nth-child(3)');
    await step('place → confirm (splash)', '.place', '5-confirm', [200, 1100, 3200]);
    console.log(`${view} calendar link: ${await page.$eval('.cf-actions a[download]', a => a.href.slice(0, 5))}`);
    await step('confirm → visit (sun)', '.cf-actions .ghost', '6-visit', [300, 800, 2600]);
    await step('logo → home (awning)', '.logo', '7-home', [300, 700, 3200]);
    await page.goBack(); await sleep(2600); console.log(`${view} ${'back'.padEnd(28)} ${await state()}`);
    if (view === 'desktop') {
      await click('.nav li:nth-child(2) a'); await sleep(3500);
      const [y, pin] = await page.evaluate(() => [Math.round(window.lenis.scroll), Math.round(window.ScrollTrigger.getAll().find(t => t.pin && t.trigger.id === 'steps').start)]);
      console.log(`${view} "How it's made" lands at ${y}, steps pin starts at ${pin}${y === pin ? '' : '  <-- MISMATCH'}`);
      await page.screenshot({ path: path.join(OUT, `${v}-flow-8-steps.png`) });
    }
    await page.close();
  }
}

if (ONLY === 'all' || ONLY === 'rm') {
  for (const r of ['menu', 'juice/gold-rush', 'visit', 'order']) {
    const page = await open('#' + r, 'desktop', true);
    await sleep(1200);
    // anything laid out but invisible (the size radios are visually hidden on purpose)
    const hidden = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const s = getComputedStyle(e); return e.getBoundingClientRect().width > 0 && !e.matches('.size-opt input') && (s.visibility === 'hidden' || +s.opacity === 0); }).length);
    await page.screenshot({ path: path.join(OUT, `r-${r.replace('/', '-')}.png`), fullPage: true });
    console.log(`rm #${r}: hidden elements ${hidden}`);
    await page.close();
  }
  const page = await open('#menu', 'desktop', true);
  await page.click('.board-row:nth-child(2) .br-name a'); await sleep(300);
  console.log('rm click: ' + await page.evaluate(() => `${location.hash} · ${document.querySelector('main').className}`));
  await page.close();
}

await browser.close();
console.log(errors.length ? `\n${errors.length} console errors/warnings:\n${errors.join('\n')}` : '\nno console errors or warnings');
console.log(`screenshots: ${OUT}`);
