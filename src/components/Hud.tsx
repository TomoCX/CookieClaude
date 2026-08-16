import type { LocalizedText } from '../types';
import { useText } from '../i18n/text';
import { UI } from '../i18n/ui';

interface Props {
  /** 左上：地図を開く */
  onOpenMap: () => void;
  /** 右上：メインメニューを開く */
  onOpenMenu: () => void;
  /** いまいるエリアの名前 */
  areaName?: LocalizedText;
  /** いま見ているシーンの名前 */
  sceneName?: LocalizedText;
}

/**
 * 画面の上に常に出ている操作。
 * 左上が地図（地点の移動）、右上がメインメニュー。
 */
export function Hud({ onOpenMap, onOpenMenu, areaName, sceneName }: Props) {
  const t = useText();
  return (
    <div className="hud">
      <button type="button" className="hud__btn hud__btn--map" onClick={onOpenMap}>
        <svg viewBox="0 0 24 24" className="hud__icon" aria-hidden="true">
          <path
            d="M3 6 L9 3.5 L15 6 L21 3.5 L21 18 L15 20.5 L9 18 L3 20.5 Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M9 3.5 L9 18 M15 6 L15 20.5"
            stroke="#3a2617"
            strokeWidth="1.2"
            fill="none"
          />
          <circle cx="12" cy="11" r="2.2" fill="#c2551e" stroke="#fff" strokeWidth="1" />
        </svg>
        <span className="hud__label">{t(UI.map)}</span>
      </button>

      {areaName && (
        <span className="hud__place">
          {t(areaName)}
          {sceneName && <em className="hud__scene">{t(sceneName)}</em>}
        </span>
      )}

      <button type="button" className="hud__btn hud__btn--menu" onClick={onOpenMenu}>
        <svg viewBox="0 0 24 24" className="hud__icon" aria-hidden="true">
          <rect x="2.5" y="7" width="19" height="12.5" rx="2" fill="currentColor" />
          <path d="M9 7 L9 5 L15 5 L15 7" stroke="currentColor" strokeWidth="1.8" fill="none" />
          <rect x="2.5" y="11.5" width="19" height="2.4" fill="#3a2617" opacity="0.5" />
          <rect x="10.4" y="10.4" width="3.2" height="4.6" rx="1" fill="#e2a01c" />
        </svg>
        <span className="hud__label">{t(UI.menu)}</span>
      </button>
    </div>
  );
}
