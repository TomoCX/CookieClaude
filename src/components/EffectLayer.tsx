import { useEffect, useRef, useState } from 'react';
import type { EffectSketch, EffectSlot } from '../types';
import { activeEffects, effectStrength, subscribeEffects } from '../effects/runtime';

/** 一コマで進める時間の上限（タブを戻したときに飛ばないように） */
const MAX_DT = 0.05;
/** 高解像度の画面でも描く量が増えすぎないよう、倍率に頭打ちをつける */
const MAX_DPR = 2;

interface Props {
  slot: EffectSlot;
  /** 街並みのカメラ位置（0〜1）。奥行きのあるエフェクトが使う。 */
  cameraT?: number;
}

/**
 * エフェクトを描く場所。
 *
 * 画面のどこかに一枚置いておくと、その場所（slot）に登録されたエフェクトが
 * まとめて動く。クリックは通りぬけるので、上に重ねても操作の邪魔にならない。
 *
 * エフェクトそのものは `src/effects/` にあり、この部品は
 * 「大きさ・時間・指の位置を渡して、毎コマ呼ぶ」だけを受けもつ。
 */
export function EffectLayer({ slot, cameraT = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** 毎コマ読むだけなので、描きなおしを起こさないよう ref で渡す */
  const cameraRef = useRef(cameraT);
  cameraRef.current = cameraT;
  /** 入り切りが変わったら、絵筆を組みなおす合図 */
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeEffects(() => setRevision((v) => v + 1)), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const sketches: EffectSketch[] = activeEffects(slot).map((e) => e.create());
    if (sketches.length === 0) {
      // 最後の一つを切ったときは、描き終わったコマが残ってしまう。
      // ループを回さないので、ここで一度だけ消しておく。
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let width = 0;
    let height = 0;

    /** 見た目の大きさに合わせて、canvas の目を細かくしなおす */
    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      // 以降は CSS ピクセルで描けるようにしておく
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const s of sketches) s.setup?.({ width, height });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas);

    /** 指の位置。canvas は当たり判定を持たないので、窓ぜんたいから拾う。 */
    let pointer: { x: number; y: number } | null = null;
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      pointer = x < -0.2 || x > 1.2 || y < -0.2 || y > 1.2 ? null : { x, y };
    };
    const onPointerOut = () => {
      pointer = null;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerOut);

    let raf = 0;
    let prev = performance.now();
    let time = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - prev) / 1000, MAX_DT);
      prev = now;
      if (width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);
      const strength = effectStrength();
      // 設定で切っているときは、消したまま何も描かない
      if (strength <= 0) return;

      time += dt;
      const frame = {
        ctx,
        width,
        height,
        time,
        dt,
        pointer,
        strength,
        cameraT: cameraRef.current,
      };
      for (const s of sketches) {
        // 一つが状態を変えても、次のものに持ちこさない
        ctx.save();
        s.draw(frame);
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      document.removeEventListener('pointerleave', onPointerOut);
      for (const s of sketches) s.teardown?.();
    };
  }, [slot, revision]);

  return <canvas ref={canvasRef} className="fx" aria-hidden="true" />;
}
