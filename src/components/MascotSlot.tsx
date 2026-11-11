import { useEffect, useRef } from 'react';
import { LIVE, registerSlot, type SceneId } from '../lib/mascot';

/**
 * A place on the page where the rabbit can appear. The shared 3D canvas moves in while the slot is on screen.
 * Where the 3D rabbit doesn't run (reduced motion, no WebGL), it shows a still of the same pose instead.
 */
export function MascotSlot({ id, className = '' }: { id: SceneId; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => (LIVE ? registerSlot(id, el.current!) : undefined), [id]);
  return (
    <div ref={el} className={`mascot-slot ms-${id} ${className}`} aria-hidden="true">
      {!LIVE && id !== 'pop' && <img className="mascot-still" src={`/img/rabbit-${id}.webp`} alt="" />}
    </div>
  );
}
