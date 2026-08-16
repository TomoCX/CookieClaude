import type { DialogueChoice, GameState, Puzzle, Reward, Scenario } from '../types';
import { AREAS, getArea } from '../data/areas';
import { getScene, sceneStartX } from '../data/scenes';
import { MAIN_SCENARIOS } from '../data/scenarios';
import { PUZZLES, picaratFor } from '../data/puzzles';

const SAVE_KEY = 'cookieclaude.save.v3';
/** 「エリア・シーン」に言いかえる前の保存 */
const OLD_SAVE_KEY = 'cookieclaude.save.v2';

/** 物語の出発点 */
const START_AREA_ID = 'coach';
const START_SCENE_ID = 'scn_coach_stop';

/** 最初から始めるときの状態 */
export function createInitialState(): GameState {
  return {
    picarat: 0,
    coin: 10,
    playSeconds: 0,
    areaId: START_AREA_ID,
    sceneId: START_SCENE_ID,
    sceneX: sceneStartX(START_SCENE_ID),
    openAreas: AREAS.filter((a) => a.openFromStart).map((a) => a.id),
    clearedScenarios: [],
    foundPuzzles: [],
    solvedPuzzles: [],
    misses: {},
    hints: {},
    notes: [],
    charms: [],
    collected: [],
    picks: {},
    examined: [],
    achievements: [],
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

  const openAreas = [...state.openAreas];
  for (const id of sc.unlocks ?? []) {
    if (!openAreas.includes(id)) openAreas.push(id);
  }

  return {
    ...state,
    coin: state.coin + sc.coin,
    openAreas,
    clearedScenarios: [...state.clearedScenarios, sc.id],
    notes: sc.note ? [...state.notes, sc.note] : state.notes,
    charms: sc.charm ? [...state.charms, sc.charm] : state.charms,
  };
}

/**
 * 会話の分かれ道で選んだものを反映する。
 * 選択そのものも覚えておき（`picks`）、あとから参照できるようにする。
 */
export function applyChoices(
  state: GameState,
  scenarioId: string,
  picked: DialogueChoice[],
): GameState {
  let next = state;
  for (const choice of picked) {
    next = { ...next, picks: { ...next.picks, [`${scenarioId}:${choice.id}`]: choice.id } };
    if (choice.gives) next = applyReward(next, choice.gives);
  }
  return next;
}

/** もらえるもの（コイン・メモ・チャーム・開放・アイテム）を一度に足す */
export function applyReward(state: GameState, reward: Reward, areaId?: string): GameState {
  const openAreas = [...state.openAreas];
  for (const id of reward.unlocks ?? []) {
    if (!openAreas.includes(id)) openAreas.push(id);
  }
  const collected = [...state.collected];
  for (const itemId of reward.items ?? []) {
    if (!collected.some((c) => c.itemId === itemId)) {
      collected.push({ itemId, areaId: areaId ?? state.areaId, atSeconds: state.playSeconds });
    }
  }
  return {
    ...state,
    coin: state.coin + (reward.coin ?? 0),
    openAreas,
    collected,
    notes: reward.note && !state.notes.some((n) => n.id === reward.note!.id)
      ? [...state.notes, reward.note]
      : state.notes,
    charms: reward.charm && !state.charms.some((c) => c.id === reward.charm!.id)
      ? [...state.charms, reward.charm]
      : state.charms,
  };
}

/** 調べどころを調べたことを記録する（同じところは一度だけ） */
export function applyExamine(state: GameState, propId: string): GameState {
  if (state.examined.includes(propId)) return state;
  return { ...state, examined: [...state.examined, propId] };
}

/** アイテムを拾ったことを記録する */
export function applyPickup(
  state: GameState,
  itemId: string,
  areaId: string,
): GameState {
  if (state.collected.some((c) => c.itemId === itemId)) return state;
  return {
    ...state,
    collected: [...state.collected, { itemId, areaId, atSeconds: state.playSeconds }],
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

  // シーンを持たない古い保存や、現在地と食い違う保存は、エリアから引き直す。
  // （そのままだと「現在地は大門広場なのに、いるのは馬車止め」になってしまう）
  const scene = getScene(healed.sceneId);
  if (!scene || scene.areaId !== healed.areaId) {
    healed.sceneId = getArea(healed.areaId)?.entrySceneId ?? START_SCENE_ID;
    healed.sceneX = sceneStartX(healed.sceneId);
  }
  // 見渡していた位置がおかしい保存も直す
  if (!Number.isFinite(healed.sceneX) || healed.sceneX < 0 || healed.sceneX > 1) {
    healed.sceneX = sceneStartX(healed.sceneId);
  }
  // 配列であるべき項目が壊れていたら空にしておく
  const lists = [
    'examined',
    'achievements',
    'openAreas',
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
  if (typeof healed.picks !== 'object' || healed.picks === null) healed.picks = {};
  return healed;
}

/**
 * 「場所・街並み」と呼んでいたころの保存を、いまの言いかたに移しかえる。
 * 呼び名を変えただけで中身は同じなので、読めるかぎりは読む。
 */
function migrateOldNames(raw: Record<string, unknown>): Record<string, unknown> {
  if (raw.areaId != null) return raw;
  const moved = { ...raw };
  if (typeof raw.placeId === 'string') moved.areaId = raw.placeId;
  if (Array.isArray(raw.openPlaces)) moved.openAreas = raw.openPlaces;
  // 街並みの id は付けかたごと変わったので、エリアの入口シーンから引き直す
  if (typeof moved.areaId === 'string') {
    moved.sceneId = getArea(moved.areaId)?.entrySceneId;
    moved.sceneX = typeof raw.streetX === 'number' ? raw.streetX : undefined;
  }
  if (Array.isArray(raw.collected)) {
    moved.collected = raw.collected.map((c) => {
      const item = c as { itemId?: string; placeId?: string; areaId?: string; atSeconds?: number };
      return {
        itemId: item.itemId,
        areaId: item.areaId ?? item.placeId,
        atSeconds: item.atSeconds ?? 0,
      };
    });
  }
  delete moved.placeId;
  delete moved.openPlaces;
  delete moved.streetId;
  delete moved.streetX;
  return moved;
}

/** 読みこんだ生のデータを、欠けを埋めたうえで進行状況に仕立てる */
export function reviveSave(raw: Record<string, unknown>): GameState {
  const moved = migrateOldNames(raw);
  // 未定義の項目を初期値で上書きしてしまわないよう、落としてから重ねる
  for (const key of Object.keys(moved)) {
    if (moved[key] === undefined) delete moved[key];
  }
  return healSave({ ...createInitialState(), ...moved } as GameState);
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
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(OLD_SAVE_KEY);
    if (!raw) return null;
    // 保存データが古い / 壊れている場合に備えて初期値で埋める
    return reviveSave(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return null;
  }
}

/** セーブデータがあるか */
export function hasSave(): boolean {
  try {
    return (
      localStorage.getItem(SAVE_KEY) !== null || localStorage.getItem(OLD_SAVE_KEY) !== null
    );
  } catch {
    return false;
  }
}
