import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { DrawnFlag } from '../../types';
import { TOTAL_FLAGS } from '../../types';
import './RevealModal.css';

interface Props {
  flag: DrawnFlag | null;
  isOpen: boolean;
  onClose: () => void;
  totalDrawn: number;
}

export default function RevealModal({ flag, isOpen, onClose, totalDrawn }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Auto-cierre en 4s
  useEffect(() => {
    if (isOpen) {
      timerRef.current = setTimeout(onClose, 4000);
      return () => clearTimeout(timerRef.current);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && flag && (
        <motion.div
          className="reveal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={`reveal-card ${flag.isSpecial ? 'reveal-card--special' : ''}`}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reveal-card__group">Grupo {flag.group}</div>
            <img
              className="reveal-card__img"
              src={flag.imageSrc}
              alt={flag.name}
            />
            <div className="reveal-card__name">{flag.name}</div>
            <div className="reveal-card__number">#{totalDrawn} de {TOTAL_FLAGS}</div>
            <button className="reveal-card__close" onClick={onClose}>
              Continuar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
