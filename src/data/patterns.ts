import type { PatternType } from '../types';
import { TOTAL_FLAGS, GRID_COLS, GRID_ROWS } from '../types';

/**
 * Definición de patrones de victoria.
 *
 * Cada patrón define conjuntos de IDs de posición (índice 0-47 en el grid de 8×6).
 * Si TODOS los IDs de al menos un conjunto están en el historial → patrón cumplido.
 *
 * Grid visual (índices):
 *  0  1  2  3  4  5  6  7
 *  8  9 10 11 12 13 14 15
 * 16 17 18 19 20 21 22 23
 * 24 25 26 27 28 29 30 31
 * 32 33 34 35 36 37 38 39
 * 40 41 42 43 44 45 46 47
 */

// Filas (6 líneas horizontales)
const ROWS: number[][] = Array.from({ length: GRID_ROWS }, (_, row) =>
  Array.from({ length: GRID_COLS }, (_, col) => row * GRID_COLS + col),
);

// Columnas (8 líneas verticales)
const COLS: number[][] = Array.from({ length: GRID_COLS }, (_, col) =>
  Array.from({ length: GRID_ROWS }, (_, row) => row * GRID_COLS + col),
);

// Cuadro: bordes exteriores completos (fila 0, última fila, col 0, última col)
const lastRow = GRID_ROWS - 1;
const lastCol = GRID_COLS - 1;
const CUADRO: number[][] = [
  [
    ...ROWS[0],
    ...ROWS[lastRow],
    // Interiores de col 0 y última col (filas 1 a lastRow-1)
    ...Array.from({ length: lastRow - 1 }, (_, i) => (i + 1) * GRID_COLS),
    ...Array.from({ length: lastRow - 1 }, (_, i) => (i + 1) * GRID_COLS + lastCol),
  ],
];

// Bingo full: las 48 posiciones
const FULL: number[][] = [Array.from({ length: TOTAL_FLAGS }, (_, i) => i)];

// L: 4 orientaciones (esquinas)
// L normal: col 0 completa + última fila (esquina inferior izquierda)
// L rotada 90°: fila 0 completa + última col (esquina superior derecha)
// L rotada 180°: última col completa + fila 0 (esquina superior derecha → col + row)
// L rotada 270°: última fila + col 0 → ya es el normal. Mejor usar las 4 esquinas.
const ELE: number[][] = [
  // ⌐ Esquina inferior-izquierda: col 0 + última fila
  [...new Set([...COLS[0], ...ROWS[lastRow]])],
  // Esquina inferior-derecha: última col + última fila
  [...new Set([...COLS[lastCol], ...ROWS[lastRow]])],
  // Esquina superior-izquierda: col 0 + fila 0
  [...new Set([...COLS[0], ...ROWS[0]])],
  // Esquina superior-derecha: última col + fila 0
  [...new Set([...COLS[lastCol], ...ROWS[0]])],
];

export const patterns: Record<PatternType, number[][]> = {
  linea: ROWS,
  columna: COLS,
  ele: ELE,
  cuadro: CUADRO,
  bingo_full: FULL,
};
