import { useReducer, useEffect, useCallback, useRef } from 'react';
import type { GameState, PatternType, Winner, DrawnFlag } from '../types';
import { SCHEMA_VERSION, STORAGE_KEY } from '../types';
import { bingoReducer, initialGameState } from '../logic/bingoReducer';
import { checkPattern } from '../logic/patternChecker';

// ─── Debounced localStorage persistence ────────────────────

function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('[useBingo] Failed to persist state.');
  }
}

// ─── Hook principal ────────────────────────────────────────

export function useBingo() {
  const [state, dispatch] = useReducer(bingoReducer, initialGameState, () => {
    const saved = loadState();
    return saved ?? initialGameState;
  });

  // Debounced persistence
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveState(state), 200);
    return () => clearTimeout(saveTimerRef.current);
  }, [state]);

  // ── Acciones envueltas ──

  const drawFlag = useCallback(() => {
    dispatch({ type: 'DRAW_FLAG' });
  }, []);

  const undoLast = useCallback(() => {
    dispatch({ type: 'UNDO_LAST' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const changePattern = useCallback((pattern: PatternType) => {
    dispatch({ type: 'CHANGE_PATTERN', pattern });
  }, []);

  const registerWinner = useCallback((winner: Winner) => {
    dispatch({ type: 'REGISTER_WINNER', winner });
  }, []);

  const enterRehearsal = useCallback(() => {
    dispatch({ type: 'ENTER_REHEARSAL' });
  }, []);

  const exitRehearsal = useCallback(() => {
    dispatch({ type: 'EXIT_REHEARSAL' });
  }, []);

  // ── Selectores derivados ──

  const isRehearsal = state.rehearsalSnapshot !== null;

  const isPatternComplete = checkPattern(state.history, state.pattern);

  const flagsRemaining = state.available.length;

  const lastDrawn: DrawnFlag | null = state.current;

  const historyIds = new Set(state.history.map((f) => f.id));

  const isFlagDrawn = useCallback(
    (flagId: string) => historyIds.has(flagId),
    [historyIds],
  );

  return {
    // Estado
    state,
    flagsRemaining,
    lastDrawn,
    isPatternComplete,

    // Acciones
    drawFlag,
    undoLast,
    resetGame,
    changePattern,
    registerWinner,
    enterRehearsal,
    exitRehearsal,

    // Utilidades
    isFlagDrawn,
    isRehearsal,
    dispatch,
  } as const;
}
