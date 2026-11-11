import { forwardRef, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { wavePath } from '../lib/wave';

const WAVE = wavePath(2600, 560, 14, 14, 250);

type Props = {
  /** Unique per instance: the clip path id. */
  id: string;
  className?: string;
  base?: string;
  fill?: string;
  outline?: boolean;
  /** Start full (static) or empty (to be filled by a tween on the forwarded ref, y 250 → -40). */
  startFull?: boolean;
};

/**
 * "RussRuss" in Shrikhand, filled with juice: a looping wave clipped to the letters.
 * The forwarded ref is the wave group; tween its `y` from 250 (empty) to -40 (full).
 */
export const Wordmark = forwardRef<SVGGElement, Props>(function Wordmark(
  { id, className, base = '#FFE6BF', fill = '#FF2E7E', outline = false, startFull = true }, ref,
) {
  const loop = useRef<SVGGElement>(null);
  useGSAP(() => {
    if (!RM) gsap.to(loop.current, { x: -500, duration: 1.2, ease: 'none', repeat: -1 });
  });
  const stroke = outline ? { stroke: '#3B1E08', strokeWidth: 6, paintOrder: 'stroke' } : {};
  return (
    <svg className={className} viewBox="0 0 1000 240" role="img" aria-label="RussRuss">
      <defs><clipPath id={id}><text x="500" y="180" textAnchor="middle" className="wm-text">RussRuss</text></clipPath></defs>
      <text x="500" y="180" textAnchor="middle" className="wm-text" fill={base} {...stroke}>RussRuss</text>
      <g clipPath={`url(#${id})`}>
        <g ref={ref} transform={`translate(0 ${startFull ? -40 : 250})`}>
          <g ref={loop}><path d={WAVE} fill={fill} /></g>
        </g>
      </g>
    </svg>
  );
});
