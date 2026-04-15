import { useRef, useEffect } from 'react';
import type { DrawnFlag } from '../../types';
import './HistoryTicker.css';

interface Props {
  history: DrawnFlag[];
}

export default function HistoryTicker({ history }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando entra una nueva bandera
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [history.length]);

  return (
    <div className="history-ticker" ref={containerRef}>
      {history.length === 0 ? (
        <span className="history-ticker__empty">Sin banderas sorteadas aún</span>
      ) : (
        history.map((flag) => (
          <div key={flag.id} className="history-ticker__item">
            <span className="history-ticker__item-idx">#{flag.drawIndex + 1}</span>
            <img className="history-ticker__item-img" src={flag.imageSrc} alt={flag.name} />
            <span className="history-ticker__item-name">{flag.name}</span>
          </div>
        ))
      )}
    </div>
  );
}
