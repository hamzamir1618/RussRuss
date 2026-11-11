// The menu. Names, ingredients, prices, sizes and nutrition are samples until the stand confirms the real menu.

export type Size = { ml: number; label: string; price: number };

export type Juice = {
  id: string;
  name: string;
  blurb: string;
  /** Longer note for the juice page. */
  note: string;
  sizes: Size[];
  stats: string[];
  ingredients: { name: string; amount: string }[];
  nutrition: { label: string; value: string }[];
  cup: string;
  garnish: string | null;
  /** Big Monoton word behind the row while this juice is centred. */
  word: string;
  /** Accent: card stage fill, giant word tint, progress bar, page colour. */
  tint: string;
  /** Burst colours when added to the bag. */
  juice: string[];
};

const sizes = (small: number, big: number): Size[] => [
  { ml: 350, label: '350 ml cup', price: small },
  { ml: 1000, label: '1 litre bottle', price: big },
];

export const MENU: Juice[] = [
  {
    id: 'sun-up', name: 'Sun Up', sizes: sizes(9.5, 24), stats: ['140 cal', '3.2 lb fruit'],
    blurb: 'Orange, carrot and a thumb of ginger. The first thing we press every morning.',
    note: 'Our most ordered juice, and the one we taste-test the oranges with. Sweet from the fruit, warm from the ginger.',
    ingredients: [{ name: 'Valencia orange', amount: '6' }, { name: 'Carrot', amount: '2' }, { name: 'Yuzu', amount: '½' }, { name: 'Ginger', amount: '1 thumb' }],
    nutrition: [{ label: 'Calories', value: '140' }, { label: 'Sugar', value: '24 g' }, { label: 'Vitamin C', value: '160% DV' }, { label: 'Fruit and veg', value: '3.2 lb' }],
    cup: '/img/cup-orange.webp', garnish: '/img/orange-half.webp', word: 'SUN UP', tint: '#FFC300',
    juice: ['#FF6A13', '#FFC300', '#FFF6E2'],
  },
  {
    id: 'garden-party', name: 'Garden Party', sizes: sizes(10, 25), stats: ['90 cal', '3.5 lb produce'],
    blurb: 'Green apple, celery, cucumber and mint. Sharp and cold, not sweet.',
    note: "For people who say they don't like green juice. The apple does most of the talking; the celery keeps it honest.",
    ingredients: [{ name: 'Green apple', amount: '2' }, { name: 'Celery', amount: '4 stalks' }, { name: 'Cucumber', amount: '1' }, { name: 'Mint', amount: 'a handful' }, { name: 'Lime', amount: '½' }],
    nutrition: [{ label: 'Calories', value: '90' }, { label: 'Sugar', value: '14 g' }, { label: 'Vitamin K', value: '45% DV' }, { label: 'Fruit and veg', value: '3.5 lb' }],
    cup: '/img/cup-green.webp', garnish: null, word: 'GARDEN', tint: '#7ED321',
    juice: ['#7ED321', '#E6F9C8', '#FFF6E2'],
  },
  {
    id: 'berry-beet', name: 'Berry Beet', sizes: sizes(9.5, 24), stats: ['150 cal', '3.1 lb produce'],
    blurb: 'Watermelon, strawberry and beet. Sweet up front, earthy after.',
    note: 'Summer in a cup. When watermelons are out of season we swap in more strawberry and tell you on the board.',
    ingredients: [{ name: 'Watermelon', amount: '¼' }, { name: 'Strawberry', amount: '8' }, { name: 'Beet', amount: '1' }, { name: 'Lemon', amount: '½' }],
    nutrition: [{ label: 'Calories', value: '150' }, { label: 'Sugar', value: '28 g' }, { label: 'Vitamin C', value: '110% DV' }, { label: 'Fruit and veg', value: '3.1 lb' }],
    cup: '/img/cup-pink.webp', garnish: '/img/strawberry.webp', word: 'BERRY', tint: '#FF2E7E',
    juice: ['#FF2E7E', '#FFB3CF', '#FFF6E2'],
  },
  {
    id: 'gold-rush', name: 'Gold Rush', sizes: sizes(9, 23), stats: ['130 cal', '2.8 lb fruit'],
    blurb: 'Pineapple, mango and ginger. The ginger shows up a second later.',
    note: 'Thick, bright and a little hot. If you like it hotter, ask for extra ginger.',
    ingredients: [{ name: 'Pineapple', amount: '¼' }, { name: 'Mango', amount: '1' }, { name: 'Ginger', amount: '1 thumb' }, { name: 'Lime', amount: '½' }],
    nutrition: [{ label: 'Calories', value: '130' }, { label: 'Sugar', value: '26 g' }, { label: 'Vitamin C', value: '130% DV' }, { label: 'Fruit and veg', value: '2.8 lb' }],
    cup: '/img/cup-mango.webp', garnish: '/img/pineapple.webp', word: 'GOLD', tint: '#FF6A13',
    juice: ['#FFC300', '#FF6A13', '#FFF6E2'],
  },
];

export const juiceById = (id?: string) => MENU.find(j => j.id === id);

/** Text-only extras, added at the counter. */
export const ADDONS = [
  { name: 'Extra ginger', price: 0.5 },
  { name: 'Shot of lemon', price: 0.5 },
  { name: 'Ice', price: 0 },
  { name: 'Chia seeds', price: 1 },
];

export const money = (n: number) => `$${n.toFixed(2)}`;
