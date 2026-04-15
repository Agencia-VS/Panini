/**
 * Script para generar placeholder SVG de banderas.
 * Ejecutar: node scripts/generate-flag-placeholders.mjs
 * Reemplazar después con imágenes reales (.webp).
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const flags = [
  { id: 'USA', name: 'USA', colors: ['#B31942', '#0A3161'] },
  { id: 'MEX', name: 'MEX', colors: ['#006847', '#CE1126'] },
  { id: 'CAN', name: 'CAN', colors: ['#FF0000', '#FFFFFF'] },
  { id: 'SEN', name: 'SEN', colors: ['#00853F', '#FDEF42'] },
  { id: 'ARG', name: 'ARG', colors: ['#74ACDF', '#FFFFFF'] },
  { id: 'AUS', name: 'AUS', colors: ['#00008B', '#FFFFFF'] },
  { id: 'NGA', name: 'NGA', colors: ['#008751', '#FFFFFF'] },
  { id: 'BOL', name: 'BOL', colors: ['#D52B1E', '#F9E300'] },
  { id: 'FRA', name: 'FRA', colors: ['#002395', '#EF4135'] },
  { id: 'COL', name: 'COL', colors: ['#FCD116', '#003893'] },
  { id: 'PAN', name: 'PAN', colors: ['#005293', '#D21034'] },
  { id: 'NZL', name: 'NZL', colors: ['#00247D', '#CC142B'] },
  { id: 'BRA', name: 'BRA', colors: ['#009739', '#FEDD00'] },
  { id: 'ITA', name: 'ITA', colors: ['#008C45', '#CD212A'] },
  { id: 'ECU', name: 'ECU', colors: ['#FFD100', '#034EA2'] },
  { id: 'TUN', name: 'TUN', colors: ['#E70013', '#FFFFFF'] },
  { id: 'GER', name: 'GER', colors: ['#000000', '#DD0000'] },
  { id: 'JPN', name: 'JPN', colors: ['#FFFFFF', '#BC002D'] },
  { id: 'CRC', name: 'CRC', colors: ['#002B7F', '#CE1126'] },
  { id: 'ANG', name: 'ANG', colors: ['#CC0000', '#000000'] },
  { id: 'ESP', name: 'ESP', colors: ['#AA151B', '#F1BF00'] },
  { id: 'NED', name: 'NED', colors: ['#AE1C28', '#21468B'] },
  { id: 'PRY', name: 'PRY', colors: ['#D52B1E', '#0038A8'] },
  { id: 'IRN', name: 'IRN', colors: ['#239F40', '#DA0000'] },
  { id: 'ENG', name: 'ENG', colors: ['#FFFFFF', '#CE1124'] },
  { id: 'POR', name: 'POR', colors: ['#006600', '#FF0000'] },
  { id: 'URU', name: 'URU', colors: ['#001489', '#FFFFFF'] },
  { id: 'KOR', name: 'KOR', colors: ['#FFFFFF', '#CD2E3A'] },
  { id: 'BEL', name: 'BEL', colors: ['#000000', '#FDDA24'] },
  { id: 'POL', name: 'POL', colors: ['#FFFFFF', '#DC143C'] },
  { id: 'MAR', name: 'MAR', colors: ['#C1272D', '#006233'] },
  { id: 'PER', name: 'PER', colors: ['#D91023', '#FFFFFF'] },
  { id: 'CRO', name: 'CRO', colors: ['#FF0000', '#171796'] },
  { id: 'DEN', name: 'DEN', colors: ['#C60C30', '#FFFFFF'] },
  { id: 'CHL', name: 'CHL', colors: ['#D52B1E', '#0039A6'] },
  { id: 'CMR', name: 'CMR', colors: ['#007A5E', '#CE1126'] },
  { id: 'SUI', name: 'SUI', colors: ['#DA291C', '#FFFFFF'] },
  { id: 'SRB', name: 'SRB', colors: ['#C6363C', '#0C4076'] },
  { id: 'GHA', name: 'GHA', colors: ['#006B3F', '#FCD116'] },
  { id: 'JAM', name: 'JAM', colors: ['#009B3A', '#FED100'] },
  { id: 'QAT', name: 'QAT', colors: ['#8D1B3D', '#FFFFFF'] },
  { id: 'KSA', name: 'KSA', colors: ['#006C35', '#FFFFFF'] },
  { id: 'WAL', name: 'WAL', colors: ['#C8102E', '#00B140'] },
  { id: 'VEN', name: 'VEN', colors: ['#FFCC00', '#00247D'] },
  { id: 'UKR', name: 'UKR', colors: ['#005BBB', '#FFD500'] },
  { id: 'EGY', name: 'EGY', colors: ['#CE1126', '#000000'] },
  { id: 'HON', name: 'HON', colors: ['#0073CF', '#FFFFFF'] },
  { id: 'ALG', name: 'ALG', colors: ['#006633', '#FFFFFF'] },
];

const outDir = join(process.cwd(), 'public', 'flags');
mkdirSync(outDir, { recursive: true });

for (const flag of flags) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
  <rect width="60" height="80" fill="${flag.colors[0]}"/>
  <rect x="60" width="60" height="80" fill="${flag.colors[1]}"/>
  <text x="60" y="48" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="#fff" stroke="#000" stroke-width="0.5">${flag.name}</text>
</svg>`;

  // Guardamos como .webp extension pero es SVG content — funciona en <img> para dev
  // En producción se reemplazan con .webp reales
  writeFileSync(join(outDir, `${flag.id}.webp`), svg);
}

console.log(`✓ ${flags.length} placeholder flags generados en public/flags/`);
