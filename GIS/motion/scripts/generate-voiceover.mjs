import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {EdgeTTS} from 'node-edge-tts';

const outputDirectory = resolve('public/audio');
await mkdir(outputDirectory, {recursive: true});

const lines = [
  'Every day, water moves through thousands of connected assets. But utilities cannot manage what they cannot see.',
  'Records are fragmented. Conditions change. Leaks remain hidden. And treated water becomes non-revenue water.',
  'AquaWise brings every pipe, valve, pump, tank, and meter into one intelligent asset-management platform.',
  'Track condition, maintenance, pressure, and flow, from the entire network down to a single asset.',
  'Compare expected flow with what the network is reporting. Detect anomalies, locate risk, and see where water is disappearing.',
  'Run hydraulic simulations before making changes. Understand the impact, and prioritize the right intervention.',
  'So teams act sooner, infrastructure lasts longer, and utilities protect both water and revenue.',
  'AquaWise. Manage every asset. Understand every flow. Reduce non-revenue water.',
];

const tts = new EdgeTTS({
  voice: 'en-KE-AsiliaNeural',
  lang: 'en-KE',
  outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
  pitch: '-4%',
  rate: '-6%',
  volume: '+0%',
  timeout: 30000,
});

for (const [index, line] of lines.entries()) {
  const filename = `voiceover-${String(index + 1).padStart(2, '0')}.mp3`;
  await tts.ttsPromise(line, resolve(outputDirectory, filename));
  process.stdout.write(`Created ${filename}\n`);
}
