import { useSyncExternalStore } from 'react';
import type { Language, LocalizedText } from '../types';

/**
 * 画面に出すことばの切りかえ。
 *
 * 設定と同じく React の外で持つ。データ（`src/data/`）は React を知らないので、
 * `getScene(...)?.name` のような値を画面のどこからでも訳せるようにするため。
 *
 * 訳が無いときは日本語がそのまま出る。中身を足すときは `ja` だけ書いて先へ進んでよい。
 */

let current: Language = 'ja';
const listeners = new Set<() => void>();

/** 設定から呼ぶ */
export function setLanguage(next: Language): void {
  if (current === next) return;
  current = next;
  for (const f of listeners) f();
}

/**
 * LocalizedText を、いまの言語の文字にする。
 * ただの文字列（未訳）は、そのまま返す。
 */
export function text(value: LocalizedText | undefined): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return current === 'en' ? (value.en ?? value.ja) : value.ja;
}

function subscribe(f: () => void): () => void {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
}

const snapshot = () => current;

/** いまの言語。変わったら描きなおす。 */
export function useLanguage(): Language {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/**
 * 画面のどこからでも使う訳し器。
 * `useLanguage()` を通しているので、言語を変えると呼んだ側も描きなおる。
 */
export function useText(): (value: LocalizedText | undefined) => string {
  useLanguage();
  return text;
}
