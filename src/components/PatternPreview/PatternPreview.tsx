import { useMemo } from 'react';
import type { PatternType } from '../../types';
import { GRID_COLS, GRID_ROWS } from '../../types';
import { patterns } from '../../data/patterns';
import './PatternPreview.css';

const PATTERN_NAMES: Record<PatternType, string> = {
  linea: 'Línea',
  columna: 'Columna',
  ele: 'L',
  cuadro: 'Cuadro',
  bingo_full: 'Bingo Full',
};

interface Props {
  pattern: PatternType;
  variant?: 'compact' | 'expanded';
}

export default function PatternPreview({ pattern, variant = 'compact' }: Props) {
  // Tomar el primer conjunto del patrón como ejemplo visual
  const activeCells = useMemo(() => {
    const sets = patterns[pattern];
    return new Set(sets[0]);
  }, [pattern]);

  const totalCells = GRID_ROWS * GRID_COLS;

  return (
    <div className={`pattern-preview pattern-preview--${variant}`}>
      <div className="pattern-preview__label">{PATTERN_NAMES[pattern]}</div>
      <div
        className="pattern-preview__grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          aspectRatio: `${GRID_COLS} / ${GRID_ROWS}`,
        }}
      >
        {Array.from({ length: totalCells }, (_, i) => (
          <div
            key={i}
            className={`pattern-preview__cell ${activeCells.has(i) ? 'pattern-preview__cell--active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
