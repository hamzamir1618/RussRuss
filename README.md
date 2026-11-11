# RussRuss

Website for RussRuss, a cold-pressed juice stand: a long-scroll landing page plus menu, juice, visit, order and confirmation pages. Design direction: **Sunburst Stand**, a 70s roadside juice stand at golden hour on a white page.

```
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
```

## Sections and motion

| # | Section | What happens |
|---|---------|--------------|
| — | Loader | "RussRuss" fills with pink juice while a counter runs to 100, then the white curtain lifts. Scroll is locked until it's done. |
| 1 | Hero | The cup falls in, squashes, splashes and wobbles to rest in front of a sunset-filled sun with turning rays and ring text. "Squeezed" rises with a striped extrusion; "this morning." rolls on a wavy baseline. Fruit and stickers fly in and shift with the pointer. On scroll (pinned) the headline splits, the cup grows, front fruit flies past the camera, and a white circle opens out of the sun with "Today's press". |
| 2 | Today's press | Pinned horizontal row of four juices. The giant Monoton flavour word, the accent tint and the counter follow the card in view; scroll speed skews the cards; each cup turns as it crosses. Cards tilt toward the pointer; Add bursts juice and pops the bag count. Drag sideways with a mouse. |
| 3 | How a cup gets made | Pinned. The orange half spins in from the corner and fills the screen, then the steps open through its pith. Pick, cut, press, pour: each photo sits in a circular frame with a turning text ring; frames wipe between steps, Monoton numbers count up and fill, titles rise and swell from weight 300 to 800. |
| 4 | Finale | Pinned. A striped awning drops ("Come by the stand.") and rolls up on the stand photo; the sign swings down and fills with juice like the loader; the four cups land on the counter with bursts; the order button and the "See you at 7" sticker arrive; the wave bands close the page. |

Reduced motion: no loader, no pins, no particles; every section renders as a static page with all content visible.

## Pages and transitions

Hash routes (`src/lib/router.tsx`). Every page arrives through one of the landing page's scene changes (`src/components/TransitionOverlay.tsx`): the screen is covered, the page swaps underneath, then it's uncovered.

| Route | Page | Arrives through |
|-------|------|-----------------|
| `#home` (or no hash), `#home/steps` | Landing page; with a section, lands on it | Awning: the striped awning drops with a bounce and rolls back up |
| `#menu` | The full menu: four big rows that alternate sides, each with a cup on a turning sun, a recipe, and an Add button per size; extras on price tags | Orange: an orange half spins out of the click and through the camera |
| `#juice/<id>` | One juice: sizes, quantity, recipe card, nutrition stickers, and the next juice | Pour: the clicked cup lifts off its card, its colour floods the screen, and it lands on the juice page |
| `#visit` | Find the stand: photo, address, hours with today lit, a sticker-style corner map, how to get there | Sun: a rayed sun rises over the page and leaves through the top |
| `#order` | Bag (counts, quick add), 15-minute pickup slots for the rest of today (or tomorrow), name and optional phone, receipt | Wave: the pink, tangerine and sunflower bands roll up the screen |
| `#confirm` | Pickup ticket with a code, a PRESSED stamp, an .ics calendar file, and a plain note that nothing was sent | Splash: pink floods out of the button with a juice burst and a stamp |

Browser back and forward play the same transitions. With reduced motion pages swap instantly.

## RussRuss the rabbit

The mascot is a 3D rabbit: ["Cute Rabbit" by Hafiene](https://sketchfab.com/3d-models/cute-rabbit-a92db0809f3f447f876d643ac38bf48b), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), recoloured and animated for RussRuss. The site credits it in the footer and on the finale. The model has no rig, so the code re-assembles its parts on pivots and animates those. He's toon-shaded in the site palette with a cocoa outline, so he reads like the sticker kit. three.js and the model (0.38 MB) load in their own chunk after the opening, so the first paint is no slower.

| Where | What he does |
|-------|--------------|
| Hero | Drops in once the cup has landed, in front of its lower left, with a juice splash, and says hello (happy nods, ear wiggle, paws flapping). He follows the pointer, shifts with the other floating layers and flies past the camera when you scroll. |
| Today's press | Rides the progress bar under the cards: turns to face the way you're scrolling, hop-walks while the row moves, turns back to you when it stops, and hops each time a new juice comes up. |
| How a cup gets made | Sits at the photo frame and acts out each step: excited for pick, a curious tilt for cut, squashes down hard for press, dances for pour. |
| Finale | Pops up behind the counter once the cups land, cheers, and says hello again when the order button arrives. Ducks back down if you scroll back. |
| Bag | Cheers whenever something goes in the bag: where he already is, or popping up from the bottom-right corner on any other page. |

Between cues he keeps busy: blinks, looks around, tilts his head, winks, bounces, dances (his paws only ever swing forward, so they never disappear into his big head), and his ears blow back when you scroll fast. Click him for a hop, a wink or a dance.

With reduced motion (or no WebGL) he's a still image in the same places. Dev builds have a lab at `/?rabbit` with a button per action.

## Placeholders

Menu names, prices, sizes, nutrition, hours (7 to 7 every day), transit notes and the address are samples in `src/data`. The bag and the placed order are in memory only; there is no ordering or payment backend, so a refresh clears them and the confirmation page says so.
