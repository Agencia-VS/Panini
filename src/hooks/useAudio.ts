import { useRef, useCallback, useEffect } from 'react';
import { Howl } from 'howler';

/**
 * Mapa de sonidos del juego.
 * Cada sonido se instancia como Howl independiente para control granular.
 */
const SOUNDS = {
  spin: { src: '/audio/spin-loop.mp3', loop: true, volume: 0.6 },
  reveal: { src: '/audio/reveal-hit.mp3', volume: 0.8 },
  sticker: { src: '/audio/sticker-slap.mp3', volume: 0.5 },
  special: { src: '/audio/special-fanfare.mp3', volume: 0.9 },
  win: { src: '/audio/bingo-win.mp3', volume: 1.0 },
  countdown: { src: '/audio/countdown-tick.mp3', volume: 0.7 },
  undo: { src: '/audio/undo-whoosh.mp3', volume: 0.5 },
} as const;

type SoundName = keyof typeof SOUNDS;

export function useAudio(enabled = true) {
  const howlsRef = useRef<Map<SoundName, Howl>>(new Map());
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Inicializar sonidos una sola vez
  useEffect(() => {
    const map = howlsRef.current;
    for (const [name, config] of Object.entries(SOUNDS)) {
      if (!map.has(name as SoundName)) {
        map.set(
          name as SoundName,
          new Howl({
            src: [config.src],
            loop: 'loop' in config ? config.loop : false,
            volume: config.volume,
            preload: true,
          }),
        );
      }
    }

    return () => {
      map.forEach((howl) => howl.unload());
      map.clear();
    };
  }, []);

  const play = useCallback((name: SoundName) => {
    if (!enabledRef.current) return;
    const howl = howlsRef.current.get(name);
    if (howl) {
      howl.stop();
      howl.play();
    }
  }, []);

  const stop = useCallback((name: SoundName) => {
    const howl = howlsRef.current.get(name);
    if (howl) howl.stop();
  }, []);

  const stopAll = useCallback(() => {
    howlsRef.current.forEach((howl) => howl.stop());
  }, []);

  return { play, stop, stopAll };
}
