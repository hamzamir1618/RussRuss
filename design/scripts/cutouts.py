"""Turn the white-background Nano Banana photos into transparent WebP cutouts.

    python design/scripts/cutouts.py            # Sunburst set: design/source-art/sunburst -> public/img
    python design/scripts/cutouts.py --candy    # also the archived Candy Gloss set -> design/archive/03-sunburst-vs-candy/assets

Background = near-white pixels connected to the image border (flood fill), so white details inside the subject
(straw stripes, pith, highlights) stay opaque. Inside the background, alpha comes from a white colour-to-alpha,
so soft edges, droplets and spray keep their translucency. A graded off-white backdrop is lifted to pure white first.
Needs: pillow, numpy, scipy.
"""
import argparse
import glob
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap = argparse.ArgumentParser()
ap.add_argument('--src', default=os.path.join(ROOT, 'design', 'source-art'), help='folder holding sunburst/ and candy/')
ap.add_argument('--out', default=os.path.join(ROOT, 'public', 'img'), help='where the Sunburst cutouts go')
ap.add_argument('--candy', action='store_true', help='also cut the archived Candy Gloss set')
ap.add_argument('--candy-out', default=os.path.join(ROOT, 'design', 'archive', '03-sunburst-vs-candy', 'assets'))
args = ap.parse_args()


def cutout(img, thresh=None):
    a = np.asarray(img.convert('RGB')).astype(np.float32)
    mn = a.min(axis=2)
    edge = np.concatenate([mn[:8].ravel(), mn[-8:].ravel(), mn[:, :8].ravel(), mn[:, -8:].ravel()])
    bgl = float(np.percentile(edge, 60))
    # flatten a graded off-white backdrop: lift everything near it so the backdrop reads as pure white
    lift = 255.0 - bgl
    a = np.clip(a + lift * np.clip((mn[..., None] - (bgl - 40)) / 40, 0, 1), 0, 255)
    mn = a.min(axis=2)
    lab, _ = ndimage.label(mn >= (thresh or 238))
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, border[border > 0])
    ca = np.clip(((255.0 - mn) / 255.0 - 0.02) / 0.6, 0, 1)  # colour-to-alpha against white
    alpha = np.where(bg, ca, 1.0)
    alpha = np.maximum(alpha, ndimage.uniform_filter(np.where(bg, 0.0, 1.0), 3) * 0.85)  # soften the edge by a pixel
    alpha = np.where(bg, np.minimum(alpha, ca * 1.4), alpha)
    safe = np.maximum(alpha, 1e-3)[..., None]
    rgb = np.clip(np.where(bg[..., None], (a - 255.0 * (1 - safe)) / safe, a), 0, 255)
    return Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), 'RGBA')


def trim(im, pad=12, thr=10, rel=0.0):
    al = np.asarray(im)[..., 3]
    ys, xs = np.where(al > thr)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    pad = max(pad, int(rel * max(x1 - x0, y1 - y0)))
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))


def save(im, out, name, long_edge, q=82):
    os.makedirs(out, exist_ok=True)
    im = im.copy()
    im.thumbnail((long_edge, long_edge), Image.LANCZOS)
    path = os.path.join(out, name)
    im.save(path, 'WEBP', quality=q, method=6)
    print(f'{name:28s} {im.size} {os.path.getsize(path) // 1024} KB')


def split_columns(im, count, gap_pad):
    """Split an image of objects laid out side by side into `count` pieces at the empty columns between them."""
    al = np.asarray(im)[..., 3] > 60
    lab, n = ndimage.label(al.sum(axis=0) > 4)
    spans = sorted([(np.where(lab == i)[0].min(), np.where(lab == i)[0].max()) for i in range(1, n + 1)], key=lambda s: s[1] - s[0], reverse=True)[:count]
    return [im.crop((max(0, x0 - gap_pad), 0, min(im.width, x1 + gap_pad), im.height)) for x0, x1 in sorted(spans)]


