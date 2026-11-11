import * as THREE from 'three';
import { FINE, gsap, NARROW, vel } from '../lib/motion';
import { burstFrom, JUICE } from '../lib/burst';
import { Rabbit } from './rabbit';

/*
 * One renderer, one canvas, one rabbit for the whole site. The canvas moves into whichever slot is on screen
 * (hero, today's press, how a cup gets made, the finale counter, the bag pop-up, or the dev lab), so he sits in the
 * page's real stacking order and scrolls and pins with it. Nothing renders while no slot is visible.
 */

export type SceneId = 'hero' | 'press' | 'steps' | 'finale' | 'pop' | 'lab';
/** Moves a section can ask for (see `react`). */
export type Move = 'greet' | 'cheers' | 'wink' | 'tilt' | 'hop' | 'dance' | 'lookAround' | 'bounce' | 'stomp';

type Setup = {
  /** Camera position and target, vertical field of view. */
  cam: [number, number, number]; at: [number, number, number]; fov: number;
  /** Where he stands in the slot: offset, turn, lean (z rotation). */
  place: { x: number; y: number; turn: number; lean: number };
  /** Mover offset while he's out of sight (above the slot for a drop, below the edge for a pop). */
  away: { x: number; y: number };
  /** How he arrives: dropped in from above (`drop`, on first sight; the hero waits for its cue) or popped up (`pop`, on cue). */
  entry: 'drop' | 'pop' | 'none';
  /** Overrides on phones. */
  narrow?: Partial<Omit<Setup, 'narrow'>>;
};

const SETUPS: Record<SceneId, Setup> = {
  // in front of the big cup, at its lower left (phones: lower right), turned toward it
  hero: { cam: [0, 1.45, 7.4], at: [0, 1.4, 0], fov: 26, place: { x: 0, y: 0, turn: 0.38, lean: 0 }, away: { x: 0, y: 4.4 }, entry: 'drop',
    narrow: { place: { x: 0, y: 0, turn: -0.38, lean: 0 } } },
  // rides the progress bar under the cards (the stage turns him toward the scroll direction)
  press: { cam: [0, 1.35, 6.6], at: [0, 1.32, 0], fov: 26, place: { x: 0, y: 0, turn: 0, lean: 0 }, away: { x: 0, y: 4.2 }, entry: 'drop' },
  // beside the step photo, acting out each step
  steps: { cam: [0, 1.4, 7.2], at: [0, 1.38, 0], fov: 26, place: { x: 0, y: 0, turn: -0.35, lean: 0 }, away: { x: 0, y: 4.4 }, entry: 'drop' },
  // camera aimed high so the slot's bottom edge (the counter) cuts him at the waist
  finale: { cam: [0, 1.9, 6.0], at: [0, 1.85, 0], fov: 26, place: { x: 0, y: 0, turn: -0.2, lean: 0 }, away: { x: 0, y: -3.3 }, entry: 'pop',
    narrow: { cam: [0, 1.8, 6.4], at: [0, 1.75, 0] } },
  pop: { cam: [0, 1.75, 5.6], at: [0, 1.75, 0], fov: 26, place: { x: 0, y: 0, turn: -0.15, lean: 0 }, away: { x: 0, y: -3.4 }, entry: 'pop' },
  lab: { cam: [0, 1.25, 7.6], at: [0, 1.22, 0], fov: 26, place: { x: 0, y: 0, turn: 0, lean: 0 }, away: { x: 0, y: 0 }, entry: 'none' },
};
/** Order of preference when several slots are visible. */
const PRIORITY: SceneId[] = ['lab', 'hero', 'press', 'steps', 'finale'];
/** Idle moves, picked at random when he's out and doing nothing. */
const IDLE: Move[] = ['tilt', 'wink', 'lookAround', 'bounce', 'dance', 'greet', 'tilt', 'lookAround'];

export class Stage {
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  rabbit: Rabbit;

  private slots = new Map<SceneId, { el: HTMLElement; visible: boolean }>();
  private active: SceneId | null = null;
  /** Whether he's out in each slot (dropped in, popped up). */
  private out: Record<SceneId, boolean> = { hero: false, press: false, steps: false, finale: false, pop: false, lab: true };
  private popping = false;
  private popTimer: gsap.core.Tween | null = null;
  private idleAt = 0;
  private time = 0;
  private pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  /** Today's press: scroll velocity along the row, for facing and the hop-walk. */
  private steerV = 0;
  private io: IntersectionObserver;
  private ro: ResizeObserver;
  private ray = new THREE.Raycaster();
  private hover = false;
  private pokes = 0;

  constructor(rabbit: Rabbit) {
    this.rabbit = rabbit;
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'mascot-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');

