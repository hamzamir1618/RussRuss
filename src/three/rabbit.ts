import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { gsap } from '../lib/motion';

/*
 * RussRuss the rabbit, from a model: "Cute Rabbit" by Hafiene (Sketchfab, CC BY 4.0, credited on the site).
 * The web copy is public/models/rabbit.glb, made by design/scripts/mascot.mjs, which also names the parts.
 * The model has no rig, only separate parts, so this file re-assembles them on pivots and animates those:
 *
 *   root  (slot placement, set by the stage)
 *   > mover  (actions: enter, hop, pop up/down)
 *     > torso  (procedural lean toward the pointer)
 *       > body, belly, tail, legs; arm pivots at the shoulders (actions)
 *       > neck > headLook (procedural) > headAct (actions) > head, face, eye pivots (blink), ear pivots (springs)
 *
 * Look: three flat tones in the site palette with a cocoa outline (the user picked this over the model's own
 * soft shading).
 */

const PAL = { fur: '#FFF6E2', accent: '#FF9DB4', ink: '#3B1E08' };

/** Three flat tones: shade, mid, lit. */
const gradient = (() => {
  const t = new THREE.DataTexture(new Uint8Array([110, 190, 255]), 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
const TOON: Record<string, THREE.Material> = {
  fur: new THREE.MeshToonMaterial({ color: PAL.fur, gradientMap: gradient }),
  accent: new THREE.MeshToonMaterial({ color: PAL.accent, gradientMap: gradient }),
  ink: new THREE.MeshBasicMaterial({ color: PAL.ink }),
};

/** Outline: back faces pushed out along the normal in view space, so the line keeps one width. */
const outlineMat = new THREE.ShaderMaterial({
  uniforms: { thickness: { value: 0.02 }, color: { value: new THREE.Color(PAL.ink) } },
  vertexShader: /* glsl */`
    uniform float thickness;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      mv.xyz += normalize(normalMatrix * normal) * thickness;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */`
    uniform vec3 color;
    void main() { gl_FragColor = vec4(color, 1.0); }`,
  side: THREE.BackSide,
});
/** Parts that get an outline (face details and the belly patch read better without: the belly's line showed past its pink). */
const OUTLINED = new Set(['head', 'body', 'tail', 'legs', 'arms', 'earL_outer', 'earR_outer']);
/**
 * Small forward nudges (rabbit space) for parts that sit flush on the head. Slimming the model moved the head's
 * surface a hair, enough to cover the middle of the thin nose disc.
 */
const NUDGE: Record<string, number> = { nose: 0.018, mouth: 0.006, cheeks: 0.004 };

/** Same shape with seams welded and normals averaged, so hard edges don't split the outline. */
function hullOf(geo: THREE.BufferGeometry) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', geo.getAttribute('position'));
  if (geo.index) g.setIndex(geo.index);
  const h = mergeVertices(g, 1e-4);
  h.computeVertexNormals();
  return h;
}

/** Splits a geometry (already in rabbit space) into the triangles left and right of x = 0: [−x side, +x side]. */
function splitBySide(geo: THREE.BufferGeometry): [THREE.BufferGeometry, THREE.BufferGeometry] {
  const pos = geo.getAttribute('position');
  const index = geo.index ? Array.from(geo.index.array) : Array.from({ length: pos.count }, (_, i) => i);
  const sides: number[][] = [[], []];
  for (let t = 0; t < index.length; t += 3) {
    const cx = pos.getX(index[t]) + pos.getX(index[t + 1]) + pos.getX(index[t + 2]);
    sides[cx < 0 ? 0 : 1].push(index[t], index[t + 1], index[t + 2]);
  }
  return sides.map(ix => { const g = geo.clone(); g.setIndex(ix); return g; }) as [THREE.BufferGeometry, THREE.BufferGeometry];
}

type Spring = { a: number; v: number; k: number; c: number };
const spring = (k: number, c: number): Spring => ({ a: 0, v: 0, k, c });
const stepSpring = (s: Spring, dt: number) => { s.v += (-s.k * s.a - s.c * s.v) * dt; s.a += s.v * dt; };
type Ear = { pivot: THREE.Group; side: number; z: Spring; x: Spring };

/**
 * Paws only swing forward, in front of his belly, never out or up: his head overhangs his shoulders, so any
 * sideways raise tucks the nub under it and a big raise sends the paw into his head. ARM_FWD is the furthest
 * forward swing (radians about x, negative = toward the camera); ARM_IN turns them slightly inward.
 */
const ARM_FWD = -0.62, ARM_IN = 0.12;

/** Height of the rabbit (feet to ear tips) in scene units; the stage's framing assumes it. */
const HEIGHT = 2.5;

export class Rabbit {
  root = new THREE.Group();
  mover = new THREE.Group();
  torso = new THREE.Group();
  neck = new THREE.Group();
  headLook = new THREE.Group();
  headAct = new THREE.Group();
  armL = new THREE.Group();
  armR = new THREE.Group();
  eyeL = new THREE.Group();
  eyeR = new THREE.Group();
  ears: Ear[] = [];
  /** Every mesh except outlines, for pointer hit tests. */
  hits: THREE.Object3D[] = [];

  action: gsap.core.Timeline | null = null;
  private meshes: THREE.Mesh[] = [];
  private gaze = new THREE.Vector2();
  private lastYaw = 0;
  private t = Math.random() * 10;
  private blinkAt = 2;
  /** Rest z rotation of each arm (the nubs hang slightly out). */
  private armRest = { L: 0, R: 0 };

  static async load(url = '/models/rabbit.glb') {
    const gltf = await new GLTFLoader().loadAsync(url);
    return new Rabbit(gltf.scene);
  }

  private constructor(model: THREE.Object3D) {
    // 1. bake every part into "rabbit space": feet on y = 0, centred on x and z, HEIGHT tall, facing +z
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), mid = box.getCenter(new THREE.Vector3());
    const s = HEIGHT / size.y;
    const norm = new THREE.Matrix4().makeScale(s, s, s).multiply(new THREE.Matrix4().makeTranslation(-mid.x, -box.min.y, -mid.z));
    const parts = new Map<string, { geo: THREE.BufferGeometry; mat: string }>();
    model.traverse(o => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const name = m.name.replace(/_mesh$/, '');
      const geo = m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(norm, m.matrixWorld)).translate(0, 0, NUDGE[name] ?? 0);
      parts.set(name, { geo, mat: (m.material as THREE.Material).name });
    });
    const need = (n: string) => { const p = parts.get(n); if (!p) throw new Error(`rabbit.glb has no "${n}" part (re-run design/scripts/mascot.mjs)`); return p; };
    const bounds = (g: THREE.BufferGeometry) => { g.computeBoundingBox(); return g.boundingBox!.clone(); };

    // 2. pivots, at rest positions measured from the parts
    const add = (parent: THREE.Object3D, child: THREE.Object3D, at: THREE.Vector3, parentAt: THREE.Vector3) => { child.position.copy(at).sub(parentAt); parent.add(child); };
    const O = new THREE.Vector3();
    this.root.add(this.mover); this.mover.add(this.torso);
    const hb = bounds(need('head').geo);
    const neckAt = new THREE.Vector3(0, hb.min.y + (hb.max.y - hb.min.y) * 0.12, (hb.min.z + hb.max.z) / 2);
    add(this.torso, this.neck, neckAt, O);
    this.neck.add(this.headLook); this.headLook.add(this.headAct);

    /** Puts a part under a pivot whose rest position (rabbit space) is `at`. */
    const mount = (name: string, geo: THREE.BufferGeometry, pivot: THREE.Object3D, at: THREE.Vector3) => {
      const p = need(name);
      const g = geo.clone().translate(-at.x, -at.y, -at.z);
      const mesh = new THREE.Mesh(g, TOON[p.mat] ?? TOON.fur);
      mesh.userData.name = name;
      pivot.add(mesh);
      this.meshes.push(mesh);
      this.hits.push(mesh);
      if (OUTLINED.has(name)) { const h = new THREE.Mesh(hullOf(g), outlineMat); h.raycast = () => {}; mesh.add(h); }
      return mesh;
    };

    for (const n of ['body', 'belly', 'tail']) mount(n, need(n).geo, this.torso, O);
    for (const n of ['head', 'cheeks', 'nose', 'mouth']) mount(n, need(n).geo, this.headAct, neckAt);
    const [legL, legR] = splitBySide(need('legs').geo);
    mount('legs', legL, this.torso, O); mount('legs', legR, this.torso, O);

    // arms: pivot at the top inner corner of each nub (the shoulder)
    const [armLg, armRg] = splitBySide(need('arms').geo);
    for (const [g, pivot, side] of [[armLg, this.armL, -1], [armRg, this.armR, 1]] as const) {
      const b = bounds(g), at = new THREE.Vector3(side < 0 ? b.max.x : b.min.x, b.max.y, (b.min.z + b.max.z) / 2);
      add(this.torso, pivot, at, O);
      mount('arms', g, pivot, at);
    }

    // eyes: pivot at each eye's centre so a blink squashes it in place
    const [eyeLg, eyeRg] = splitBySide(need('eyes').geo);
    for (const [g, pivot] of [[eyeLg, this.eyeL], [eyeRg, this.eyeR]] as const) {
      const at = bounds(g).getCenter(new THREE.Vector3());
      add(this.headAct, pivot, at, neckAt);
      mount('eyes', g, pivot, at);
    }

    // ears: pivot where each ear meets the head; outside and pink inside move together
    for (const [side, key] of [[-1, 'earL'], [1, 'earR']] as const) {
      const b = bounds(need(`${key}_outer`).geo);
      const at = new THREE.Vector3((b.min.x + b.max.x) / 2, b.min.y + (b.max.y - b.min.y) * 0.08, (b.min.z + b.max.z) / 2);
      const pivot = new THREE.Group();
      add(this.headAct, pivot, at, neckAt);
      mount(`${key}_outer`, need(`${key}_outer`).geo, pivot, at);
      mount(`${key}_inner`, need(`${key}_inner`).geo, pivot, at);
      this.ears.push({ pivot, side, z: spring(70, 6), x: spring(60, 5) });
    }

    this.armRest = { L: this.armL.rotation.z, R: this.armR.rotation.z };
  }

  /** Arms, head and eyes back to rest. */
  rest(d = 0.35) {
    const o = { duration: d, ease: 'power2.out', overwrite: true };
    gsap.to(this.armL.rotation, { x: 0, y: 0, z: this.armRest.L, ...o });
    gsap.to(this.armR.rotation, { x: 0, y: 0, z: this.armRest.R, ...o });
    gsap.to(this.headAct.rotation, { x: 0, y: 0, z: 0, ...o });
    gsap.to([this.eyeL.scale, this.eyeR.scale], { y: 1, ...o });
    gsap.to(this.torso.scale, { x: 1, y: 1, z: 1, ...o });
    gsap.to(this.torso.rotation, { z: 0, ...o });
    // an action cut short mid-hop would leave him in the air; the stage's own entrances (drop, pop) are left alone
    if (!gsap.isTweening(this.mover.position)) gsap.to(this.mover.position, { y: 0, ...o });
  }

  get busy() { return !!this.action?.isActive(); }

  /** Run one action at a time; a new one cuts the old one short and starts from rest. */
  play(build: (tl: gsap.core.Timeline) => void, force = true) {
    if (this.busy && !force) return null;
    const cut = this.busy;
    if (this.action) { this.action.kill(); this.rest(0.15); }
    const tl = gsap.timeline({ delay: cut ? 0.15 : 0, onComplete: () => this.rest() });
    build(tl);
    this.action = tl;
    return tl;
  }

  /** Kick the ears: `a` side to side, `b` back and forth. */
  kick(a: number, b = 0) { this.ears.forEach(e => { e.z.v += a * e.side; e.x.v += b; }); }

  /**
   * Hello: two happy nods with squinted eyes, ears wiggling left-right, paws flapping in front of his belly.
   * (Replaced the wave: a raised paw disappears into his big head. See ARM_FWD.)
   */
  greet() {
    return this.play(tl => {
      tl.to([this.eyeL.scale, this.eyeR.scale], { y: 0.3, duration: 0.12 }, 0);
      for (let i = 0; i < 2; i++) {
        const at = i * 0.42;
        tl.to(this.headAct.rotation, { x: 0.2, z: i ? -0.08 : 0.08, duration: 0.18, ease: 'power2.out' }, at)
          .to(this.headAct.rotation, { x: -0.04, duration: 0.24, ease: 'back.out(2.5)' }, at + 0.18)
          .add(() => this.kick(i ? -7 : 7, 6), at + 0.12);
      }
      tl.to(this.armL.rotation, { x: ARM_FWD, z: this.armRest.L + ARM_IN, duration: 0.12, repeat: 5, yoyo: true, ease: 'sine.inOut' }, 0.05)
        .to(this.armR.rotation, { x: ARM_FWD, z: this.armRest.R - ARM_IN, duration: 0.12, repeat: 5, yoyo: true, ease: 'sine.inOut' }, 0.11)
        .to({}, { duration: 0.3 });
    });
  }

  /** Paws forward, a happy hop and a squint: what he does when something goes in the bag. */
  cheers() {
    const m = this.mover.position, b = this.torso.scale;
    return this.play(tl => tl
      .to(this.armL.rotation, { x: ARM_FWD, z: this.armRest.L + ARM_IN, duration: 0.3, ease: 'back.out(2.4)' }, 0)
      .to(this.armR.rotation, { x: ARM_FWD, z: this.armRest.R - ARM_IN, duration: 0.3, ease: 'back.out(2.4)' }, 0)
      .to([this.eyeL.scale, this.eyeR.scale], { y: 0.25, duration: 0.12 }, 0.05) // happy squint
      .to(b, { y: 0.9, x: 1.06, z: 1.06, duration: 0.12 }, 0)
      .to(m, { y: 0.35, duration: 0.25, ease: 'power2.out' }, 0.12)
      .to(b, { y: 1.06, x: 0.96, z: 0.96, duration: 0.2 }, 0.12)
      .add(() => this.kick(-8, -10), 0.12)
      .to(m, { y: 0, duration: 0.22, ease: 'power2.in' }, 0.37)
      .to(b, { y: 0.9, x: 1.06, z: 1.06, duration: 0.08 }, 0.59)
      .add(() => this.kick(9, 12), 0.6)
      .to(b, { y: 1, x: 1, z: 1, duration: 0.45, ease: 'elastic.out(1,.35)' }, 0.67)
      .to([this.armL.rotation, this.armR.rotation], { x: ARM_FWD * 0.45, duration: 0.14, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 0.4)
      .to({}, { duration: 0.2 }));
  }

  /** A wink and a head tilt. */
  wink() {
    return this.play(tl => tl
      .to(this.headAct.rotation, { z: 0.16, duration: 0.25, ease: 'back.out(2)' })
      .to(this.eyeR.scale, { y: 0.08, duration: 0.08 }, 0.12)
      .add(() => this.kick(5), 0.1)
      .to({}, { duration: 0.6 }), false);
  }

  /** A curious head tilt, ears following. */
  tilt() {
    return this.play(tl => tl
      .to(this.headAct.rotation, { z: -0.22, x: 0.06, duration: 0.4, ease: 'back.out(2)' })
      .add(() => this.kick(-7, 4), 0.1)
      .to({}, { duration: 0.8 }), false);
  }

  /** A little dance: body rocks side to side, paws pump forward in turn, head bobs against the beat. */
  dance() {
    const beats = 6, b = 0.22;
    return this.play(tl => {
      for (let i = 0; i < beats; i++) {
        const d = i % 2 ? 1 : -1, at = i * b;
        tl.to(this.torso.rotation, { z: d * 0.14, duration: b, ease: 'sine.inOut' }, at)
          .to(this.headAct.rotation, { z: -d * 0.12, x: 0.05, duration: b, ease: 'sine.inOut' }, at)
          .to(this.armL.rotation, { x: d < 0 ? ARM_FWD : -0.08, duration: b, ease: 'back.out(2)' }, at)
          .to(this.armR.rotation, { x: d > 0 ? ARM_FWD : -0.08, duration: b, ease: 'back.out(2)' }, at)
          .to(this.mover.position, { y: 0.1, duration: b / 2, yoyo: true, repeat: 1, ease: 'sine.out' }, at)
          .add(() => this.kick(5 * d, 4), at);
      }
      tl.to(this.torso.rotation, { z: 0, duration: 0.25 });
    }, false);
  }

  /** Looks left, then right, ears swinging after. */
  lookAround() {
    return this.play(tl => tl
      .to(this.headAct.rotation, { y: -0.55, z: 0.06, duration: 0.35, ease: 'power2.inOut' })
      .add(() => this.kick(6), 0.15)
      .to(this.headAct.rotation, { y: 0.55, z: -0.06, duration: 0.5, ease: 'power2.inOut' }, 0.75)
      .add(() => this.kick(-7), 0.95)
      .to({}, { duration: 0.5 }), false);
  }

  /** Two quick little hops in place. */
  bounce() {
    const m = this.mover.position, b = this.torso.scale;
    return this.play(tl => {
      for (let i = 0; i < 2; i++) {
        const at = i * 0.34;
        tl.to(b, { y: 0.9, x: 1.05, z: 1.05, duration: 0.07 }, at)
          .to(m, { y: 0.2, duration: 0.13, ease: 'power2.out' }, at + 0.07)
          .to(b, { y: 1.05, x: 0.97, z: 0.97, duration: 0.13 }, at + 0.07)
          .to(m, { y: 0, duration: 0.12, ease: 'power2.in' }, at + 0.2)
          .add(() => this.kick(6, 8), at + 0.32);
      }
      tl.to(b, { y: 1, x: 1, z: 1, duration: 0.35, ease: 'elastic.out(1,.4)' });
    });
  }

  /** "Press": squashes down hard three times, nubs pushing down, eyes screwed shut. */
  stomp() {
    const b = this.torso.scale;
    return this.play(tl => {
      tl.to([this.armL.rotation, this.armR.rotation], { x: -0.7, duration: 0.15 }, 0)
        .to([this.eyeL.scale, this.eyeR.scale], { y: 0.2, duration: 0.1 }, 0);
      for (let i = 0; i < 3; i++) {
        tl.to(b, { y: 0.8, x: 1.12, z: 1.12, duration: 0.12, ease: 'power3.in' }, 0.15 + i * 0.36)
          .add(() => this.kick(0, 12), 0.27 + i * 0.36)
          .to(b, { y: 1.05, x: 0.97, z: 0.97, duration: 0.22, ease: 'back.out(3)' }, 0.27 + i * 0.36);
      }
      tl.to(b, { y: 1, x: 1, z: 1, duration: 0.3 });
    });
  }

  /** Lands from a drop: a hard squash, ears flung, a wobble back up. */
  land() {
    const b = this.torso.scale;
    this.kick(12, 18);
    return gsap.timeline()
      .to(b, { y: 0.74, x: 1.18, z: 1.18, duration: 0.08, ease: 'power2.out' })
      .to(b, { y: 1, x: 1, z: 1, duration: 0.7, ease: 'elastic.out(1,.3)' });
  }

  hop(height = 0.45) {
    const m = this.mover.position, b = this.torso.scale;
    return this.play(tl => tl
      .to(b, { y: 0.86, x: 1.08, z: 1.08, duration: 0.12, ease: 'power2.out' })
      .add(() => this.kick(-9, -12))
      .to(m, { y: height, duration: 0.26, ease: 'power2.out' })
      .to(b, { y: 1.08, x: 0.95, z: 0.95, duration: 0.2 }, '<')
      .to(m, { y: 0, duration: 0.24, ease: 'power2.in' })
      .to(b, { y: 0.86, x: 1.08, z: 1.08, duration: 0.08 })
      .add(() => this.kick(10, 14))
      .to(b, { y: 1, x: 1, z: 1, duration: 0.5, ease: 'elastic.out(1,.35)' }));
  }

  /** Per frame: breathing, blinking, looking toward (lookX, lookY) in -1..1, ears on springs; `speed` is scroll px/s. */
  update(dt: number, lookX: number, lookY: number, speed = 0) {
    dt = Math.min(dt, 1 / 20);
    this.t += dt;
    this.gaze.x += (lookX - this.gaze.x) * Math.min(1, dt * 6);
    this.gaze.y += (lookY - this.gaze.y) * Math.min(1, dt * 6);
    const yaw = this.gaze.x * 0.55, pitch = this.gaze.y * 0.28;
    this.headLook.rotation.set(pitch, yaw, -this.gaze.x * 0.07);
    this.torso.rotation.y = yaw * 0.25;
    if (!this.busy) this.torso.scale.y = 1 + Math.sin(this.t * 2.2) * 0.01;

    if (this.t > this.blinkAt) {
      this.blinkAt = this.t + 2 + Math.random() * 3.5;
      if (!this.busy) gsap.to([this.eyeL.scale, this.eyeR.scale], { y: 0.08, duration: 0.06, yoyo: true, repeat: 1, ease: 'power1.in' });
    }

    // ears lag behind head turns and settle on springs
    const turn = (yaw - this.lastYaw) / Math.max(dt, 1e-3);
    this.lastYaw = yaw;
    // fast scrolling blows the ears back
    const wind = THREE.MathUtils.clamp(speed / 1500, -1, 1);
    this.ears.forEach((e, i) => {
      e.z.v += -turn * 20 * dt;
      e.x.v += -Math.abs(wind) * 40 * dt;
      stepSpring(e.z, dt); stepSpring(e.x, dt);
      const sway = Math.sin(this.t * 1.7 + i * 1.3) * 0.025;
      e.pivot.rotation.set(e.x.a * 0.05, 0, e.z.a * 0.07 + sway);
    });
  }
}
