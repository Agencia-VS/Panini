import { useRef, useCallback } from 'react';
import gsap from 'gsap';

interface SpinOptions {
  duration?: number;
  onComplete: () => void;
}

/**
 * Orquesta la animación GSAP del bolillero.
 * Usa ref externo para no competir con React por el DOM.
 */
export function useSpinAnimation() {
  const spinnerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const spin = useCallback(({ duration = 3, onComplete }: SpinOptions) => {
    const el = spinnerRef.current;
    if (!el) return;

    // Matar animación previa si existe
    timelineRef.current?.kill();

    const baseDuration = duration + (Math.random() - 0.5);

    const tl = gsap.timeline({
      onComplete: () => {
        timelineRef.current = null;
        onComplete();
      },
    });

    tl.to(el, {
      rotation: '+=1080',
      duration: baseDuration * 0.6,
      ease: 'power2.in',
    })
      .to(el, {
        rotation: '+=540',
        duration: baseDuration * 0.3,
        ease: 'power3.out',
      })
      .to(el, {
        rotation: '+=90',
        duration: baseDuration * 0.1,
        ease: 'power4.out',
      })
      .to(el, {
        scale: 1.08,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: 'back.out(2)',
      });

    timelineRef.current = tl;
  }, []);

  const kill = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
  }, []);

  return { spinnerRef, spin, kill };
}
