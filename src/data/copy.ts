// All page copy lives in src/data. Menu, prices, nutrition, hours and the address are placeholders
// until the stand confirms them. Voice: plain and specific, "we", facts over adjectives, no health claims.

export const ADDRESS = 'Corner of Sample St and 2nd Ave';
export const HOURS = 'Open 7 to 7';

/** `view` is the page; `param` a section on the landing page. `short` is the phone label (empty: hidden on phones). */
export const NAV = [
  { label: 'Menu', short: 'Menu', view: 'menu', param: undefined },
  { label: "How it's made", short: '', view: 'home', param: 'steps' },
  { label: 'Find the stand', short: 'Visit', view: 'visit', param: undefined },
] as const;

export const LOADER = { label: 'Pressing', aside: HOURS };

export const HERO = {
  kicker: `Cold-pressed juice · ${HOURS}`,
  line1: 'Squeezed',
  line2: 'this morning.',
  ring: 'FRESH-SQUEEZED EVERY MORNING • RUSSRUSS JUICE STAND • OPEN 7 TO 7 •',
  facts: ['Pressed at 6 am', '350 ml cups'],
  hot: 'Never heated',
  cue: 'Scroll down',
  cta: 'Order for pickup',
  badge: { ring: 'PRESSED DAILY • 350 ML • NEVER HEATED •', center: '6am' },
};

export const WIPE = { kicker: "What we're pouring today", title: "Today's press" };

export const PRESS = { title: "Today's press", sub: 'Four juices, pressed this morning' };

export const STEPS_HEAD = 'How a cup gets made';

export const FINALE = {
  kicker: 'Last stop',
  title: 'Come by the stand.',
  signKicker: `Juice stand · ${HOURS}`,
  cta: 'Order for pickup',
  foot: `RussRuss · Cold-pressed juice · ${HOURS} · Sample address`,
  badge: { ring: 'OPEN 7 TO 7 • RUSSRUSS • JUICE STAND •', top: 'SEE YOU', bottom: 'at 7' },
};

/** The mascot's 3D model is CC BY 4.0: credit the author, link the model and the licence, and say it was changed. */
export const MODEL_CREDIT = {
  title: 'Cute Rabbit',
  url: 'https://sketchfab.com/3d-models/cute-rabbit-a92db0809f3f447f876d643ac38bf48b',
  author: 'Hafiene',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  changes: 'recoloured and animated',
};