    // toon lighting: warm key from the upper left plus ambient fill, so lit tones come out at the true palette colour
    this.scene.add(new THREE.AmbientLight('#FFF1DC', 1.25));
    const key = new THREE.DirectionalLight('#FFFFFF', 1.95);
    key.position.set(-3, 5, 6);
    this.scene.add(key);
    this.scene.add(this.rabbit.root);

    this.io = new IntersectionObserver(es => {
      es.forEach(e => this.slots.forEach(s => { if (s.el === e.target) s.visible = e.isIntersecting; }));
      this.choose();
    });
    this.ro = new ResizeObserver(() => this.resize());

    addEventListener('pointermove', e => { this.pointer.x = e.clientX; this.pointer.y = e.clientY; this.hoverTest(); }, { passive: true });
    this.canvas.addEventListener('pointerdown', () => { if (this.hover) this.poke(); });
    gsap.ticker.add((t, dt) => this.tick(t, dt / 1000));
  }

  addSlot(id: SceneId, el: HTMLElement) {
    const old = this.slots.get(id);
    if (old) this.io.unobserve(old.el);
    this.slots.set(id, { el, visible: false });
    if (id !== 'lab' && id !== 'pop') this.out[id] = false; // a fresh section starts with him out of sight
    this.io.observe(el);
  }

  removeSlot(id: SceneId, el: HTMLElement) {
    const s = this.slots.get(id);
    if (!s || s.el !== el) return;
    this.io.unobserve(el);
    this.slots.delete(id);
    if (this.active === id) { this.active = null; this.canvas.remove(); }
    this.choose();
  }

  /** Hero: drop in beside the cup and say hello (cued by the hero's opening, once the cup has landed). */
  enter(id: SceneId) {
    if (this.out[id]) return;
    this.out[id] = true;
    if (this.active === id) this.drop(() => this.rabbit.greet());
  }

  /** Finale: pop up behind the counter (or duck back down when scrolled back). */
  show(id: SceneId, on: boolean) {
    if (this.out[id] === on) return;
    this.out[id] = on;
    if (this.active !== id) return;
    on ? this.popUp(() => this.rabbit.cheers()) : this.popDown();
  }

  /** A section asks for a move (a new juice in the row, the next step, the order button arriving). */
  react(id: SceneId, move: Move) {
    if (this.active !== id || !this.out[id] || gsap.isTweening(this.rabbit.mover.position)) return;
    this.rabbit[move]();
    this.idleAt = this.time + 3.5;
  }

  /** Today's press: scroll velocity along the row (px/s, + = forward). */
  steer(v: number) { this.steerV = v; }

  /** Something went into the bag: cheer where he is, or pop up in the corner. */
  cheer() {
    const where = this.active;
    if (where && where !== 'pop' && this.out[where] && this.slots.get(where)?.visible) {
      this.rabbit.cheers();
      this.idleAt = this.time + 4;
      return;
    }
    if (!this.popping) {
      this.popping = true;
      this.choose();
      this.popUp(() => this.rabbit.cheers());
    } else this.rabbit.cheers();
    this.popTimer?.kill();
    this.popTimer = gsap.delayedCall(2.6, () => this.popDown(() => { this.popping = false; this.choose(); }));
  }

  /** The current frame as an image data URL (dev: design/scripts/stills.mjs makes the reduced-motion stills with it). */
  snapshot(type = 'image/png', quality?: number) {
    this.render();
    return this.canvas.toDataURL(type, quality);
  }

  /** Falls in from above the slot, lands with a squash and a juice splash. */
  private drop(then?: () => void) {
    const m = this.rabbit.mover.position, slot = this.slots.get(this.active!)?.el;
    gsap.killTweensOf(m);
    gsap.timeline()
      .fromTo(m, { y: this.setup(this.active!).away.y }, { y: 0, duration: 0.55, ease: 'power3.in' })
      .add(() => { this.rabbit.land(); burstFrom(slot, 0.5, 0.92, JUICE.party, 22, 0.85); })
      .add(() => { then?.(); this.idleAt = this.time + 4; }, '+=0.45');
  }

  private popUp(then?: () => void) {
    const m = this.rabbit.mover.position;
    gsap.killTweensOf(m);
    gsap.timeline()
      .fromTo(m, { y: this.setup(this.active!).away.y }, { y: 0, duration: 0.7, ease: 'back.out(1.6)' })
      .add(() => this.rabbit.kick(12, 18), 0.3)
      .add(() => { then?.(); this.idleAt = this.time + 4; }, 0.55);
  }

  private popDown(then?: () => void) {
    const m = this.rabbit.mover.position;
    gsap.killTweensOf(m);
    gsap.to(m, { y: this.setup(this.active ?? 'pop').away.y, duration: 0.45, ease: 'back.in(1.4)', onComplete: then });
  }

  private setup(id: SceneId): Setup { return { ...SETUPS[id], ...(NARROW() ? SETUPS[id].narrow : {}) }; }

  private choose() {
    const want: SceneId | null = this.popping ? 'pop' : PRIORITY.find(id => this.slots.get(id)?.visible) ?? null;
    if (want !== this.active) this.attach(want);
  }

  private attach(id: SceneId | null) {
    if (this.active) this.ro.unobserve(this.slots.get(this.active)?.el ?? this.canvas);
    this.active = id;
    if (!id) { this.canvas.remove(); return; }
    const el = this.slots.get(id)!.el, S = this.setup(id);
    el.appendChild(this.canvas);
    this.ro.observe(el);
    this.camera.fov = S.fov;
    this.camera.position.set(...S.cam);
    this.camera.lookAt(...S.at);
    const r = this.rabbit;
    r.root.position.set(S.place.x, S.place.y, 0);
    r.root.rotation.set(0, S.place.turn, S.place.lean);
    gsap.killTweensOf(r.mover.position);
    const out = this.out[id] && id !== 'pop';
    r.mover.position.set(out ? 0 : S.away.x, out ? 0 : S.away.y, 0);
    this.resize();
    // sections he simply drops into the first time they come on screen (the hero waits for its own cue)
    if (!out && S.entry === 'drop' && id !== 'hero') {
      this.out[id] = true;
      gsap.delayedCall(0.25, () => { if (this.active === id) this.drop(() => this.rabbit.greet()); });
    }
  }

  private resize() {
    const el = this.active && this.slots.get(this.active)?.el;
    if (!el) return;
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private ndc(): THREE.Vector2 | null {
    if (!this.active) return null;
    const r = this.canvas.getBoundingClientRect();
    if (!r.width) return null;
    return new THREE.Vector2(((this.pointer.x - r.left) / r.width) * 2 - 1, -((this.pointer.y - r.top) / r.height) * 2 + 1);
  }

  private hoverTest() {
    const p = this.ndc();
    if (!p || !FINE) return;
    this.ray.setFromCamera(p, this.camera);
    this.hover = this.ray.intersectObjects(this.rabbit.hits, false).length > 0;
    this.canvas.style.cursor = this.hover ? 'pointer' : '';
  }

  /** Clicked: a hop, a wink, a dance, in turn. */
  private poke() {
    const k = this.pokes++ % 3;
    if (k === 0) this.rabbit.hop(0.5); else if (k === 1) this.rabbit.wink(); else this.rabbit.dance();
    this.idleAt = this.time + 5;
  }

  private tick(_t: number, dt: number) {
    const slot = this.active && this.slots.get(this.active);
    if (!slot || !slot.visible) return;
    this.time += dt;
    const r = this.rabbit, id = this.active!;

    // look toward the pointer (relative to his canvas); on touch screens, glance around slowly
    let lx: number, ly: number;
    if (FINE) {
      const b = this.canvas.getBoundingClientRect();
      lx = THREE.MathUtils.clamp((this.pointer.x - (b.left + b.width / 2)) / (innerWidth * 0.45), -1, 1);
      ly = THREE.MathUtils.clamp((this.pointer.y - (b.top + b.height * 0.3)) / (innerHeight * 0.6), -1, 1);
    } else { lx = Math.sin(this.time * 0.45) * 0.55; ly = Math.sin(this.time * 0.31) * 0.25; }

    // today's press: he faces the way the row is going and hop-walks while it moves, then turns back to us
    if (id === 'press') {
      const moving = Math.abs(this.steerV) > 60;
      const turn = moving ? Math.sign(this.steerV) * 1.1 : 0;
      r.root.rotation.y += (turn - r.root.rotation.y) * Math.min(1, dt * 7);
      if (moving) lx = 0;
      if (this.out.press && !r.busy && !gsap.isTweening(r.mover.position)) {
        const amt = Math.min(1, Math.abs(this.steerV) / 900);
        r.mover.position.y = Math.abs(Math.sin(this.time * 13)) * 0.22 * amt;
      }
      this.steerV *= Math.pow(0.02, dt); // eases off if scroll events stop
    }
    r.update(dt, lx, ly, vel());

    // now and then, when he's out and doing nothing, something from the idle list
    if (this.out[id] && id !== 'pop' && !r.busy && this.time > this.idleAt && !(id === 'press' && Math.abs(this.steerV) > 60)) {
      if (this.idleAt > 0) r[IDLE[Math.floor(Math.random() * IDLE.length)]]();
      this.idleAt = this.time + 2.5 + Math.random() * 3;
    }
    this.render();
  }

  private render() { this.renderer.render(this.scene, this.camera); }
}

/** Loads the model, then builds the stage. */
export async function createStage() {
  return new Stage(await Rabbit.load('/models/rabbit.glb'));
}
