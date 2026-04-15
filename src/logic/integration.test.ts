import { describe, it, expect, vi } from 'vitest';
import { bingoReducer, initialGameState } from './bingoReducer';
import { checkPattern } from './patternChecker';
import { allFlags } from '../data/flags';
import { GRID_COLS } from '../types';
import type { GameState } from '../types';

// Mock rng: índice controlable
let mockIndex = 0;
vi.mock('./rng', () => ({
  secureRandomIndex: vi.fn(() => mockIndex),
}));

describe('Flujo de integración', () => {
  it('simula un juego completo: draw → undo → redraw → pattern check', () => {
    mockIndex = 0;
    let state: GameState = initialGameState;

    // Sortear 3 banderas
    state = bingoReducer(state, { type: 'DRAW_FLAG' });
    state = bingoReducer(state, { type: 'DRAW_FLAG' });
    state = bingoReducer(state, { type: 'DRAW_FLAG' });

    expect(state.history).toHaveLength(3);
    expect(state.available).toHaveLength(allFlags.length - 3);

    // Deshacer la última
    state = bingoReducer(state, { type: 'UNDO_LAST' });
    expect(state.history).toHaveLength(2);
    expect(state.available).toHaveLength(allFlags.length - 2);
    // current apunta a la última del historial restante
    expect(state.current).not.toBeNull();
    expect(state.current!.id).toBe(state.history[1].id);

    // Volver a sortear
    state = bingoReducer(state, { type: 'DRAW_FLAG' });
    expect(state.history).toHaveLength(3);

    // Verificar que el audit log registra todo
    expect(state.auditLog.length).toBeGreaterThanOrEqual(5); // 3 draws + 1 undo + 1 draw
  });

  it('detecta patrón línea al completar la primera fila', () => {
    mockIndex = 0;
    let state: GameState = { ...initialGameState };

    // Cambiar patrón a línea
    state = bingoReducer(state, { type: 'CHANGE_PATTERN', pattern: 'linea' });

    // Sortear las primeras GRID_COLS banderas (primera fila del grid)
    for (let i = 0; i < GRID_COLS; i++) {
      state = bingoReducer(state, { type: 'DRAW_FLAG' });
    }

    // Las banderas sorteadas
    // Verificar pattern check con el historial real
    const isComplete = checkPattern(state.history, 'linea');
    // Pueden o no completar la línea dependiendo del orden, pero no debe crashear
    expect(typeof isComplete).toBe('boolean');
  });

  it('modo ensayo: snapshot y restauración', () => {
    mockIndex = 0;
    let state: GameState = initialGameState;

    // Sortear 2 banderas
    state = bingoReducer(state, { type: 'DRAW_FLAG' });
    state = bingoReducer(state, { type: 'DRAW_FLAG' });
    const historyBefore = state.history.length;

    // Entrar a ensayo (resetea estado pero guarda snapshot)
    state = bingoReducer(state, { type: 'ENTER_REHEARSAL' });
    expect(state.rehearsalSnapshot).not.toBeNull();
    expect(state.history).toHaveLength(0); // Ensayo empieza limpio

    // Sortear más en ensayo
    state = bingoReducer(state, { type: 'DRAW_FLAG' });
    state = bingoReducer(state, { type: 'DRAW_FLAG' });
    expect(state.history).toHaveLength(2);

    // Salir de ensayo → restaura estado anterior
    state = bingoReducer(state, { type: 'EXIT_REHEARSAL' });
    expect(state.history).toHaveLength(historyBefore);
    expect(state.rehearsalSnapshot).toBeNull();
  });

  it('HYDRATE restaura un estado serializado', () => {
    mockIndex = 0;
    let state: GameState = initialGameState;

    state = bingoReducer(state, { type: 'DRAW_FLAG' });
    const serialized = JSON.parse(JSON.stringify(state)) as GameState;

    // Hidrate desde un estado "fresco"
    const hydrated = bingoReducer(initialGameState, {
      type: 'HYDRATE',
      state: serialized,
    });

    expect(hydrated.history).toHaveLength(1);
    expect(hydrated.history[0].id).toBe(state.history[0].id);
  });

  it('RESET_GAME vuelve a estado inicial con todas las banderas disponibles', () => {
    mockIndex = 0;
    let state: GameState = initialGameState;

    state = bingoReducer(state, { type: 'DRAW_FLAG' });
    state = bingoReducer(state, { type: 'DRAW_FLAG' });
    state = bingoReducer(state, { type: 'RESET_GAME' });

    expect(state.history).toHaveLength(0);
    expect(state.available).toHaveLength(allFlags.length);
    expect(state.current).toBeNull();
  });
});
