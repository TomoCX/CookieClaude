/**
 * 見出しつきの進み具合の帯。
 * 進行状況・深まるナゾ・ナゾ事典で同じ形のものを使う。
 */
export function ProgressBar({
  label,
  note,
  percent,
  children,
}: {
  /** 帯の左に出す見出し */
  label: string;
  /** 帯の右に出す内訳（「3 / 6（50%）」など） */
  note: string;
  /** 0〜100 */
  percent: number;
  /** 帯の下に続けて出す行（あれば） */
  children?: React.ReactNode;
}) {
  return (
    <div className="menu__progress">
      <div className="menu__progress-head">
        <span>{label}</span>
        <span>{note}</span>
      </div>
      <div className="menu__progress-track">
        <div className="menu__progress-fill" style={{ width: `${percent}%` }} />
      </div>
      {children}
    </div>
  );
}
