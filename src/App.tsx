import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { RM, ScrollTrigger } from './lib/motion';
import { goTo, jumpTo, scrollToY } from './lib/scroll';
import { BagProvider } from './lib/bag';
import { hashOf, RouterContext, routeFromHash, TRANSITION, type Point, type Route, type View } from './lib/router';
import { Sprite } from './components/Sprite';
import { Loader } from './components/Loader';
import { Nav } from './components/Nav';
import { Cursor } from './components/Cursor';
import { Footer } from './components/Footer';
import { TransitionOverlay, type OverlayHandle } from './components/TransitionOverlay';
import { MascotSlot } from './components/MascotSlot';
import { loadMascot } from './lib/mascot';
import { Home } from './pages/Home';
import { MenuPage } from './pages/MenuPage';
import { JuicePage } from './pages/JuicePage';
import { VisitPage } from './pages/VisitPage';
import { OrderPage } from './pages/OrderPage';
import { ConfirmPage } from './pages/ConfirmPage';

// Never let a transition that fails to finish lock up navigation.
const atMost = <T,>(p: Promise<T>, fallback: T, ms = 4000) => Promise.race([p, new Promise<T>(r => setTimeout(() => r(fallback), ms))]);
const same = (a: Route, b: Route) => a.view === b.view && (a.param ?? '') === (b.param ?? '');

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [loading, setLoading] = useState(!RM);
  const [revealed, setRevealed] = useState(RM);
  const overlay = useRef<OverlayHandle>(null);
  const current = useRef(route);
  const busy = useRef(false);

  // land on a home section (#home/steps) once its pins are measured
  const land = (r: Route) => { if (r.view === 'home' && r.param) jumpTo(`#${r.param}`); };

  const swap = useCallback((to: Route) => {
    // commit the new page synchronously while the screen is covered, then re-measure scroll triggers
    flushSync(() => setRoute(to));
    current.current = to;
    scrollToY(0, true);
    ScrollTrigger.refresh();
    land(to);
  }, []);

  const go = useCallback(async (view: View, from?: Point, param?: string) => {
    const to: Route = { view, param };
    if (busy.current) return;
    // already on the landing page: glide to the section instead of reloading it
    if (view === 'home' && current.current.view === 'home') {
      if (param) goTo(`#${param}`); else scrollToY(0);
      return;
    }
    if (same(to, current.current)) { scrollToY(0); return; }
    busy.current = true;
    try { history.pushState(null, '', hashOf(to)); } catch { /* sandboxed frames may refuse */ }
    try {
      if (RM || !overlay.current) { swap(to); return; }
      const kind = TRANSITION[view];
      await atMost(overlay.current.cover(kind, to, from), undefined);
      swap(to);
      await atMost(overlay.current.uncover(kind), undefined);
    } finally {
      busy.current = false;
    }
  }, [swap]);

  // browser back/forward
  useEffect(() => {
    const onPop = () => { const r = routeFromHash(); if (!same(r, current.current)) go(r.view, undefined, r.param); };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, [go]);

  // late fonts and images shift layout; re-measure once everything is in
  useEffect(() => {
    const refresh = () => { ScrollTrigger.refresh(); };
    addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    if (current.current.param) setTimeout(() => land(current.current), 300);
    return () => removeEventListener('load', refresh);
  }, []);

  // the 3D rabbit loads in its own chunk once the opening is done
  useEffect(() => { if (revealed) loadMascot(); }, [revealed]);

  const router = useMemo(() => ({ route, go, revealed }), [route, go, revealed]);

  return (
    <RouterContext.Provider value={router}>
      <BagProvider>
        <Sprite />
        {loading && <Loader onReveal={() => setRevealed(true)} onDone={() => { setLoading(false); ScrollTrigger.refresh(); }} />}
        <Nav />
        <main key={hashOf(route)} className={`page page-${route.view}`}>
          {route.view === 'home' && <Home revealed={revealed} />}
          {route.view === 'menu' && <MenuPage />}
          {route.view === 'juice' && <JuicePage id={route.param} />}
          {route.view === 'visit' && <VisitPage />}
          {route.view === 'order' && <OrderPage />}
          {route.view === 'confirm' && <ConfirmPage />}
        </main>
        {route.view !== 'home' && <Footer />}
        <MascotSlot id="pop" />
        <TransitionOverlay ref={overlay} />
        <Cursor />
      </BagProvider>
    </RouterContext.Provider>
  );
}
