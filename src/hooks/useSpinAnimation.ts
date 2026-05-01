import { useRef, useCallback } from 'react';
import gsap from 'gsap';

interface SpinOptions {
  duration?: number;
  onComplete: () => void;
}

/**
 * Orquesta la animación GSAP del bolillero.
 * Usa ref externo para no competir con React por el DOM.
 *
 * Con MP4 animado, evitamos rotar el DOM para no duplicar movimiento.
 * GSAP se usa aquí únicamente como temporizador cancelable.
 */
export function useSpinAnimation() {
  const spinnerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const spin = useCallback(({ duration = 3, onComplete }: SpinOptions) => {
    const el = spinnerRef.current;
    if (!el) return;

    // Matar animación previa si existe
    timelineRef.current?.kill();

    const baseDuration = duration;

    const tl = gsap.timeline({
      onComplete: () => {
        timelineRef.current = null;
        onComplete();
      },
    });

    tl.to({}, { duration: baseDuration, ease: 'none' });

    timelineRef.current = tl;
  }, []);

  const kill = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
  }, []);

  return { spinnerRef, spin, kill };
}