# ---------------- Sunburst set (used by the app) ----------------
SB, OUT = os.path.join(args.src, 'sunburst'), args.out
open_sb = lambda f: Image.open(os.path.join(SB, f))

# cups: cropped around the cup body (far droplets ignored) so all four share the same framing
for f, n, e in [('orange juice.jpg', 'cup-orange.webp', 1500), ('green apple juice.jpg', 'cup-green.webp', 1100),
                ('strawberry juice.jpg', 'cup-pink.webp', 1100), ('mango juice.jpg', 'cup-mango.webp', 1100)]:
    save(trim(cutout(open_sb(f)), thr=230, rel=0.07), OUT, n, e)
save(trim(cutout(open_sb('half orange.jpg'))), OUT, 'orange-half.webp', 1200)
save(trim(cutout(open_sb('sunburst splash.jpg'), thresh=240)), OUT, 'splash.webp', 1400)
save(trim(cutout(open_sb('juice press.jpg'))), OUT, 'press.webp', 1300)
for piece, n in zip(split_columns(cutout(open_sb('watermelon strawberry pineapple.jpg')), 3, 40), ['melon.webp', 'strawberry.webp', 'pineapple.webp']):
    save(trim(piece), OUT, n, 900)
for f, n in [('sunset.jpg', 'sunset.webp'), ('juice stand.jpg', 'stand.webp')]:  # full-frame scenes, no cutout
    im = open_sb(f).convert('RGB')
    im.thumbnail((1920, 1920), Image.LANCZOS)
    im.save(os.path.join(OUT, n), 'WEBP', quality=80, method=6)
    print(f'{n:28s} {im.size} {os.path.getsize(os.path.join(OUT, n)) // 1024} KB')

# ---------------- Candy Gloss set (archived direction) ----------------
if args.candy:
    CA, CO = os.path.join(args.src, 'candy'), args.candy_out
    open_ca = lambda f: Image.open(os.path.join(CA, f))
    for f, n in [('orange blob.jpg', 'blob-orange.webp'), ('green apple blob.jpg', 'blob-green.webp'),
                 ('strawberry blob.jpg', 'blob-pink.webp'), ('pineapple blob.jpg', 'blob-yellow.webp')]:
        save(trim(cutout(open_ca(f))), CO, n, 1200)
    for k, piece in enumerate(split_columns(cutout(open_ca('glossy fruits.jpg')), 4, 30)):
        save(trim(piece), CO, f'gloss-{k + 1}.webp', 900)
    b = cutout(open_ca('juice bubbles.jpg'))
    save(trim(b), CO, 'bubbles.webp', 1600)
    # single bubbles: the largest round blobs (cropped half-spheres at the photo's edge are skipped by aspect ratio)
    al = np.asarray(b)[..., 3] > 90
    lab, n = ndimage.label(ndimage.binary_closing(al, iterations=3))
    sizes, objs = ndimage.sum(al, lab, range(1, n + 1)), ndimage.find_objects(lab)
    round_ = lambda sl: 0.88 < (sl[0].stop - sl[0].start) / (sl[1].stop - sl[1].start) < 1.14
    keep = [i for i in np.argsort(sizes)[::-1] if sizes[i] > 1500 and round_(objs[i])][:12]
    for f in glob.glob(os.path.join(CO, 'bubble-*.webp')):
        os.remove(f)
    for k, i in enumerate(keep):
        sl = objs[i]
        save(b.crop((max(0, sl[1].start - 8), max(0, sl[0].start - 8), min(b.width, sl[1].stop + 8), min(b.height, sl[0].stop + 8))), CO, f'bubble-{k + 1}.webp', 420)
    save(cutout(open_ca('juice drip.jpg')), CO, 'drip.webp', 1920)
    for f, n, e in [('juice ribbon.jpg', 'ribbon.webp', 1600), ('squeeze moment.jpg', 'squeeze.webp', 1200), ('lime wheel.jpg', 'lime-wheel.webp', 1100)]:
        save(trim(cutout(open_ca(f))), CO, n, e)
