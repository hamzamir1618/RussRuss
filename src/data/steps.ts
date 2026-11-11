// How a cup gets made: four steps, each with a circular photo frame. Figures are samples to confirm with the stand.

export type Step = {
  id: 'pick' | 'cut' | 'press' | 'pour';
  label: string;
  /** Text on the ring around the photo (repeated to fill the circle). */
  ring: string;
  ringColor: string;
  caption: string;
  number: number;
  decimals?: number;
  suffix?: string;
  unit: string;
  title: string;
  body: string;
};

export const STEPS: Step[] = [
  {
    id: 'pick', label: 'Pick', ring: 'STEP 01 • PICK •', ringColor: '#FF2E7E', caption: 'Step 1 · The morning delivery',
    number: 5, suffix: ':00', unit: 'a.m., when the fruit shows up',
    title: "We buy what's ripe that morning.", body: 'So the menu moves with the seasons. In winter, that means a lot of citrus.',
  },
  {
    id: 'cut', label: 'Cut', ring: 'STEP 02 • CUT •', ringColor: '#FF6A13', caption: 'Step 2 · A Valencia orange, halved',
    number: 3.2, decimals: 1, unit: 'pounds of fruit in every cup',
    title: 'Everything is washed and cut by hand.', body: 'Peels off, seeds out. Nothing goes in to bulk it up.',
  },
  {
    id: 'press', label: 'Press', ring: 'STEP 03 • PRESS •', ringColor: '#FF2E7E', caption: 'Step 3 · The press',
    number: 4, unit: 'tons of slow pressure',
    title: 'Squeezed, not spun.', body: 'A hydraulic press pushes the juice out of the pulp, so nothing heats up on the way.',
  },
  {
    id: 'pour', label: 'Pour', ring: 'STEP 04 • POUR •', ringColor: '#FF6A13', caption: 'Step 4 · Sun Up, 350 ml',
    number: 72, unit: 'hours before it fades',
    title: 'Into cups within the hour.', body: "We don't pasteurize, so it doesn't keep forever. Drink it within three days.",
  },
];
