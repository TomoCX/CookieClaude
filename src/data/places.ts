import type { Place } from '../types';

/** メイン画面（マップ）に並ぶ場所 */
export const PLACES: Place[] = [
  {
    id: 'gate',
    name: '町の入り口',
    ruby: 'まちのいりぐち',
    x: 16,
    y: 72,
    scenarioId: 'sc_gate',
    openFromStart: true,
  },
  {
    id: 'plaza',
    name: '大門広場',
    ruby: 'だいもんひろば',
    x: 45,
    y: 58,
    scenarioId: 'sc_plaza',
  },
  {
    id: 'inn',
    name: 'まんげつ亭',
    ruby: 'まんげつてい',
    x: 25,
    y: 36,
    scenarioId: 'sc_inn',
  },
  {
    id: 'clocktower',
    name: '時計塔',
    ruby: 'とけいとう',
    x: 71,
    y: 27,
    scenarioId: 'sc_clocktower',
  },
  {
    id: 'alley',
    name: '裏路地',
    ruby: 'うらろじ',
    x: 82,
    y: 66,
    scenarioId: 'sc_alley',
  },
];

/** id から場所を取得する */
export function getPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}
