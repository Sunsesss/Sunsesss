import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, quantize, prune, textureCompress } from '@gltf-transform/functions';
import sharp from 'sharp';
import { statSync } from 'node:fs';

const path = 'public/assets/kns.glb';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const before = statSync(path).size;
const document = await io.read(path);
for (const mesh of document.getRoot().listMeshes()) {
  for (const primitive of mesh.listPrimitives()) {
    if (!primitive.getMaterial()?.getBaseColorTexture()) {
      primitive.setAttribute('TEXCOORD_0', null);
      primitive.setAttribute('TEXCOORD_1', null);
    }
  }
}
await document.transform(dedup(), weld(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }), textureCompress({ encoder: sharp, targetFormat: 'jpeg', quality: 90 }), prune());
await io.write(path, document);
console.log(`KNS GLB: ${(before / 1048576).toFixed(2)} → ${(statSync(path).size / 1048576).toFixed(2)} MB, no external decoder required.`);
