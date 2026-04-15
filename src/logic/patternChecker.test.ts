import { describe, it, expect } from 'vitest';
import type { DrawnFlag } from '../types';
import { allFlags } from '../data/flags';
import { checkPattern } from './patternChecker';

/** Helper: crea DrawnFlags a partir de índices del array maestro */
function drawByIndices(indices: number[]): DrawnFlag[] {
  return indices.map((idx, i) => ({
    ...allFlags[idx],
    drawnAt: Date.now(),
    drawIndex: i,
  }));
}

describe('patternChecker', () => {
  describe('linea (fila completa)', () => {
    it('detecta la primera fila completa (índices 0-7)', () => {
      const history = drawByIndices([0, 1, 2, 3, 4, 5, 6, 7]);
      expect(checkPattern(history, 'linea')).toBe(true);
    });

    it('detecta la quinta fila completa (índices 32-39)', () => {
      const history = drawByIndices([32, 33, 34, 35, 36, 37, 38, 39]);
      expect(checkPattern(history, 'linea')).toBe(true);
    });

    it('no detecta fila incompleta', () => {
      const history = drawByIndices([0, 1, 2, 3, 4, 5, 6]); // Falta el 7
      expect(checkPattern(history, 'linea')).toBe(false);
    });
  });

  describe('columna', () => {
    it('detecta primera columna completa (0, 8, 16, 24, 32, 40)', () => {
      const history = drawByIndices([0, 8, 16, 24, 32, 40]);
      expect(checkPattern(history, 'columna')).toBe(true);
    });

    it('no detecta columna incompleta', () => {
      const history = drawByIndices([0, 8, 16, 24, 32]); // Falta el 40
      expect(checkPattern(history, 'columna')).toBe(false);
    });
  });

  describe('cuadro (bordes)', () => {
    it('detecta cuadro completo', () => {
      // Fila 0 + Fila 5 + interiores col 0 y col 7 (filas 1-4)
      const indices = [
        0, 1, 2, 3, 4, 5, 6, 7,         // Fila 0
        40, 41, 42, 43, 44, 45, 46, 47,  // Fila 5
        8, 16, 24, 32,                    // Col 0 interior
        15, 23, 31, 39,                   // Col 7 interior
      ];
      const history = drawByIndices(indices);
      expect(checkPattern(history, 'cuadro')).toBe(true);
    });

    it('no detecta cuadro incompleto', () => {
      const indices = [0, 1, 2, 3, 4, 5, 6, 7, 40, 41]; // Muy incompleto
      const history = drawByIndices(indices);
      expect(checkPattern(history, 'cuadro')).toBe(false);
    });
  });

  describe('bingo_full', () => {
    it('detecta las 48 banderas', () => {
      const history = drawByIndices(Array.from({ length: 48 }, (_, i) => i));
      expect(checkPattern(history, 'bingo_full')).toBe(true);
    });

    it('no detecta con 47 banderas', () => {
      const history = drawByIndices(Array.from({ length: 47 }, (_, i) => i));
      expect(checkPattern(history, 'bingo_full')).toBe(false);
    });
  });

  describe('con banderas extras (no afectan)', () => {
    it('detecta patrón aunque haya banderas adicionales', () => {
      // Primera fila + algunas extras
      const history = drawByIndices([0, 1, 2, 3, 4, 5, 6, 7, 10, 20, 30]);
      expect(checkPattern(history, 'linea')).toBe(true);
    });
  });

  describe('ele (L)', () => {
    it('detecta L inferior-izquierda: col 0 + última fila', () => {
      // Col 0: 0,8,16,24,32,40 + Última fila: 40,41,42,43,44,45,46,47
      const indices = [...new Set([0, 8, 16, 24, 32, 40, 41, 42, 43, 44, 45, 46, 47])];
      const history = drawByIndices(indices);
      expect(checkPattern(history, 'ele')).toBe(true);
    });

    it('detecta L superior-derecha: última col + fila 0', () => {
      // Última col: 7,15,23,31,39,47 + Fila 0: 0,1,2,3,4,5,6,7
      const indices = [...new Set([7, 15, 23, 31, 39, 47, 0, 1, 2, 3, 4, 5, 6])];
      const history = drawByIndices(indices);
      expect(checkPattern(history, 'ele')).toBe(true);
    });

    it('no detecta L incompleta', () => {
      // Solo col 0 sin la fila
      const history = drawByIndices([0, 8, 16, 24, 32, 40]);
      expect(checkPattern(history, 'ele')).toBe(false);
    });
  });
});
