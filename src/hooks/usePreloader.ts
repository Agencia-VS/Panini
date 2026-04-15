import { useState, useEffect, useCallback } from 'react';
import { allFlags } from '../data/flags';

interface PreloadState {
  progress: number;       // 0 a 1
  loaded: number;
  failed: string[];       // IDs que fallaron
  isReady: boolean;
}

/**
 * Precarga todas las imágenes de banderas.
 * Usa Image.decode() cuando está disponible para decodificar fuera del hilo principal.
 * Promise.allSettled garantiza que 1 fallo no bloquea las demás.
 */
export function usePreloader() {
  const [state, setState] = useState<PreloadState>({
    progress: 0,
    loaded: 0,
    failed: [],
    isReady: false,
  });

  const preload = useCallback(async () => {
    const total = allFlags.length;
    let loaded = 0;
    const failed: string[] = [];

    const promises = allFlags.map(async (flag) => {
      try {
        const img = new Image();
        img.src = flag.imageSrc;

        if (typeof img.decode === 'function') {
          await img.decode();
        } else {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed: ${flag.id}`));
          });
        }

        loaded++;
        setState((prev) => ({
          ...prev,
          loaded,
          progress: loaded / total,
        }));
      } catch {
        failed.push(flag.id);
        loaded++;
        setState((prev) => ({
          ...prev,
          loaded,
          failed: [...prev.failed, flag.id],
          progress: loaded / total,
        }));
      }
    });

    await Promise.allSettled(promises);

    setState((prev) => ({
      ...prev,
      isReady: true,
    }));
  }, []);

  useEffect(() => {
    preload();
  }, [preload]);

  return state;
}
