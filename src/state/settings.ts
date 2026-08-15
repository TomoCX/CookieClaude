import type { ScreenSize, Settings } from '../types';

const SETTINGS_KEY = 'cookieclaude.settings.v1';

/** はじめての起動で使う設定 */
export function defaultSettings(): Settings {
  return {
    screenSize: 'medium',
    bgmOn: true,
    bgmVolume: 45,
    seOn: true,
    seVolume: 70,
  };
}

/** 画面の大きさの えらびかた */
export const SCREEN_SIZES: { id: ScreenSize; label: string; note: string }[] = [
  { id: 'small', label: 'ちいさい', note: '380 px' },
  { id: 'medium', label: 'ふつう', note: '460 px' },
  { id: 'large', label: 'おおきい', note: '560 px' },
  { id: 'full', label: 'ぜんめん', note: 'ウィンドウいっぱい' },
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
    /* 保存領域が使えない環境では 覚えないだけ */
  }
}
