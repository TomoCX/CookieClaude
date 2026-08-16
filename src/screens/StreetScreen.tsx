import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GameState, Street } from '../types';
import { getCharacter } from '../data/characters';
import { getPlace } from '../data/places';
import { getPuzzle } from '../data/puzzles';
import { getStreet } from '../data/streets';
import { getScenario } from '../data/scenarios';
import { StreetScene } from '../components/StreetScene';
import {
  ExitArrow,
  NpcMarker,
  PuzzleMarker,
  ShoeButton,
  SparkleMarker,
} from '../components/StreetActors';
import { VIEW, clampCenter, useStreetCamera } from '../hooks/useStreetCamera';
import { playSe } from '../audio/audio';

/** 画面のまんなか近くとみなす距離 */
const FOCUS_RANGE = 0.075;
/** フェードにかける時間（ミリ秒）。CSS の street__fade とそろえる。 */
const FADE_MS = 380;

/** クリックしたものをどう開くか */
type Pending =
  | { kind: 'talk'; scenarioId: string }
  | { kind: 'puzzle'; puzzleId: string }
  | { kind: 'move'; streetId: string };

/** 画面のまんなかに来ているもの。下のバーの案内にも使う。 */
type Focus = (Pending & { kind: 'talk' | 'puzzle' }) & { label: string };

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
 * 右下の靴を押すと、隣の街並みへの矢印が出る。
 *
 * カメラの動かしかたは `useStreetCamera`、
 * 道の上に置く部品は `components/StreetActors` にまとめてある。
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
  /** これから開くもの。入っているあいだ画面を暗くする。 */
  const [pending, setPending] = useState<Pending | null>(null);
  /** 入ってきた直後の明るくなる演出 */
  const [entering, setEntering] = useState(true);
  /** 靴のアイコンで出す、行き先の矢印を表示しているか */
  const [moveMode, setMoveMode] = useState(false);

  const cam = useStreetCamera({
    initialX,
    onMove,
    frozen,
    locked: pending !== null,
  });

  useEffect(() => {
    const id = setTimeout(() => setEntering(false), FADE_MS);
    return () => clearTimeout(id);
  }, []);

  /** いま現れている人だけを描く */
  const npcs = useMemo(
    () =>
      street.npcs.filter(
        (n) => !n.requiresScenario || state.clearedScenarios.includes(n.requiresScenario),
      ),
    [street.npcs, state.clearedScenarios],
  );

  /** まだ拾っていないキラキラだけを出す */
  const sparkles = useMemo(
    () => street.sparkles.filter((sp) => !state.collected.some((c) => c.itemId === sp.itemId)),
    [street.sparkles, state.collected],
  );

  /** 隣の街並みへの出口。行き先の名前と、いま行けるかどうかを添える。 */
  const exits = useMemo(
    () =>
      street.exits.map((ex) => {
        const place = getPlace(getStreet(ex.to)?.placeId ?? '');
        return {
          ...ex,
          name: place?.name ?? '？？？',
          open: place ? state.openPlaces.includes(place.id) : false,
        };
      }),
    [street.exits, state.openPlaces],
  );

  /** その位置で正面に来ているものを探す。人のほうがナゾより優先。 */
  const focusAt = useCallback(
    (c: number): Focus | null => {
      const npc = npcs.find((v) => Math.abs(v.x - c) < FOCUS_RANGE);
      if (npc) {
        const name = getCharacter(npc.characterId)?.name ?? '相手';
        return { kind: 'talk', scenarioId: npc.scenarioId, label: `${name}に話しかける` };
      }
      const spot = street.puzzles.find((v) => Math.abs(v.x - c) < FOCUS_RANGE);
      if (spot) {
        return {
          kind: 'puzzle',
          puzzleId: spot.puzzleId,
          label: state.solvedPuzzles.includes(spot.puzzleId)
            ? '解いたナゾを見直す'
            : 'ナゾに挑戦する',
        };
      }
      return null;
    },
    [npcs, street.puzzles, state.solvedPuzzles],
  );

  /** クリックしたらフェードしてから画面を切りかえる */
  const open = useCallback(
    (next: Pending) => {
      // ドラッグの終わりに出る click は無視する
      if (pending || cam.dragged.current || frozen) return;
      cam.setHeld(0);
      playSe('fade');
      setPending(next);
      setTimeout(() => {
        if (next.kind === 'talk') onTalk(next.scenarioId);
        else if (next.kind === 'puzzle') onOpenPuzzle(next.puzzleId);
        else onGoTo(next.streetId);
      }, FADE_MS);
    },
    [pending, cam, onTalk, onOpenPuzzle, onGoTo, frozen],
  );

  /** キラキラを押した。ドラッグの流れで押されたものは無視する。 */
  const pickUp = (itemId: string) => {
    if (pending || cam.dragged.current || frozen) return;
    playSe('coin');
    onPickup(itemId);
  };

  /** キーボード操作 */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (frozen) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') cam.setHeld(-1);
      else if (e.key === 'ArrowRight' || e.key === 'd') cam.setHeld(1);
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const target = focusAt(cam.centerRef.current);
        if (target) open(target);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') cam.releaseHeld(-1);
      else if (e.key === 'ArrowRight' || e.key === 'd') cam.releaseHeld(1);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [cam, focusAt, open, frozen]);

  /**
   * 靴を押したときに寄せる先。
   * すでに出口が見えていれば動かさず、見えていなければ
   * いちばん近い出口が画面に入る位置を返す。
   */
  const nearestExitCenter = (): number | null => {
    const here = cam.centerRef.current;
    if (exits.length === 0) return null;
    const gap = (x: number) => Math.abs(x - here);
    // ぎりぎり端に写っているものを「見えている」と数えると寄せそこねるので、少し狭くみる
    if (exits.some((ex) => gap(ex.x) < (VIEW / 2) * 0.9)) return null;
    const near = exits.reduce((best, ex) => (gap(ex.x) < gap(best.x) ? ex : best));
    return clampCenter(near.x);
  };

  const toggleMoveMode = () => {
    playSe('click');
    const next = !moveMode;
    setMoveMode(next);
    cam.glideTo(next ? nearestExitCenter() : null);
  };

  /** 下のバーに出す案内 */
  const focus = focusAt(cam.center);

  return (
    <div
      className={`street${cam.grabbing ? ' street--grabbing' : ''}${
        frozen ? ' street--frozen' : ''
      }`}
    >
      <StreetScene bg={street.bg} cameraT={cam.cameraT} surface={cam.surface}>
        {/* 立っている人 */}
        {npcs.map((npc) => {
          const ch = getCharacter(npc.characterId);
          if (!ch) return null;
          return (
            <NpcMarker
              key={npc.id}
              npc={npc}
              character={ch}
              talked={state.clearedScenarios.includes(npc.scenarioId)}
              isMain={getScenario(npc.scenarioId)?.kind === 'main'}
              onClick={() => open({ kind: 'talk', scenarioId: npc.scenarioId })}
            />
          );
        })}

        {/* 置かれているナゾ */}
        {street.puzzles.map((spot) => {
          const found = state.foundPuzzles.includes(spot.puzzleId);
          return (
            <PuzzleMarker
              key={spot.id}
              spot={spot}
              title={(found && getPuzzle(spot.puzzleId)?.title) || 'ナゾ'}
              solved={state.solvedPuzzles.includes(spot.puzzleId)}
              onClick={() => open({ kind: 'puzzle', puzzleId: spot.puzzleId })}
            />
          );
        })}

        {/* 行き先の矢印（靴のアイコンを押しているあいだだけ出す） */}
        {moveMode &&
          exits.map((ex) => (
            <ExitArrow
              key={ex.id}
              dir={ex.dir}
              x={ex.x}
              y={ex.y}
              name={ex.name}
              open={ex.open}
              onClick={() => open({ kind: 'move', streetId: ex.to })}
            />
          ))}

        {/* 落ちているキラキラ */}
        {sparkles.map((sp) => (
          <SparkleMarker key={sp.id} x={sp.x} y={sp.y} onClick={() => pickUp(sp.itemId)} />
        ))}
      </StreetScene>

      {/* 画面のまんなかをさす目じるし */}
      <div
        className={`street__sight${focus ? ' street__sight--on' : ''}`}
        aria-hidden="true"
      />

      {/* 下部：見わたす操作 */}
      <div className="street__controls">
        <button type="button" className="street__walk" aria-label="左を見る" {...cam.hold(-1)}>
          ◀
        </button>
        <button type="button" className="street__walk" aria-label="右を見る" {...cam.hold(1)}>
          ▶
        </button>

        {moveMode ? (
          <p className="street__tip street__tip--move">
            三角の矢印を押すと、その方向の場所へ移る。
          </p>
        ) : focus ? (
          <button type="button" className="street__talk" onClick={() => open(focus)}>
            {focus.label}
          </button>
        ) : (
          <p className="street__tip">
            ◀ ▶ かドラッグで道を見わたす。人やナゾをクリックすると中に入れる。
          </p>
        )}

        <ShoeButton on={moveMode} onClick={toggleMoveMode} />
      </div>

      {/* 出入りのフェード */}
      <div
        className={`street__fade${pending || entering ? ' street__fade--on' : ''}`}
        aria-hidden="true"
      />
    </div>
  );
}
