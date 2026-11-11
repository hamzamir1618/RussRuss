import { useEffect, useRef } from 'react';
import { gsap, RM } from '../lib/motion';
import { useBag } from '../lib/bag';
import { linkTo, NAV_OF, useRouter } from '../lib/router';
import { NAV } from '../data/copy';
import { mascot } from '../lib/mascot';

/** Fixed top bar: wordmark (home), page links, and the bag count, which pops when something is added and opens the order. */
export function Nav() {
  const { count } = useBag();
  const { go, route } = useRouter();
  const pill = useRef<HTMLAnchorElement>(null);
  const last = useRef(count);
  const lit = NAV_OF[route.view];

  useEffect(() => {
    if (count === last.current) return;
    const up = count > last.current;
    last.current = count;
    if (!RM) gsap.fromTo(pill.current, { scale: 1.35, rotation: -8 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1,.35)' });
    if (up) mascot.cheer(); // the rabbit pops up under the bag (or cheers where he already is)
  }, [count]);

  return (
    <header className="nav">
      <a className="logo" {...linkTo(go, 'home')}>RussRuss</a>
      <nav aria-label="Pages">
        <ul>
          {NAV.map(n => (
            <li key={n.label} className={n.short ? '' : 'wide-only'}>
              <a {...linkTo(go, n.view, n.param)} aria-current={!n.param && lit === n.view ? 'page' : undefined}>
                <span className="long">{n.label}</span>{n.short && <span className="short">{n.short}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <a ref={pill} className={`pill bag ${count ? 'hot' : ''}`} {...linkTo(go, 'order')} aria-label={`Your order, ${count} item${count === 1 ? '' : 's'}`} aria-current={lit === 'order' ? 'page' : undefined}>
        Bag · {count}
      </a>
    </header>
  );
}
