import { useRef, useCallback, useEffect } from 'react';
import { Howl, Howler } from 'howler';

const AUDIO_VERSION = '2026-04-17-2';
const audioPath = (fileName: string) => `${import.meta.env.BASE_URL}audio/${fileName}?v=${AUDIO_VERSION}`;

/**
 * Mapa de sonidos del juego.
 * Cada sonido se instancia como Howl independiente para control granular.
 */
const SOUNDS = {
  bgm: { src: audioPath('background-ambient.mp3'), loop: true, volume: 0.24 },
  spin: { src: audioPath('spin-loop.mp3'), loop: true, volume: 0.6 },
  reveal: { src: audioPath('reveal-hit.mp3'), volume: 0.8 },
  sticker: { src: audioPath('sticker-slap.mp3'), volume: 0.5 },
  special: { src: audioPath('special-fanfare.mp3'), volume: 0.9 },
  win: { src: audioPath('bingo-win.mp3'), volume: 1.0 },
  countdown: { src: audioPath('countdown-tick.mp3'), volume: 0.7 },
  undo: { src: audioPath('undo-whoosh.mp3'), volume: 0.5 },
} as const;

type SoundName = keyof typeof SOUNDS;

export function useAudio(enabled = true) {
  const howlsRef = useRef<Map<SoundName, Howl>>(new Map());
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const ensureBackgroundMusic = useCallback(() => {
    if (!enabledRef.current) return;
    const bgm = howlsRef.current.get('bgm');
    if (bgm && !bgm.playing()) {
      bgm.play();
    }
  }, []);

  // Inicializar sonidos una sola vez
  useEffect(() => {
    const map = howlsRef.current;

    const unlockAudio = () => {
      if (Howler.ctx?.state !== 'running') {
        void Howler.ctx?.resume();
      }
      Howler.mute(false);
      ensureBackgroundMusic();
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    for (const [name, config] of Object.entries(SOUNDS)) {
      if (!map.has(name as SoundName)) {
        let howl: Howl;

        howl = new Howl({
          src: [config.src],
          loop: 'loop' in config ? config.loop : false,
          volume: config.volume,
          preload: true,
          onloaderror: (_id, error) => {
            console.warn(`[Audio] Error cargando ${name} (${config.src})`, error);
          },
          onplayerror: (_id, error) => {
            console.warn(`[Audio] Error reproduciendo ${name}`, error);
            howl.once('unlock', () => {
              if (enabledRef.current) {
                howl.play();
              }
            });
          },
        });

        map.set(
          name as SoundName,
          howl,
        );
      }
    }

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      map.forEach((howl) => howl.unload());
      map.clear();
    };
  }, [ensureBackgroundMusic]);

  // Sincronizar música de fondo con el toggle general de audio
  useEffect(() => {
    const bgm = howlsRef.current.get('bgm');
    if (!bgm) return;

    if (enabled) {
      if (Howler.ctx?.state !== 'running') {
        void Howler.ctx?.resume().then(() => ensureBackgroundMusic()).catch(() => {});
      } else {
        ensureBackgroundMusic();
      }
    } else {
      bgm.stop();
    }
  }, [enabled, ensureBackgroundMusic]);

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
    howlsRef.current.forEach((howl, name) => {
      if (name !== 'bgm') {
        howl.stop();
      }
    });
  }, []);

  return { play, stop, stopAll };
}
