import { useEffect } from 'react';
import type { Item, SceneProp } from '../types';
import { ItemArt } from './ItemIcon';
import { useText } from '../i18n/text';
import { UI } from '../i18n/ui';

/**
 * 棚や飾りを調べたときに出るポップアップ。
 *
 * 画面は移らない。読み終えて閉じれば、さっきのシーンの続きから見てまわれる。
 * 調べた先で品が手に入るときは、その絵も添える。
 */
interface Props {
  prop: SceneProp;
  /** 調べて手に入った品（あれば） */
  gained?: Item;
  onClose: () => void;
}

export function ExamineModal({ prop, gained, onClose }: Props) {
  const t = useText();

  // Esc でも閉じられるようにする
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="overlay overlay--examine" onClick={onClose} role="presentation">
      <div
        className="examine"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t(prop.name)}
      >
        <p className="examine__head">{t(UI.examine)}</p>
        <h2 className="examine__title">{t(prop.name)}</h2>
        <p className="examine__text">{t(prop.text)}</p>

        {gained && (
          <div className="examine__gain">
            <ItemArt icon={gained.icon} className="examine__art" />
            <div>
              <span className="examine__gain-head">{t(UI.gotItem)}</span>
              <strong className="examine__gain-name">{t(gained.name)}</strong>
            </div>
          </div>
        )}

        <button type="button" className="result__ok" onClick={onClose}>
          {t(UI.examineClose)}
        </button>
      </div>
    </div>
  );
}

/** シーンの上に置く、調べどころの当たり判定 */
export function PropSpot({ prop, onClick }: { prop: SceneProp; onClick: () => void }) {
  const t = useText();
  return (
    <button
      type="button"
      className="prop"
      style={{
        left: `${prop.x * 100}%`,
        top: `${prop.y * 100}%`,
        width: `${(prop.w ?? 0.12) * 100}%`,
        height: `${(prop.h ?? 0.16) * 100}%`,
      }}
      title={`${t(prop.name)}`}
      aria-label={`${t(prop.name)}（${t(UI.examine)}）`}
      onClick={onClick}
    >
      <span className="prop__ring" aria-hidden="true" />
    </button>
  );
}
