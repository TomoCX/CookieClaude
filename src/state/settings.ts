import type { ScreenSize, Settings } from '../types';

const SETTINGS_KEY = 'cookieclaude.settings.v1';

/** 動きを控えてほしいと、端末側で指定されているか */
function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** はじめての起動で使う設定 */
export function defaultSettings(): Settings {
  return {
    language: 'ja',
    screenSize: 'medium',
    bgmOn: true,
    bgmVolume: 45,
    seOn: true,
    seVolume: 70,
    // 動きを控える設定の端末では、エフェクトを切った状態から始める
    effectsOn: !prefersReducedMotion(),
    effectStrength: 80,
  };
}

/** 画面の大きさのえらびかた */
export const SCREEN_SIZES: { id: ScreenSize; label: string; note: string }[] = [
  { id: 'small', label: '小', note: '560 px' },
  { id: 'medium', label: '中', note: '720 px' },
  { id: 'large', label: '大', note: '880 px' },
  { id: 'xlarge', label: '特大', note: '1040 px' },
  { id: 'full', label: '全画面', note: 'ウィンドウ全体' },
];

/** 設定を読み込む。無ければ既定値。 */
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...defaultSettings(), ...parsed };
  } catch {
    return defaultSettings();
  }
}

/** 設定を保存する */
export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* 保存領域が使えない環境では覚えないだけ */
  }
}
