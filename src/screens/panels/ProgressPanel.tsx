import type { GameState } from '../../types';
import { getArea } from '../../data/areas';
import { PUZZLES } from '../../data/puzzles';
import { MAIN_SCENARIOS } from '../../data/scenarios';
import {
  TOTAL_PICARAT,
  clearedMainCount,
  formatPlayTime,
  foundCount,
  progressPercent,
  solvedCount,
} from '../../state/gameState';
import { ProgressBar } from '../../components/ProgressBar';
import { useText } from '../../i18n/text';
import { UI } from '../../i18n/ui';

interface Props {
  state: GameState;
}

/** 進行状況。メインメニューのタブから開く。 */
export function ProgressPanel({ state }: Props) {
  const t = useText();
  const time = formatPlayTime(state.playSeconds);
  const here = getArea(state.areaId);
  const percent = progressPercent(state);

  return (
    <div className="progress">
      <h2 className="panel__title">{t(UI.progress)}</h2>

      <div className="menu__grid">
        <StatCard
          icon="▮"
          label={t(UI.statSolved)}
          value={String(solvedCount(state))}
          unit={t(UI.questionUnit)}
          tone="orange"
        />
        <StatCard
          icon="✦"
          label={t(UI.statPicarat)}
          value={String(state.picarat)}
          unit={t(UI.picarat)}
          tone="orange"
          wide
        />
        <StatCard
          icon="!"
          label={t(UI.statFound)}
          value={String(foundCount(state))}
          unit={t(UI.questionUnit)}
          tone="orange"
        />
        <StatCard
          icon="C"
          label={t(UI.statCoin)}
          value={String(state.coin)}
          unit={t(UI.coinUnit)}
          tone="gold"
          wide
        />
        <div className="card card--time">
          <span className="card__icon">◷</span>
          <span className="card__label">{t(UI.playTime)}</span>
          <span className="card__value">
            {time.h}
            <em>{t(UI.hours)}</em>
            {time.m}
            <em>{t(UI.minutes)}</em>
          </span>
        </div>
      </div>

      <div className="menu__place">
        <span className="menu__place-icon" aria-hidden="true">
          🎩
        </span>
        <span className="menu__place-label">{t(UI.currentPlace)}</span>
        <span className="menu__place-value">
          <ruby>
            {t(here?.name)}
            <rt>{here?.ruby}</rt>
          </ruby>
        </span>
      </div>

      <ProgressBar
        label={t(UI.storyProgress)}
        note={`${clearedMainCount(state)} / ${MAIN_SCENARIOS.length}（${percent}%）`}
        percent={percent}
      >
        <div className="menu__progress-head menu__progress-head--sub">
          <span>{t(UI.puzzleCollection)}</span>
          <span>
            {solvedCount(state)} / {PUZZLES.length}（{state.picarat} / {TOTAL_PICARAT}{' '}
            {t(UI.picarat)}）
          </span>
        </div>
      </ProgressBar>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  unit: string;
  tone: 'orange' | 'gold';
  wide?: boolean;
}

function StatCard({ icon, label, value, unit, tone, wide }: StatCardProps) {
  return (
    <div className={`card card--${tone}${wide ? ' card--wide' : ''}`}>
      <span className="card__icon">{icon}</span>
      <span className="card__label">{label}</span>
      <span className="card__value">
        {value}
        <em>{unit}</em>
      </span>
    </div>
  );
}
