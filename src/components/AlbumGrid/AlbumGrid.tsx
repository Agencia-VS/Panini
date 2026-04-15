import { allFlags } from '../../data/flags';
import Sticker from '../Sticker/Sticker';
import './AlbumGrid.css';

interface Props {
  revealedIds: Set<string>;
  lastRevealedId?: string | null;
}

export default function AlbumGrid({ revealedIds, lastRevealedId }: Props) {
  return (
    <div className="album-grid">
      {allFlags.map((flag) => (
        <Sticker
          key={flag.id}
          flag={flag}
          isRevealed={revealedIds.has(flag.id)}
          isJustRevealed={flag.id === lastRevealedId}
        />
      ))}
    </div>
  );
}
