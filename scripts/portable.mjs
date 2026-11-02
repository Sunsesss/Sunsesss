import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';

// Package the tested production build as a genuinely standalone file.
// No server, external modules, fonts, images or network requests are required.
const dist = resolve('dist');
const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };
const embedded = new Map();
function asset(url) {
  if (!url.startsWith('/assets/')) return url;
  if (embedded.has(url)) return embedded.get(url);
  const [path, fragment] = url.split('#');
  const result = `data:${types[extname(path)] || 'application/octet-stream'};base64,${readFileSync(resolve(dist, path.slice(1))).toString('base64')}${fragment ? '#' + fragment : ''}`;
  embedded.set(url, result);
  return result;
}
let html = readFileSync(resolve(dist, 'index.html'), 'utf8');
const cssPath = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/)?.[1];
const jsPath = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/)?.[1];
if (!cssPath || !jsPath) throw new Error('Missing production CSS or JavaScript');
// All supported browsers use WOFF2. Avoid embedding legacy SVG/TTF/WOFF copies
// of the same icon font in the standalone file.
const cssSource = readFileSync(resolve(dist, cssPath.slice(1)), 'utf8').replace(/@font-face\{[^}]+\}/g, face => face.replace(/src:([^;]+);/, original => {
  const woff2 = original.match(/url\((?:"[^"]*"|'[^']*'|[^)]+)\)\s*format\(["']?woff2["']?\)/)?.[0];
  return woff2 ? `src:${woff2};` : original;
}));
const css = cssSource.replace(/url\((['"]?)(\/assets\/[^)'"\s]+)\1\)/g, (_, quote, url) => `url("${asset(url)}")`);
const js = readFileSync(resolve(dist, jsPath.slice(1)), 'utf8').replace(/\/assets\/[^"'\s)]+/g, url => asset(url));
html = html.replace(/<link rel="stylesheet"[^>]*>/, () => `<style>${css}</style>`);
html = html.replace(/<script type="module"[^>]*><\/script>/, '');
html = html.replace('</body>', () => `<script>if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',startSite,{once:true});}else{startSite();}function startSite(){${js.replace(/<\/script/gi, '<\\/script')}\n}</script></body>`);
html = html.replace(/(src|href)="(\/assets\/[^"#]+)"/g, (_, attr, url) => `${attr}="${asset(url)}"`);
if (/(?:src|href)="\/assets\//.test(html) || /url\(["']?\/assets\//.test(html)) throw new Error('External asset reference remains');
mkdirSync('portable', { recursive: true });
writeFileSync('portable/index.html', html);
console.log(`Standalone HTML created: ${Math.round(Buffer.byteLength(html) / 1024 / 1024)} MB; all assets embedded.`);
