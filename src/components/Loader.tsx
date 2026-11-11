import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/motion';
import { lockScroll } from '../lib/scroll';
import { LOADER } from '../data/copy';
import { Wordmark } from './Wordmark';

type Props = { onReveal: () => void; onDone: () => void };

/** Opening: the wordmark fills with juice while a counter runs to 100, then the white curtain lifts. Scroll stays locked. */
export function Loader({ onReveal, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<SVGGElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    lockScroll(true);
    const n = { v: 0 };
    gsap.timeline({ onComplete: () => { lockScroll(false); onDone(); } })
      .fromTo('.ld-rays', { rotation: -40, scale: 0.8 }, { rotation: 40, scale: 1, duration: 2.4, ease: 'none' }, 0)
      .fromTo(fill.current, { y: 250 }, { y: -40, duration: 1.5, ease: 'power2.inOut' }, 0)
      .fromTo(n, { v: 0 }, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { if (count.current) count.current.textContent = String(Math.round(n.v)).padStart(3, '0'); } }, 0)
      .add(onReveal, '+=.05')
      .fromTo(root.current, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut' }, '<');
  }, { scope: root });

  return (
    <div className="loader" ref={root} aria-hidden="true">
      <div className="ld-rays rays" />
      <Wordmark id="ldClip" className="ld-wm" ref={fill} startFull={false} />
      <div className="ld-row"><span>{LOADER.label} <span ref={count}>000</span>%</span><span>{LOADER.aside}</span></div>
    </div>
  );
}
