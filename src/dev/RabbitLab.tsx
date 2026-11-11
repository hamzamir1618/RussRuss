import { useEffect, useState } from 'react';
import { loadMascot } from '../lib/mascot';
import { MascotSlot } from '../components/MascotSlot';
import { Sprite } from '../components/Sprite';
import type { Stage } from '../three/stage';

/** Dev-only page (/?rabbit): the rabbit on his own, with a button per action. */
export function RabbitLab() {
  const [stage, setStage] = useState<Stage | null>(null);
  useEffect(() => { loadMascot().then(() => setStage((window as unknown as { mascot: Stage }).mascot)); }, []);
  const r = stage?.rabbit;
  const acts: [string, () => void][] = r ? [
    ['Greet', () => r.greet()], ['Cheers', () => r.cheers()], ['Wink', () => r.wink()], ['Tilt', () => r.tilt()],
    ['Hop', () => r.hop()], ['Ears', () => r.kick(10, 12)], ['Dance', () => r.dance()], ['Bounce', () => r.bounce()],
    ['Look around', () => r.lookAround()], ['Stomp', () => r.stomp()],
  ] : [];
  return (
    <div className="lab">
      <Sprite />
      <div className="rays turn-60" />
      <MascotSlot id="lab" />
      <div className="lab-bar">{acts.map(([l, f]) => <button key={l} className="btn sm" type="button" onClick={f}>{l}</button>)}</div>
    </div>
  );
}
