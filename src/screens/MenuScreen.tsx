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
  /** 前の画面へ戻る */
  onBack: () => void;
  /** メインメニュー（トランク）を開く */
  onOpenMainMenu: () => void;
}

/** メニュー画面（写真1枚目の上側）。今の進み具合をまとめて見せる。 */
export function MenuScreen({ state, onBack, onOpenMainMenu }: Props) {
  const time = formatPlayTime(state.playSeconds);
  const here = getPlace(state.placeId);
  const percent = progressPercent(state);

  return (
    <div className="menu">
      <div className="menu__bar">
        <button type="button" className="iconbtn" onClick={onBack} title="もどる">
          ↰
        </button>
        <h1 className="menu__title">メニュー</h1>
        <button
          type="button"
          className="iconbtn iconbtn--gear"
          onClick={onOpenMainMenu}
          title="メインメニューへ"
        >
          ⚙
        </button>
      </div>

      <div className="menu__grid">
        <StatCard
          icon="▮"
          label="とけたナゾ"
          value={String(solvedCount(state))}
          unit="コ"
          tone="orange"
        />
        <StatCard
          icon="✦"
          label="トータルひらめきしすう"
          value={String(state.picarat)}
          unit="ピカラット"
          tone="orange"
          wide
        />
        <StatCard
          icon="!"
          label="みつけたナゾ"
          value={String(foundCount(state))}
          unit="コ"
          tone="orange"
        />
        <StatCard
          icon="C"
          label="ひらめきコイン"
          value={String(state.coin)}
          unit="まい"
          tone="gold"
          wide
        />
        <div className="card card--time">
          <span className="card__icon">◷</span>
          <span className="card__label">プレイじかん</span>
          <span className="card__value">
            {time.h}
            <em>じかん</em>
            {time.m}
            <em>ふん</em>
          </span>
        </div>
      </div>

      <div className="menu__place">
        <span className="menu__place-icon" aria-hidden="true">
          🎩
        </span>
        <span className="menu__place-label">げんざいち</span>
        <span className="menu__place-value">
          <ruby>
            {here?.name}
            <rt>{here?.ruby}</rt>
          </ruby>
        </span>
      </div>

      <div className="menu__progress">
        <div className="menu__progress-head">
          <span>ものがたりの しんこう</span>
          <span>
            {clearedMainCount(state)} / {MAIN_SCENARIOS.length}（{percent}%）
          </span>
        </div>
        <div className="menu__progress-track">
          <div className="menu__progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="menu__progress-head menu__progress-head--sub">
          <span>ナゾの しゅうかい</span>
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
