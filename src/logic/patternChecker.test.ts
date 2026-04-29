import { describe, it, expect } from 'vitest';
import type { DrawnFlag } from '../types';
import { allFlags } from '../data/flags';
import { checkPattern } from './patternChecker';
import { GRID_COLS, GRID_ROWS, TOTAL_FLAGS } from '../types';

/** Helper: crea DrawnFlags a partir de índices del array maestro */
function drawByIndices(indices: number[]): DrawnFlag[] {
  return indices.map((idx, i) => ({
    ...allFlags[idx],
    drawnAt: Date.now(),
    drawIndex: i,
  }));
}

const firstRow = Array.from({ length: GRID_COLS }, (_, i) => i);
const lastRowStart = (GRID_ROWS - 1) * GRID_COLS;
const lastRow = Array.from({ length: GRID_COLS }, (_, i) => lastRowStart + i);
const firstCol = Array.from({ length: GRID_ROWS }, (_, row) => row * GRID_COLS);
const lastColIndex = GRID_COLS - 1;
const lastCol = Array.from({ length: GRID_ROWS }, (_, row) => row * GRID_COLS + lastColIndex);

const cuadroIndices = [
  ...firstRow,
  ...lastRow,
  ...Array.from({ length: Math.max(0, GRID_ROWS - 2) }, (_, i) => (i + 1) * GRID_COLS),
  ...Array.from({ length: Math.max(0, GRID_ROWS - 2) }, (_, i) => (i + 1) * GRID_COLS + lastColIndex),
];

describe('patternChecker', () => {
  describe('linea (fila completa)', () => {
    it('detecta la primera fila completa', () => {
      const history = drawByIndices(firstRow);
      expect(checkPattern(history, 'linea')).toBe(true);
    });

    it('detecta la última fila completa', () => {
      const history = drawByIndices(lastRow);
      expect(checkPattern(history, 'linea')).toBe(true);
    });

    it('no detecta fila incompleta', () => {
      const history = drawByIndices(firstRow.slice(0, -1));
      expect(checkPattern(history, 'linea')).toBe(false);
    });
  });

  describe('columna', () => {
    it('detecta primera columna completa', () => {
      const history = drawByIndices(firstCol);
      expect(checkPattern(history, 'columna')).toBe(true);
    });

    it('no detecta columna incompleta', () => {
      const history = drawByIndices(firstCol.slice(0, -1));
      expect(checkPattern(history, 'columna')).toBe(false);
    });
  });

  describe('cuadro (bordes)', () => {
    it('detecta cuadro completo', () => {
      const history = drawByIndices(cuadroIndices);
      expect(checkPattern(history, 'cuadro')).toBe(true);
    });

    it('no detecta cuadro incompleto', () => {
      const history = drawByIndices(cuadroIndices.slice(0, Math.max(1, cuadroIndices.length - 2)));
      expect(checkPattern(history, 'cuadro')).toBe(false);
    });
  });

  describe('bingo_full', () => {
    it('detecta todas las banderas', () => {
      const history = drawByIndices(Array.from({ length: TOTAL_FLAGS }, (_, i) => i));
      expect(checkPattern(history, 'bingo_full')).toBe(true);
    });

    it('no detecta con una bandera faltante', () => {
      const history = drawByIndices(Array.from({ length: TOTAL_FLAGS - 1 }, (_, i) => i));
      expect(checkPattern(history, 'bingo_full')).toBe(false);
    });
  });

  describe('con banderas extras (no afectan)', () => {
    it('detecta patrón aunque haya banderas adicionales', () => {
      const extras = Array.from({ length: Math.min(2, TOTAL_FLAGS - firstRow.length) }, (_, i) => firstRow.length + i);
      const history = drawByIndices([...firstRow, ...extras]);
      expect(checkPattern(history, 'linea')).toBe(true);
    });
  });

  describe('ele (L)', () => {
    it('detecta L inferior-izquierda: col 0 + última fila', () => {
      const indices = [...new Set([...firstCol, ...lastRow])];
      const history = drawByIndices(indices);
      expect(checkPattern(history, 'ele')).toBe(true);
    });

    it('detecta L superior-derecha: última col + fila 0', () => {
      const indices = [...new Set([...lastCol, ...firstRow])];
      const history = drawByIndices(indices);
      expect(checkPattern(history, 'ele')).toBe(true);
    });

    it('no detecta L incompleta', () => {
      const history = drawByIndices(firstCol);
      expect(checkPattern(history, 'ele')).toBe(false);
    });
  });
});
