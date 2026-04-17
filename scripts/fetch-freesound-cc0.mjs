#!/usr/bin/env node

/**
 * Download CC0 sound effects from Freesound and map them to game audio files.
 *
 * Usage:
 *   FREESOUND_API_KEY=xxx node scripts/fetch-freesound-cc0.mjs
 *   FREESOUND_API_KEY=xxx node scripts/fetch-freesound-cc0.mjs --dry-run
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API_BASE = 'https://freesound.org/apiv2';
const API_KEY = process.env.FREESOUND_API_KEY || process.env.FREESOUND_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');
const OUT_DIR = join(process.cwd(), 'public', 'audio');

const SOUND_TARGETS = [
  {
    fileName: 'background-ambient.mp3',
    queries: [
      'upbeat game music loop',
      'arcade background music loop',
      'casino style music loop',
      'energetic background beat loop',
    ],
    minDuration: 6,
    maxDuration: 120,
  },
  {
    fileName: 'spin-loop.mp3',
    queries: [
      'roulette wheel spin loop',
      'wheel spin loop',
      'spin whoosh loop',
      'slot machine spin',
    ],
    minDuration: 0.8,
    maxDuration: 12,
  },
  {
    fileName: 'reveal-hit.mp3',
    queries: [
      'impact hit reveal whoosh',
      'cinematic impact hit short',
      'ui reveal hit',
    ],
    minDuration: 0.1,
    maxDuration: 3,
  },
  {
    fileName: 'sticker-slap.mp3',
    queries: [
      'card slap paper sticker',
      'paper slap short',
      'card hit short',
      'ui pop click',
    ],
    minDuration: 0.05,
    maxDuration: 1.2,
  },
  {
    fileName: 'special-fanfare.mp3',
    queries: [
      'trumpet fanfare success short',
      'victory fanfare short',
      'win brass stinger',
    ],
    minDuration: 1,
    maxDuration: 7,
  },
  {
    fileName: 'bingo-win.mp3',
    queries: [
      'crowd cheer win stinger',
      'victory crowd cheer',
      'game win success',
      'winner fanfare',
    ],
    minDuration: 0.6,
    maxDuration: 10,
  },
  {
    fileName: 'countdown-tick.mp3',
    queries: [
      'countdown tick',
      'clock tick digital click',
      'metronome click short',
      'ui tick click',
    ],
    minDuration: 0.02,
    maxDuration: 0.8,
  },
  {
    fileName: 'undo-whoosh.mp3',
    queries: [
      'reverse whoosh short',
      'reverse swoosh short',
      'rewind whoosh',
    ],
    minDuration: 0.05,
    maxDuration: 3.5,
  },
];

function ensureApiKey() {
  if (!API_KEY) {
    console.error('Missing FREESOUND_API_KEY or FREESOUND_TOKEN environment variable.');
    process.exit(1);
  }
}

function scoreCandidate(sound, target) {
  const duration = Number(sound.duration || 0);
  const isBackgroundMusic = target.fileName === 'background-ambient.mp3';
  let score = 0;

  if (duration >= target.minDuration && duration <= target.maxDuration) {
    score += 100;
  } else {
    const dist = Math.min(
      Math.abs(duration - target.minDuration),
      Math.abs(duration - target.maxDuration),
    );
    score += Math.max(-160, 20 - dist * 30);
  }

  if (duration > target.maxDuration * 3) score -= 200;
  if (target.fileName.includes('tick') && duration > 1.2) score -= 120;
  if (target.fileName.includes('slap') && duration > 2) score -= 120;

  const name = String(sound.name || '').toLowerCase();
  if (name.includes('loop') && (target.fileName.includes('loop') || isBackgroundMusic)) score += 20;
  if (name.includes('short')) score += 8;
  if (isBackgroundMusic) {
    if (name.includes('upbeat') || name.includes('arcade') || name.includes('game')) score += 45;
    if (name.includes('beat') || name.includes('rhythm') || name.includes('dance')) score += 22;
    if (name.includes('music') || name.includes('loop')) score += 15;
    if (name.includes('calm') || name.includes('soft') || name.includes('sleep') || name.includes('pad')) score -= 60;
    if (duration < 5) score -= 80;
  } else if (name.includes('ambient') || name.includes('music')) {
    score -= 90;
  }

  return score;
}

async function searchCc0Sound(target, query) {
  const params = new URLSearchParams({
    token: API_KEY,
    query,
    filter: 'license:"Creative Commons 0"',
    sort: 'score',
    page_size: '50',
    fields: 'id,name,username,license,duration,url,previews',
  });

  const url = `${API_BASE}/search/text/?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Freesound search failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];

  const withPreview = results.filter((item) => {
    const previews = item.previews || {};
    return previews['preview-hq-mp3'] || previews['preview-lq-mp3'];
  });

  if (!withPreview.length) return null;

  const ranked = withPreview
    .map((sound) => ({ sound, score: scoreCandidate(sound, target) }))
    .sort((a, b) => b.score - a.score);

  return ranked[0].sound;
}

async function downloadFile(url, outPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file (${response.status}) from ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  writeFileSync(outPath, Buffer.from(arrayBuffer));
}

async function main() {
  ensureApiKey();
  mkdirSync(OUT_DIR, { recursive: true });

  const manifest = [];

  for (const target of SOUND_TARGETS) {
    process.stdout.write(`Searching ${target.fileName}... `);

    const queries = [...(target.queries || [])];
    let selected = null;
    let selectedQuery = '';
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const query of queries) {
      const candidate = await searchCc0Sound(target, query);
      if (!candidate) continue;

      const candidateScore = scoreCandidate(candidate, target);
      if (candidateScore > bestScore) {
        selected = candidate;
        selectedQuery = query;
        bestScore = candidateScore;
      }
    }

    if (!selected || bestScore < 25) {
      console.log('not found');
      manifest.push({
        fileName: target.fileName,
        triedQueries: queries,
        status: 'missing',
      });
      continue;
    }

    const previewUrl =
      selected.previews['preview-hq-mp3'] || selected.previews['preview-lq-mp3'];

    console.log(`found #${selected.id} ${selected.name}`);

    if (!DRY_RUN) {
      const outPath = join(OUT_DIR, target.fileName);
      await downloadFile(previewUrl, outPath);
    }

    manifest.push({
      fileName: target.fileName,
      query: selectedQuery,
      score: bestScore,
      triedQueries: queries,
      status: DRY_RUN ? 'selected-dry-run' : 'downloaded',
      source: {
        id: selected.id,
        name: selected.name,
        username: selected.username,
        license: selected.license,
        soundPage: selected.url,
        previewUrl,
        duration: selected.duration,
      },
    });
  }

  const manifestPath = join(OUT_DIR, 'freesound-manifest.json');
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun: DRY_RUN,
        source: 'freesound.org',
        licenseFilter: 'Creative Commons 0',
        items: manifest,
      },
      null,
      2,
    ),
  );

  console.log('Done.');
  console.log(`Manifest: ${manifestPath}`);
  if (DRY_RUN) {
    console.log('Dry run mode: no audio files were downloaded.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
