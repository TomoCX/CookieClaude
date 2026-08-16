import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameState, Scene } from '../types';
import { getCharacter } from '../data/characters';
import { getArea } from '../data/areas';
import { getPuzzle } from '../data/puzzles';
import { getScene } from '../data/scenes';
import { getScenario } from '../data/scenarios';
import { StreetBackdrop } from '../components/StreetBackdrop';
import { ViewBackdrop } from '../components/ViewBackdrop';
import { EffectLayer } from '../components/EffectLayer';
import {
  ExitArrow,
  NpcMarker,
  PuzzleMarker,
  ShoeButton,
  SparkleMarker,
} from '../components/SceneActors';
import { VIEW, clampCenter, useSceneCamera } from '../hooks/useSceneCamera';
import { DevProbe } from '../dev/DevProbe';
import { playSe } from '../audio/audio';

/** 画面のまんなか近くとみなす距離（street のみ） */
const FOCUS_RANGE = 0.075;

/** 見わたしに使うキーと、その向き */
const PAN_KEYS: Record<string, 1 | -1> = {
  ArrowLeft: -1,
  a: -1,
  ArrowRight: 1,
  d: 1,
};
/** フェードにかける時間（ミリ秒）。CSS の scene__fade とそろえる。 */
const FADE_MS = 380;

/** クリックしたものをどう開くか */
type Pending =
  | { kind: 'talk'; scenarioId: string }
  | { kind: 'puzzle'; puzzleId: string }
  | { kind: 'move'; sceneId: string };

/** 画面のまんなかに来ているもの。下のバーの案内にも使う。 */
type Focus = (Pending & { kind: 'talk' | 'puzzle' }) & { label: string };

interface Props {
  scene: Scene;
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
  /** 隣のシーンへ移った */
  onGoTo: (sceneId: string) => void;
  /** 地図などがかぶさっている間は操作を受けつけない */
  frozen?: boolean;
}

/**
 * シーン画面。遊びの土台になる画面。
 *
 * 背景 1 枚に 1 つ対応し、種類（kind）で見せかたが変わる。
 * - street  … 3 層のパララックスを横に見わたす。出口は靴を押したときだけ出る
 * - view / closeup … 一枚絵。見わたさないので、出口は常に出しておく
 *
 * カメラの動かしかたは `useSceneCamera`、
 * 上に置く部品は `components/SceneActors` にまとめてある。
 */
