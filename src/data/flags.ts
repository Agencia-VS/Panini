import type { Flag } from '../types';

/**
 * Set corto offline para juego express.
 * 16 selecciones en matriz 4x4.
 * imageSrc apunta a assets locales en /public/flags.
 */

const flagAsset = (code: string) => `${import.meta.env.BASE_URL}flags/${code}.webp`;

export const allFlags: Flag[] = [
  // ── Grupo A ──
  { id: 'MEX', name: 'México', group: 'A', imageSrc: flagAsset('MEX'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#006847', '#FFFFFF', '#CE1126'] },
  { id: 'USA', name: 'Estados Unidos', group: 'A', imageSrc: flagAsset('USA'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#B31942', '#FFFFFF', '#0A3161'] },
  { id: 'CAN', name: 'Canadá', group: 'A', imageSrc: flagAsset('CAN'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#FF0000', '#FFFFFF'] },
  { id: 'BRA', name: 'Brasil', group: 'A', imageSrc: flagAsset('BRA'), isSpecial: true, specialEffect: 'fireworks', specialColors: ['#009739', '#FEDD00'] },

  // ── Grupo B ──
  { id: 'ARG', name: 'Argentina', group: 'B', imageSrc: flagAsset('ARG'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#74ACDF', '#FFFFFF'] },
  { id: 'FRA', name: 'Francia', group: 'B', imageSrc: flagAsset('FRA'), isSpecial: true, specialEffect: 'golden' },
  { id: 'GER', name: 'Alemania', group: 'B', imageSrc: flagAsset('GER') },
  { id: 'ENG', name: 'Inglaterra', group: 'B', imageSrc: flagAsset('ENG') },

  // ── Grupo C ──
  { id: 'ESP', name: 'España', group: 'C', imageSrc: flagAsset('ESP') },
  { id: 'POR', name: 'Portugal', group: 'C', imageSrc: flagAsset('POR') },
  { id: 'NED', name: 'Países Bajos', group: 'C', imageSrc: flagAsset('NED') },
  { id: 'BEL', name: 'Bélgica', group: 'C', imageSrc: flagAsset('BEL') },

  // ── Grupo D ──
  { id: 'JPN', name: 'Japón', group: 'D', imageSrc: flagAsset('JPN') },
  { id: 'KOR', name: 'Corea del Sur', group: 'D', imageSrc: flagAsset('KOR') },
  { id: 'CRO', name: 'Croacia', group: 'D', imageSrc: flagAsset('CRO') },
  { id: 'COL', name: 'Colombia', group: 'D', imageSrc: flagAsset('COL') },
];
