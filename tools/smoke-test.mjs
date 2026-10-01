#!/usr/bin/env node
// Smoke test for the conversion core inside index.html.
//
//   node tools/smoke-test.mjs                    converts examples/sourdough.md
//   node tools/smoke-test.mjs path/to/deck.pptx  converts a PowerPoint file (needs `npm install`)
//
// The script pulls the `Core` module out of index.html, runs the same parse, plan and
// FCPXML steps the page runs, and prints a summary. Media rendering and the zip are
// browser-only and aren't exercised here.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const m = html.match(/<script data-d2f>\s*(\/\* -+ Deck to Final Cut Pro: core[\s\S]*?)<\/script>/);
if (!m) { console.error('Could not find the core script in index.html'); process.exit(1); }
const Core = new Function(m[1] + '\nreturn Core;')();

const settings = {
  frame: '1920x1080', fps: '29.97', fit: 'fit', durMode: 'fixed', durSec: 5, wpm: 150,
  layout: 'slide', split: false, bulletChars: true, imgMode: 'placed', bgMode: 'slide',
  notes: 'markers', chapters: true, skipHidden: true, masterText: true, mergeImages: true,
  mergeOver: 6, minSize: 32, textScale: 100, fontFallback: '', pathMode: 'relative', version: '1.10',
};

const input = process.argv[2] || join(root, 'examples', 'sourdough.md');
let doc;
if (/\.pptx$/i.test(input)) {
  let JSZip, DOMParser;
  try {
    JSZip = (await import('jszip')).default;
    ({ DOMParser } = await import('@xmldom/xmldom'));
  } catch {
    console.error('Testing a .pptx needs the dev dependencies. Run `npm install` first.');
    process.exit(1);
  }
  const parseXml = (s) => new DOMParser().parseFromString(s, 'application/xml');
  doc = await Core.parsePptx(readFileSync(input), JSZip, parseXml, basename(input));
} else {
  doc = Core.parseMarkdown(readFileSync(input, 'utf8'), new Map());
  doc.media = new Map();
}

const plan = Core.makePlan(doc, settings);
const files = new Map([...plan.reqs.keys()].map((k, i) => [k, { file: `media-${i}.png`, w: plan.W, h: plan.H }]));
const xml = Core.buildFcpxml(plan, files, settings);

const titles = plan.segments.reduce((n, s) => n + s.titles.length, 0);
const layers = plan.segments.reduce((n, s) => n + s.images.length, 0);
const todos = plan.segments.reduce((n, s) => n + s.markers.filter((x) => x.todo).length, 0);
console.log(`${basename(input)}: ${plan.segments.length} segments, ${(plan.totalFrames / plan.fpsVal).toFixed(1)} s, ${titles} titles, ${layers} image/shape layers, ${todos} to-do markers`);
console.log(`Fonts: ${Object.keys(plan.fonts).join(', ') || 'none'}`);
for (const s of plan.segments) console.log(`  ${s.name}`);

const tags = 'title|video|gap|spine|sequence|project|event|resources|fcpxml|text|text-style-def';
const opened = [...xml.matchAll(new RegExp(`<(${tags})(?=[\\s/>])([^>]*)>`, 'g'))].filter((t) => !t[2].endsWith('/')).length;
const closed = (xml.match(new RegExp(`</(${tags})>`, 'g')) || []).length;
if (!xml.startsWith('<?xml') || opened !== closed) { console.error(`FCPXML looks malformed (${opened} opened, ${closed} closed)`); process.exit(1); }
console.log(`FCPXML OK (${xml.length.toLocaleString()} characters)`);
