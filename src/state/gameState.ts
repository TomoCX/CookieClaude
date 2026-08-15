import type { GameState, Scenario } from '../types';
import { PLACES } from '../data/places';
import { SCENARIOS } from '../data/scenarios';

const SAVE_KEY = 'cookieclaude.save.v1';

/** はじめから始めるときの状態 */
export function createInitialState(): GameState {
  return {
    solved: 0,
    found: 0,
    picarat: 0,
    coin: 10,
    playSeconds: 0,
    placeId: 'gate',
    openPlaces: PLACES.filter((p) => p.openFromStart).map((p) => p.id),
    clearedScenarios: [],
    notes: [],
    charms: [],
    memo: '',
  };
}

/** シナリオ読了を反映した新しい状態を返す */
export function applyScenarioClear(state: GameState, sc: Scenario): GameState {
  if (state.clearedScenarios.includes(sc.id)) return state;

  const openPlaces = [...state.openPlaces];
  for (const id of sc.unlocks ?? []) {
    if (!openPlaces.includes(id)) openPlaces.push(id);
  }

  return {
    ...state,
    solved: state.solved + 1,
    found: state.found + 1,
    picarat: state.picarat + sc.reward.picarat,
    coin: state.coin + sc.reward.coin,
    openPlaces,
    clearedScenarios: [...state.clearedScenarios, sc.id],
    notes: sc.note ? [...state.notes, sc.note] : state.notes,
    charms: sc.charm ? [...state.charms, sc.charm] : state.charms,
  };
}

/** 進行度（0〜100%） */
export function progressPercent(state: GameState): number {
  return Math.round((state.clearedScenarios.length / SCENARIOS.length) * 100);
}

/** プレイ時間を「00じかん 01ふん」形式に分解する */
export function formatPlayTime(seconds: number): { h: string; m: string } {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return {
    h: String(Math.min(h, 99)).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
  };
}

/** localStorage へ保存する。成功したら true */
export function saveGame(state: GameState): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** localStorage から読み込む。無ければ null */
export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    // 保存データが古い / 壊れている場合に備えて初期値で埋める
    return { ...createInitialState(), ...parsed };
  } catch {
    return null;
  }
}

/** セーブデータがあるか */
export function hasSave(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch {
    return false;
  }
}

/** セーブデータを消す */
export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* 保存領域が使えない環境では何もしない */
  }
}
