import type { DrawnFlag } from '../../types';
import './RecentFlags.css';

interface Props {
  history: DrawnFlag[];
  maxVisible?: number;
}

export default function RecentFlags({ history, maxVisible = 5 }: Props) {
  // Últimas N banderas, la más reciente primero
  const recent = history.slice(-maxVisible).reverse();

  if (recent.length === 0) {
    return (
      <div className="recent-flags">
        <div className="recent-flags__empty">
          Esperando primera bandera...
        </div>
      </div>
    );
  }

  return (
    <div className="recent-flags">
      <div className="recent-flags__title">Últimas banderas</div>
      <div className="recent-flags__list">
        {recent.map((flag, i) => (
          <div
            key={flag.id}
            className={`recent-flags__card ${i === 0 ? 'recent-flags__card--latest' : ''}`}
          >
            <span className="recent-flags__number">#{flag.drawIndex + 1}</span>
            <img
              className="recent-flags__img"
              src={flag.imageSrc}
              alt={flag.name}
            />
            <span className="recent-flags__name">{flag.name}</span>
            <span className="recent-flags__group">Grupo {flag.group}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
