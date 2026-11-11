import { useEffect, useRef, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from './motion';
import { useRouter } from './router';

/**
 * A page's entrance. `build` returns a timeline of fromTo tweens (their start states apply at once, so the page
 * stays hidden); it plays a beat after the loader lifts, or while the transition uncovers the page.
 */
export function useIntro(scope: RefObject<HTMLElement>, build: () => gsap.core.Timeline, lead = 0.35) {
  const { revealed } = useRouter();
  const tl = useRef<gsap.core.Timeline | null>(null);
  useGSAP(() => {
    if (RM) return;
    tl.current = gsap.timeline({ paused: true }).add(build(), lead);
  }, { scope });
  useEffect(() => { if (revealed) tl.current?.play(); }, [revealed]);
}
