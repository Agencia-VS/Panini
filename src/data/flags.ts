import type { Flag } from '../types';

/**
 * 48 selecciones del Mundial 2026.
 * Ordenadas por grupo (A–L, 4 equipos cada uno).
 * imageSrc usa flagcdn.com CDN (w320 webp).
 */

const cdn = (iso: string) => `https://flagcdn.com/w320/${iso}.webp`;

export const allFlags: Flag[] = [
  // ── Grupo A ──
  { id: 'MEX', name: 'México', group: 'A', imageSrc: cdn('mx'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#006847', '#FFFFFF', '#CE1126'] },
  { id: 'RSA', name: 'Sudáfrica', group: 'A', imageSrc: cdn('za') },
  { id: 'KOR', name: 'Corea del Sur', group: 'A', imageSrc: cdn('kr') },
  { id: 'CZE', name: 'República Checa', group: 'A', imageSrc: cdn('cz') },

  // ── Grupo B ──
  { id: 'CAN', name: 'Canadá', group: 'B', imageSrc: cdn('ca'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#FF0000', '#FFFFFF'] },
  { id: 'BIH', name: 'Bosnia y Herzegovina', group: 'B', imageSrc: cdn('ba') },
  { id: 'QAT', name: 'Qatar', group: 'B', imageSrc: cdn('qa') },
  { id: 'SUI', name: 'Suiza', group: 'B', imageSrc: cdn('ch') },

  // ── Grupo C ──
  { id: 'BRA', name: 'Brasil', group: 'C', imageSrc: cdn('br'), isSpecial: true, specialEffect: 'fireworks', specialColors: ['#009739', '#FEDD00'] },
  { id: 'MAR', name: 'Marruecos', group: 'C', imageSrc: cdn('ma') },
  { id: 'HAI', name: 'Haití', group: 'C', imageSrc: cdn('ht') },
  { id: 'SCO', name: 'Escocia', group: 'C', imageSrc: cdn('gb-sct') },

  // ── Grupo D ──
  { id: 'USA', name: 'Estados Unidos', group: 'D', imageSrc: cdn('us'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#B31942', '#FFFFFF', '#0A3161'] },
  { id: 'PRY', name: 'Paraguay', group: 'D', imageSrc: cdn('py') },
  { id: 'AUS', name: 'Australia', group: 'D', imageSrc: cdn('au') },
  { id: 'TUR', name: 'Turquía', group: 'D', imageSrc: cdn('tr') },

  // ── Grupo E ──
  { id: 'GER', name: 'Alemania', group: 'E', imageSrc: cdn('de') },
  { id: 'CUW', name: 'Curazao', group: 'E', imageSrc: cdn('cw') },
  { id: 'CIV', name: 'Costa de Marfil', group: 'E', imageSrc: cdn('ci') },
  { id: 'ECU', name: 'Ecuador', group: 'E', imageSrc: cdn('ec') },

  // ── Grupo F ──
  { id: 'NED', name: 'Países Bajos', group: 'F', imageSrc: cdn('nl') },
  { id: 'JPN', name: 'Japón', group: 'F', imageSrc: cdn('jp') },
  { id: 'SWE', name: 'Suecia', group: 'F', imageSrc: cdn('se') },
  { id: 'TUN', name: 'Túnez', group: 'F', imageSrc: cdn('tn') },

  // ── Grupo G ──
  { id: 'BEL', name: 'Bélgica', group: 'G', imageSrc: cdn('be') },
  { id: 'EGY', name: 'Egipto', group: 'G', imageSrc: cdn('eg') },
  { id: 'IRN', name: 'Irán', group: 'G', imageSrc: cdn('ir') },
  { id: 'NZL', name: 'Nueva Zelanda', group: 'G', imageSrc: cdn('nz') },

  // ── Grupo H ──
  { id: 'ESP', name: 'España', group: 'H', imageSrc: cdn('es') },
  { id: 'CPV', name: 'Cabo Verde', group: 'H', imageSrc: cdn('cv') },
  { id: 'KSA', name: 'Arabia Saudita', group: 'H', imageSrc: cdn('sa') },
  { id: 'URU', name: 'Uruguay', group: 'H', imageSrc: cdn('uy') },

  // ── Grupo I ──
  { id: 'FRA', name: 'Francia', group: 'I', imageSrc: cdn('fr'), isSpecial: true, specialEffect: 'golden' },
  { id: 'SEN', name: 'Senegal', group: 'I', imageSrc: cdn('sn') },
  { id: 'IRQ', name: 'Irak', group: 'I', imageSrc: cdn('iq') },
  { id: 'NOR', name: 'Noruega', group: 'I', imageSrc: cdn('no') },

  // ── Grupo J ──
  { id: 'ARG', name: 'Argentina', group: 'J', imageSrc: cdn('ar'), isSpecial: true, specialEffect: 'confetti', specialColors: ['#74ACDF', '#FFFFFF'] },
  { id: 'ALG', name: 'Argelia', group: 'J', imageSrc: cdn('dz') },
  { id: 'AUT', name: 'Austria', group: 'J', imageSrc: cdn('at') },
  { id: 'JOR', name: 'Jordania', group: 'J', imageSrc: cdn('jo') },

  // ── Grupo K ──
  { id: 'POR', name: 'Portugal', group: 'K', imageSrc: cdn('pt') },
  { id: 'COD', name: 'RD Congo', group: 'K', imageSrc: cdn('cd') },
  { id: 'UZB', name: 'Uzbekistán', group: 'K', imageSrc: cdn('uz') },
  { id: 'COL', name: 'Colombia', group: 'K', imageSrc: cdn('co') },

  // ── Grupo L ──
  { id: 'ENG', name: 'Inglaterra', group: 'L', imageSrc: cdn('gb-eng') },
  { id: 'CRO', name: 'Croacia', group: 'L', imageSrc: cdn('hr') },
  { id: 'GHA', name: 'Ghana', group: 'L', imageSrc: cdn('gh') },
  { id: 'PAN', name: 'Panamá', group: 'L', imageSrc: cdn('pa') },
];
