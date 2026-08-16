import type { Street } from '../types';

/**
 * 街並み。マップから場所に入ると、この画面で道を見わたせる。
 * npcs・puzzles・sparkles の x は 0（道の左はし）〜 1（右はし）。
 * sparkles・exits の y は画面の高さに対する位置（0 が上、1 が下）。
 * exits は靴のアイコンを押したときに出る、隣の街並みへの矢印。
 * ナゾはマップではなく、人に話しかけるのと同じこの画面に置く。
 */
export const STREETS: Street[] = [
  {
    id: 'st_coach',
    placeId: 'coach',
    bg: 'highway',
    startX: 0.06,
    npcs: [
      { id: 'npc_driver', characterId: 'driver', x: 0.26, scenarioId: 'sc_coach' },
    ],
    puzzles: [
      { id: 'sp_coach_1', puzzleId: 'pz_riddle', x: 0.62, look: 'sundial' },
    ],
    sparkles: [
      { id: 'sp_coach_a', itemId: 'it_ticket', x: 0.13, y: 0.74 },
      { id: 'sp_coach_b', itemId: 'it_berry', x: 0.83, y: 0.62 },
    ],
    exits: [
      { id: 'ex_coach_gate', to: 'st_gate', dir: 'far', x: 0.5, y: 0.5 },
    ],
  },
  {
    id: 'st_gate',
    placeId: 'gate',
    bg: 'gate',
    startX: 0.06,
    npcs: [
      { id: 'npc_maurice', characterId: 'maurice', x: 0.26, scenarioId: 'sc_gate' },
      {
        id: 'npc_toby',
        characterId: 'toby',
        x: 0.74,
        scenarioId: 'sc_gate_toby',
        requiresScenario: 'sc_gate',
      },
    ],
    puzzles: [
      { id: 'sp_gate_1', puzzleId: 'pz_strike', x: 0.5, look: 'clock' },
      { id: 'sp_gate_2', puzzleId: 'pz_lamps', x: 0.93, look: 'pocketwatch' },
    ],
    sparkles: [
      { id: 'sp_gate_a', itemId: 'it_stone', x: 0.38, y: 0.78 },
      { id: 'sp_gate_b', itemId: 'it_key', x: 0.68, y: 0.46 },
    ],
    exits: [
      { id: 'ex_gate_coach', to: 'st_coach', dir: 'near', x: 0.08, y: 0.83 },
      { id: 'ex_gate_plaza', to: 'st_plaza', dir: 'far', x: 0.86, y: 0.5 },
    ],
  },
  {
    id: 'st_plaza',
    placeId: 'plaza',
    bg: 'plaza',
    startX: 0.06,
    npcs: [
      { id: 'npc_martha', characterId: 'martha', x: 0.27, scenarioId: 'sc_plaza' },
      { id: 'npc_lily', characterId: 'lily', x: 0.76, scenarioId: 'sc_plaza_lily' },
    ],
    puzzles: [
      { id: 'sp_plaza_1', puzzleId: 'pz_interval', x: 0.5, look: 'clock' },
      { id: 'sp_plaza_2', puzzleId: 'pz_mirror', x: 0.93, look: 'pocketwatch' },
    ],
    sparkles: [
      { id: 'sp_plaza_a', itemId: 'it_flower', x: 0.16, y: 0.7 },
      { id: 'sp_plaza_b', itemId: 'it_tile', x: 0.62, y: 0.79 },
    ],
    exits: [
      { id: 'ex_plaza_gate', to: 'st_gate', dir: 'near', x: 0.06, y: 0.83 },
      { id: 'ex_plaza_inn', to: 'st_inn', dir: 'left', x: 0.34, y: 0.56 },
      { id: 'ex_plaza_tower', to: 'st_clocktower', dir: 'far', x: 0.88, y: 0.48 },
    ],
  },
  {
    id: 'st_inn',
    placeId: 'inn',
    bg: 'inn',
    startX: 0.06,
    npcs: [
      { id: 'npc_gear', characterId: 'gear', x: 0.28, scenarioId: 'sc_inn' },
      {
        id: 'npc_martha_inn',
        characterId: 'martha',
        x: 0.78,
        scenarioId: 'sc_inn_martha',
      },
    ],
    puzzles: [
      { id: 'sp_inn_1', puzzleId: 'pz_stopped', x: 0.55, look: 'pocketwatch' },
      { id: 'sp_inn_2', puzzleId: 'pz_soup', x: 0.94, look: 'clock' },
    ],
    sparkles: [
      { id: 'sp_inn_a', itemId: 'it_paper', x: 0.2, y: 0.44 },
      { id: 'sp_inn_b', itemId: 'it_coaster', x: 0.7, y: 0.76 },
    ],
    exits: [
      { id: 'ex_inn_plaza', to: 'st_plaza', dir: 'right', x: 0.92, y: 0.56 },
    ],
  },
  {
    id: 'st_clocktower',
    placeId: 'clocktower',
    bg: 'clocktower',
    startX: 0.06,
    npcs: [
      {
        id: 'npc_gear_tower',
        characterId: 'gear',
        x: 0.27,
        scenarioId: 'sc_clocktower',
      },
      { id: 'npc_hans', characterId: 'hans', x: 0.75, scenarioId: 'sc_tower_hans' },
    ],
    puzzles: [
      { id: 'sp_tower_1', puzzleId: 'pz_gears', x: 0.52, look: 'sundial' },
      { id: 'sp_tower_2', puzzleId: 'pz_order', x: 0.94, look: 'clock' },
    ],
    sparkles: [
      { id: 'sp_tower_a', itemId: 'it_screw', x: 0.14, y: 0.72 },
      { id: 'sp_tower_b', itemId: 'it_shard', x: 0.72, y: 0.4 },
    ],
    exits: [
      { id: 'ex_tower_plaza', to: 'st_plaza', dir: 'near', x: 0.06, y: 0.83 },
      { id: 'ex_tower_alley', to: 'st_alley', dir: 'right', x: 0.9, y: 0.6 },
    ],
  },
  {
    id: 'st_alley',
    placeId: 'alley',
    bg: 'alley',
    startX: 0.06,
    npcs: [
      { id: 'npc_pete', characterId: 'pete', x: 0.26, scenarioId: 'sc_alley_pete' },
      { id: 'npc_mint', characterId: 'mint', x: 0.8, scenarioId: 'sc_alley' },
    ],
    puzzles: [
      { id: 'sp_alley_1', puzzleId: 'pz_overlap', x: 0.54, look: 'clock' },
    ],
    sparkles: [
      { id: 'sp_alley_a', itemId: 'it_glove', x: 0.44, y: 0.75 },
      { id: 'sp_alley_b', itemId: 'it_letter', x: 0.9, y: 0.55 },
    ],
    exits: [
      { id: 'ex_alley_tower', to: 'st_clocktower', dir: 'left', x: 0.06, y: 0.6 },
    ],
  },
];

/** id から街並みを取得する */
export function getStreet(id: string): Street | undefined {
  return STREETS.find((s) => s.id === id);
}

/** 街並みが無いときに使う、道の入口あたりのカメラ位置 */
const FALLBACK_START_X = 0.06;

/**
 * その街並みに入ってきたときのカメラ位置。
 * 知らない id を渡されても落ちないよう、既定値でしのぐ。
 */
export function streetStartX(id: string): number {
  return getStreet(id)?.startX ?? FALLBACK_START_X;
}
