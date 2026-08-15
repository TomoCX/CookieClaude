import type { Place } from '../types';

/** メイン画面（マップ）に並ぶ場所 */
export const PLACES: Place[] = [
  {
    id: 'coach',
    name: '街道の馬車止め',
    ruby: 'かいどうのばしゃどめ',
    x: 6,
    y: 88,
    streetId: 'st_coach',
    mainScenarioId: 'sc_coach',
    openFromStart: true,
  },
  {
    id: 'gate',
    name: '町の入り口',
    ruby: 'まちのいりぐち',
    x: 16,
    y: 74,
    streetId: 'st_gate',
    mainScenarioId: 'sc_gate',
    openFromStart: true,
  },
  {
    id: 'plaza',
    name: '大門広場',
    ruby: 'だいもんひろば',
    x: 44,
    y: 60,
    streetId: 'st_plaza',
    mainScenarioId: 'sc_plaza',
  },
  {
    id: 'inn',
    name: 'まんげつ亭',
    ruby: 'まんげつてい',
    x: 24,
    y: 38,
    streetId: 'st_inn',
    mainScenarioId: 'sc_inn',
  },
  {
    id: 'clocktower',
    name: '時計塔',
    ruby: 'とけいとう',
    x: 72,
    y: 30,
    streetId: 'st_clocktower',
    mainScenarioId: 'sc_clocktower',
  },
  {
    id: 'alley',
    name: '裏路地',
    ruby: 'うらろじ',
    x: 84,
    y: 68,
    streetId: 'st_alley',
    mainScenarioId: 'sc_alley',
  },
];

/** id から場所を取得する */
export function getPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}
