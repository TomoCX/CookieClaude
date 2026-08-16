import type { Area } from '../types';

/**
 * エリア。地図の上に並ぶ区画。
 *
 * エリアそのものは背景を持たない。絵を持つのはシーンのほうで、
 * どのシーンがどのエリアに属するかは `scenes.ts` の `areaId` で決まる。
 * ここに書くのは「地図の上での見えかた」と「入口のシーン」だけ。
 *
 * 開放の段取り:
 * - 街道の馬車止め・町の入り口・大門広場 … 最初から自由に行き来できる
 * - 時計塔・まんげつ亭 … 広場の本筋（sc_plaza）を読むと開く
 * - 裏路地 … 時計塔の本筋（sc_clocktower）を読むと開く
 *
 * まだ開いていないエリアは、地図に影も出さない（`TownMap`）。
 * 開いた瞬間に初めて姿を現す。
 */
export const AREAS: Area[] = [
  {
    id: 'coach',
    name: '街道の馬車止め',
    ruby: 'かいどうのばしゃどめ',
    x: 6,
    y: 88,
    entrySceneId: 'scn_coach_stop',
    mainScenarioId: 'sc_coach',
    openFromStart: true,
  },
  {
    id: 'gate',
    name: '町の入り口',
    ruby: 'まちのいりぐち',
    x: 16,
    y: 74,
    entrySceneId: 'scn_gate_front',
    mainScenarioId: 'sc_gate',
    openFromStart: true,
  },
  {
    id: 'plaza',
    name: '大門広場',
    ruby: 'だいもんひろば',
    x: 44,
    y: 60,
    entrySceneId: 'scn_plaza_fountain',
    mainScenarioId: 'sc_plaza',
    openFromStart: true,
  },
  {
    id: 'inn',
    name: 'まんげつ亭',
    ruby: 'まんげつてい',
    x: 24,
    y: 38,
    entrySceneId: 'scn_inn_hall',
    mainScenarioId: 'sc_inn',
  },
  {
    id: 'clocktower',
    name: '時計塔',
    ruby: 'とけいとう',
    x: 72,
    y: 30,
    entrySceneId: 'scn_tower_foot',
    mainScenarioId: 'sc_clocktower',
  },
  {
    id: 'alley',
    name: '裏路地',
    ruby: 'うらろじ',
    x: 84,
    y: 68,
    entrySceneId: 'scn_alley_back',
    mainScenarioId: 'sc_alley',
  },
];

/** id からエリアを取得する */
export function getArea(id: string): Area | undefined {
  return AREAS.find((a) => a.id === id);
}
