import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameState, Npc, Street } from '../types';
import { getCharacter } from '../data/characters';
import { getPlace } from '../data/places';
import { getScenario } from '../data/scenarios';
import { CharacterArt } from '../components/CharacterSprite';
import { StreetScene } from '../components/StreetScene';

/** 1 秒あたりに進む道の割合 */
const WALK_SPEED = 0.32;
/** 画面に見えている道の幅（手前の層の 1/3） */
const VIEW = 1 / 3;
/** 話しかけられる距離 */
const TALK_RANGE = 0.06;
/** 相手に かさならないよう、少し手前で 立ち止まる */
const APPROACH_GAP = 0.045;
/** 歩ける範囲 */
const MIN_X = 0.03;
const MAX_X = 0.97;

interface Props {
  street: Street;
  state: GameState;
  /** 人に話しかけた */
  onTalk: (scenarioId: string) => void;
  /** マップへ戻る */
  onBackToMap: () => void;
  /** 右上ボタン: メニュー画面 */
  onOpenMenu: () => void;
  /** 右下ボタン: メインメニュー */
  onOpenMainMenu: () => void;
}

/**
 * 街並み画面。左右に歩いて道を進み、立っている人をクリックすると会話が始まる。
 * クリックした相手の所まで歩いてから 話しかける。
 */
export function StreetScreen({
  street,
  state,
  onTalk,
  onBackToMap,
  onOpenMenu,
  onOpenMainMenu,
}: Props) {
  const [x, setX] = useState(street.startX);
  const [facing, setFacing] = useState<1 | -1>(1);
  /** 歩いていく目的地。null なら 手動操作 */
  const [target, setTarget] = useState<{ x: number; npcId: string } | null>(null);
  /** ← → で押されている向き */
  const held = useRef(0);
  const xRef = useRef(x);
  xRef.current = x;
  const targetRef = useRef(target);
  targetRef.current = target;

  const place = getPlace(street.placeId);

  /** いま現れている人だけを描く */
  const npcs = useMemo(
    () =>
      street.npcs.filter(
        (n) => !n.requiresScenario || state.clearedScenarios.includes(n.requiresScenario),
      ),
    [street.npcs, state.clearedScenarios],
  );

  /** 話しかけられる距離にいる人 */
  const nearby = npcs.find((n) => Math.abs(n.x - x) < TALK_RANGE);

  const startTalk = useCallback(
    (npc: Npc) => {
      held.current = 0;
      setTarget(null);
      onTalk(npc.scenarioId);
    },
    [onTalk],
  );

  /** 歩きのループ */
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      const tgt = targetRef.current;
      if (tgt) {
        const dx = tgt.x - xRef.current;
        const dist = Math.abs(dx);
        if (dist < 0.008) {
          // 着いたので 話しかける
          const npc = npcs.find((n) => n.id === tgt.npcId);
          setTarget(null);
          if (npc) startTalk(npc);
        } else {
          const dir = dx > 0 ? 1 : -1;
          setFacing(dir);
          setX((p) =>
            Math.min(MAX_X, Math.max(MIN_X, p + dir * Math.min(WALK_SPEED * dt, dist))),
          );
        }
      } else if (held.current !== 0) {
        const dir = held.current as 1 | -1;
        setFacing(dir);
        setX((p) => Math.min(MAX_X, Math.max(MIN_X, p + dir * WALK_SPEED * dt)));
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [npcs, startTalk]);

  /** キーボード操作 */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        held.current = -1;
        setTarget(null);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        held.current = 1;
        setTarget(null);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const n = npcs.find((v) => Math.abs(v.x - xRef.current) < TALK_RANGE);
        if (n) startTalk(n);
      } else if (e.key === 'Escape') {
        onBackToMap();
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
  }, [npcs, startTalk, onBackToMap]);

  // カメラは プレイヤーを 画面の中ほどに とどめる
  const cameraLeft = Math.min(Math.max(x - VIEW / 2, 0), 1 - VIEW);
  const cameraT = cameraLeft / (1 - VIEW);

  const claude = getCharacter('claude');
  const cookie = getCharacter('cookie');

  const hold = (dir: 1 | -1) => ({
    onPointerDown: () => {
      held.current = dir;
      setTarget(null);
    },
    onPointerUp: () => {
      held.current = 0;
    },
    onPointerLeave: () => {
      held.current = 0;
    },
  });

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
              style={{
                left: `${npc.x * 100}%`,
                '--walker-scale': ch.scale ?? 1,
              } as React.CSSProperties}
              onClick={() =>
                setTarget({
                  // 相手の 手前がわで 立ち止まる
                  x: npc.x + (xRef.current <= npc.x ? -APPROACH_GAP : APPROACH_GAP),
                  npcId: npc.id,
                })
              }
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

        {/* プレイヤー（クロードとクッキー） */}
        <div
          className="walker walker--player"
          style={{ left: `${x * 100}%`, transform: `translateX(-50%) scaleX(${facing})` }}
          aria-hidden="true"
        >
          {cookie && (
            <CharacterArt
              character={cookie}
              pose="normal"
              className="walker__art walker__art--behind"
            />
          )}
          {claude && (
            <CharacterArt character={claude} pose="normal" className="walker__art" />
          )}
        </div>
      </StreetScene>

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

      {/* 下部：歩く操作と 話しかけるボタン */}
      <div className="street__controls">
        <button
          type="button"
          className="street__walk"
          aria-label="左へ 歩く"
          {...hold(-1)}
        >
          ◀
        </button>
        <button
          type="button"
          className="street__walk"
          aria-label="右へ 歩く"
          {...hold(1)}
        >
          ▶
        </button>

        {nearby ? (
          <button
            type="button"
            className="street__talk"
            onClick={() => startTalk(nearby)}
          >
            {getCharacter(nearby.characterId)?.name}に 話しかける
          </button>
        ) : (
          <p className="street__tip">
            ◀ ▶ で 道を進む。人を クリックすると 話しかけられる。
          </p>
        )}
      </div>
    </div>
  );
}
