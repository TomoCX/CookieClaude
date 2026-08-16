import type { EffectSketch } from '../../types';

/**
 * 表紙の星座。
 *
 * ゆっくり漂う点を、近いものどうし線でつなぐ。指を近づけると
 * そこへ寄ってきて、つながりが濃くなる。表紙の待ち時間に眺めるためのもの。
 */

const DENSITY = 0.5;
const MAX_STARS = 90;
/** これより近い点どうしを線でつなぐ（画面の短いほうに対する割合） */
const LINK_DIST = 0.16;
/** 指に寄っていく強さ */
const PULL = 0.22;
/** 指の効く範囲 */
const PULL_RADIUS = 0.3;

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** またたきの位相 */
  phase: number;
}

export function createConstellation(): EffectSketch {
  let stars: Star[] = [];

  return {
    setup({ width, height }) {
      const n = Math.min(MAX_STARS, Math.round(((width * height) / 10000) * DENSITY));
      stars = Array.from({ length: Math.max(18, n) }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.022,
        vy: (Math.random() - 0.5) * 0.022,
        r: 0.8 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
      }));
    },

    draw({ ctx, width, height, time, dt, pointer, strength }) {
      const unit = Math.min(width, height);
      const aspectX = width / unit;
      const aspectY = height / unit;

      for (const s of stars) {
        if (pointer) {
          const dx = pointer.x - s.x;
          const dy = pointer.y - s.y;
          const dist = Math.hypot(dx * aspectX, dy * aspectY);
          if (dist < PULL_RADIUS && dist > 0.001) {
            const power = (1 - dist / PULL_RADIUS) * PULL * dt;
            s.vx += (dx / dist) * power;
            s.vy += (dy / dist) * power;
          }
        }
        // 速くなりすぎないよう、少しずつ抑える
        s.vx *= 0.985 ** (dt * 60);
        s.vy *= 0.985 ** (dt * 60);
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        // はしに来たら跳ねかえす
        if (s.x < 0 || s.x > 1) s.vx *= -1;
        if (s.y < 0 || s.y > 1) s.vy *= -1;
        s.x = Math.min(1, Math.max(0, s.x));
        s.y = Math.min(1, Math.max(0, s.y));
      }

      // つながり
      ctx.lineWidth = 1;
      for (let i = 0; i < stars.length; i++) {
        const a = stars[i]!;
        for (let j = i + 1; j < stars.length; j++) {
          const b = stars[j]!;
          const dist = Math.hypot((a.x - b.x) * aspectX, (a.y - b.y) * aspectY);
          if (dist > LINK_DIST) continue;
          const alpha = (1 - dist / LINK_DIST) * 0.32 * strength;
          ctx.strokeStyle = `rgba(226, 164, 60, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x * width, a.y * height);
          ctx.lineTo(b.x * width, b.y * height);
          ctx.stroke();
        }
      }

      // 星そのもの
      for (const s of stars) {
        const twinkle = 0.55 + Math.sin(time * 1.7 + s.phase) * 0.35;
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(246, 236, 212, ${twinkle * strength})`;
        ctx.fill();
      }
    },
  };
}
