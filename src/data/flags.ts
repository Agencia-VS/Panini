import { TOTAL_FLAGS } from '../types';
import type { Flag } from '../types';

/**
 * Set offline para juego express.
 * La matriz/cartón sigue en 4x3 (12 celdas).
 * El bombo de sorteo usa 20 banderas (pool fijo) en orden aleatorio.
 * imageSrc apunta a assets locales en /public/flags.
 */

const flagAsset = (code: string) => `${import.meta.env.BASE_URL}flags/${code}.webp`;

const FLAG_POOL: Flag[] = [
  { id: 'ARG', name: 'Argentina', group: 'A', imageSrc: flagAsset('ARG'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#74ACDF', '#FFFFFF'] },
  { id: 'BRA', name: 'Brasil', group: 'A', imageSrc: flagAsset('BRA'), isSpecial: true, specialEffect: 'fireworks', specialColors: ['#009739', '#FEDD00'] },
  { id: 'FRA', name: 'Francia', group: 'A', imageSrc: flagAsset('FRA'), isSpecial: true, specialEffect: 'golden' },
  { id: 'ESP', name: 'España', group: 'A', imageSrc: flagAsset('ESP') },

  { id: 'ENG', name: 'Inglaterra', group: 'B', imageSrc: flagAsset('ENG') },
  { id: 'GER', name: 'Alemania', group: 'B', imageSrc: flagAsset('GER') },
  { id: 'POR', name: 'Portugal', group: 'B', imageSrc: flagAsset('POR') },
  { id: 'MEX', name: 'México', group: 'B', imageSrc: flagAsset('MEX'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#006847', '#FFFFFF', '#CE1126'] },

  { id: 'NED', name: 'Países Bajos', group: 'C', imageSrc: flagAsset('NED') },
  { id: 'URU', name: 'Uruguay', group: 'C', imageSrc: flagAsset('URU') },
  { id: 'COL', name: 'Colombia', group: 'C', imageSrc: flagAsset('COL') },
  { id: 'MAR', name: 'Marruecos', group: 'C', imageSrc: flagAsset('MAR') },

  { id: 'JPN', name: 'Japón', group: 'D', imageSrc: flagAsset('JPN') },
  { id: 'USA', name: 'EE.UU.', group: 'D', imageSrc: flagAsset('USA'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#B31942', '#FFFFFF', '#0A3161'] },
  { id: 'CRO', name: 'Croacia', group: 'D', imageSrc: flagAsset('CRO') },
  { id: 'SEN', name: 'Senegal', group: 'D', imageSrc: flagAsset('SEN') },

  { id: 'KOR', name: 'Corea del Sur', group: 'E', imageSrc: flagAsset('KOR') },
  { id: 'ECU', name: 'Ecuador', group: 'E', imageSrc: flagAsset('ECU') },
  { id: 'CAN', name: 'Canadá', group: 'E', imageSrc: flagAsset('CAN'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#FF0000', '#FFFFFF'] },
  { id: 'SWE', name: 'Suecia', group: 'E', imageSrc: flagAsset('SWE') },
];

function shuffleFlags(flags: Flag[]): Flag[] {
  const copy = [...flags];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const allFlags: Flag[] = shuffleFlags(FLAG_POOL).slice(0, TOTAL_FLAGS);
