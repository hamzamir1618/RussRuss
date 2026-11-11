import type { CSSProperties } from 'react';
import { FINALE, HERO } from '../data/copy';

/** Points of an `n`-pointed starburst, alternating outer radius `r1` and inner radius `r2`. */
const star = (n: number, r1: number, r2: number) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 ? r2 : r1, a = (Math.PI * i) / n - Math.PI / 2;
    return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

const BURST = star(18, 98, 84);

/** viewBox for each sticker symbol, so <Sticker> can size any of them. */
export const BOX = {
  sparkle: '-50 -50 100 100',
  daisy: '-50 -50 100 100',
  sunicon: '-50 -50 100 100',
  rainbow: '-52 -52 104 54',
  squiggle: '0 0 100 20',
  leaf: '-30 -50 60 100',
  badge6: '0 0 200 200',
  badge7: '0 0 200 200',
} as const;
export type StickerId = keyof typeof BOX;

/** A sticker from the sprite. `color` drives currentColor (sparkle, daisy petals, squiggle, sun icon). */
export function Sticker({ id, className, style, color }: { id: StickerId; className?: string; style?: CSSProperties; color?: string }) {
  return (
    <svg className={className} viewBox={BOX[id]} style={color ? { color, ...style } : style} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

/** One hidden sprite of the 70s sticker kit and the shared text paths. Mount once, before anything that uses it. */
export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <path id="ringP" d="M100,100 m-89,0 a89,89 0 1,1 178,0 a89,89 0 1,1 -178,0" />
        <path id="ringS" d="M100,100 m-60,0 a60,60 0 1,1 120,0 a60,60 0 1,1 -120,0" />
        <path id="archP" d="M60,330 Q500,10 940,330" />
      </defs>
      <symbol id="sparkle" viewBox={BOX.sparkle}>
        <path d="M0 -50 C5 -12 12 -5 50 0 C12 5 5 12 0 50 C-5 12 -12 5 -50 0 C-12 -5 -5 -12 0 -50 Z" fill="currentColor" />
      </symbol>
      <symbol id="daisy" viewBox={BOX.daisy}>
        <g fill="currentColor">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(r => <ellipse key={r} cx="0" cy="-27" rx="12" ry="22" transform={`rotate(${r})`} />)}
        </g>
        <circle r="14" fill="#FFC300" />
        <circle r="14" fill="none" stroke="#3B1E08" strokeWidth="2" strokeDasharray="1 4" />
      </symbol>
      <symbol id="rainbow" viewBox={BOX.rainbow}>
        <path d="M-50 0 A50 50 0 0 1 50 0 L40 0 A40 40 0 0 0 -40 0 Z" fill="#FF2E7E" />
        <path d="M-40 0 A40 40 0 0 1 40 0 L30 0 A30 30 0 0 0 -30 0 Z" fill="#FF6A13" />
        <path d="M-30 0 A30 30 0 0 1 30 0 L20 0 A20 20 0 0 0 -20 0 Z" fill="#FFC300" />
      </symbol>
      <symbol id="squiggle" viewBox={BOX.squiggle}>
        <path d="M3 10 Q11.5 1 20 10 T37 10 T54 10 T71 10 T88 10 T97 10" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </symbol>
      <symbol id="sunicon" viewBox={BOX.sunicon}>
        <circle r="18" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="6" strokeLinecap="round">
          <path d="M0 -28 V-44 M0 28 V44 M-28 0 H-44 M28 0 H44 M-20 -20 L-31 -31 M20 20 L31 31 M-20 20 L-31 31 M20 -20 L31 -31" />
        </g>
      </symbol>
      <symbol id="leaf" viewBox={BOX.leaf}>
        <path d="M0 46 C-32 16 -26 -26 0 -46 C26 -26 32 16 0 46 Z" fill="#7ED321" />
        <path d="M0 42 V-38" stroke="#FFF6E2" strokeWidth="3" strokeLinecap="round" opacity=".7" />
      </symbol>
      <symbol id="badge6" viewBox={BOX.badge6}>
        <polygon points={BURST} transform="translate(100 100)" fill="#FF2E7E" />
        <circle cx="100" cy="100" r="70" fill="#FFF6E2" />
        <text className="ring-txt ring-sm"><textPath href="#ringS" textLength="370">{HERO.badge.ring}</textPath></text>
        <text x="100" y="114" textAnchor="middle" className="badge-big" fill="#FF6A13">{HERO.badge.center}</text>
      </symbol>
      <symbol id="badge7" viewBox={BOX.badge7}>
        <polygon points={BURST} transform="translate(100 100)" fill="#FFC300" />
        <circle cx="100" cy="100" r="70" fill="#FFF6E2" />
        <text className="ring-txt ring-sm"><textPath href="#ringS" textLength="370">{FINALE.badge.ring}</textPath></text>
        <text x="100" y="98" textAnchor="middle" className="badge-kick" fill="#3B1E08">{FINALE.badge.top}</text>
        <text x="100" y="128" textAnchor="middle" className="badge-mid" fill="#FF2E7E">{FINALE.badge.bottom}</text>
      </symbol>
    </svg>
  );
}

/** Text on a circle, Righteous caps, fitted to the circumference. Turn it with CSS (`.turn-*`) or GSAP. */
export function RingText({ text, className, style }: { text: string; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} viewBox="0 0 200 200" style={style} aria-hidden="true">
      <text className="ring-txt"><textPath href="#ringP" textLength="556">{text}</textPath></text>
    </svg>
  );
}
