"""Bundle the Sunburst design doc and its embedded prototype into one offline HTML file.

    python design/scripts/export.py
    -> design/exports/RUSSRUSS-Sunburst-Stand-Design-Doc.html

Inlines the images (one copy for the doc, one inside the prototype), the latin subset of the four Google fonts
(downloaded once, needs network), GSAP, ScrollTrigger and Lenis (from design/scripts/vendor). The prototype runs
in an iframe `srcdoc`; "Open full screen" opens it from a Blob URL.
"""
import argparse
import base64
import os
import re
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
ap = argparse.ArgumentParser()
ap.add_argument('--src', default=os.path.join(ROOT, 'design', 'prototype'), help='folder with index.html, sunburst.html and assets/')
ap.add_argument('--vendor', default=os.path.join(HERE, 'vendor'), help='gsap.min.js, ScrollTrigger.min.js, lenis.min.js, fonts.css')
ap.add_argument('--out', default=os.path.join(ROOT, 'design', 'exports', 'RUSSRUSS-Sunburst-Stand-Design-Doc.html'))
args = ap.parse_args()
FIN, VEN, OUT = args.src, args.vendor, args.out

rd = lambda p: open(p, encoding='utf-8').read()
js_safe = lambda s: s.replace('</script', '<\\/script')
body_of = lambda html: (re.search(r'<body[^>]*>(.*)</body>', html, re.S) or [None, html])[1]

# ---- images ----
assets = {}
for f in sorted(os.listdir(os.path.join(FIN, 'assets'))):
    if f.endswith('.webp'):
        assets[f[:-5]] = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(FIN, 'assets', f), 'rb').read()).decode()
inline_assets = lambda s: re.sub(r'assets/([a-z0-9-]+)\.webp', lambda m: assets[m.group(1)], s)

# ---- fonts: latin subset, woff2 embedded ----
blocks = re.findall(r'/\* ([a-z-]+) \*/\s*(@font-face \{.*?\})', rd(os.path.join(VEN, 'fonts.css')), re.S)
cache, faces = {}, []
for subset, block in blocks:
    if subset != 'latin':
        continue
    url = re.search(r'url\((https://[^)]+)\)', block).group(1)
    if url not in cache:
        cache[url] = 'data:font/woff2;base64,' + base64.b64encode(urllib.request.urlopen(url).read()).decode()
    faces.append(block.replace(url, cache[url]))
FONTS = '\n'.join(faces)
print('fonts:', len(faces), 'faces,', sum(len(v) for v in cache.values()) // 1024, 'KB')

lib = lambda n: f'<script>{js_safe(rd(os.path.join(VEN, n)))}</script>\n'
LIBS = lib('gsap.min.js') + lib('ScrollTrigger.min.js') + lib('lenis.min.js')

# ---- the prototype, standalone (it goes into the iframe's srcdoc) ----
p = rd(os.path.join(FIN, 'sunburst.html'))
p = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', f'<style>{FONTS}</style>', p)
p = p.replace('<link rel="stylesheet" href="common.css">', f'<style>{rd(os.path.join(FIN, "common.css"))}</style>')
p = re.sub(r'<script src="https://cdnjs[^"]*gsap\.min\.js"></script>\n<script src="https://cdnjs[^"]*ScrollTrigger\.min\.js"></script>\n<script src="https://unpkg[^"]*lenis\.min\.js"></script>\n', lambda m: LIBS, p)
p = p.replace('<script src="engine.js"></script>', f'<script>{js_safe(rd(os.path.join(FIN, "engine.js")))}</script>')
p = inline_assets(p)
assert 'cdnjs' not in p and 'unpkg' not in p and 'assets/' not in p, 'prototype still has external references'

# ---- the doc: body only; images come from one shared table at runtime ----
d = body_of(rd(os.path.join(FIN, 'index.html')))
d = re.sub(r'<title>.*?</title>\n?', '', d)
d = re.sub(r'<link rel="stylesheet" href="[^"]*">\n?', '', d)
d = re.sub(r'<script src="[^"]*"></script>\n?', '', d)
esc = p.replace('&', '&amp;').replace('"', '&quot;')
d = d.replace('<iframe src="sunburst.html" title="Sunburst Stand prototype" loading="lazy"></iframe>', f'<iframe title="Sunburst Stand prototype" srcdoc="{esc}"></iframe>')
d = d.replace('<a class="btn sm" href="sunburst.html" target="_blank" rel="noopener">Open full screen ↗</a>', '<a class="btn sm" href="#" id="openFull">Open full screen ↗</a>')
d = re.sub(r'src="assets/([a-z0-9-]+)\.webp"', r'data-asset="\g<1>"', d)
assert 'assets/' not in d, 'doc html still has asset paths'

core = rd(os.path.join(FIN, 'doc-core.js')).replace("const A = n => `assets/${n}.webp`;", "const A = n => (window.RR_ASSETS && window.RR_ASSETS[n]) || `assets/${n}.webp`;")
labs = re.sub(r'assets/\$\{([^}]+)\}\.webp', r'${RRD.A(\1)}', rd(os.path.join(FIN, 'labs.js')))
labs = re.sub(r'assets/([a-z0-9-]+)\.webp', lambda m: "${RRD.A('" + m.group(1) + "')}", labs)
init = inline_assets(rd(os.path.join(FIN, 'doc-init.js')))
doc_css = rd(os.path.join(FIN, 'doc.css')).replace('url(assets/sunset.webp)', 'var(--asset-sunset)')
assert 'assets/' not in doc_css
asset_js = ('window.RR_ASSETS = ' + repr(assets).replace("'", '"') + ';\n'
            "document.documentElement.style.setProperty('--asset-sunset', 'url(' + RR_ASSETS.sunset + ')');\n"
            "document.querySelectorAll('[data-asset]').forEach(i => { i.src = RR_ASSETS[i.dataset.asset]; });")
open_full = ("document.getElementById('openFull').addEventListener('click', e => { e.preventDefault(); "
             "const src = document.querySelector('[data-frame] iframe').srcdoc; "
             "window.open(URL.createObjectURL(new Blob([src], { type: 'text/html' })), '_blank'); });")

html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RUSSRUSS · Sunburst Stand · Design doc</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27%3E%3Ccircle cx=%2732%27 cy=%2732%27 r=%2730%27 fill=%27%23FF6A13%27/%3E%3Ccircle cx=%2732%27 cy=%2732%27 r=%2722%27 fill=%27%23FFC300%27/%3E%3C/svg%3E">
<style>{FONTS}</style>
<style>[hidden] {{ display: none !important; }}
{doc_css}</style>
</head>
<body>
{d}
{lib('gsap.min.js')}<script>{js_safe(asset_js)}</script>
<script>{js_safe(core)}</script>
<script>{js_safe(labs)}</script>
<script>{js_safe(init)}</script>
<script>{open_full}</script>
</body>
</html>
'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(html)
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
