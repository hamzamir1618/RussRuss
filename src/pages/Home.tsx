import { Hero } from '../sections/Hero';
import { Press } from '../sections/Press';
import { Steps } from '../sections/Steps';
import { Finale } from '../sections/Finale';

// Section order matters: pinned sections create their ScrollTriggers in mount order, top to bottom.
export function Home({ revealed }: { revealed: boolean }) {
  return (
    <>
      <Hero revealed={revealed} />
      <Press />
      <Steps />
      <Finale />
    </>
  );
}
