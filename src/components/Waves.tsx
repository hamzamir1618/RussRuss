import { forwardRef, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { wavePath } from '../lib/wave';

const BANDS = [
  { base: 50, color: '#FF2E7E' },
  { base: 110, color: '#FF6A13' },
  { base: 170, color: '#FFC300' },
];

/** Pink, tangerine and sunflower wave bands rolling along the bottom of a section. */
export const Waves = forwardRef<SVGSVGElement, { className?: string }>(function Waves({ className }, ref) {
  const root = useRef<SVGGElement>(null);
  useGSAP(() => {
    if (RM) return;
    gsap.utils.toArray<SVGGElement>('.wv-loop', root.current).forEach((g, i) =>
      gsap.to(g, { x: -500, duration: 1.2 + i * 0.35, ease: 'none', repeat: -1 }));
  }, { scope: root });
  return (
    <svg ref={ref} className={className} viewBox="0 0 2000 220" preserveAspectRatio="none" aria-hidden="true">
      <g ref={root}>
        {BANDS.map(b => <g key={b.base} className="wv-loop"><path d={wavePath(2600, 220, b.base, 14, 250)} fill={b.color} /></g>)}
      </g>
    </svg>
  );
});
