/** 自由記入のメモ帳 */
export function MemoPanel({
  memo,
  onChange,
}: {
  memo: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="panel__body">
      <h2 className="panel__title">メモ</h2>
      <p className="panel__lead">気づいたことを書き留めておこう。</p>
      <textarea
        className="memopad"
        value={memo}
        onChange={(e) => onChange(e.target.value)}
        placeholder="自由に記入できる"
        spellCheck={false}
      />
    </div>
  );
}
