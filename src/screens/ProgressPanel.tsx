import type { GameState } from '../types';
import { getPlace } from '../data/places';
import { PUZZLES } from '../data/puzzles';
import { MAIN_SCENARIOS } from '../data/scenarios';
import {
  TOTAL_PICARAT,
  clearedMainCount,
  formatPlayTime,
  foundCount,
  progressPercent,
  solvedCount,
} from '../state/gameState';

interface Props {
  state: GameState;
}

/** 進行状況。メインメニューのタブから開く。 */
export function ProgressPanel({ state }: Props) {
  const time = formatPlayTime(state.playSeconds);
  const here = getPlace(state.placeId);
  const percent = progressPercent(state);

  return (
    <div className="progress">

      <h2 className="panel__title">進行状況</h2>

      <div className="menu__grid">
        <StatCard
          icon="▮"
          label="解いたナゾ"
          value={String(solvedCount(state))}
          unit="問"
          tone="orange"
        />
        <StatCard
          icon="✦"
          label="ひらめき指数（累計）"
          value={String(state.picarat)}
          unit="ピカラット"
          tone="orange"
          wide
        />
        <StatCard
          icon="!"
          label="発見したナゾ"
          value={String(foundCount(state))}
          unit="問"
          tone="orange"
        />
        <StatCard
          icon="C"
          label="ひらめきコイン"
          value={String(state.coin)}
          unit="枚"
          tone="gold"
          wide
        />
        <div className="card card--time">
          <span className="card__icon">◷</span>
          <span className="card__label">プレイ時間</span>
          <span className="card__value">
            {time.h}
            <em>時間</em>
            {time.m}
            <em>分</em>
          </span>
        </div>
      </div>

      <div className="menu__place">
        <span className="menu__place-icon" aria-hidden="true">
          🎩
        </span>
        <span className="menu__place-label">現在地</span>
        <span className="menu__place-value">
          <ruby>
            {here?.name}
            <rt>{here?.ruby}</rt>
          </ruby>
        </span>
      </div>

      <div className="menu__progress">
        <div className="menu__progress-head">
          <span>物語の進行</span>
          <span>
            {clearedMainCount(state)} / {MAIN_SCENARIOS.length}（{percent}%）
          </span>
        </div>
        <div className="menu__progress-track">
          <div className="menu__progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="menu__progress-head menu__progress-head--sub">
          <span>ナゾの収集</span>
          <span>
            {solvedCount(state)} / {PUZZLES.length}（{state.picarat} /{' '}
            {TOTAL_PICARAT} ピカラット）
          </span>
        </div>
      </div>
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
