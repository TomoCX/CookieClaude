import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameState, Street, StreetPuzzle } from '../types';
import { getCharacter } from '../data/characters';
import { getPlace } from '../data/places';
import { getPuzzle } from '../data/puzzles';
import { getScenario } from '../data/scenarios';
import { CharacterArt } from '../components/CharacterSprite';
import { StreetScene } from '../components/StreetScene';
import { PuzzleObject } from '../components/PuzzleObject';
import { playSe } from '../audio/audio';

/** 1 秒あたりに カメラが 進む道の割合 */
const PAN_SPEED = 0.3;
/** 画面に見えている道の幅（手前の層の 1/3） */
const VIEW = 1 / 3;
/** 画面の まんなか近くと みなす距離 */
const FOCUS_RANGE = 0.075;
/** カメラの まんなかが 動ける範囲 */
const MIN_C = VIEW / 2;
const MAX_C = 1 - VIEW / 2;
/** フェードにかける時間（ミリ秒）。CSS の street__fade と そろえる。 */
const FADE_MS = 380;

/** クリックしたものを どう開くか */
type Pending =
  | { kind: 'talk'; scenarioId: string }
  | { kind: 'puzzle'; puzzleId: string };

interface Props {
  street: Street;
  state: GameState;
  /** 入ってきたときの カメラ位置（会話から戻ったときは そのつづきから） */
  initialX: number;
  /** カメラが 動くたびに 知らせる */
  onMove: (x: number) => void;
  /** 人に話しかけた */
  onTalk: (scenarioId: string) => void;
  /** ナゾを 開いた */
  onOpenPuzzle: (puzzleId: string) => void;
  /** マップへ戻る */
  onBackToMap: () => void;
  /** 右上ボタン: メニュー画面 */
  onOpenMenu: () => void;
  /** 右下ボタン: メインメニュー */
  onOpenMainMenu: () => void;
}

/**
 * 街並み画面。
 * カメラ＝クロードたちの目線なので、画面に 自分の姿は 出さない。
 * ◀ ▶ で 道を見わたし、人や ナゾを クリックすると フェードして その画面へ入る。
 */
export function StreetScreen({
  street,
  state,
  initialX,
  onMove,
  onTalk,
  onOpenPuzzle,
  onBackToMap,
  onOpenMenu,
  onOpenMainMenu,
}: Props) {
  const [center, setCenter] = useState(() =>
    Math.min(MAX_C, Math.max(MIN_C, initialX)),
  );
  /** これから 開くもの。入っているあいだ 画面を 暗くする。 */
  const [pending, setPending] = useState<Pending | null>(null);
  /** 入ってきた直後の 明るくなる演出 */
  const [entering, setEntering] = useState(true);
  /** ◀ ▶ で 押されている向き */
  const held = useRef(0);
  const centerRef = useRef(center);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const place = getPlace(street.placeId);

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

  /** クリックしたら フェードしてから 画面を 切りかえる */
  const open = useCallback(
    (next: Pending) => {
      if (pending) return;
      held.current = 0;
      playSe('fade');
      setPending(next);
      setTimeout(() => {
        if (next.kind === 'talk') onTalk(next.scenarioId);
        else onOpenPuzzle(next.puzzleId);
      }, FADE_MS);
    },
    [pending, onTalk, onOpenPuzzle],
  );

  /** カメラを 動かす */
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

  /** 画面の まんなかに 来ているもの */
  const focusNpc = npcs.find((n) => Math.abs(n.x - center) < FOCUS_RANGE);
  const focusPuzzle = street.puzzles.find((p) => Math.abs(p.x - center) < FOCUS_RANGE);

  /** キーボード操作 */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
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
      } else if (e.key === 'Escape') onBackToMap();
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
  }, [npcs, street.puzzles, open, onBackToMap]);

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

  /** 下のバーに 出す案内 */
  const action = focusNpc
    ? {
        label: `${getCharacter(focusNpc.characterId)?.name}に 話しかける`,
        run: () => open({ kind: 'talk', scenarioId: focusNpc.scenarioId }),
      }
    : focusPuzzle
      ? {
          label: state.solvedPuzzles.includes(focusPuzzle.puzzleId)
            ? 'といた ナゾを 見なおす'
            : 'ナゾに ちょうせんする',
          run: () => open({ kind: 'puzzle', puzzleId: focusPuzzle.puzzleId }),
        }
      : null;

  return (
    <div className="street">
      <StreetScene bg={street.bg} cameraT={cameraT}>
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
              title={`${ch.name}に 話しかける`}
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

        {/* 置かれている ナゾ */}
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
              title={solved ? 'といた ナゾ' : 'ナゾ！'}
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
      </StreetScene>

      {/* 画面の まんなかを さす目じるし */}
      <div
        className={`street__sight${action ? ' street__sight--on' : ''}`}
        aria-hidden="true"
      />

      {/* 上部バー */}
      <div className="street__topbar">
        <button type="button" className="iconbtn" onClick={onBackToMap} title="マップへ">
          ↰
        </button>
        <span className="street__place">{place?.name}</span>
      </div>

      {/* 右上：メニュー画面へ */}
      <button
        type="button"
        className="main__corner main__corner--tr"
        onClick={onOpenMenu}
        title="メニュー画面へ"
      >
        <span className="main__corner-icon" aria-hidden="true">
          ⚙
        </span>
        <span className="main__corner-label">メニュー</span>
      </button>

      {/* 右下：メインメニューへ */}
      <button
        type="button"
        className="main__corner main__corner--br"
        onClick={onOpenMainMenu}
        title="メインメニューへ"
      >
        <span className="main__corner-icon" aria-hidden="true">
          🧳
        </span>
        <span className="main__corner-label">メインメニュー</span>
      </button>

      {/* 下部：見わたす操作 */}
      <div className="street__controls">
        <button
          type="button"
          className="street__walk"
          aria-label="左を 見る"
          {...hold(-1)}
        >
          ◀
        </button>
        <button
          type="button"
          className="street__walk"
          aria-label="右を 見る"
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
            ◀ ▶ で 道を 見わたす。人や ナゾを クリックすると 中に 入れる。
          </p>
        )}
      </div>

      {/* 出入りの フェード */}
      <div
        className={`street__fade${pending || entering ? ' street__fade--on' : ''}`}
        aria-hidden="true"
      />
    </div>
  );
}
