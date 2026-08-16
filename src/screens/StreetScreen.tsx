import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ExitDir, GameState, Street, StreetPuzzle } from '../types';
import { getCharacter } from '../data/characters';
import { getPlace } from '../data/places';
import { getPuzzle } from '../data/puzzles';
import { getStreet } from '../data/streets';
import { getScenario } from '../data/scenarios';
import { CharacterArt } from '../components/CharacterSprite';
import { StreetScene } from '../components/StreetScene';
import { PuzzleObject } from '../components/PuzzleObject';
import { playSe } from '../audio/audio';

/** 1 秒あたりにカメラが進む道の割合 */
const PAN_SPEED = 0.3;
/** 画面に見えている道の幅（手前の層の 1/3） */
const VIEW = 1 / 3;
/** 画面のまんなか近くとみなす距離 */
const FOCUS_RANGE = 0.075;
/** カメラのまんなかが動ける範囲 */
const MIN_C = VIEW / 2;
const MAX_C = 1 - VIEW / 2;
/** フェードにかける時間（ミリ秒）。CSS の street__fade とそろえる。 */
const FADE_MS = 380;
/** これ以上指が動いたら、クリックではなくドラッグとみなす */
const DRAG_SLOP = 5;
/** 靴を押したとき、行き先へカメラを寄せる速さ（1 秒あたりの道の割合） */
const GLIDE_SPEED = 0.9;

/** クリックしたものをどう開くか */
type Pending =
  | { kind: 'talk'; scenarioId: string }
  | { kind: 'puzzle'; puzzleId: string }
  | { kind: 'move'; streetId: string };

/** 矢印の向きごとの回転角（三角は上向きに描いてある） */
const ARROW_ROTATION: Record<ExitDir, number> = {
  far: 0,
  near: 180,
  left: -90,
  right: 90,
};

/** 矢印に添える言葉 */
const ARROW_LABEL: Record<ExitDir, string> = {
  far: '奥へ',
  near: '手前へ',
  left: '左へ',
  right: '右へ',
};

interface Props {
  street: Street;
  state: GameState;
  /** 入ってきたときのカメラ位置（会話から戻ったときはその続きから） */
  initialX: number;
  /** カメラが動くたびに知らせる */
  onMove: (x: number) => void;
  /** 人に話しかけた */
  onTalk: (scenarioId: string) => void;
  /** ナゾを開いた */
  onOpenPuzzle: (puzzleId: string) => void;
  /** キラキラを押してアイテムを拾った */
  onPickup: (itemId: string) => void;
  /** 隣の街並みへ移った */
  onGoTo: (streetId: string) => void;
  /** 地図などがかぶさっている間は操作を受けつけない */
  frozen?: boolean;
}

/**
 * 街並み画面。
 * カメラ＝クロードたちの目線なので、画面に自分の姿は出さない。
 * ◀ ▶ で道を見わたし、人やナゾをクリックするとフェードしてその画面へ入る。
 */