export function SceneScreen({
  scene,
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
  /** 靴のアイコンで出す、行き先の矢印を表示しているか（street のみ） */
  const [moveMode, setMoveMode] = useState(false);
  /** いま押されている見わたしのキー */
  const heldKeys = useRef(new Set<string>());

  /** 見わたすシーンかどうか。ここから下の分かれ道はすべてこれで決まる。 */
  const walkable = scene.kind === 'street';

  const cam = useSceneCamera({
    enabled: walkable,
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
      scene.npcs.filter(
        (n) => !n.requiresScenario || state.clearedScenarios.includes(n.requiresScenario),
      ),
    [scene.npcs, state.clearedScenarios],
  );

  /** まだ拾っていないキラキラだけを出す */
  const sparkles = useMemo(
    () => scene.sparkles.filter((sp) => !state.collected.some((c) => c.itemId === sp.itemId)),
    [scene.sparkles, state.collected],
  );

  /** 隣のシーンへの出口。行き先の名前と、いま行けるかどうかを添える。 */
  const exits = useMemo(
    () =>
      scene.exits.map((ex) => {
        const dest = getScene(ex.to);
        const area = dest ? getArea(dest.areaId) : undefined;
        // 同じエリアの中で移るだけなら、エリア名ではなくシーン名のほうが分かりやすい
        const sameArea = dest?.areaId === scene.areaId;
        return {
          ...ex,
          name: (sameArea ? dest?.name : area?.name) ?? '？？？',
          // エリアをまたぐときだけ、その行き先が開いているかを見る
          open: sameArea ? true : area != null && state.openAreas.includes(area.id),
        };
      }),
    [scene.exits, scene.areaId, state.openAreas],
  );

  /** その位置で正面に来ているものを探す。人のほうがナゾより優先。 */
  const focusAt = useCallback(
    (c: number): Focus | null => {
      if (!walkable) return null;
      const npc = npcs.find((v) => Math.abs(v.x - c) < FOCUS_RANGE);
      if (npc) {
        const name = getCharacter(npc.characterId)?.name ?? '相手';
        return { kind: 'talk', scenarioId: npc.scenarioId, label: `${name}に話しかける` };
      }
      const spot = scene.puzzles.find((v) => Math.abs(v.x - c) < FOCUS_RANGE);
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
    [walkable, npcs, scene.puzzles, state.solvedPuzzles],
  );

  // カメラのうち、描きなおしても変わらない部分だけを取りだす。
  // これを依存に使うと、毎コマ handler を作りなおさずに済む。
  const { setHeld, dragged, centerRef } = cam;

  /** クリックしたらフェードしてから画面を切りかえる */
  const open = useCallback(
    (next: Pending) => {
      // ドラッグの終わりに出る click は無視する
      if (pending || dragged.current || frozen) return;
      setHeld(0);
      playSe('fade');
      setPending(next);
      setTimeout(() => {
        if (next.kind === 'talk') onTalk(next.scenarioId);
        else if (next.kind === 'puzzle') onOpenPuzzle(next.puzzleId);
        else onGoTo(next.sceneId);
      }, FADE_MS);
    },
    [pending, dragged, setHeld, onTalk, onOpenPuzzle, onGoTo, frozen],
  );

  /** キラキラを押した。ドラッグの流れで押されたものは無視する。 */
  const pickUp = (itemId: string) => {
    if (pending || dragged.current || frozen) return;
    playSe('coin');
    onPickup(itemId);
  };

  /**
   * キーボード操作（見わたすシーンだけ）。
   *
   * 向きは「いま押されているキー」から毎回引き直す。
   * 押した順に上書きするだけだと、右を押しっぱなしで左を叩いて離したときに
   * 右まで止まってしまう。左右を同時に押しているあいだは、打ち消しあって止まる。
   */
  useEffect(() => {
    if (!walkable) return;
    const keys = heldKeys.current;
    const apply = () => {
      let dir = 0;
      for (const key of keys) dir += PAN_KEYS[key] ?? 0;
      setHeld(Math.sign(dir) as 1 | 0 | -1);
    };
    const down = (e: KeyboardEvent) => {
      if (frozen) return;
      if (e.key in PAN_KEYS) {
        keys.add(e.key);
        apply();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const target = focusAt(centerRef.current);
        if (target) open(target);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (keys.delete(e.key)) apply();
    };
    /** 窓から離れているあいだの keyup は届かないので、押しっぱなしを解いておく */
    const release = () => {
      keys.clear();
      apply();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', release);
    };
  }, [walkable, setHeld, centerRef, focusAt, open, frozen]);

  /**
   * 靴を押したときに寄せる先。
   * すでに出口が見えていれば動かさず、見えていなければ
   * いちばん近い出口が画面に入る位置を返す。
   */
  const nearestExitCenter = (): number | null => {
    const here = centerRef.current;
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

  /** 出口の矢印を出すか。見わたさないシーンでは隠す理由がないので常に出す。 */
  const showExits = walkable ? moveMode : true;

  /**
   * 画面のまんなかに来ているもの。
   * 人は姿と名札で押せると分かるので、下のバーには出さない。
   * 物体のほうは見ただけでは押せると分かりにくいので、ボタンを出す。
   */
  const focus = focusAt(cam.center);
  const action = focus?.kind === 'puzzle' ? focus : null;

  /** 背景の上に並べるもの。street でも view でも中身は同じ。 */
  const actors = (
    <>
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
            fixedY={walkable ? undefined : npc.y}
            onClick={() => open({ kind: 'talk', scenarioId: npc.scenarioId })}
          />
        );
      })}

      {scene.puzzles.map((spot) => {
        const found = state.foundPuzzles.includes(spot.puzzleId);
        return (
          <PuzzleMarker
            key={spot.id}
            spot={spot}
            title={(found && getPuzzle(spot.puzzleId)?.title) || 'ナゾ'}
            solved={state.solvedPuzzles.includes(spot.puzzleId)}
            fixedY={walkable ? undefined : spot.y}
            onClick={() => open({ kind: 'puzzle', puzzleId: spot.puzzleId })}
          />
        );
      })}

      {showExits &&
        exits.map((ex) => (
          <ExitArrow
            key={ex.id}
            dir={ex.dir}
            x={ex.x}
            y={ex.y}
            name={ex.name}
            open={ex.open}
            onClick={() => open({ kind: 'move', sceneId: ex.to })}
          />
        ))}

      {sparkles.map((sp) => (
        <SparkleMarker key={sp.id} x={sp.x} y={sp.y} onClick={() => pickUp(sp.itemId)} />
      ))}
    </>
  );

  return (
    <div
      className={`scene scene--${scene.kind}${cam.grabbing ? ' scene--grabbing' : ''}${
        frozen ? ' scene--frozen' : ''
      }`}
    >
      {scene.kind === 'street' ? (
        <StreetBackdrop
          bg={scene.bg}
          cameraT={cam.cameraT}
          surface={cam.surface}
          back={<EffectLayer slot="scene.back" cameraT={cam.cameraT} sceneKind={scene.kind} />}
        >
          {actors}
        </StreetBackdrop>
      ) : (
        <ViewBackdrop backdrop={scene.backdrop} kind={scene.kind}>
          {actors}
        </ViewBackdrop>
      )}

      {/* 手前のエフェクト。操作の当たり判定は持たない。 */}
      <EffectLayer slot="scene.front" cameraT={cam.cameraT} sceneKind={scene.kind} />

      {/* 開発者モードの置き場所どうぐ（ふだんは何も描かない） */}
      <DevProbe
        scene={scene}
        center={walkable ? cam.center : 0.5}
        view={walkable ? VIEW : 1}
      />

      {/* 画面のまんなかをさす目じるし。下のボタンと連動させる。 */}
      {walkable && (
        <div
          className={`scene__sight${action ? ' scene__sight--on' : ''}`}
          aria-hidden="true"
        />
      )}

      {/* 下部：操作 */}
      <div className="scene__controls">
        {walkable && (
          <>
            <button
              type="button"
              className="scene__walk"
              aria-label="左を見る"
              {...cam.hold(-1)}
            >
              ◀
            </button>
            <button
              type="button"
              className="scene__walk"
              aria-label="右を見る"
              {...cam.hold(1)}
            >
              ▶
            </button>
          </>
        )}

        {!walkable ? (
          <p className="scene__tip scene__tip--move">
            {scene.name}。矢印を押すと、もとの場所へもどる。
          </p>
        ) : moveMode ? (
          <p className="scene__tip scene__tip--move">
            三角の矢印を押すと、その方向の場所へ移る。
          </p>
        ) : action ? (
          <button type="button" className="scene__talk" onClick={() => open(action)}>
            {action.label}
          </button>
        ) : (
          <p className="scene__tip">
            ◀ ▶ かドラッグで道を見わたす。人やナゾをクリックすると中に入れる。
          </p>
        )}

        {walkable && <ShoeButton on={moveMode} onClick={toggleMoveMode} />}
      </div>

      {/* 出入りのフェード */}
      <div
        className={`scene__fade${pending || entering ? ' scene__fade--on' : ''}`}
        aria-hidden="true"
      />
    </div>
  );
}
