import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './Countdown.css';

interface Props {
  active: boolean;
  from?: number;
  onComplete: () => void;
  playTick?: () => void;
}

export default function Countdown({ active, from = 3, onComplete, playTick }: Props) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (!active) {
      const resetTimer = setTimeout(() => {
        setCount(from);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    playTick?.();

    if (count <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount((c) => c - 1);
      if (count - 1 > 0) playTick?.();
    }, 800);

    return () => clearTimeout(timer);
  }, [active, count, onComplete, playTick, from]);

  return (
    <AnimatePresence>
      {active && count > 0 && (
        <motion.div
          className="countdown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.span
            key={count}
            className="countdown__number"
            initial={{ scale: 2.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
          >
            {count}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
