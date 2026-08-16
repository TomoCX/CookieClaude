import type { ReactNode } from 'react';
import { useText } from '../i18n/text';
import { UI } from '../i18n/ui';

/**
 * 一覧から一件を選んだときに出す、画面いっぱいの説明。
 *
 * 行の下が少し伸びるだけだと、長い文が読みにくく、前後の行にも埋もれる。
 * 選んだらその件だけを大きく出し、「戻る」で一覧へかえす。
 * ナゾ事典とコレクションで同じ形を使う。
 */
interface Props {
  /** 小さく添える肩書き（「ナゾ 003」「拾った品」など） */
  eyebrow?: string;
  title: string;
  /** 見出しの左に置く絵 */
  art?: ReactNode;
  /** 本文 */
  children: ReactNode;
  onBack: () => void;
}

export function DetailView({ eyebrow, title, art, children, onBack }: Props) {
  const t = useText();
  return (
    <div className="detail">
      <div className="detail__bar">
        <button type="button" className="detail__back" onClick={onBack}>
          ↰ {t(UI.back)}
        </button>
      </div>

      <div className="detail__head">
        {art && <span className="detail__art">{art}</span>}
        <div className="detail__heading">
          {eyebrow && <span className="detail__eyebrow">{eyebrow}</span>}
          <h3 className="detail__title">{title}</h3>
        </div>
      </div>

      <div className="detail__body">{children}</div>
    </div>
  );
}
