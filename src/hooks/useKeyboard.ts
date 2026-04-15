import { useEffect, useCallback } from 'react';

type KeyMap = Record<string, () => void>;

/**
 * Atajos de teclado para el host.
 * Solo actúa si el foco no está en un input/textarea.
 */
export function useKeyboard(keyMap: KeyMap) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const fn = keyMap[e.key] ?? keyMap[e.code];
      if (fn) {
        e.preventDefault();
        fn();
      }
    },
    [keyMap],
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
