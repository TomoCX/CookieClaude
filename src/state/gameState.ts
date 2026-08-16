import type { GameState, Puzzle, Scenario } from '../types';
import { PLACES, getPlace } from '../data/places';
import { getStreet, streetStartX } from '../data/streets';
import { MAIN_SCENARIOS } from '../data/scenarios';
import { PUZZLES, picaratFor } from '../data/puzzles';

const SAVE_KEY = 'cookieclaude.save.v2';

/** 物語の出発点 */
const START_PLACE_ID = 'coach';
const START_STREET_ID = 'st_coach';

/** 最初から始めるときの状態 */
export function createInitialState(): GameState {
  return {
    picarat: 0,
    coin: 10,
    playSeconds: 0,
    placeId: START_PLACE_ID,
    streetId: START_STREET_ID,
    streetX: streetStartX(START_STREET_ID),
    openPlaces: PLACES.filter((p) => p.openFromStart).map((p) => p.id),
    clearedScenarios: [],
    foundPuzzles: [],
    solvedPuzzles: [],
    misses: {},
    hints: {},
    notes: [],
    charms: [],
    collected: [],
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

/** アイテムを拾ったことを記録する */
export function applyPickup(
  state: GameState,
  itemId: string,
  placeId: string,
): GameState {
  if (state.collected.some((c) => c.itemId === itemId)) return state;
  return {
    ...state,
    collected: [
      ...state.collected,
      { itemId, placeId, atSeconds: state.playSeconds },
    ],
  };
}

/** ナゾを開いた（発見した）ことを記録する */
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

/**
 * 読みこんだ進行状況のつじつまを合わせる。
 * 古い形式や、手で書きかえたバックアップにも耐えられるようにするため、
 * localStorage からの読みこみとバックアップの読みこみの両方から呼ぶ。
 */
export function healSave(state: GameState): GameState {
  const healed: GameState = { ...state };

  // 街並みを持たない古い保存や、現在地と食い違う保存は、現在地から引き直す。
  // （そのままだと「現在地は大門広場なのに、いるのは馬車止め」になってしまう）
  const street = getStreet(healed.streetId);
  if (!street || street.placeId !== healed.placeId) {
    healed.streetId = getPlace(healed.placeId)?.streetId ?? START_STREET_ID;
    healed.streetX = streetStartX(healed.streetId);
  }
  // 見渡していた位置がおかしい保存も直す
  if (!Number.isFinite(healed.streetX) || healed.streetX < 0 || healed.streetX > 1) {
    healed.streetX = streetStartX(healed.streetId);
  }
  // 配列であるべき項目が壊れていたら空にしておく
  const lists = [
    'openPlaces',
    'clearedScenarios',
    'foundPuzzles',
    'solvedPuzzles',
    'notes',
    'charms',
    'collected',
  ] as const;
  for (const key of lists) {
    if (!Array.isArray(healed[key])) {
      (healed[key] as unknown) = [];
    }
  }
  if (typeof healed.memo !== 'string') healed.memo = '';
  return healed;
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
    return healSave({ ...createInitialState(), ...parsed });
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
