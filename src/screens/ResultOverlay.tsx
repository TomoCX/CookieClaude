/** シナリオを読み終えたときに出す結果表示 */
export interface Result {
  title: string;
  coin: number;
  /** 新しい行き先が開いたか */
  unlocked: boolean;
  note?: string;
  charm?: string;
}

/** 会話を初めて読み終えたときに一度だけ出す、手に入れたものの一覧 */
export function ResultOverlay({
  result,
  onClose,
}: {
  result: Result;
  onClose: () => void;
}) {
  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div className="result" onClick={(e) => e.stopPropagation()}>
        <p className="result__head">聞き込みを終えた</p>
        <h2 className="result__title">{result.title}</h2>
        <ul className="result__rewards">
          <li>
            <span>ひらめきコイン</span>
            <strong>+{result.coin} 枚</strong>
          </li>
          {result.note && (
            <li>
              <span>調査メモ</span>
              <strong>{result.note}</strong>
            </li>
          )}
          {result.charm && (
            <li>
              <span>チャーム</span>
              <strong>{result.charm}</strong>
            </li>
          )}
        </ul>
        {result.unlocked && <p className="result__unlock">新たな行き先が開かれた</p>}
        <button type="button" className="result__ok" onClick={onClose}>
          続ける
        </button>
      </div>
    </div>
  );
}
