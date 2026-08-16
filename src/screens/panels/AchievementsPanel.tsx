import type { GameState } from '../../types';
import { ACHIEVEMENTS } from '../../data/achievements';
import { flagOn, getFlag } from '../../data/flags';
import { isEarned } from '../../state/achievements';
import { ProgressBar } from '../../components/ProgressBar';
import { useText } from '../../i18n/text';
import { UI } from '../../i18n/ui';

/**
 * 実績の一覧。
 *
 * 解放したかどうかは、そのつどフラグから引き直す（`isEarned`）。
 * まだ解放していないものには、条件になっているフラグを並べて出す
 * ——「あと何が足りないか」だけが分かり、答えそのものは書かない。
 */
export function AchievementsPanel({ state }: { state: GameState }) {
  const t = useText();
  const earned = ACHIEVEMENTS.filter((a) => isEarned(a, state));

  return (
    <div className="panel__body">
      <h2 className="panel__title">{t(UI.achievements)}</h2>
      <p className="panel__lead">{t(UI.achievementsLead)}</p>

      <ProgressBar
        label={t(UI.achievementsUnlocked)}
        note={`${earned.length} / ${ACHIEVEMENTS.length}`}
        percent={(earned.length / ACHIEVEMENTS.length) * 100}
      />

      <ul className="achvlist">
        {ACHIEVEMENTS.map((achievement) => {
          const on = earned.includes(achievement);
          // 伏せてある実績は、解放するまで名前も説明も見せない
          const hidden = achievement.secret === true && !on;
          return (
            <li key={achievement.id} className={`achvitem${on ? ' achvitem--on' : ''}`}>
              <span className="achvitem__icon" aria-hidden="true">
                {hidden ? '❓' : achievement.icon}
              </span>
              <span className="achvitem__body">
                <span className="achvitem__name">
                  {hidden ? t(UI.achievementSecret) : t(achievement.name)}
                </span>
                <span className="achvitem__desc">
                  {hidden ? t(UI.achievementSecretLead) : t(achievement.desc)}
                </span>
                {!on && !hidden && (
                  <span className="achvitem__flags">
                    {achievement.flags.map((id) => {
                      const flag = getFlag(id);
                      if (!flag) return null;
                      const lit = flagOn(id, state);
                      return (
                        <span key={id} className={`achvflag${lit ? ' achvflag--on' : ''}`}>
                          {lit ? '●' : '○'} {t(flag.name)}
                        </span>
                      );
                    })}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="panel__note">{t(UI.achievementsNote)}</p>
    </div>
  );
}
