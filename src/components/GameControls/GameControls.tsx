import { useState } from 'react';
import { Undo2, RotateCcw, Volume2, VolumeX, Maximize, Timer, TimerOff, FlaskConical, Download } from 'lucide-react';
import type { PatternType } from '../../types';
import './GameControls.css';

interface Props {
  onUndo: () => void;
  onReset: () => void;
  onChangePattern: (p: PatternType) => void;
  pattern: PatternType;
  remaining: number;
  total: number;
  disabled: boolean;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  countdownEnabled: boolean;
  onToggleCountdown: () => void;
  isRehearsal: boolean;
  onToggleRehearsal: () => void;
  onExport: () => void;
  theme: string;
  onChangeTheme: (theme: string) => void;
}

const PATTERN_LABELS: Record<PatternType, string> = {
  linea: 'Línea',
  columna: 'Columna',
  ele: 'L',
  cuadro: 'Cuadro',
  bingo_full: 'Bingo Full',
};

export default function GameControls({
  onUndo,
  onReset,
  onChangePattern,
  pattern,
  remaining,
  total,
  disabled,
  audioEnabled,
  onToggleAudio,
  countdownEnabled,
  onToggleCountdown,
  isRehearsal,
  onToggleRehearsal,
  onExport,
  theme,
  onChangeTheme,
}: Props) {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setConfirmReset(false);
    onReset();
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="game-controls">
      <div className="game-controls__title">Control del Host</div>

      <button className="game-controls__btn" onClick={onUndo} disabled={disabled}>
        <Undo2 size={14} /> Deshacer
      </button>

      <button
        className={`game-controls__btn ${confirmReset ? 'game-controls__btn--danger' : ''}`}
        onClick={handleReset}
        disabled={disabled}
      >
        <RotateCcw size={14} />
        {confirmReset ? '¿Confirmar reset?' : 'Reiniciar'}
      </button>

      <select
        className="game-controls__pattern-select"
        value={pattern}
        onChange={(e) => onChangePattern(e.target.value as PatternType)}
        disabled={disabled}
      >
        {Object.entries(PATTERN_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      <button className="game-controls__btn" onClick={onToggleAudio}>
        {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        {audioEnabled ? 'Audio On' : 'Audio Off'}
      </button>

      <button className="game-controls__btn" onClick={onToggleCountdown}>
        {countdownEnabled ? <Timer size={14} /> : <TimerOff size={14} />}
        {countdownEnabled ? 'Cuenta: On' : 'Cuenta: Off'}
      </button>

      <button className="game-controls__btn" onClick={handleFullscreen}>
        <Maximize size={14} /> Pantalla completa
      </button>

      <button
        className={`game-controls__btn ${isRehearsal ? 'game-controls__btn--danger' : ''}`}
        onClick={onToggleRehearsal}
        disabled={disabled}
      >
        <FlaskConical size={14} />
        {isRehearsal ? 'Salir ensayo' : 'Modo ensayo'}
      </button>

      <button
        className="game-controls__btn"
        onClick={onExport}
      >
        <Download size={14} />
        Exportar
      </button>

      <select
        className="game-controls__select"
        value={theme}
        onChange={(e) => onChangeTheme(e.target.value)}
      >
        <option value="clasico">Panini Clásico</option>
        <option value="estadio">Estadio</option>
        <option value="neon">Neon</option>
      </select>

      <div className="game-controls__info">
        Restantes: {remaining} / {total}<br />
        Patrón: {PATTERN_LABELS[pattern]}
      </div>
    </div>
  );
}
