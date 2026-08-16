import type { Effect, EffectSlot } from '../types';
import { createMotes } from './sketches/motes';
import { createLeaves } from './sketches/leaves';
import { createConstellation } from './sketches/constellation';

/**
 * 差しこめるエフェクトの一覧。
 *
 * 絵は canvas に手続きで描く（Processing の setup / draw と同じ組み立て）。
 * ここに一行足せば、その場所へ勝手に混ざる。画面側に手を入れる必要はない。
 * 足しかたは README の「エフェクトを足す」を参照。
 */
export const EFFECTS: Effect[] = [
  {
    id: 'fx_motes',
    name: '陽だまりの塵',
    slot: 'scene.back',
    sceneKinds: ['street'],
    note: '空気中の細かな粒。見わたすと手前のものほど大きく流れる。',
    enabled: true,
    create: createMotes,
  },
  {
    id: 'fx_leaves',
    name: 'メープルの落ち葉',
    slot: 'scene.front',
    sceneKinds: ['street'],
    note: '舞い落ちる楓の葉。指を近づけると風を受けて押しのけられる。',
    enabled: true,
    create: createLeaves,
  },
  {
    id: 'fx_constellation',
    name: '星座',
    slot: 'boot.front',
    note: '漂う点を近いものどうし線でつなぐ。指のほうへ寄ってくる。',
    enabled: true,
    create: createConstellation,
  },
];

/** 差しこめる場所の一覧（開発者モードの案内に使う） */
export const EFFECT_SLOTS: { id: EffectSlot; label: string }[] = [
  { id: 'scene.back', label: 'シーン・奥（背景の上、人より奥）' },
  { id: 'scene.front', label: 'シーン・手前（何よりも手前）' },
  { id: 'scenario.front', label: '会話・手前' },
  { id: 'puzzle.front', label: 'ナゾ解き・手前' },
  { id: 'menu.back', label: 'メインメニュー・奥' },
  { id: 'boot.front', label: '表紙・手前' },
];

/** id からエフェクトを取得する */
export function getEffect(id: string): Effect | undefined {
  return EFFECTS.find((e) => e.id === id);
}
