import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {EdgeTTS} from 'node-edge-tts';

const outputDirectory = resolve('public/audio');
await mkdir(outputDirectory, {recursive: true});

const lines = [
  'Every utility loses water it cannot see, and the cost runs into millions.',
  'AquaWise turns your entire water network into one living, connected system.',
  'Manage every asset, every pipe, valve, pump, reservoir and meter, in one place.',
  'See it all live, from the whole network down to a single valve.',
  'The moment pressure drifts or a sensor flags, AquaWise alerts you first.',
  'Compare expected flow with reality, and pinpoint non-revenue water before it drains revenue.',
  'Then AquaWise AI recommends the fix, and proves it on the hydraulic model before a crew ever moves.',
  'AquaWise. Less water lost. More revenue kept. See it. Simulate it. Act.',
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
