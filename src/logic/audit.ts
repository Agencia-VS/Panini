import type { AuditEntry, GameAction } from '../types';

/**
 * Crea una entrada de auditoría para una acción del reducer.
 */
export function createAuditEntry(action: GameAction): AuditEntry {
  return {
    action: action.type,
    timestamp: Date.now(),
    payload: 'pattern' in action
      ? action.pattern
      : 'winner' in action
        ? action.winner
        : undefined,
  };
}
