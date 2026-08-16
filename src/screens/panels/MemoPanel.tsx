import { useText } from '../../i18n/text';
import { UI } from '../../i18n/ui';

/** 自由記入のメモ帳 */
export function MemoPanel({
  memo,
  onChange,
}: {
  memo: string;
  onChange: (v: string) => void;
}) {
  const t = useText();
  return (
    <div className="panel__body">
      <h2 className="panel__title">{t(UI.memo)}</h2>
      <p className="panel__lead">{t(UI.memoLead)}</p>
      <textarea
        className="memopad"
        value={memo}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t(UI.memoPlaceholder)}
        spellCheck={false}
      />
    </div>
  );
}
