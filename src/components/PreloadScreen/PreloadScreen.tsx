import './PreloadScreen.css';
import { TOTAL_FLAGS } from '../../types';

interface Props {
  progress: number;
  loaded: number;
  failed: string[];
}

export default function PreloadScreen({ progress, loaded, failed }: Props) {
  return (
    <div className="preload-screen">
      <div className="preload-screen__title">BINGO MUNDIALERO</div>
      <div className="preload-screen__bar-container">
        <div
          className="preload-screen__bar"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <div className="preload-screen__label">
        Cargando banderas… {loaded}/{TOTAL_FLAGS}
        {failed.length > 0 && ` (${failed.length} con error)`}
      </div>
    </div>
  );
}
