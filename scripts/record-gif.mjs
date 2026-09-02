#!/usr/bin/env node
/**
 * Records the README GIF by scrolling the demo in a real browser.
 *
 * A motion library with no moving image in its README is a hard sell, and this
 * is one thing that genuinely can't be shown in a code block.
 *
 * Playwright screenshots each frame and gifenc encodes them. Playwright does
 * bundle an ffmpeg, but it's a stripped webm-only build with no GIF muxer and no
 * palette filters, so the encoding happens here.
 *
 *   npm run demo &
 *   node scripts/record-gif.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from '@playwright/test';
// Both are CommonJS and Node's named-export detection doesn't see through
// either, so they arrive as defaults.
import gifenc from 'gifenc';
import pngjs from 'pngjs';

const { GIFEncoder, applyPalette, quantize } = gifenc;
const { PNG } = pngjs;

const URL = process.env.DEMO_URL ?? 'http://localhost:4319';
const OUT = 'docs/demo.gif';
const WIDTH = 880;
const HEIGHT = 620;

const frames = [];

async function shoot(page, delay = 70) {
  const png = PNG.sync.read(await page.screenshot({ type: 'png' }));
  frames.push({ data: new Uint8Array(png.data), delay });
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

await shoot(page, 700);

/**
 * Smooth scrolling rather than jumps, because the whole point is what happens
 * *during* the scroll. Frames are captured between steps, not after.
 */
const total = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
const step = Math.max(40, Math.round(total / 40));

for (let y = 0; y < total; y += step) {
  await page.evaluate((to) => window.scrollTo(0, to), y);
  // Give the reveal a moment to actually play. Screenshotting straight after
  // the scroll catches every element at frame zero of its own animation, which
  // produces a GIF of a library that appears to do nothing.
  await page.waitForTimeout(90);
  await shoot(page, 110);
}

await page.evaluate((to) => window.scrollTo(0, to), total);
await shoot(page, 1200);

await browser.close();

// One palette across every frame; quantising each on its own makes the colours
// crawl, which on a page that is mostly gentle gradients looks like banding.
const sample = frames.filter((_, i) => i % 2 === 0);
const merged = new Uint8Array(sample.reduce((n, f) => n + f.data.length, 0));
let at = 0;
for (const frame of sample) {
  merged.set(frame.data, at);
  at += frame.data.length;
}

const palette = quantize(merged, 256, { format: 'rgb565' });
const encoder = GIFEncoder();

for (const frame of frames) {
  encoder.writeFrame(applyPalette(frame.data, palette, 'rgb565'), WIDTH, HEIGHT, {
    palette,
    delay: frame.delay,
  });
}

encoder.finish();
mkdirSync(dirname(OUT), { recursive: true });
const bytes = encoder.bytes();
writeFileSync(OUT, bytes);

const seconds = frames.reduce((n, f) => n + f.delay, 0) / 1000;
console.log(`${OUT}: ${frames.length} frames, ${seconds.toFixed(1)}s, ${(bytes.length / 1e6).toFixed(2)} MB`);
