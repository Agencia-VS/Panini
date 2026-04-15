import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook de persistencia en localStorage con debounce.
 * Solo serializa datos planos (sin refs, sin funciones).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs = 200,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      console.warn(`[useLocalStorage] Failed to parse key "${key}". Using initial value.`);
      return initialValue;
    }
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounced write
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(storedValue));
      } catch {
        console.warn(`[useLocalStorage] Failed to write key "${key}".`);
      }
    }, debounceMs);

    return () => clearTimeout(timerRef.current);
  }, [key, storedValue, debounceMs]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) =>
        value instanceof Function ? value(prev) : value,
      );
    },
    [],
  );

  return [storedValue, setValue];
}
