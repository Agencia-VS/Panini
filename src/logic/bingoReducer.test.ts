import { describe, it, expect, vi } from 'vitest';
import { bingoReducer, initialGameState } from './bingoReducer';
import type { GameState, PatternType } from '../types';
import { allFlags } from '../data/flags';

// Mock rng para hacer tests deterministas
vi.mock('./rng', () => ({
  secureRandomIndex: vi.fn(() => 0), // Siempre retorna el primer elemento
}));

describe('bingoReducer', () => {
  // ── DRAW_FLAG ─────────────────────────────────────

  describe('DRAW_FLAG', () => {
    it('extrae una bandera de available y la mueve a history', () => {
      const state = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });

      expect(state.available).toHaveLength(allFlags.length - 1);
      expect(state.history).toHaveLength(1);
      expect(state.current).not.toBeNull();
      expect(state.current!.id).toBe(allFlags[0].id);
    });

    it('agrega drawnAt y drawIndex a la bandera extraída', () => {
      const state = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });

      expect(state.current!.drawnAt).toBeGreaterThan(0);
      expect(state.current!.drawIndex).toBe(0);
    });

    it('registra la acción en auditLog', () => {
      const state = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });

      expect(state.auditLog).toHaveLength(1);
      expect(state.auditLog[0].action).toBe('DRAW_FLAG');
    });

    it('no cambia el estado si no quedan banderas', () => {
      const emptyState: GameState = {
        ...initialGameState,
        available: [],
      };

      const state = bingoReducer(emptyState, { type: 'DRAW_FLAG' });
      expect(state).toBe(emptyState); // Misma referencia = sin cambio
    });

    it('la bandera extraída ya no está en available', () => {
      const state = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });
      const drawnId = state.current!.id;

      expect(state.available.find((f) => f.id === drawnId)).toBeUndefined();
    });
  });

  // ── UNDO_LAST ─────────────────────────────────────

  describe('UNDO_LAST', () => {
    it('devuelve la última bandera a available', () => {
      const afterDraw = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });
      const afterUndo = bingoReducer(afterDraw, { type: 'UNDO_LAST' });

      expect(afterUndo.available).toHaveLength(allFlags.length);
      expect(afterUndo.history).toHaveLength(0);
      expect(afterUndo.current).toBeNull();
    });

    it('no cambia el estado si history está vacío', () => {
      const state = bingoReducer(initialGameState, { type: 'UNDO_LAST' });
      expect(state).toBe(initialGameState);
    });

    it('current apunta a la penúltima bandera después de undo', () => {
      let state = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });
      state = bingoReducer(state, { type: 'DRAW_FLAG' });
      // Ahora history tiene 2 banderas

      const afterUndo = bingoReducer(state, { type: 'UNDO_LAST' });
      expect(afterUndo.history).toHaveLength(1);
      expect(afterUndo.current!.id).toBe(afterUndo.history[0].id);
    });

    it('registra la acción en auditLog', () => {
      const afterDraw = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });
      const afterUndo = bingoReducer(afterDraw, { type: 'UNDO_LAST' });

      expect(afterUndo.auditLog).toHaveLength(2);
      expect(afterUndo.auditLog[1].action).toBe('UNDO_LAST');
    });
  });

  // ── RESET_GAME ────────────────────────────────────

  describe('RESET_GAME', () => {
    it('restaura las 32 banderas y limpia history', () => {
      let state = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });
      state = bingoReducer(state, { type: 'DRAW_FLAG' });
      state = bingoReducer(state, { type: 'RESET_GAME' });

      expect(state.available).toHaveLength(allFlags.length);
      expect(state.history).toHaveLength(0);
      expect(state.current).toBeNull();
      expect(state.winners).toHaveLength(0);
    });

    it('mantiene el patrón actual', () => {
      let state = bingoReducer(initialGameState, {
        type: 'CHANGE_PATTERN',
        pattern: 'cuadro',
      });
      state = bingoReducer(state, { type: 'RESET_GAME' });

      expect(state.pattern).toBe('cuadro');
    });

    it('mantiene el auditLog acumulado', () => {
      let state = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });
      state = bingoReducer(state, { type: 'RESET_GAME' });

      // auditLog del initialGameState en reset se construye sobre el existente
      expect(state.auditLog.length).toBeGreaterThan(0);
      expect(state.auditLog[state.auditLog.length - 1].action).toBe('RESET_GAME');
    });
  });

  // ── CHANGE_PATTERN ────────────────────────────────

  describe('CHANGE_PATTERN', () => {
    it('cambia el patrón sin afectar banderas', () => {
      const afterDraw = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });
      const state = bingoReducer(afterDraw, {
        type: 'CHANGE_PATTERN',
        pattern: 'bingo_full',
      });

      expect(state.pattern).toBe('bingo_full');
      expect(state.history).toHaveLength(1);
      expect(state.available).toHaveLength(allFlags.length - 1);
    });

    it('registra la acción con payload del patrón', () => {
      const state = bingoReducer(initialGameState, {
        type: 'CHANGE_PATTERN',
        pattern: 'columna',
      });

      const lastEntry = state.auditLog[state.auditLog.length - 1];
      expect(lastEntry.action).toBe('CHANGE_PATTERN');
      expect(lastEntry.payload).toBe('columna');
    });
  });

  // ── REGISTER_WINNER ──────────────────────────────

  describe('REGISTER_WINNER', () => {
    it('agrega ganador al array de winners', () => {
      const winner = {
        id: '1',
        name: 'Juan',
        pattern: 'linea' as PatternType,
        timestamp: Date.now(),
      };

      const state = bingoReducer(initialGameState, {
        type: 'REGISTER_WINNER',
        winner,
      });

      expect(state.winners).toHaveLength(1);
      expect(state.winners[0].name).toBe('Juan');
    });
  });

  // ── HYDRATE ──────────────────────────────────────

  describe('HYDRATE', () => {
    it('restaura estado completo si schema es compatible', () => {
      let savedState = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });
      savedState = bingoReducer(savedState, { type: 'DRAW_FLAG' });

      const hydrated = bingoReducer(initialGameState, {
        type: 'HYDRATE',
        state: savedState,
      });

      expect(hydrated.history).toHaveLength(2);
      expect(hydrated.available).toHaveLength(allFlags.length - 2);
    });

    it('descarta estado si schema es incompatible', () => {
      const badState: GameState = {
        ...initialGameState,
        schemaVersion: 999,
        history: [{ ...allFlags[0], drawnAt: 0, drawIndex: 0 }],
      };

      const hydrated = bingoReducer(initialGameState, {
        type: 'HYDRATE',
        state: badState,
      });

      expect(hydrated).toEqual(initialGameState);
    });
  });

  // ── Inmutabilidad ────────────────────────────────

  describe('inmutabilidad', () => {
    it('DRAW_FLAG no muta el estado original', () => {
      const originalAvailable = [...initialGameState.available];
      bingoReducer(initialGameState, { type: 'DRAW_FLAG' });

      expect(initialGameState.available).toEqual(originalAvailable);
      expect(initialGameState.history).toHaveLength(0);
    });

    it('UNDO_LAST no muta el estado original', () => {
      const afterDraw = bingoReducer(initialGameState, { type: 'DRAW_FLAG' });
      const historyBefore = [...afterDraw.history];
      bingoReducer(afterDraw, { type: 'UNDO_LAST' });

      expect(afterDraw.history).toEqual(historyBefore);
    });
  });
});
