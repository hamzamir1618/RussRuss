import Lenis from 'lenis';
import { gsap, ScrollTrigger, RM } from './motion';

let lenis: Lenis | null = null;

/** Smooth scroll, driven by the GSAP ticker so ScrollTrigger scrubs stay in step. Call once before render. */
export function startSmoothScroll() {
  if (RM || lenis) return;
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function goTo(selector: string, offset = 0) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.8, offset });
  else el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
}

/** Absolute scroll position, glided by default. */
export function scrollToY(y: number, immediate = false) {
  if (lenis) lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.8, force: true });
  else window.scrollTo({ top: y, behavior: immediate || RM ? 'auto' : 'smooth' });
}

/** Straight to a section, no glide (used right after a page swap, while the screen is covered). */
export function jumpTo(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  lenis?.resize(); // its scroll limit is measured asynchronously; a page swap just changed the height
  const y = el.getBoundingClientRect().top + scrollY();
  scrollToY(y, true);
}

export const scrollY = () => (lenis ? lenis.scroll : window.scrollY);

export function lockScroll(on: boolean) {
  document.documentElement.classList.toggle('locked', on);
  if (lenis) (on ? lenis.stop() : lenis.start());
}

/** Dev-only handles for the puppeteer checks. */
export function exposeForTesting() {
  if (!import.meta.env.DEV) return;
  Object.assign(window, { lenis, ScrollTrigger, gsap });
}
