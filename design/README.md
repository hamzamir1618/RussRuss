# design/

Approval material and source art. Nothing here is part of the app build.

| Folder | What's in it |
|--------|--------------|
| `source-art/sunburst/` | The user's 10 Nano Banana photos for the Sunburst Stand direction (the ones the app uses). |
| `source-art/candy/` | The 10 Candy Gloss photos. The direction was dropped; kept for reference. |
| `source-art/mascot/` | `cute_rabbit.glb`, the mascot model as downloaded: "Cute Rabbit" by Hafiene on Sketchfab (https://sketchfab.com/3d-models/cute-rabbit-a92db0809f3f447f876d643ac38bf48b), CC BY 4.0, so the site must credit it. Untouched original; `node design/scripts/mascot.mjs` makes the site's copy, `public/models/rabbit.glb`. |
| `prototype/` | The final design doc (`index.html`) and the single-file prototype it embeds (`sunburst.html`), with `assets/` (the Sunburst cutouts). Open `index.html` over a local server, or use the export. |
| `exports/` | `RUSSRUSS-Sunburst-Stand-Design-Doc.html`: the design doc as one offline file (images, fonts and animation libraries inlined). This is the copy that was sent to the manager. |
| `archive/01-brutalist-spec/` | First direction: brutalist spec with a scroll-driven prototype. Dropped as not fitting a juice shop. |
| `archive/02-four-directions/` | Four art directions on a shared motion engine: Sunburst Stand, Amalfi Citrus, Candy Gloss, Daylight Jungle. Open `index.html`. |
| `archive/03-sunburst-vs-candy/` | The two-direction design doc (Sunburst Stand vs Candy Gloss) with both prototypes and all cutouts. |
| `archive/image-prompts.html` | The structured Nano Banana prompts for all four directions. |
| `scripts/` | Tooling, below. `vendor/` holds GSAP, ScrollTrigger, Lenis and the Google Fonts CSS for the offline export. |

## Scripts

Run from the project root.

```
python design/scripts/cutouts.py           # source-art/sunburst/*.jpg -> public/img/*.webp (transparent cutouts)
python design/scripts/cutouts.py --candy   # also source-art/candy -> archive/03-sunburst-vs-candy/assets
python design/scripts/export.py            # prototype/ -> exports/RUSSRUSS-Sunburst-Stand-Design-Doc.html
node design/scripts/check.mjs              # browser check of the running dev server (see the header for setup)
```

`cutouts.py` needs pillow, numpy and scipy. `export.py` downloads the font files once, so it needs network. `check.mjs` needs `puppeteer-core` (`npm i --no-save puppeteer-core@23`) and Edge.

Pages open fine straight from disk except where they load sibling files with `fetch` (none do) or embed `sunburst.html` in an iframe, which some browsers block from `file://`. If an embedded prototype stays blank, run `npx serve design` and open it over http, or use the export.
