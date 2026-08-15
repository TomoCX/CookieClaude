import type { Street } from '../types';

/**
 * 街並み。マップから場所に入ると、この画面で道を見わたせる。
 * npcs・puzzles の x は 0（道の左はし）〜 1（右はし）。
 * ナゾはマップではなく、人に話しかけるのと同じこの画面に置く。
 */
export const STREETS: Street[] = [
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
  },
];

/** id から街並みを取得する */
export function getStreet(id: string): Street | undefined {
  return STREETS.find((s) => s.id === id);
}
