import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { CSSProperties } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger };

export const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const FINE = window.matchMedia('(pointer: fine)').matches;
export const NARROW = () => window.matchMedia('(max-width: 760px)').matches;

export const rand = (min: number, max: number) => min + Math.random() * (max - min);
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Scale at which an element of width `w`, centred anywhere on screen, covers the viewport. */
export const cover = (w: number) => (2 * Math.hypot(innerWidth, innerHeight) / Math.max(w, 1)) * 1.05;

/** Inline style that sets CSS custom properties (React's types reject `--x` keys). */
export const vars = (v: Record<string, string | number>) => v as CSSProperties;

let velocity = 0;
/** Latest scroll velocity in px/s (signed). */
export const vel = () => velocity;
export function trackVelocity() {
  ScrollTrigger.create({ onUpdate: s => { velocity = s.getVelocity(); } });
}

/** Runs `onChange(true/false)` as the element enters/leaves the viewport. Pinned (fixed) sections count as visible. */
export function whileVisible(el: Element, onChange: (visible: boolean) => void) {
  const io = new IntersectionObserver(([e]) => onChange(e.isIntersecting), { rootMargin: '10% 0px' });
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Fires `fn` once each time a scrubbed timeline passes `at` going forward (re-arms when scrolled back).
 * Use from a ScrollTrigger's onUpdate: `cues.update(self)`.
 */
export function cueList() {
  const cues: { at: number; fn: () => void; done: boolean }[] = [];
  return {
    add(at: number, fn: () => void) { cues.push({ at, fn, done: false }); },
    update(self: ScrollTrigger) {
      const p = self.progress;
      cues.forEach(c => {
        if (!c.done && self.direction > 0 && p >= c.at) { c.done = true; c.fn(); }
        else if (c.done && p < c.at - 0.04) c.done = false;
      });
    },
  };
}
