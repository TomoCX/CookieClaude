import type { EffectSketch } from '../../types';

/**
 * メープルの落ち葉。
 *
 * シーンのいちばん手前をひらひら舞う。指を近づけると風を受けたように
 * 押しのけられて、離すと元の落ちかたに戻る——という、触って遊べる部分。
 */

/** 画面の広さ 1 万平方ピクセルあたりの葉の数 */
const DENSITY = 0.36;
const MAX_LEAVES = 34;
/** 小さな画面でも、これだけは舞わせる */
const MIN_LEAVES = 10;
/** 指の風が届く距離（画面の短いほうに対する割合） */
const PUSH_RADIUS = 0.22;
/** 押しのける強さ */
const PUSH_FORCE = 2.6;
/** 押された勢いが抜けていく速さ（1 秒あたりに残る割合） */
const DAMPING = 0.12;

const COLORS = ['#d9682e', '#c8862a', '#b5482a', '#e0913a', '#9d5626'];

interface Leaf {
  /** 画面に対する位置（0〜1） */
  x: number;
  y: number;
  /** 大きさ（px） */
  size: number;
  /** 落ちる速さ */
  fall: number;
  /** 横ゆれの幅と位相 */
  swayAmp: number;
  swayPhase: number;
  spin: number;
  angle: number;
  color: string;
  alpha: number;
  /** 指に押された勢い（0〜1 の座標系） */
  pushX: number;
  pushY: number;
}

function spawn(top: boolean): Leaf {
  const size = 7 + Math.random() * 11;
  return {
    x: Math.random(),
    y: top ? -0.1 - Math.random() * 0.3 : Math.random(),
    size,
    fall: 0.035 + Math.random() * 0.06,
    swayAmp: 0.01 + Math.random() * 0.035,
    swayPhase: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 2.4,
    angle: Math.random() * Math.PI * 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0]!,
    alpha: 0.55 + Math.random() * 0.4,
    pushX: 0,
    pushY: 0,
  };
}

/** 楓の葉。五つの裂片を、中心から放射状に描く。 */
function drawLeaf(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.62;
    const tip = size * (i === 2 ? 1 : i % 2 === 0 ? 0.72 : 0.88);
    const notch = size * 0.34;
    const na = a + 0.31;
    if (i === 0) ctx.moveTo(Math.cos(a) * tip, Math.sin(a) * tip);
    else ctx.lineTo(Math.cos(a) * tip, Math.sin(a) * tip);
    ctx.lineTo(Math.cos(na) * notch, Math.sin(na) * notch);
  }
  ctx.closePath();
  ctx.fill();
  // 葉柄
  ctx.beginPath();
  ctx.moveTo(0, size * 0.2);
  ctx.lineTo(0, size * 0.6);
  ctx.stroke();
}

export function createLeaves(): EffectSketch {
  let leaves: Leaf[] = [];

  return {
    setup({ width, height }) {
      const n = Math.min(MAX_LEAVES, Math.round(((width * height) / 10000) * DENSITY));
      leaves = Array.from({ length: Math.max(MIN_LEAVES, n) }, () => spawn(false));
    },

    draw({ ctx, width, height, time, dt, pointer, strength }) {
      // 縦横で押しのけかたが変わらないよう、短いほうを基準にする
      const unit = Math.min(width, height);
      ctx.lineWidth = 1;

      for (const leaf of leaves) {
        // 指の風
        if (pointer) {
          const dx = leaf.x - pointer.x;
          const dy = leaf.y - pointer.y;
          const dist = Math.hypot(dx * (width / unit), dy * (height / unit));
          if (dist < PUSH_RADIUS && dist > 0.0001) {
            const power = (1 - dist / PUSH_RADIUS) ** 2 * PUSH_FORCE * dt;
            leaf.pushX += (dx / dist) * power;
            leaf.pushY += (dy / dist) * power * 0.6;
          }
        }
        // 受けた勢いは、じきに抜ける
        const keep = DAMPING ** dt;
        leaf.pushX *= keep;
        leaf.pushY *= keep;

        leaf.y += (leaf.fall + leaf.pushY) * dt;
        leaf.x += leaf.pushX * dt;
        leaf.angle += leaf.spin * dt;
        leaf.swayPhase += dt * 1.6;

        // 下まで落ちたら、また上から
        if (leaf.y > 1.15) Object.assign(leaf, spawn(true));
        if (leaf.x < -0.15) leaf.x = 1.15;
        if (leaf.x > 1.15) leaf.x = -0.15;

        const px = (leaf.x + Math.sin(leaf.swayPhase) * leaf.swayAmp) * width;
        const py = leaf.y * height;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(leaf.angle + Math.sin(time * 1.1 + leaf.swayPhase) * 0.3);
        ctx.globalAlpha = leaf.alpha * strength;
        ctx.fillStyle = leaf.color;
        ctx.strokeStyle = leaf.color;
        drawLeaf(ctx, leaf.size);
        ctx.restore();
      }
    },
  };
}
