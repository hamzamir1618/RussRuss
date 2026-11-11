// Make the web copy of the mascot model: public/models/rabbit.glb from design/source-art/mascot/cute_rabbit.glb.
//   npm i --no-save @gltf-transform/core@4 @gltf-transform/functions@4 meshoptimizer@0.21   (once)
//   node design/scripts/mascot.mjs [--ratio 0.2]
// - renames the parts to English (the source names are Tunisian Arabic), telling the two ears apart by side;
//   src/three/rabbit.ts finds parts by these names
// - welds and simplifies the meshes (the source is ~158k triangles, far more than he needs at site sizes)
// - drops the unused UVs (no textures) and anything left unreferenced
//
// Model: "Cute Rabbit" by Hafiene, https://sketchfab.com/3d-models/cute-rabbit-a92db0809f3f447f876d643ac38bf48b
// CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/). The site credits it in the footer.
import { NodeIO, VertexLayout, getBounds } from '@gltf-transform/core';
import { dedup, prune, simplify, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const IN = path.join(ROOT, 'design/source-art/mascot/cute_rabbit.glb');
const OUT = path.join(ROOT, 'public/models/rabbit.glb');
const ratio = +(process.argv[process.argv.indexOf('--ratio') + 1] || 0.2) || 0.2;

/** Source node name (trimmed) -> part name. Ears are resolved by side below. */
const NAMES = {
  '3enin': 'eyes', '5cham': 'nose', 'bdan': 'body', 'sa9in': 'legs', 'iden': 'arms', 'kerch 2': 'belly',
  '5doud.001': 'cheeks', 'ras': 'head', 'ba3bous': 'tail', 'fom': 'mouth',
};

// separate (not interleaved) vertex arrays: src/three/rabbit.ts edits the geometry when it assembles him
const io = new NodeIO().setVertexLayout(VertexLayout.SEPARATE);
const doc = await io.read(IN);
const root = doc.getRoot();
const centerX = node => { const b = getBounds(node); return (b.min[0] + b.max[0]) / 2; };
const head = root.listNodes().find(n => n.getName().trim() === 'ras');
const hx = centerX(head);

for (const node of root.listNodes()) {
  const src = node.getName().trim();
  let name = NAMES[src];
  if (src.startsWith('wedhnen')) {
    // four ear pieces: two cream outsides, two pink insides
    const inner = node.listChildren().some(c => c.getMesh()?.listPrimitives().some(p => p.getMaterial()?.getName() === 'Material.008'));
    name = `ear${centerX(node) < hx ? 'L' : 'R'}_${inner ? 'inner' : 'outer'}`;
  }
  if (!name) continue;
  node.setName(name);
  for (const c of node.listChildren()) { c.setName(`${name}_mesh`); c.getMesh()?.setName(name); }
}
// the three materials: fur (cream), accent (pink), ink (black)
const MAT = { 'Material.007': 'fur', 'Material.008': 'accent', 'Material.002': 'ink', 'Material.004': 'ink' };
for (const m of root.listMaterials()) m.setName(MAT[m.getName()] ?? m.getName());

for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) p.setAttribute('TEXCOORD_0', null);

await MeshoptSimplifier.ready;
const before = count();
await doc.transform(dedup(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.003 }), prune());
fs.mkdirSync(path.dirname(OUT), { recursive: true });
await io.write(OUT, doc);
console.log(`triangles ${before} -> ${count()}, ${(fs.statSync(IN).size / 1e6).toFixed(2)} MB -> ${(fs.statSync(OUT).size / 1e6).toFixed(2)} MB`);
console.log('parts:', root.listNodes().filter(n => n.getMesh()).map(n => n.getName()).join(', '));

function count() {
  let t = 0;
  for (const m of root.listMeshes()) for (const p of m.listPrimitives()) t += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3;
  return Math.round(t);
}
