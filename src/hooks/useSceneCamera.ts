import { useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, PointerEvent as ReactPointerEvent } from 'react';

/**
 * street シーンのカメラ。
 *
 * 道を見わたす画面は「道の 0〜1 のどこを見ているか」だけで表せる。
 * その一点を、次の三つの入力から動かす。
 *
 * - ◀ ▶ の押しっぱなしとキーボード（`hold` / `setHeld`）
 * - 画面のドラッグ（`surface`）
 * - 靴を押したときの自動寄せ（`glideTo`）
 *
 * 三つが競合しないよう、毎フレームひとつのループでまとめて動かす。
 * 押しっぱなしがいちばん強く、動かしはじめた時点で自動寄せは打ち切る。
 */

/** 1 秒あたりにカメラが進む道の割合 */
const PAN_SPEED = 0.3;
/** 画面に見えている道の幅（手前の層の 1/3） */
export const VIEW = 1 / 3;
/** カメラのまんなかが動ける範囲 */
export const MIN_C = VIEW / 2;
export const MAX_C = 1 - VIEW / 2;
/** これ以上指が動いたら、クリックではなくドラッグとみなす */
const DRAG_SLOP = 5;
/** 靴を押したとき、行き先へカメラを寄せる速さ（1 秒あたりの道の割合） */
const GLIDE_SPEED = 0.9;
/** 自動寄せを打ち切ってよいとみなす、残りの距離 */
const GLIDE_EPSILON = 0.004;

/** 道の中に収まるよう、カメラ位置を丸める */
export function clampCenter(x: number): number {
  return Math.min(MAX_C, Math.max(MIN_C, x));
}

export interface SceneCamera {
  /** いま見ている道の位置（MIN_C〜MAX_C） */
  center: number;
  /** 背景の層をずらすための 0〜1 */
  cameraT: number;
  /** 描画を挟まずに読める、いまのカメラ位置 */
  centerRef: React.RefObject<number>;
  /** つかんで見わたしている最中か */
  grabbing: boolean;
  /** 直前の操作がドラッグだったか。クリックを打ち消すのに使う。 */
  dragged: React.RefObject<boolean>;
  /** シーンの地の部分に広げる、ドラッグ用の handler */
  surface: HTMLAttributes<HTMLDivElement>;
  /** ◀ ▶ ボタン用の handler */
  hold: (dir: 1 | -1) => HTMLAttributes<HTMLButtonElement>;
  /** キーボードから見わたす向きを指示する（0 で停止） */
  setHeld: (dir: 1 | 0 | -1) => void;
  /** その向きで見わたしている最中なら止める（キーを離したとき用） */
  releaseHeld: (dir: 1 | -1) => void;
  /** その位置へなめらかに寄せる。null で取りやめ。 */
  glideTo: (x: number | null) => void;
}

interface Options {
  /** 入ってきたときのカメラ位置 */
  initialX: number;
  /** カメラが動くたびに知らせる */
  onMove: (x: number) => void;
  /** 地図などがかぶさっている間は操作を受けつけない */
  frozen: boolean;
  /** フェード中など、ドラッグを始めさせたくないとき */
  locked: boolean;
}

export function useSceneCamera({
  initialX,
  onMove,
  frozen,
  locked,
}: Options): SceneCamera {
  const [center, setCenter] = useState(() => clampCenter(initialX));
  const [grabbing, setGrabbing] = useState(false);
  /** ◀ ▶ で押されている向き */
  const held = useRef(0);
  const centerRef = useRef(center);
  const glide = useRef<number | null>(null);
  /** ドラッグ中の指の情報 */
  const drag = useRef<{ id: number; fromX: number; fromCenter: number } | null>(null);
  const dragged = useRef(false);

  // 再描画のたびに ループを 組みなおさずに済むよう、ref 越しに 最新を 見る
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const panTo = (next: number) => {
    const clamped = clampCenter(next);
    centerRef.current = clamped;
    setCenter(clamped);
    onMoveRef.current(clamped);
  };
  const panRef = useRef(panTo);
  panRef.current = panTo;

  /** 見わたしのループ。押しっぱなしと自動寄せの両方をここで進める。 */
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      if (held.current !== 0) {
        glide.current = null;
        panRef.current(centerRef.current + held.current * PAN_SPEED * dt);
      } else if (glide.current !== null) {
        const to = glide.current;
        const gap = to - centerRef.current;
        if (Math.abs(gap) < GLIDE_EPSILON) {
          glide.current = null;
          panRef.current(to);
        } else {
          panRef.current(
            centerRef.current + Math.sign(gap) * Math.min(GLIDE_SPEED * dt, Math.abs(gap)),
          );
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const surface: HTMLAttributes<HTMLDivElement> = {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || locked || frozen) return;
      // ここでは まだ setPointerCapture しない。
      // 押した時点で捕まえると click の宛先を奪ってしまい、
      // 人やナゾのボタンが押せなくなる。
      drag.current = { id: e.pointerId, fromX: e.clientX, fromCenter: centerRef.current };
      dragged.current = false;
      held.current = 0;
      glide.current = null;
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
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
      // 指の動きと景色が 1 対 1 になるよう、画面幅 ＝ 見えている道幅（VIEW）で換算する
      panRef.current(d.fromCenter - (dx / width) * VIEW);
    },
    onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (drag.current?.id !== e.pointerId) return;
      drag.current = null;
      setGrabbing(false);
    },
    onPointerCancel: () => {
      drag.current = null;
      setGrabbing(false);
    },
  };

  return {
    center,
    cameraT: (center - MIN_C) / (MAX_C - MIN_C),
    centerRef,
    grabbing,
    dragged,
    surface,
    hold: (dir) => ({
      onPointerDown: () => {
        held.current = dir;
      },
      onPointerUp: () => {
        held.current = 0;
      },
      onPointerLeave: () => {
        held.current = 0;
      },
    }),
    setHeld: (dir) => {
      held.current = dir;
    },
    releaseHeld: (dir) => {
      // 左右を同時に押して片方だけ離したとき、残った側を止めてしまわないように
      if (held.current === dir) held.current = 0;
    },
    glideTo: (x) => {
      glide.current = x;
    },
  };
}
