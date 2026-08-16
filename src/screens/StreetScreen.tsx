import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameState, Street, StreetPuzzle } from '../types';
import { getCharacter } from '../data/characters';
import { getPuzzle } from '../data/puzzles';
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

/** クリックしたものをどう開くか */
type Pending =
  | { kind: 'talk'; scenarioId: string }
  | { kind: 'puzzle'; puzzleId: string };

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
        else onOpenPuzzle(next.puzzleId);
      }, FADE_MS);
    },
    [pending, onTalk, onOpenPuzzle, frozen],
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
        panRef.current(centerRef.current + held.current * PAN_SPEED * dt);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

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

        {action ? (
          <button type="button" className="street__talk" onClick={action.run}>
            {action.label}
          </button>
        ) : (
          <p className="street__tip">
            ◀ ▶ かドラッグで道を見わたす。人やナゾをクリックすると中に入れる。
          </p>
        )}
      </div>

      {/* 出入りのフェード */}
      <div
        className={`street__fade${pending || entering ? ' street__fade--on' : ''}`}
        aria-hidden="true"
      />
    </div>
  );
}
