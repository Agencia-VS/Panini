import type { GameState } from '../types';

/**
 * Exporta los resultados del juego en formato JSON descargable.
 */
export function exportResults(state: GameState) {
  const results = {
    exportedAt: new Date().toISOString(),
    pattern: state.pattern,
    totalDrawn: state.history.length,
    totalRemaining: state.available.length,
    winners: state.winners,
    drawOrder: state.history.map((f, i) => ({
      position: i + 1,
      id: f.id,
      name: f.name,
      group: f.group,
      drawnAt: new Date(f.drawnAt).toISOString(),
    })),
    auditLog: state.auditLog.map((e) => ({
      ...e,
      timestamp: new Date(e.timestamp).toISOString(),
    })),
  };

  const blob = new Blob([JSON.stringify(results, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bingo-mundialero-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Genera un resumen de texto del juego.
 */
export function generateSummary(state: GameState): string {
  const lines = [
    '═══ BINGO MUNDIALERO — PANINI ═══',
    `Fecha: ${new Date().toLocaleDateString('es')}`,
    `Patrón: ${state.pattern}`,
    `Banderas sorteadas: ${state.history.length}`,
    `Banderas restantes: ${state.available.length}`,
    '',
    '── Orden de sorteo ──',
    ...state.history.map(
      (f, i) => `  ${String(i + 1).padStart(2, ' ')}. ${f.name} (${f.group})`,
    ),
  ];

  if (state.winners.length > 0) {
    lines.push('', '── Ganadores ──');
    state.winners.forEach((w) => {
      lines.push(`  🏆 ${w.name} — ${w.pattern}`);
    });
  }

  return lines.join('\n');
}
