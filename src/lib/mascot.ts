import { RM } from './motion';
import type { Move, SceneId, Stage } from '../three/stage';

/*
 * RussRuss the rabbit, from the page's side. three.js and the rabbit load in their own chunk once the loader has
 * lifted (`loadMascot`), so they never slow the first paint. Until then, calls are remembered: slots and the
 * finale's in/out state are applied on load; one-shot cues (enter, cheer) only if they're still recent.
 * With reduced motion or no WebGL the slots show a still image instead (see MascotSlot).
 */

export type { Move, SceneId };

let stage: Stage | null = null;
let loading: Promise<void> | null = null;
const slots = new Map<SceneId, HTMLElement>();
const shown = new Map<SceneId, boolean>();
const entered = new Set<SceneId>();

export const webgl = (() => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
})();
/** Whether the 3D rabbit runs here (otherwise slots show the still). */
export const LIVE = !RM && webgl;

export function loadMascot() {
  if (!LIVE) return Promise.resolve();
  if (loading) return loading;
  loading = import('../three/stage').then(m => m.createStage()).then(s => {
    stage = s;
    slots.forEach((el, id) => stage!.addSlot(id, el));
    entered.forEach(id => stage!.enter(id));
    shown.forEach((on, id) => stage!.show(id, on));
    if (import.meta.env.DEV) Object.assign(window, { mascot: stage });
  });
  return loading;
}

export function registerSlot(id: SceneId, el: HTMLElement) {
  slots.set(id, el);
  entered.delete(id);
  shown.delete(id);
  stage?.addSlot(id, el);
  return () => {
    if (slots.get(id) === el) slots.delete(id);
    stage?.removeSlot(id, el);
  };
}

export const mascot = {
  /** Hero: hop out from behind the cup. */
  enter(id: SceneId) { if (stage) stage.enter(id); else entered.add(id); },
  /** Finale: pop up behind the counter (true) or duck down (false). Cheap to call every frame. */
  show(id: SceneId, on: boolean) { if (stage) stage.show(id, on); else shown.set(id, on); },
  /** Something went into the bag. */
  cheer() { stage?.cheer(); },
  /** A section asks him for a move (only plays while he's out in that section). */
  react(id: SceneId, move: Move) { stage?.react(id, move); },
  /** Today's press: scroll velocity along the row, so he faces and hop-walks the way it's going. */
  steer(v: number) { stage?.steer(v); },
};
