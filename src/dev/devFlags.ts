import { useSyncExternalStore } from 'react';

/**
 * 開発者モードの入り切り。
 *
 * 遊ぶ人には見えないところに置いておきたいので、React の状態ではなく
 * ここで持つ。街並み画面のように、開発者モードとは直接つながっていない
 * 場所からも読めるようにするため。
 *
 * 入りかたは二つ。
 * - URL に `?dev=1` を付けて開く
 * - `Ctrl + Shift + D`（この組み合わせはブラウザ側と当たらない）
 */

const KEY = 'cookieclaude.dev.v1';

export interface DevFlags {
  /** 開発者モードそのもの */
  on: boolean;
  /** 街並みをクリックすると座標を読みとる */
  probe: boolean;
  /** 人・ナゾ・キラキラ・出口の置き場所を見えるようにする */
  guides: boolean;
}

const OFF: DevFlags = { on: false, probe: false, guides: false };

function load(): DevFlags {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('dev');
    const saved = localStorage.getItem(KEY);
    const base: DevFlags = saved ? { ...OFF, ...(JSON.parse(saved) as Partial<DevFlags>) } : OFF;
    // URL の指定はその場かぎり。保存された値より強い。
    if (fromUrl === '1') return { ...base, on: true };
    if (fromUrl === '0') return { ...base, on: false };
    return base;
  } catch {
    return OFF;
  }
}

let flags: DevFlags = load();
const listeners = new Set<() => void>();

export function setDevFlags(part: Partial<DevFlags>): void {
  flags = { ...flags, ...part };
  // 開発者モードを出るときは、上に描くものも一緒に片づける
  if (!flags.on) flags = { ...flags, probe: false, guides: false };
  try {
    localStorage.setItem(KEY, JSON.stringify(flags));
  } catch {
    /* 保存領域が使えない環境では覚えないだけ */
  }
  for (const f of listeners) f();
}

export function toggleDevMode(): void {
  setDevFlags({ on: !flags.on });
}

function subscribe(f: () => void): () => void {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
}

const snapshot = () => flags;

/** いまの開発者モードの状態を読む */
export function useDevFlags(): DevFlags {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/* ---- 座標ひろい ---- */

/**
 * 街並みで最後にクリックした場所（道の 0〜1 と、画面の高さの 0〜1）。
 * 「配置」の欄に、そのまま貼れるひな型として出す。
 */
let picked: { x: number; y: number } | null = null;
const pickListeners = new Set<() => void>();

export function setPickedSpot(spot: { x: number; y: number } | null): void {
  picked = spot;
  for (const f of pickListeners) f();
}

function subscribePick(f: () => void): () => void {
  pickListeners.add(f);
  return () => {
    pickListeners.delete(f);
  };
}

const pickSnapshot = () => picked;

export function usePickedSpot(): { x: number; y: number } | null {
  return useSyncExternalStore(subscribePick, pickSnapshot, pickSnapshot);
}
