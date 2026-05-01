import { useState, useCallback, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';

import '../styles/themes.css';
import './App.css';

import { TOTAL_FLAGS } from '../types';
import { useBingo } from '../hooks/useBingo';
import { usePhase } from '../hooks/usePhase';
import { usePreloader } from '../hooks/usePreloader';
import { useSpinAnimation } from '../hooks/useSpinAnimation';
import { useAudio } from '../hooks/useAudio';
import { useKeyboard } from '../hooks/useKeyboard';
import { exportResults } from '../logic/exportResults';
import { useBroadcast } from '../hooks/useBroadcast';

import PreloadScreen from '../components/PreloadScreen/PreloadScreen';
import BallSpinner from '../components/BallSpinner/BallSpinner';
import RevealModal from '../components/RevealModal/RevealModal';
import PatternPreview from '../components/PatternPreview/PatternPreview';
import RecentFlags from '../components/RecentFlags/RecentFlags';
import GameControls from '../components/GameControls/GameControls';
import HistoryTicker from '../components/HistoryTicker/HistoryTicker';
import Countdown from '../components/Countdown/Countdown';
import RecapModal from '../components/RecapModal/RecapModal';

export default function App() {
  const preload = usePreloader();

  // Rol dual-screen: ?role=viewer para pantalla pública
  const role = new URLSearchParams(window.location.search).get('role') === 'viewer'
    ? 'viewer' as const
    : 'host' as const;

  const {
    state,
    flagsRemaining,
    lastDrawn,
    drawFlag,
    undoLast,
    resetGame,
    changePattern,
    enterRehearsal,
    exitRehearsal,
    isRehearsal,
    dispatch,
  } = useBingo();

  // Sincronización dual-screen via BroadcastChannel
  useBroadcast({
    role,
    state: role === 'host' ? state : undefined,
    onStateReceived: role === 'viewer' ? (s) => dispatch({ type: 'HYDRATE', state: s }) : undefined,
  });

  const { phase, canSpin, canUndo, isBlocked, startSpin, reveal, celebrate, goIdle } =
    usePhase(preload.isReady ? 'idle' : 'loading');

  const [audioEnabled, setAudioEnabled] = useState(true);
  const { play, stop, stopAll } = useAudio(audioEnabled);
  const { spinnerRef, spin, kill: killSpin } = useSpinAnimation();
  const [modalOpen, setModalOpen] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownEnabled, setCountdownEnabled] = useState(true);
  const [theme, setTheme] = useState('clasico');
  const [panelOpen, setPanelOpen] = useState(true);
  const [recapOpen, setRecapOpen] = useState(false);

  // Aplicar tema al documento
  useEffect(() => {
    if (theme === 'clasico') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Cuando preload termina, ir a idle
  useEffect(() => {
    if (preload.isReady && phase === 'loading') {
      goIdle();
    }
  }, [preload.isReady, phase, goIdle]);

  // ── Flujo de giro ──
  const executeSpin = useCallback(() => {
    startSpin();
    play('spin');

    spin({
      duration: 3,
      onComplete: () => {
        stop('spin');
        play('reveal');
        drawFlag();
        reveal();
        setModalOpen(true);
      },
    });
  }, [startSpin, play, spin, stop, drawFlag, reveal]);

  const handleSpin = useCallback(() => {
    if (!canSpin || flagsRemaining === 0) return;

    if (countdownEnabled) {
      setCountdownActive(true);
    } else {
      executeSpin();
    }
  }, [canSpin, flagsRemaining, countdownEnabled, executeSpin]);

  const handleCountdownComplete = useCallback(() => {
    setCountdownActive(false);
    executeSpin();
  }, [executeSpin]);

  // ── Cerrar reveal ──
  const handleCloseReveal = useCallback(() => {
    setModalOpen(false);
    play('sticker');

    // Efecto especial por bandera
    if (lastDrawn?.isSpecial) {
      play('special');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: lastDrawn.specialColors ?? ['#f5c518', '#ff6b35'],
      });
    }

    goIdle();
  }, [goIdle, play, lastDrawn]);

  // ── Bingo manual (host confirma patrón completado) ──
  const handleBingo = useCallback(() => {
    celebrate();
    play('win');
    const durationMs = 2800;
    const intervalMs = 140;
    const end = Date.now() + durationMs;

    // Pulso inicial para arranque inmediato.
    confetti({
      particleCount: 45,
      spread: 90,
      startVelocity: 42,
      origin: { x: 0.5, y: 0.42 },
      colors: ['#f5c518', '#ff6b35', '#ffffff', '#e879f9'],
    });

    const timerId = window.setInterval(() => {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) {
        window.clearInterval(timerId);
        return;
      }

      const intensity = Math.max(0.25, timeLeft / durationMs);
      const particleCount = Math.round(18 * intensity);

      confetti({
        particleCount,
        angle: 60,
        spread: 70,
        startVelocity: 38,
        origin: { x: 0.08, y: 0.62 },
        colors: ['#f5c518', '#ff6b35', '#ffffff', '#e879f9'],
      });

      confetti({
        particleCount,
        angle: 120,
        spread: 70,
        startVelocity: 38,
        origin: { x: 0.92, y: 0.62 },
        colors: ['#f5c518', '#ff6b35', '#ffffff', '#e879f9'],
      });
    }, intervalMs);

    setTimeout(() => {
      goIdle();
    }, 4000);
  }, [celebrate, goIdle, play]);

  // ── Undo ──
  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    play('undo');
    undoLast();
  }, [canUndo, play, undoLast]);

  // ── Reset ──
  const handleReset = useCallback(() => {
    stopAll();
    killSpin();
    resetGame();
    setModalOpen(false);
    setCountdownActive(false);
    goIdle();
  }, [stopAll, killSpin, resetGame, goIdle]);



  // ── Atajos de teclado ──
  useKeyboard(
    useMemo(
      () => ({
        ' ': handleSpin,
        Space: handleSpin,
        z: handleUndo,
        Escape: () => modalOpen && handleCloseReveal(),
      }),
      [handleSpin, handleUndo, modalOpen, handleCloseReveal],
    ),
  );

  // ── Pantalla de carga ──
  if (!preload.isReady) {
    return (
      <PreloadScreen
        progress={preload.progress}
        loaded={preload.loaded}
        failed={preload.failed}
      />
    );
  }

  return (
    <div className={`app ${role === 'viewer' ? 'app--viewer' : ''}`}>
      <header className="app__header">
        <div className="app__logo">
          <img
            className="app__logo-img"
            src={`${import.meta.env.BASE_URL}panini-logo.webp`}
            alt="Panini"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <div className="app__header-center">
          <h1 className="app__title">
            BINGO<br />MUNDIALERO
            {isRehearsal && <span className="app__rehearsal-badge"> 🧪 ENSAYO</span>}
          </h1>
          {role === 'host' ? (
            <button
              className="app__bingo-btn"
              onClick={handleBingo}
              disabled={phase === 'spinning' || phase === 'celebrating'}
            >
              ¡BINGO!
            </button>
          ) : <span className="app__header-placeholder app__header-placeholder--bingo" aria-hidden />}
          <span className="app__status">
            {flagsRemaining} restantes · {state.history.length} sorteadas
          </span>
          {state.history.length > 0 ? (
            <button
              className="app__recap-btn"
              onClick={() => setRecapOpen(true)}
            >
              RECUENTO
            </button>
          ) : <span className="app__header-placeholder app__header-placeholder--recap" aria-hidden />}
        </div>

        <div className="app__wc26" aria-hidden>
          <img
            className="app__wc26-img"
            src={`${import.meta.env.BASE_URL}logo26.png`}
            alt=""
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </header>

      <main className="app__main">
        <BallSpinner
          spinnerRef={spinnerRef}
          onSpin={handleSpin}
          disabled={role === 'viewer' || !canSpin || flagsRemaining === 0}
          remaining={flagsRemaining}
          isSpinning={phase === 'spinning'}
        />
        <aside className="app__right-panel">
          <section className="app__pattern-panel">
            <div className="app__pattern-title" aria-label="¡TODO EMPIEZA CON PANINI!">
              <span className="app__pattern-word app__pattern-word--sky">¡TODO</span>{' '}
              <span className="app__pattern-word app__pattern-word--blue">EMPIEZA</span>
              <br />
              <span className="app__pattern-word app__pattern-word--green">CON</span>{' '}
              <span className="app__pattern-word app__pattern-word--red">PANINI!</span>
            </div>
            <PatternPreview pattern={state.pattern} variant="expanded" />
          </section>
          <RecentFlags history={state.history} maxVisible={4} />
        </aside>
      </main>

      {role === 'host' && (
        <div className={`app__controls ${panelOpen ? '' : 'app__controls--collapsed'}`}>
          <button
            className="app__controls-toggle"
            onClick={() => setPanelOpen((p) => !p)}
            title={panelOpen ? 'Ocultar panel' : 'Mostrar panel'}
          >
            {panelOpen ? '✕' : '⚙'}
          </button>
          {panelOpen && (
            <GameControls
              onUndo={handleUndo}
              onReset={handleReset}
              onChangePattern={changePattern}
              pattern={state.pattern}
              remaining={flagsRemaining}
              total={TOTAL_FLAGS}
              disabled={isBlocked}
              audioEnabled={audioEnabled}
              onToggleAudio={() => setAudioEnabled((prev) => !prev)}
              countdownEnabled={countdownEnabled}
              onToggleCountdown={() => setCountdownEnabled((prev) => !prev)}
              isRehearsal={isRehearsal}
              onToggleRehearsal={() => isRehearsal ? exitRehearsal() : enterRehearsal()}
              onExport={() => exportResults(state)}
              theme={theme}
              onChangeTheme={setTheme}
            />
          )}
        </div>
      )}

      <footer className="app__footer">
        <HistoryTicker history={state.history} />
      </footer>

      {phase === 'celebrating' && (
        <div className="app__win-banner">
          🏆 ¡BINGO! — Patrón completado 🏆
        </div>
      )}

      <RevealModal
        flag={lastDrawn}
        isOpen={modalOpen}
        onClose={handleCloseReveal}
        totalDrawn={state.history.length}
      />

      <Countdown
        active={countdownActive}
        from={3}
        onComplete={handleCountdownComplete}
        playTick={() => play('countdown')}
      />

      <RecapModal
        history={state.history}
        isOpen={recapOpen}
        onClose={() => setRecapOpen(false)}
      />
    </div>
  );
}
