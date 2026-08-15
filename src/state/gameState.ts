import type { GameState, Puzzle, Scenario } from '../types';
import { PLACES } from '../data/places';
import { MAIN_SCENARIOS } from '../data/scenarios';
import { PUZZLES, picaratFor } from '../data/puzzles';

const SAVE_KEY = 'cookieclaude.save.v2';

/** 最初から始めるときの状態 */
export function createInitialState(): GameState {
  return {
    picarat: 0,
    coin: 10,
    playSeconds: 0,
    placeId: 'gate',
    openPlaces: PLACES.filter((p) => p.openFromStart).map((p) => p.id),
    clearedScenarios: [],
    foundPuzzles: [],
    solvedPuzzles: [],
    misses: {},
    hints: {},
    notes: [],
    charms: [],
    memo: '',
  };
}

/* ---- 集計 ---- */

/** 解いたナゾの数 */
export function solvedCount(state: GameState): number {
  return state.solvedPuzzles.length;
}

/** 発見したナゾの数 */
export function foundCount(state: GameState): number {
  return state.foundPuzzles.length;
}

/** 本筋の進行度（0〜100%） */
export function progressPercent(state: GameState): number {
  const cleared = MAIN_SCENARIOS.filter((s) =>
    state.clearedScenarios.includes(s.id),
  ).length;
  return Math.round((cleared / MAIN_SCENARIOS.length) * 100);
}

/** 読み終えた本筋シナリオの数 */
export function clearedMainCount(state: GameState): number {
  return MAIN_SCENARIOS.filter((s) => state.clearedScenarios.includes(s.id)).length;
}

/** 集められるピカラットの合計 */
export const TOTAL_PICARAT = PUZZLES.reduce((sum, p) => sum + p.picarat[0], 0);

/** プレイ時間を「00じかん 01ふん」形式に分解する */
export function formatPlayTime(seconds: number): { h: string; m: string } {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return {
    h: String(Math.min(h, 99)).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
  };
}

/* ---- 状態の更新 ---- */

/** シナリオ読了を反映した新しい状態を返す */
export function applyScenarioClear(state: GameState, sc: Scenario): GameState {
  if (state.clearedScenarios.includes(sc.id)) return state;

  const openPlaces = [...state.openPlaces];
  for (const id of sc.unlocks ?? []) {
    if (!openPlaces.includes(id)) openPlaces.push(id);
  }

  return {
    ...state,
    coin: state.coin + sc.coin,
    openPlaces,
    clearedScenarios: [...state.clearedScenarios, sc.id],
    notes: sc.note ? [...state.notes, sc.note] : state.notes,
    charms: sc.charm ? [...state.charms, sc.charm] : state.charms,
  };
}

/** ナゾを開いた（みつけた）ことを記録する */
export function applyPuzzleFound(state: GameState, puzzleId: string): GameState {
  if (state.foundPuzzles.includes(puzzleId)) return state;
  return { ...state, foundPuzzles: [...state.foundPuzzles, puzzleId] };
}

/** まちがえたことを記録する */
export function applyPuzzleMiss(state: GameState, puzzleId: string): GameState {
  return {
    ...state,
    misses: { ...state.misses, [puzzleId]: (state.misses[puzzleId] ?? 0) + 1 },
  };
}

/** ヒントを 1 つ見る。コインが足りなければ状態を変えない。 */
export function applyHintUse(state: GameState, puzzle: Puzzle): GameState {
  const used = state.hints[puzzle.id] ?? 0;
  if (used >= puzzle.hints.length || state.coin < 1) return state;
  return {
    ...state,
    coin: state.coin - 1,
    hints: { ...state.hints, [puzzle.id]: used + 1 },
  };
}

/** ナゾに正解した。もらえるピカラットも計算して足す。 */
export function applyPuzzleSolved(state: GameState, puzzle: Puzzle): GameState {
  if (state.solvedPuzzles.includes(puzzle.id)) return state;
  return {
    ...state,
    picarat: state.picarat + picaratFor(puzzle, state.misses[puzzle.id] ?? 0),
    coin: state.coin + 1,
    solvedPuzzles: [...state.solvedPuzzles, puzzle.id],
  };
}

/* ---- セーブ ---- */

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
