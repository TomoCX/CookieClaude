import type { LocalizedText } from '../types';
import { useText } from '../i18n/text';
import { UI } from '../i18n/ui';

/** シナリオを読み終えたときに出す結果表示 */
export interface Result {
  title: LocalizedText;
  coin: number;
  /** 新しい行き先が開いたか */
  unlocked: boolean;
  note?: LocalizedText;
  charm?: LocalizedText;
}

/** 会話を初めて読み終えたときに一度だけ出す、手に入れたものの一覧 */
export function ResultOverlay({
  result,
  onClose,
}: {
  result: Result;
  onClose: () => void;
}) {
  const t = useText();
  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div className="result" onClick={(e) => e.stopPropagation()}>
        <p className="result__head">{t(UI.resultHead)}</p>
        <h2 className="result__title">{t(result.title)}</h2>
        <ul className="result__rewards">
          <li>
            <span>{t(UI.hintCoins)}</span>
            <strong>
              +{result.coin} {t(UI.coinUnit)}
            </strong>
          </li>
          {result.note && (
            <li>
              <span>{t(UI.notes)}</span>
              <strong>{t(result.note)}</strong>
            </li>
          )}
          {result.charm && (
            <li>
              <span>{t(UI.charms)}</span>
              <strong>{t(result.charm)}</strong>
            </li>
          )}
        </ul>
        {result.unlocked && <p className="result__unlock">{t(UI.unlockedArea)}</p>}
        <button type="button" className="result__ok" onClick={onClose}>
          {t(UI.continue)}
        </button>
      </div>
    </div>
  );
}
