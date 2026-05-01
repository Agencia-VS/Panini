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
  const ballSvgSrc = `${import.meta.env.BASE_URL}pelota.svg`;
  const patternArtSrc = `${import.meta.env.BASE_URL}patron-base.svg`;

  const activeCells = useMemo(() => {
    const sets = patterns[pattern];
    return new Set(sets[0]);
  }, [pattern]);

  const totalCells = GRID_ROWS * GRID_COLS;

  return (
    <div className={`pattern-preview pattern-preview--${variant}`}>
      {variant === 'compact' && (
        <div className="pattern-preview__label">{PATTERN_NAMES[pattern]}</div>
      )}

      {variant === 'expanded' ? (
        <div className="pattern-preview__stage">
          <img className="pattern-preview__art" src={patternArtSrc} alt="" aria-hidden />
          <div
            className="pattern-preview__grid pattern-preview__grid--expanded"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              aspectRatio: `${GRID_COLS} / ${GRID_ROWS}`,
            }}
          >
            {Array.from({ length: totalCells }, (_, i) => {
              const isActive = activeCells.has(i);
              return (
                <div
                  key={i}
                  className={[
                    'pattern-preview__cell',
                    isActive ? 'pattern-preview__cell--active' : '',
                    isActive ? 'pattern-preview__cell--ball' : '',
                  ].filter(Boolean).join(' ')}
                  aria-hidden={!isActive}
                >
                  {isActive && (
                    <img
                      className="pattern-preview__ball-icon"
                      src={ballSvgSrc}
                      alt=""
                      aria-hidden
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="pattern-preview__grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            aspectRatio: `${GRID_COLS} / ${GRID_ROWS}`,
          }}
        >
          {Array.from({ length: totalCells }, (_, i) => {
            const isActive = activeCells.has(i);
            return (
              <div
                key={i}
                className={[
                  'pattern-preview__cell',
                  isActive ? 'pattern-preview__cell--active' : '',
                ].filter(Boolean).join(' ')}
                aria-hidden={!isActive}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
