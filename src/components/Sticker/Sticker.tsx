import { useMemo } from 'react';
import type { Flag } from '../../types';
import './Sticker.css';

interface Props {
  flag: Flag;
  isRevealed: boolean;
  isJustRevealed?: boolean;
}

export default function Sticker({ flag, isRevealed, isJustRevealed }: Props) {
  // Rotación aleatoria sutil por bandera (determinista por id)
  const rotation = useMemo(() => {
    const hash = flag.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return ((hash % 30) - 15) / 10; // entre -1.5° y +1.5°
  }, [flag.id]);

  const className = [
    'sticker',
    isRevealed ? 'sticker--unlocked' : 'sticker--locked',
    isJustRevealed ? 'sticker--just-revealed' : '',
  ].join(' ');

  return (
    <div
      className={className}
      style={{ '--sticker-rotation': `${rotation}deg` } as React.CSSProperties}
    >
      <span className="sticker__group">{flag.group}</span>
      <img
        className="sticker__img"
        src={flag.imageSrc}
        alt={flag.name}
        loading="lazy"
      />
      <div className="sticker__name">{flag.name}</div>
    </div>
  );
}
