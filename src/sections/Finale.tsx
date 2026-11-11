import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { cueList, gsap, RM } from '../lib/motion';
import { linkTo, useRouter } from '../lib/router';
import { burst, burstFrom, JUICE } from '../lib/burst';
import { ADDRESS, FINALE } from '../data/copy';
import { MENU } from '../data/menu';
import { Sticker } from '../components/Sprite';
import { Waves } from '../components/Waves';
import { Wordmark } from '../components/Wordmark';
import { MascotSlot } from '../components/MascotSlot';
import { ModelCredit } from '../components/ModelCredit';
import { mascot } from '../lib/mascot';

/**
 * Pinned ending. An awning drops over the last step and rolls up on the stand; the sign swings down and fills
 * with juice like the loader; the four cups land on the counter; the button and the "See you at 7" sticker
 * arrive; the waves close the page. The stage keeps the photo's aspect ratio so the cups always sit on its counter.
 */
export function Finale() {
  const root = useRef<HTMLElement>(null);
  const signFill = useRef<SVGGElement>(null);
  const waves = useRef<SVGSVGElement>(null);
  const { go } = useRouter();

  useGSAP(() => {
    if (RM) return;
    const q = gsap.utils.selector(root);
    const cups = q<HTMLElement>('.srv'), cues = cueList();

    // fromTo only (with invalidateOnRefresh a .from would re-record the hidden state as the end state)
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=320%', pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: s => { cues.update(s); mascot.show('finale', s.progress > 0.62); } } })
      .fromTo('.curtain', { yPercent: -105 }, { yPercent: 0, duration: 0.16, ease: 'back.out(1.25)' }, 0)
      .fromTo('.curtain-copy', { scale: 0.6, rotation: -6, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.1, ease: 'back.out(2)' }, 0.08)
      .to('.curtain-copy', { scale: 0.8, autoAlpha: 0, duration: 0.05 }, 0.23)
      .to('.curtain', { yPercent: -105, duration: 0.17, ease: 'power3.inOut' }, 0.25)
      .fromTo('.stand-stage', { scale: 1.3 }, { scale: 1, duration: 0.42, ease: 'power2.out' }, 0.22)
      .fromTo('.sweep', { xPercent: -100 }, { xPercent: 100, duration: 0.4, ease: 'none' }, 0.3)
      .fromTo('.sign', { yPercent: -190, rotation: -18 }, { yPercent: 0, rotation: 0, duration: 0.14, ease: 'back.out(1.9)' }, 0.4)
      .fromTo(signFill.current, { y: 250 }, { y: -40, duration: 0.14, ease: 'none' }, 0.5)
      .fromTo(cups, { y: () => innerHeight * 0.3, scale: 0.4, autoAlpha: 0, rotation: i => (i % 2 ? 34 : -34) },
        { y: 0, scale: 1, autoAlpha: 1, rotation: 0, duration: 0.1, ease: 'back.out(2.4)', stagger: 0.045 }, 0.56)
      .fromTo('.fin-ui > *', { y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.1, stagger: 0.03, ease: 'back.out(2)' }, 0.76)
      .fromTo(waves.current, { yPercent: 100 }, { yPercent: 0, duration: 0.1, ease: 'power2.out' }, 0.86)
      .fromTo('.fin-foot, .fin-credit', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.92)
      .to({}, { duration: 0.04 });

    cues.add(0.4, () => { for (let k = 0; k < 4; k++) burst(innerWidth * (0.15 + 0.23 * k), innerHeight * 0.18, JUICE.party, 22, 1.1); });
    cups.forEach((c, i) => cues.add(0.6 + i * 0.045, () => burstFrom(c, 0.5, 0.25, MENU[i].juice, 22, 0.9)));
    cues.add(0.83, () => burstFrom(q('.fin-cta .btn')[0], 0.5, 0, JUICE.party, 26, 1));
    cues.add(0.8, () => mascot.react('finale', 'greet'));
  }, { scope: root });

  return (
    <section id="finale" className="finale" ref={root} aria-label="Visit the stand">
      <div className="stand-stage">
        <img className="stand-photo" src="/img/stand.webp" alt="The RussRuss stand: a striped awning, crates of oranges and watermelons, and an empty counter" />
        <div className="sweep" aria-hidden="true" />
        <Sticker id="sparkle" className="deco twinkle" color="#FFF6E2" style={{ left: '24%', top: '40%', width: '1.6%' }} />
        <Sticker id="sparkle" className="deco twinkle d1" color="#FFC300" style={{ left: '74%', top: '34%', width: '2.2%' }} />
        <Sticker id="daisy" className="deco turn" color="#FF2E7E" style={{ left: '8%', top: '56%', width: '3%' }} />
        <Sticker id="daisy" className="deco turn" color="#FF6A13" style={{ left: '88%', top: '52%', width: '3.4%' }} />
        <div className="sign">
          <div className="board">
            <p className="kick">{FINALE.signKicker}</p>
            <Wordmark id="signClip" className="sign-wm" ref={signFill} outline />
          </div>
        </div>
        <MascotSlot id="finale" />
        {MENU.map((j, i) => <img key={j.id} className="srv" src={j.cup} alt={j.name} style={{ left: `${33 + i * 11}%` }} />)}
      </div>

      {!RM && (
        <div className="curtain" aria-hidden="true">
          <div className="awn" />
          <div className="curtain-copy"><p className="kick">{FINALE.kicker}</p><p className="curtain-title stripe">{FINALE.title}</p></div>
        </div>
      )}

      <div className="fin-ui">
        <div className="fin-cta">
          <a className="btn big mag" {...linkTo(go, 'order')}>{FINALE.cta}</a>
          <a className="pill" {...linkTo(go, 'visit')}>{ADDRESS} →</a>
        </div>
        <div className="fin-badge-wrap"><Sticker id="badge7" className="fin-badge swing" /></div>
      </div>
      <Waves ref={waves} className="fin-waves" />
      <p className="fin-foot">{FINALE.foot}</p>
      <ModelCredit className="fin-credit" />
    </section>
  );
}
