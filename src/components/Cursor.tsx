import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { FINE, gsap, RM } from '../lib/motion';

/** Citrus dot + trailing ring that swells over anything clickable, and magnetic pull on `.mag` buttons. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const on = FINE && !RM;

  useGSAP(() => {
    if (!on) return;
    const d = dot.current!, r = ring.current!;
    const dx = gsap.quickTo(d, 'x', { duration: 0.1 }), dy = gsap.quickTo(d, 'y', { duration: 0.1 });
    const rx = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3' });
    const move = (e: PointerEvent) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); d.classList.add('on'); r.classList.add('on'); };
    const over = (e: PointerEvent) => r.classList.toggle('big', !!(e.target as Element).closest('a,button,input,[data-drag]'));
    addEventListener('pointermove', move);
    document.addEventListener('pointerover', over);

    // magnetic buttons, by delegation
    type Pull = { x: (v: number) => void; y: (v: number) => void };
    const pulls = new WeakMap<Element, Pull>();
    let held: Element | null = null;
    const pull = (b: Element) => {
      let p = pulls.get(b);
      if (!p) { p = { x: gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), y: gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' }) }; pulls.set(b, p); }
      return p;
    };
    const magnet = (e: PointerEvent) => {
      const b = (e.target as Element).closest?.('.mag') ?? null;
      if (held && held !== b) { const p = pull(held); p.x(0); p.y(0); }
      held = b;
      if (!b) return;
      const k = b.getBoundingClientRect(), p = pull(b);
      p.x((e.clientX - k.left - k.width / 2) * 0.35); p.y((e.clientY - k.top - k.height / 2) * 0.35);
    };
    addEventListener('pointermove', magnet);
    return () => { removeEventListener('pointermove', move); removeEventListener('pointermove', magnet); document.removeEventListener('pointerover', over); };
  });

  if (!on) return null;
  return (
    <>
      <div ref={ring} className="cur cur-ring" aria-hidden="true" />
      <div ref={dot} className="cur cur-dot" aria-hidden="true" />
    </>
  );
}
