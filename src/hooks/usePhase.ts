import { useState, useCallback } from 'react';
import type { Phase } from '../types';

/**
 * Máquina de fases para la UI.
 * Controla qué acciones están permitidas en cada momento.
 */
export function usePhase(initial: Phase = 'loading') {
  const [phase, setPhase] = useState<Phase>(initial);

  const canSpin = phase === 'idle';
  const canUndo = phase === 'idle';
  const canReset = phase === 'idle';
  const canChangePattern = phase === 'idle';
  const isBlocked = phase === 'spinning' || phase === 'revealing' || phase === 'celebrating';

  const startSpin = useCallback(() => {
    setPhase('spinning');
  }, []);

  const reveal = useCallback(() => {
    setPhase('revealing');
  }, []);

  const celebrate = useCallback(() => {
    setPhase('celebrating');
  }, []);

  const goIdle = useCallback(() => {
    setPhase('idle');
  }, []);

  const startLoading = useCallback(() => {
    setPhase('loading');
  }, []);

  return {
    phase,
    canSpin,
    canUndo,
    canReset,
    canChangePattern,
    isBlocked,
    startSpin,
    reveal,
    celebrate,
    goIdle,
    startLoading,
  } as const;
}
