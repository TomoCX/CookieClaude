import type { Effect, EffectSlot, SceneKind } from '../types';
import { EFFECTS } from './registry';

/**
 * エフェクトの入り切り。
 *
 * 設定は React の外（`src/audio/audio.ts` と同じやりかた）で持つ。
 * 描画のループは毎コマここを読むだけなので、設定を変えても
 * 画面を組みなおさずに済む。
 */

/** 設定の「エフェクト」。切っているあいだは一切描かない。 */
let running = true;
/** 0〜1。設定の「強さ」。粒の数や濃さに掛ける。 */
let strength = 0.8;
/** 開発者モードで一つずつ入り切りしたときの上書き */
const overrides = new Map<string, boolean>();
const listeners = new Set<() => void>();

function notify(): void {
  for (const f of listeners) f();
}

/** 入り切りが変わったことを知りたい側（EffectLayer と開発者モード）が呼ぶ */
export function subscribeEffects(f: () => void): () => void {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
}

/** 設定から呼ぶ。strength は 0〜100。 */
export function setEffectSettings(on: boolean, strength100: number): void {
  running = on;
  strength = Math.min(1, Math.max(0, strength100 / 100));
  notify();
}

/** いまの強さ。0 なら描かなくてよい。 */
export function effectStrength(): number {
  return running ? strength : 0;
}

/** そのエフェクトを動かすか（開発者モードの上書きを含む） */
export function isEffectOn(id: string): boolean {
  const forced = overrides.get(id);
  if (forced !== undefined) return forced;
  return EFFECTS.find((e) => e.id === id)?.enabled ?? false;
}

/** 開発者モードから、一つだけ入り切りする */
export function setEffectOn(id: string, value: boolean): void {
  overrides.set(id, value);
  notify();
}

/** 上書きをぜんぶ捨てて、既定にもどす */
export function resetEffectOverrides(): void {
  overrides.clear();
  notify();
}

/**
 * その場所で、いま動かすことになっているエフェクト。
 * sceneKind を渡すと、その種類のシーンで動くものだけに絞る。
 */
export function activeEffects(slot: EffectSlot, sceneKind?: SceneKind): Effect[] {
  return EFFECTS.filter(
    (e) =>
      e.slot === slot &&
      isEffectOn(e.id) &&
      (sceneKind == null || e.sceneKinds == null || e.sceneKinds.includes(sceneKind)),
  );
}