export function StreetScreen({
  street,
  state,
  initialX,
  onMove,
  onTalk,
  onOpenPuzzle,
  onPickup,
  onGoTo,
  frozen = false,
}: Props) {
  const [center, setCenter] = useState(() =>
    Math.min(MAX_C, Math.max(MIN_C, initialX)),
  );
  /** これから開くもの。入っているあいだ画面を暗くする。 */
  const [pending, setPending] = useState<Pending | null>(null);
  /** 入ってきた直後の明るくなる演出 */
  const [entering, setEntering] = useState(true);
  /** ◀ ▶ で押されている向き */
  const held = useRef(0);
  const centerRef = useRef(center);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  /** ドラッグ中の指の情報 */
  const drag = useRef<{ id: number; fromX: number; fromCenter: number } | null>(null);
  /** 直前の操作がドラッグだったか。人やナゾのクリックを打ち消すのに使う。 */
  const dragged = useRef(false);
  const [grabbing, setGrabbing] = useState(false);
  /** 靴のアイコンで出す、行き先の矢印を表示しているか */
  const [moveMode, setMoveMode] = useState(false);
  /** カメラを自動で寄せる先。寄せ終えたら null に戻す。 */
  const glide = useRef<number | null>(null);


  useEffect(() => {
    const id = setTimeout(() => setEntering(false), FADE_MS);
    return () => clearTimeout(id);
  }, []);

  /** いま現れている人だけを描く */
  const npcs = useMemo(
    () =>
      street.npcs.filter(
        (n) =>
          !n.requiresScenario || state.clearedScenarios.includes(n.requiresScenario),
      ),
    [street.npcs, state.clearedScenarios],
  );

  /** まだ拾っていないキラキラだけを出す */
  const sparkles = useMemo(
    () => street.sparkles.filter((sp) => !state.collected.some((c) => c.itemId === sp.itemId)),
    [street.sparkles, state.collected],
  );

  /** キラキラを押した。ドラッグの流れで押されたものは無視する。 */
  const pickUp = (itemId: string) => {
    if (pending || dragged.current || frozen) return;
    playSe('coin');
    onPickup(itemId);
  };

  /** クリックしたらフェードしてから画面を切りかえる */
  const open = useCallback(
    (next: Pending) => {
      // ドラッグの終わりに出る click は無視する
      if (pending || dragged.current || frozen) return;
      held.current = 0;
      playSe('fade');
      setPending(next);
      setTimeout(() => {
        if (next.kind === 'talk') onTalk(next.scenarioId);
        else if (next.kind === 'puzzle') onOpenPuzzle(next.puzzleId);
        else onGoTo(next.streetId);
      }, FADE_MS);
    },
    [pending, onTalk, onOpenPuzzle, onGoTo, frozen],
  );

  /** カメラを動かす */
  const panTo = (next: number) => {
    const clamped = Math.min(MAX_C, Math.max(MIN_C, next));
    centerRef.current = clamped;
    setCenter(clamped);
    onMoveRef.current(clamped);
  };
  const panRef = useRef(panTo);
  panRef.current = panTo;

  /** 見わたしのループ */
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      if (held.current !== 0) {
        glide.current = null;
        panRef.current(centerRef.current + held.current * PAN_SPEED * dt);
      } else if (glide.current !== null) {
        const to = glide.current;
        const gap = to - centerRef.current;
        if (Math.abs(gap) < 0.004) {
          glide.current = null;
          panRef.current(to);
        } else {
          const step = Math.sign(gap) * Math.min(GLIDE_SPEED * dt, Math.abs(gap));
          panRef.current(centerRef.current + step);
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  /** 隣の街並みへの出口。行き先の名前と、いま行けるかどうかを添える。 */
  const exits = useMemo(
    () =>
      street.exits.map((ex) => {
        const dest = getStreet(ex.to);
        const place = dest ? getPlace(dest.placeId) : undefined;
        return {
          ...ex,
          name: place?.name ?? '？？？',
          open: place ? state.openPlaces.includes(place.id) : false,
        };
      }),
    [street.exits, state.openPlaces],
  );

  /** 画面のまんなかに来ているもの */
  const focusNpc = npcs.find((n) => Math.abs(n.x - center) < FOCUS_RANGE);
  const focusPuzzle = street.puzzles.find((p) => Math.abs(p.x - center) < FOCUS_RANGE);

  /** キーボード操作 */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (frozen) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') held.current = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd') held.current = 1;
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const c = centerRef.current;
        const n = npcs.find((v) => Math.abs(v.x - c) < FOCUS_RANGE);
        if (n) {
          open({ kind: 'talk', scenarioId: n.scenarioId });
          return;
        }
        const z = street.puzzles.find((v) => Math.abs(v.x - c) < FOCUS_RANGE);
        if (z) open({ kind: 'puzzle', puzzleId: z.puzzleId });
      }
    };
    const up = (e: KeyboardEvent) => {
      if (
        ((e.key === 'ArrowLeft' || e.key === 'a') && held.current === -1) ||
        ((e.key === 'ArrowRight' || e.key === 'd') && held.current === 1)
      ) {
        held.current = 0;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [npcs, street.puzzles, open, frozen]);

  /** 画面をつかんで見わたす。矢印ボタンと併用できる。 */
  const surface = {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || pending || frozen) return;
      // ここでは まだ setPointerCapture しない。
      // 押した時点で捕まえると click の宛先を奪ってしまい、
      // 人やナゾのボタンが押せなくなる。
      drag.current = {
        id: e.pointerId,
        fromX: e.clientX,
        fromCenter: centerRef.current,
      };
      dragged.current = false;
      held.current = 0;
      glide.current = null;
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const width = e.currentTarget.clientWidth || 1;
      const dx = e.clientX - d.fromX;
      // しきい値を こえて はじめて ドラッグとみなし、そこで 指を 捕まえる
      if (!dragged.current) {
        if (Math.abs(dx) <= DRAG_SLOP) return;
        dragged.current = true;
        setGrabbing(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      // 指の動きと景色が 1 対 1 になるように、画面幅 ＝ 見えている道幅（VIEW）で換算する
      panRef.current(d.fromCenter - (dx / width) * VIEW);
    },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
      if (drag.current?.id !== e.pointerId) return;
      drag.current = null;
      setGrabbing(false);
    },
    onPointerCancel: () => {
      drag.current = null;
      setGrabbing(false);
    },
  };

  const cameraT = (center - MIN_C) / (MAX_C - MIN_C);

  const hold = (dir: 1 | -1) => ({
    onPointerDown: () => {
      held.current = dir;
    },
    onPointerUp: () => {
      held.current = 0;
    },
    onPointerLeave: () => {
      held.current = 0;
    },
  });

  /**
   * 靴を押したときに寄せる先。
   * すでに出口が見えていれば動かさず、見えていなければ
   * いちばん近い出口が画面に入る位置を返す。
   */
  const nearestExitCenter = (): number | null => {
    if (exits.length === 0) return null;
    const half = VIEW / 2;
    const inView = exits.some((ex) => Math.abs(ex.x - centerRef.current) < half * 0.9);
    if (inView) return null;
    const near = exits.reduce((best, ex) =>
      Math.abs(ex.x - centerRef.current) < Math.abs(best.x - centerRef.current) ? ex : best,
    );
    return Math.min(MAX_C, Math.max(MIN_C, near.x));
  };

  /** 下のバーに出す案内 */
  const action = focusNpc
    ? {
        label: `${getCharacter(focusNpc.characterId)?.name}に話しかける`,
        run: () => open({ kind: 'talk', scenarioId: focusNpc.scenarioId }),
      }
    : focusPuzzle
      ? {
          label: state.solvedPuzzles.includes(focusPuzzle.puzzleId)
            ? '解いたナゾを見直す'
            : 'ナゾに挑戦する',
          run: () => open({ kind: 'puzzle', puzzleId: focusPuzzle.puzzleId }),
        }
      : null;

  return (
    <div
      className={`street${grabbing ? ' street--grabbing' : ''}${
        frozen ? ' street--frozen' : ''
      }`}
    >
      <StreetScene bg={street.bg} cameraT={cameraT} surface={surface}>
        {/* 立っている人 */}
        {npcs.map((npc) => {
          const ch = getCharacter(npc.characterId);
          if (!ch) return null;
          const talked = state.clearedScenarios.includes(npc.scenarioId);
          const isMain = getScenario(npc.scenarioId)?.kind === 'main';
          return (
            <button
              key={npc.id}
              type="button"
              className={`walker walker--npc${talked ? ' walker--talked' : ''}`}
              style={
                {
                  left: `${npc.x * 100}%`,
                  '--walker-scale': ch.scale ?? 1,
                } as React.CSSProperties
              }
              onClick={() => open({ kind: 'talk', scenarioId: npc.scenarioId })}
              title={`${ch.name}に話しかける`}
            >
              <span className="walker__tag">
                <i className="walker__mark" aria-hidden="true">
                  {talked ? '✓' : isMain ? '！' : '？'}
                </i>
                {ch.name}
              </span>
              <CharacterArt character={ch} pose="normal" className="walker__art" />
            </button>
          );
        })}

        {/* 置かれているナゾ */}
        {street.puzzles.map((sp: StreetPuzzle) => {
          const pz = getPuzzle(sp.puzzleId);
          const solved = state.solvedPuzzles.includes(sp.puzzleId);
          const found = state.foundPuzzles.includes(sp.puzzleId);
          return (
            <button
              key={sp.id}
              type="button"
              className={`streetpuzzle${solved ? ' streetpuzzle--solved' : ''}`}
              style={{ left: `${sp.x * 100}%` }}
              onClick={() => open({ kind: 'puzzle', puzzleId: sp.puzzleId })}
              title={solved ? '解いたナゾ' : 'ナゾ！'}
            >
              <span className="streetpuzzle__tag">
                <i className="streetpuzzle__mark" aria-hidden="true">
                  {solved ? '✓' : 'ナ'}
                </i>
                {found && pz ? pz.title : 'ナゾ'}
              </span>
              <PuzzleObject look={sp.look} solved={solved} />
            </button>
          );
        })}
        {/* 行き先の矢印（靴のアイコンを押しているあいだだけ出す） */}
        {moveMode &&
          exits.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className={`exit exit--${ex.dir}${ex.open ? '' : ' exit--locked'}`}
              style={{ left: `${ex.x * 100}%`, top: `${ex.y * 100}%` }}
              disabled={!ex.open}
              title={ex.open ? `${ex.name}へ移動する` : 'まだ行けない'}
              onClick={() => open({ kind: 'move', streetId: ex.to })}
            >
              <svg viewBox="0 0 40 34" className="exit__arrow" aria-hidden="true">
                <path
                  d="M20 2 L37 30 L3 30 Z"
                  transform={`rotate(${ARROW_ROTATION[ex.dir]} 20 18)`}
                />
              </svg>
              <span className="exit__label">
                <em>{ARROW_LABEL[ex.dir]}</em>
                {ex.open ? ex.name : '？？？'}
              </span>
            </button>
          ))}

        {/* 落ちているキラキラ */}
        {sparkles.map((sp) => (
          <button
            key={sp.id}
            type="button"
            className="sparkle"
            style={{ left: `${sp.x * 100}%`, top: `${sp.y * 100}%` }}
            aria-label="光るものを拾う"
            title="何か落ちている"
            onClick={() => pickUp(sp.itemId)}
          >
            <svg viewBox="0 0 24 24" className="sparkle__glow" aria-hidden="true">
              <path
                d="M12 1 L14 9 L22 12 L14 15 L12 23 L10 15 L2 12 L10 9 Z"
                fill="#fff3c4"
              />
              <path
                d="M12 5 L13.1 10.9 L19 12 L13.1 13.1 L12 19 L10.9 13.1 L5 12 L10.9 10.9 Z"
                fill="#f7d774"
              />
            </svg>
          </button>
        ))}
      </StreetScene>

      {/* 画面のまんなかをさす目じるし */}
      <div
        className={`street__sight${action ? ' street__sight--on' : ''}`}
        aria-hidden="true"
      />

      {/* 下部：見わたす操作 */}
      <div className="street__controls">
        <button
          type="button"
          className="street__walk"
          aria-label="左を見る"
          {...hold(-1)}
        >
          ◀
        </button>
        <button
          type="button"
          className="street__walk"
          aria-label="右を見る"
          {...hold(1)}
        >
          ▶
        </button>

        {moveMode ? (
          <p className="street__tip street__tip--move">
            三角の矢印を押すと、その方向の場所へ移る。
          </p>
        ) : action ? (
          <button type="button" className="street__talk" onClick={action.run}>
            {action.label}
          </button>
        ) : (
          <p className="street__tip">
            ◀ ▶ かドラッグで道を見わたす。人やナゾをクリックすると中に入れる。
          </p>
        )}

        <button
          type="button"
          className={`street__shoe${moveMode ? ' street__shoe--on' : ''}`}
          aria-pressed={moveMode}
          title={moveMode ? '移動をやめる' : '別の場所へ移動する'}
          onClick={() => {
            playSe('click');
            const next = !moveMode;
            setMoveMode(next);
            glide.current = next ? nearestExitCenter() : null;
          }}
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
      </div>

      {/* 出入りのフェード */}
      <div
        className={`street__fade${pending || entering ? ' street__fade--on' : ''}`}
        aria-hidden="true"
      />
    </div>
  );
}
