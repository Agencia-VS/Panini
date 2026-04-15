import type { RefObject } from 'react';
import './BallSpinner.css';

interface Props {
  spinnerRef: RefObject<HTMLDivElement | null>;
  onSpin: () => void;
  disabled: boolean;
  remaining: number;
}

export default function BallSpinner({ spinnerRef, onSpin, disabled, remaining }: Props) {
  return (
    <div className="ball-spinner">
      <div ref={spinnerRef} className="ball-spinner__globe">
        <span className="ball-spinner__icon">⚽</span>
      </div>
      <button
        className="ball-spinner__button"
        onClick={onSpin}
        disabled={disabled || remaining === 0}
      >
        {remaining === 0 ? 'Terminado' : 'Girar'}
      </button>
    </div>
  );
}
