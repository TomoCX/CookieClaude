import type { Street } from '../types';

/**
 * 街並み。マップから場所に入ると、この画面で道を歩ける。
 * npcs の x は 0（道の左はし）〜 1（右はし）。
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
  },
];

/** id から街並みを取得する */
export function getStreet(id: string): Street | undefined {
  return STREETS.find((s) => s.id === id);
}
