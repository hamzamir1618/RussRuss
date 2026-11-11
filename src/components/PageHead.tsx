import type { ReactNode } from 'react';
import { Chars } from './Chars';
import { Sticker } from './Sprite';

/**
 * Top of an inner page: kicker, a stripe-extruded headline split into letters (the intro drops them in),
 * a short lede, and sun rays turning behind. `aside` sits to the right on wide screens.
 */
export function PageHead({ kicker, title, lede, aside }: { kicker: string; title: string; lede?: string; aside?: ReactNode }) {
  return (
    <header className="ph">
      <div className="ph-bg" aria-hidden="true">
        <div className="rays turn-60" />
        <Sticker id="sparkle" className="deco twinkle" color="#FFC300" style={{ left: '8%', top: '30%', width: 24 }} />
        <Sticker id="daisy" className="deco turn" color="#FF2E7E" style={{ right: '9%', top: '22%', width: 38 }} />
        <Sticker id="squiggle" className="deco" color="#7ED321" style={{ left: '44%', bottom: '8%', width: 80 }} />
      </div>
      <div className="ph-copy">
        <p className="kick pink ph-kick">{kicker}</p>
        <h1 className="ph-title stripe" aria-label={title}><Chars text={title} /></h1>
        {lede && <p className="ph-lede">{lede}</p>}
      </div>
      {aside && <div className="ph-aside">{aside}</div>}
    </header>
  );
}

/** The standard entrance for a PageHead, added to a page's intro timeline. */
export const headIntro = (tl: gsap.core.Timeline) => tl
  .fromTo('.ph-bg', { scale: 1.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, ease: 'expo.out' }, 0)
  .fromTo('.ph-title .ch', { yPercent: 115, rotation: 12 }, { yPercent: 0, rotation: 0, duration: 0.9, ease: 'expo.out', stagger: 0.03 }, 0.05)
  .fromTo('.ph-kick, .ph-lede', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.08 }, 0.25)
  .fromTo('.ph-aside', { y: 60, rotation: 8, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: 1, ease: 'back.out(1.6)' }, 0.3);
