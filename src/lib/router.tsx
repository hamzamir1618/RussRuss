import { createContext, useContext } from 'react';
import type React from 'react';
import { juiceById } from '../data/menu';

export type View = 'home' | 'menu' | 'juice' | 'visit' | 'order' | 'confirm';
export const VIEWS: View[] = ['home', 'menu', 'juice', 'visit', 'order', 'confirm'];

export type Transition = 'awning' | 'orange' | 'pour' | 'sun' | 'wave' | 'splash';

// Every destination arrives through one of the approved scene changes.
export const TRANSITION: Record<View, Transition> = {
  home: 'awning',   // the striped awning drops, then rolls back up on the stand
  menu: 'orange',   // an orange half spins out of the click and through the camera
  juice: 'pour',    // the cup lifts off its card, the juice colour floods out, the cup lands on the juice page
  visit: 'sun',     // the sun rises over the page, rays turning, and sets on the new one
  order: 'wave',    // the pink, tangerine and sunflower waves roll up the screen
  confirm: 'splash',// a juice splash and a stamp
};

/** Kicker + word shown mid-transition. */
export function labelOf(view: View, param?: string): [string, string] {
  switch (view) {
    case 'home': return ['Open 7 to 7', 'RussRuss'];
    case 'menu': return ['Pressed at 6 am', 'The menu'];
    case 'juice': return ['Today’s press', juiceById(param)?.name ?? 'The menu'];
    case 'visit': return ['Sample St and 2nd Ave', 'Find us'];
    case 'order': return ['Pay at the stand', 'Your order'];
    case 'confirm': return ['Order placed', 'Pressed!'];
  }
}

/** Which nav link is lit for each page. */
export const NAV_OF: Record<View, View> = { home: 'home', menu: 'menu', juice: 'menu', visit: 'visit', order: 'order', confirm: 'order' };

/** `param` is the juice id on `juice`, and the section to land on (e.g. `steps`) on `home`. */
export interface Route { view: View; param?: string }

/** The click that started a navigation. `target` lets the pour find the cup that was chosen. */
export interface Point { clientX: number; clientY: number; target?: EventTarget | null }

interface RouterValue {
  route: Route;
  go: (to: View, from?: Point, param?: string) => void;
  /** True once the loader has lifted. */
  revealed: boolean;
}

export const RouterContext = createContext<RouterValue>({ route: { view: 'home' }, go: () => {}, revealed: true });
export const useRouter = () => useContext(RouterContext);

export const hashOf = (r: Route) => `#${r.view}${r.param ? `/${r.param}` : ''}`;

export function routeFromHash(): Route {
  const [v, param] = window.location.hash.slice(1).split('/');
  return VIEWS.includes(v as View) ? { view: v as View, param } : { view: 'home' };
}

/** Link props: a real href (so it opens in a new tab) that plays the transition on a normal click. */
export function linkTo(go: RouterValue['go'], view: View, param?: string) {
  return {
    href: hashOf({ view, param }),
    onClick: (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      go(view, e, param);
    },
  };
}
