import { AnimatePresence, motion } from 'framer-motion';
import type { DrawnFlag } from '../../types';
import './RecapModal.css';

interface Props {
  history: DrawnFlag[];
  isOpen: boolean;
  onClose: () => void;
}

export default function RecapModal({ history, isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="recap-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="recap-panel"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="recap-panel__header">
              <h2 className="recap-panel__title">
                📋 Recuento — {history.length} bandera{history.length !== 1 ? 's' : ''}
              </h2>
              <button className="recap-panel__close" onClick={onClose}>✕</button>
            </div>

            {history.length === 0 ? (
              <p className="recap-panel__empty">No se han sorteado banderas aún.</p>
            ) : (
              <div className="recap-panel__grid">
                {history.map((flag) => (
                  <div key={flag.id} className="recap-card">
                    <span className="recap-card__number">#{flag.drawIndex + 1}</span>
                    <img
                      className="recap-card__img"
                      src={flag.imageSrc}
                      alt={flag.name}
                      loading="lazy"
                    />
                    <span className="recap-card__name">{flag.name}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
