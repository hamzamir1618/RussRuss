import { FINE, RM } from './motion';

/** Juice droplets on one fixed canvas: each burst flings round drops that fall, stretch with speed and fade. */

export const JUICE = {
  citrus: ['#FF6A13', '#FFC300', '#FFF6E2'],
  green: ['#7ED321', '#E6F9C8', '#FFF6E2'],
  pink: ['#FF2E7E', '#FFB3CF', '#FFF6E2'],
  gold: ['#FFC300', '#FF6A13', '#FFF6E2'],
  party: ['#FF2E7E', '#FF6A13', '#FFC300', '#FFF6E2'],
};

type Drop = { x: number; y: number; vx: number; vy: number; r: number; c: string; life: number };

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let drops: Drop[] = [];
let running = false;
const dpr = Math.min(2, window.devicePixelRatio || 1);

function ensure() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'fx';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  const size = () => { canvas!.width = innerWidth * dpr; canvas!.height = innerHeight * dpr; };
  size();
  addEventListener('resize', size);
}

function tick() {
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  drops = drops.filter(d => d.life > 0 && d.y < innerHeight + 60);
  for (const d of drops) {
    d.vy += 0.35; d.vx *= 0.99; d.x += d.vx; d.y += d.vy; d.life -= 0.011;
    const sp = Math.hypot(d.vx, d.vy), r = d.r * Math.min(1, d.life * 2.2), ang = Math.atan2(d.vy, d.vx);
    if (r <= 0) continue; // life can dip below zero on its last frame; a negative radius throws
    ctx.beginPath(); ctx.ellipse(d.x, d.y, r * (1 + sp * 0.04), r, ang, 0, Math.PI * 2);
    ctx.fillStyle = d.c; ctx.fill();
    ctx.beginPath(); ctx.ellipse(d.x - r * 0.3, d.y - r * 0.3, r * 0.28, r * 0.18, ang, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill();
  }
  if (drops.length) requestAnimationFrame(tick);
  else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
}

/** Fling `n` drops upward from (x, y) in viewport pixels. Half as many on touch screens; none with reduced motion. */
export function burst(x: number, y: number, colors: string[], n = 30, power = 1) {
  if (RM) return;
  ensure();
  const count = FINE ? n : Math.round(n / 2);
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25, s = (5 + Math.random() * 10) * power;
    drops.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 3 + Math.random() * 9, c: colors[i % colors.length], life: 1 });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}

/** Burst from a point inside an element, given as fractions of its box. */
export function burstFrom(el: Element | null | undefined, fx: number, fy: number, colors: string[], n?: number, power?: number) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  burst(r.left + r.width * fx, r.top + r.height * fy, colors, n, power);
}
