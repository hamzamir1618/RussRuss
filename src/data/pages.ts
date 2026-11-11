// Copy for the screens behind the landing page. Hours, address, transit and parking are samples.

import { ADDRESS } from './copy';

export const MENU_PAGE = {
  kicker: 'Pressed at 6 am · Gone when it’s gone',
  title: 'The menu',
  lede: 'Four juices, two sizes. The board at the stand changes with the season; this list follows it.',
  addonsTitle: 'Extras at the counter',
};

export const VISIT = {
  kicker: 'Open 7 to 7, every day',
  title: 'Find the stand',
  lede: 'We’re the striped awning on the corner. Walk up, order at the window, or order ahead and skip the line.',
  address: ADDRESS,
  city: 'Sample City',
  hours: [
    { day: 'Monday', open: '7:00', close: '19:00' },
    { day: 'Tuesday', open: '7:00', close: '19:00' },
    { day: 'Wednesday', open: '7:00', close: '19:00' },
    { day: 'Thursday', open: '7:00', close: '19:00' },
    { day: 'Friday', open: '7:00', close: '19:00' },
    { day: 'Saturday', open: '7:00', close: '19:00' },
    { day: 'Sunday', open: '7:00', close: '19:00' },
  ],
  ways: [
    { how: 'Bus', text: 'Lines 12 and 40 stop at 2nd Ave, right across the street.' },
    { how: 'Bike', text: 'There’s a rack next to the orange crates.' },
    { how: 'Car', text: 'One-hour street parking on Sample St. Busiest from 8 to 9 am.' },
  ],
};

export const ORDER = {
  kicker: 'Order ahead · Pay at the stand',
  title: 'Your order',
  lede: 'Pick a time and we’ll have it pressed and waiting. You pay when you collect.',
  empty: 'Nothing in the bag yet.',
};

export const DONE = {
  kicker: 'Order placed',
  stamp: 'PRESSED',
  proto: 'This is a prototype. No ordering system is connected yet, so nothing has actually been sent to the stand.',
};
