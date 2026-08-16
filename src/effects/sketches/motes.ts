import type { EffectSketch } from '../../types';

/**
 * 陽だまりの塵。
 *
 * 街並みの奥にうっすら浮かべる。奥行きごとにカメラへの追従量を変えてあるので、
 * 道を見わたすと手前の粒ほど大きく流れる。
 */

/** 画面の広さ 1 万平方ピクセルあたりの粒の数 */
const DENSITY = 0.9;
const MAX_MOTES = 140;

interface Mote {
  /** 画面に対する位置（0〜1） */
  x: number;
  y: number;
  r: number;
  /** 明るさ */
  a: number;
  /** ゆっくり漂う速さ */
  vx: number;
  vy: number;
  /** ゆらぎの位相 */
  phase: number;
  /** 0（奥）〜1（手前）。カメラの追従量に使う。 */
  depth: number;
}

export function createMotes(): EffectSketch {
  let motes: Mote[] = [];

  return {
    setup({ width, height }) {
      const n = Math.min(MAX_MOTES, Math.round(((width * height) / 10000) * DENSITY));
      motes = Array.from({ length: n }, () => {
        const depth = Math.random();
        return {
          x: Math.random(),
          y: Math.random() * 0.85,
          r: 0.7 + depth * 2.2,
          a: 0.16 + Math.random() * 0.3,
          vx: (Math.random() - 0.5) * 0.012,
          vy: -0.004 - Math.random() * 0.012,
          phase: Math.random() * Math.PI * 2,
          depth,
        };
      });
    },

    draw({ ctx, width, height, time, dt, strength, cameraT }) {
      ctx.globalCompositeOperation = 'lighter';
      for (const m of motes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        // 上へ抜けたら下からもどす
        if (m.y < -0.05) {
          m.y = 0.9;
          m.x = Math.random();
        }
        if (m.x < -0.05) m.x = 1.05;
        if (m.x > 1.05) m.x = -0.05;

        // 見わたすと、手前の粒ほど大きく流れる
        const parallax = cameraT * 0.22 * (0.2 + m.depth);
        const sway = Math.sin(time * 0.6 + m.phase) * 0.006;
        const px = (m.x - parallax + sway) * width;
        const py = m.y * height;
        if (px < -8 || px > width + 8) continue;

        ctx.beginPath();
        ctx.arc(px, py, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 244, 206, ${m.a * strength})`;
        ctx.fill();
      }
    },
  };
}
