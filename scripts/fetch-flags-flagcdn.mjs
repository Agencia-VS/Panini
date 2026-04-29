#!/usr/bin/env node

/**
 * Descarga banderas reales en .webp desde FlagCDN y las guarda en public/flags.
 * Uso:
 *   node scripts/fetch-flags-flagcdn.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = join(process.cwd(), 'public', 'flags');
const WIDTH = 320;
const BASE_URL = `https://flagcdn.com/w${WIDTH}`;

// Mapeo ID interno -> código compatible con FlagCDN
const FLAG_MAP = {
  ALG: 'dz',
  ANG: 'ao',
  ARG: 'ar',
  AUS: 'au',
  BEL: 'be',
  BOL: 'bo',
  BRA: 'br',
  CAN: 'ca',
  CHL: 'cl',
  CMR: 'cm',
  COL: 'co',
  CRC: 'cr',
  CRO: 'hr',
  DEN: 'dk',
  ECU: 'ec',
  EGY: 'eg',
  ENG: 'gb-eng',
  ESP: 'es',
  FRA: 'fr',
  GER: 'de',
  GHA: 'gh',
  HON: 'hn',
  IRN: 'ir',
  ITA: 'it',
  JAM: 'jm',
  JPN: 'jp',
  KOR: 'kr',
  KSA: 'sa',
  MAR: 'ma',
  MEX: 'mx',
  NED: 'nl',
  NGA: 'ng',
  NZL: 'nz',
  PAN: 'pa',
  PER: 'pe',
  POL: 'pl',
  POR: 'pt',
  PRY: 'py',
  QAT: 'qa',
  SEN: 'sn',
  SRB: 'rs',
  SUI: 'ch',
  TUN: 'tn',
  UKR: 'ua',
  URU: 'uy',
  USA: 'us',
  VEN: 've',
  WAL: 'gb-wls',
};

async function downloadFlag(id, code) {
  const url = `${BASE_URL}/${code}.webp`;
  const outPath = join(OUT_DIR, `${id}.webp`);

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`FlagCDN failed for ${id} (${code}) [${response.status}]: ${body.slice(0, 120)}`);
  }

  const bytes = await response.arrayBuffer();
  writeFileSync(outPath, Buffer.from(bytes));
  return url;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const ids = Object.keys(FLAG_MAP).sort();
  let ok = 0;
  const failed = [];

  for (const id of ids) {
    const code = FLAG_MAP[id];
    process.stdout.write(`Downloading ${id} (${code})... `);
    try {
      await downloadFlag(id, code);
      ok += 1;
      console.log('ok');
    } catch (error) {
      failed.push({ id, code, error: error instanceof Error ? error.message : String(error) });
      console.log('failed');
    }
  }

  console.log(`\nDone. Downloaded ${ok}/${ids.length} flags into public/flags.`);

  if (failed.length) {
    console.log('\nFailed entries:');
    for (const item of failed) {
      console.log(`- ${item.id} (${item.code}): ${item.error}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
