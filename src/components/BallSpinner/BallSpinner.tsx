import { useEffect, useRef, type RefObject } from 'react';
import './BallSpinner.css';

interface Props {
  spinnerRef: RefObject<HTMLDivElement | null>;
  onSpin: () => void;
  disabled: boolean;
  remaining: number;
  isSpinning: boolean;
}

export default function BallSpinner({
  spinnerRef,
  onSpin,
  disabled,
  remaining,
  isSpinning,
}: Props) {
  const base = import.meta.env.BASE_URL;
  const animatedVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const animated = animatedVideoRef.current;
    if (!animated) return;

    // Warm-up del decoder para reducir flashes al primer play real.
    const warmup = async () => {
      try {
        await animated.play();
        animated.pause();
        animated.currentTime = 0;
      } catch {
        // Si el navegador bloquea warmup, seguimos con flujo normal.
      }
    };

    void warmup();
  }, []);

  useEffect(() => {
    const animated = animatedVideoRef.current;
    if (!animated) return;

    if (isSpinning) {
      animated.currentTime = 0;
      const playPromise = animated.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Algunos navegadores pueden bloquear reproducción temporalmente.
        });
      }
      return;
    }

    animated.pause();
    animated.currentTime = 0;
  }, [isSpinning]);

  return (
    <div className="ball-spinner">
      <div ref={spinnerRef} className="ball-spinner__globe">
        <video
          className="ball-spinner__video ball-spinner__video--static"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={`${base}visual/mp4/rueda-alt.mp4`} type="video/mp4" />
        </video>

        <video
          ref={animatedVideoRef}
          className={`ball-spinner__video ball-spinner__video--animated ${isSpinning ? 'is-active' : ''}`}
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={`${base}visual/mp4/rueda.mp4`} type="video/mp4" />
        </video>
      </div>
      <button
        className="ball-spinner__button"
        onClick={onSpin}
        disabled={disabled || remaining === 0}
      >
        {remaining === 0 ? 'Terminado' : 'Girar'}
      </button>
    </div>
  );
}
