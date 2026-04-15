import type { DrawnFlag, PatternType } from '../types';
import { allFlags } from '../data/flags';
import { patterns } from '../data/patterns';

/**
 * Comprueba si el historial de banderas cumple un patrón determinado.
 *
 * Convertimos las banderas del historial a sus índices en el array maestro
 * y verificamos si alguno de los conjuntos del patrón está completamente cubierto.
 */
export function checkPattern(
  history: DrawnFlag[],
  pattern: PatternType,
): boolean {
  const drawnIndices = new Set(
    history.map((flag) => allFlags.findIndex((f) => f.id === flag.id)),
  );

  const sets = patterns[pattern];
  return sets.some((set) => set.every((idx) => drawnIndices.has(idx)));
}
