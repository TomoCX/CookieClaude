import { useEffect, useRef } from 'react';
import type { Achievement } from '../types';
import { useText } from '../i18n/text';
import { UI } from '../i18n/ui';

/** 知らせを出しておく長さ（ミリ秒） */
const SHOW_MS = 3600;

interface Props {
  achievement: Achievement;
  /** 出しおえた。次の一枚があれば親が入れかえる。 */
  onDone: () => void;
}

/**
 * 実績を解放したときの知らせ。
 *
 * 画面の中央上部に数秒だけ出て、勝手に消える。押しても消せる。
 * 一度に何枚も解放されたときは、親（`App`）が順番待ちにして一枚ずつ渡す。
 */
export function AchievementToast({ achievement, onDone }: Props) {
  const t = useText();

  // 親は毎秒描きなおされる（プレイ時間）。onDone をそのまま依存に置くと
  // 数える前にタイマーが張りなおされて、いつまでも消えない。
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const id = setTimeout(() => done.current(), SHOW_MS);
    return () => clearTimeout(id);
  }, [achievement.id]);

  return (
    <button type="button" className="achvtoast" onClick={onDone}>
      <span className="achvtoast__icon" aria-hidden="true">
        {achievement.icon}
      </span>
      <span className="achvtoast__body">
        <span className="achvtoast__head">{t(UI.achievementGained)}</span>
        <span className="achvtoast__name">{t(achievement.name)}</span>
      </span>
    </button>
  );
}
