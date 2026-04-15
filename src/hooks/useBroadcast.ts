import { useEffect, useCallback, useRef } from 'react';
import type { GameState } from '../types';

const CHANNEL_NAME = 'panini-bingo-sync';

interface BroadcastMessage {
  type: 'STATE_UPDATE';
  state: GameState;
  timestamp: number;
}

/**
 * Hook para sincronizar estado entre pestañas via BroadcastChannel.
 * 
 * El host emite estado en cada cambio.
 * La pantalla pública recibe y actualiza.
 * 
 * Uso:
 * - Host:   useBroadcast({ role: 'host', state })
 * - Public: useBroadcast({ role: 'viewer', onStateReceived: (s) => dispatch({ type: 'HYDRATE', state: s }) })
 */
export function useBroadcast(options: {
  role: 'host' | 'viewer';
  state?: GameState;
  onStateReceived?: (state: GameState) => void;
}) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    if (options.role === 'viewer' && options.onStateReceived) {
      const handler = options.onStateReceived;
      channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
        if (event.data?.type === 'STATE_UPDATE') {
          handler(event.data.state);
        }
      };
    }

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [options.role, options.onStateReceived]);

  // Host: emitir estado
  const broadcast = useCallback(
    (state: GameState) => {
      if (options.role !== 'host') return;
      channelRef.current?.postMessage({
        type: 'STATE_UPDATE',
        state,
        timestamp: Date.now(),
      } satisfies BroadcastMessage);
    },
    [options.role],
  );

  // Auto-broadcast cuando state cambia (solo host)
  useEffect(() => {
    if (options.role === 'host' && options.state) {
      broadcast(options.state);
    }
  }, [options.role, options.state, broadcast]);

  return { broadcast };
}
