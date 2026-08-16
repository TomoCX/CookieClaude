import type { Character, ExitDir, Npc, ScenePuzzle } from '../types';
import { CharacterArt } from './CharacterSprite';
import { PuzzleObject } from './PuzzleObject';

/**
 * シーンの上に置かれるもの。
 *
 * どれも「シーンの中の 0〜1」を left / top に置きなおすだけの小さな部品。
 * street でも view でも同じものを使う（親のほうが座標の意味を決める）。
 */

/** 立っている人 */
export function NpcMarker({
  npc,
  character,
  talked,
  isMain,
  fixedY,
  onClick,
}: {
  npc: Npc;
  character: Character;
  /** view・closeup のときだけ、縦位置も指定する */
  fixedY?: number;
  /** その人の会話を読み終えているか */
  talked: boolean;
  /** 本筋の会話か（立ち話なら false） */
  isMain: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`walker walker--npc${talked ? ' walker--talked' : ''}${
        fixedY == null ? '' : ' walker--placed'
      }`}
      style={
        {
          left: `${npc.x * 100}%`,
          top: fixedY == null ? undefined : `${fixedY * 100}%`,
          '--walker-scale': character.scale ?? 1,
        } as React.CSSProperties
      }
      onClick={onClick}
      title={`${character.name}に話しかける`}
    >
      <span className="walker__tag">
        <i className="walker__mark" aria-hidden="true">
          {talked ? '✓' : isMain ? '！' : '？'}
        </i>
        {character.name}
      </span>
      <CharacterArt character={character} pose="normal" className="walker__art" />
    </button>
  );
}

/** 道端に置かれたナゾ（時計のような物体） */
export function PuzzleMarker({
  spot,
  title,
  solved,
  fixedY,
  onClick,
}: {
  spot: ScenePuzzle;
  /** まだ見つけていないナゾは名前を伏せる */
  title: string;
  solved: boolean;
  /** view・closeup のときだけ、縦位置も指定する */
  fixedY?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`streetpuzzle${solved ? ' streetpuzzle--solved' : ''}${
        fixedY == null ? '' : ' streetpuzzle--placed'
      }`}
      style={{
        left: `${spot.x * 100}%`,
        top: fixedY == null ? undefined : `${fixedY * 100}%`,
      }}
      onClick={onClick}
      title={solved ? '解いたナゾ' : 'ナゾ！'}
    >
      <span className="streetpuzzle__tag">
        <i className="streetpuzzle__mark" aria-hidden="true">
          {solved ? '✓' : 'ナ'}
        </i>
        {title}
      </span>
      <PuzzleObject look={spot.look} solved={solved} />
    </button>
  );
}

/** 矢印の向きごとの回転角（三角は上向きに描いてある） */
const ARROW_ROTATION: Record<ExitDir, number> = {
  far: 0,
  near: 180,
  left: -90,
  right: 90,
  into: 180, // 足もとや壁を「覗きこむ」ので、下向き
  back: 0, // もとのシーンへ「もどる」ので、上向き
};

/** 矢印に添える言葉 */
const ARROW_LABEL: Record<ExitDir, string> = {
  far: '奥へ',
  near: '手前へ',
  left: '左へ',
  right: '右へ',
  into: '調べる',
  back: 'もどる',
};

/**
 * 隣のシーンへの矢印。
 * street シーンでは靴のアイコンを押しているあいだだけ、
 * view・closeup シーンでは常に出す。
 */
export function ExitArrow({
  dir,
  x,
  y,
  name,
  open,
  onClick,
}: {
  dir: ExitDir;
  x: number;
  y: number;
  /** 行き先の場所の名前 */
  name: string;
  /** もう行ける場所か */
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`exit exit--${dir}${open ? '' : ' exit--locked'}`}
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      disabled={!open}
      title={open ? `${name}へ移動する` : 'まだ行けない'}
      onClick={onClick}
    >
      <svg viewBox="0 0 40 34" className="exit__arrow" aria-hidden="true">
        <path d="M20 2 L37 30 L3 30 Z" transform={`rotate(${ARROW_ROTATION[dir]} 20 18)`} />
      </svg>
      <span className="exit__label">
        <em>{ARROW_LABEL[dir]}</em>
        {open ? name : '？？？'}
      </span>
    </button>
  );
}

/** 落ちている収集アイテムのキラキラ */
export function SparkleMarker({
  x,
  y,
  onClick,
}: {
  x: number;
  y: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="sparkle"
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      aria-label="光るものを拾う"
      title="何か落ちている"
      onClick={onClick}
    >
      {/* 回転させるのは中の絵だけ。押せる範囲が動くと拾いにくくなる。 */}
      <svg viewBox="0 0 24 24" className="sparkle__glow" aria-hidden="true">
        <path d="M12 1 L14 9 L22 12 L14 15 L12 23 L10 15 L2 12 L10 9 Z" fill="#fff3c4" />
        <path
          d="M12 5 L13.1 10.9 L19 12 L13.1 13.1 L12 19 L10.9 13.1 L5 12 L10.9 10.9 Z"
          fill="#f7d774"
        />
      </svg>
    </button>
  );
}

/** 移動モードに入るための靴のアイコン。画面の右下に常に出ている。 */
export function ShoeButton({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`scene__shoe${on ? ' scene__shoe--on' : ''}`}
      aria-pressed={on}
      title={on ? '移動をやめる' : '別の場所へ移動する'}
      onClick={onClick}
    >
      <svg viewBox="0 0 32 24" aria-hidden="true">
        <path
          d="M3 17 L3 8 Q3 6 5 6 L9 6 Q11 6 12 8 L14 11 Q16 13 20 14 L26 15 Q29 16 29 18 L29 19 Q29 20 27 20 L5 20 Q3 20 3 18 Z"
          fill="currentColor"
        />
        <path d="M3 17 L29 18.6" stroke="#3a2617" strokeWidth="1.6" fill="none" />
        <path d="M9 7 L11 11 M13 10 L15 13" stroke="#3a2617" strokeWidth="1.4" fill="none" />
      </svg>
    </button>
  );
}
