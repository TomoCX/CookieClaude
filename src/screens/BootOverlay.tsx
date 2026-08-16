import { hasSave } from '../state/gameState';

/** 起動したときの表紙。ここから「最初から」か「続きから」を選ぶ。 */
export function BootOverlay({
  onNewGame,
  onContinue,
}: {
  onNewGame: () => void;
  onContinue: () => void;
}) {
  const canContinue = hasSave();

  return (
    <div className="overlay overlay--boot">
      <div className="boot">
        <p className="boot__sub">レイトン風シナリオアドベンチャー</p>
        <h1 className="boot__title">
          クッキーとクロードの
          <br />
          ナゾ解き事件簿
        </h1>
        <p className="boot__lead">町の時計が十三回鳴る夜、町の宝が消える——</p>
        <div className="boot__buttons">
          <button type="button" className="boot__btn" onClick={onNewGame}>
            最初から
          </button>
          <button
            type="button"
            className="boot__btn boot__btn--sub"
            onClick={onContinue}
            disabled={!canContinue}
          >
            続きから
          </button>
        </div>
        {!canContinue && <p className="boot__note">※ セーブデータはまだない</p>}
      </div>
    </div>
  );
}
