import type { Scene } from '../types';

/**
 * シーン。背景 1 枚に 1 つ対応する画面。
 *
 * 座標はどれもシーンの中の 0〜1。
 * - street … x は道の左はし（0）から右はし（1）。人とナゾは道の上に立つので y を使わない
 * - view / closeup … x も y も、見えている一枚絵に対する位置
 *
 * exits でシーンどうしをつなぐ。行き先が別のエリアのシーンなら、
 * そのまま地図上の現在地も移る（エリアの境を越えたことになる）。
 * 行きと帰りの両方を書くこと（`registry.ts` が起動時に確かめる）。
 *
 * id の付けかた:
 *   シーン scn_<エリア>_<場所> ／ 人 npc_* ／ ナゾの置き場 pzs_* ／
 *   キラキラ skl_* ／ 出口 ex_<from>_<to>
 */
export const SCENES: Scene[] = [
  /* ---- 街道の馬車止め ---- */
  {
    id: 'scn_coach_stop',
    name: '馬車の停留所',
    areaId: 'coach',
    kind: 'street',
    bg: 'highway',
    startX: 0.06,
    npcs: [{ id: 'npc_driver', characterId: 'driver', x: 0.26, scenarioId: 'sc_coach' }],
    puzzles: [{ id: 'pzs_coach_1', puzzleId: 'pz_riddle', x: 0.62, look: 'sundial' }],
    sparkles: [
      { id: 'skl_coach_1', itemId: 'it_ticket', x: 0.13, y: 0.74 },
      { id: 'skl_coach_2', itemId: 'it_berry', x: 0.83, y: 0.62 },
    ],
    exits: [{ id: 'ex_coach_gate', to: 'scn_gate_front', dir: 'far', x: 0.5, y: 0.5 }],
  },

  /* ---- 町の入り口 ---- */
  {
    id: 'scn_gate_front',
    name: '大門の前',
    areaId: 'gate',
    kind: 'street',
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
      { id: 'pzs_gate_1', puzzleId: 'pz_strike', x: 0.5, look: 'clock' },
      { id: 'pzs_gate_2', puzzleId: 'pz_lamps', x: 0.93, look: 'pocketwatch' },
    ],
    sparkles: [
      { id: 'skl_gate_1', itemId: 'it_stone', x: 0.38, y: 0.78 },
      { id: 'skl_gate_2', itemId: 'it_key', x: 0.68, y: 0.46 },
    ],
    exits: [
      { id: 'ex_gate_coach', to: 'scn_coach_stop', dir: 'near', x: 0.08, y: 0.83 },
      { id: 'ex_gate_plaza', to: 'scn_plaza_fountain', dir: 'far', x: 0.86, y: 0.5 },
    ],
  },

  /* ---- 大門広場（2 シーン） ---- */
  {
    id: 'scn_plaza_fountain',
    name: '噴水前',
    areaId: 'plaza',
    kind: 'street',
    bg: 'plaza',
    startX: 0.06,
    npcs: [
      { id: 'npc_martha', characterId: 'martha', x: 0.27, scenarioId: 'sc_plaza' },
      { id: 'npc_lily', characterId: 'lily', x: 0.76, scenarioId: 'sc_plaza_lily' },
    ],
    puzzles: [
      { id: 'pzs_plaza_1', puzzleId: 'pz_interval', x: 0.5, look: 'clock' },
      { id: 'pzs_plaza_2', puzzleId: 'pz_mirror', x: 0.93, look: 'pocketwatch' },
    ],
    sparkles: [{ id: 'skl_plaza_1', itemId: 'it_flower', x: 0.16, y: 0.7 }],
    exits: [
      { id: 'ex_plaza_gate', to: 'scn_gate_front', dir: 'near', x: 0.06, y: 0.83 },
      { id: 'ex_plaza_inn', to: 'scn_inn_hall', dir: 'left', x: 0.34, y: 0.56 },
      { id: 'ex_plaza_tower', to: 'scn_tower_foot', dir: 'far', x: 0.88, y: 0.48 },
      // 足もとのマンホールを覗きこむ。同じエリアの中でシーンが重なる例。
      { id: 'ex_plaza_manhole', to: 'scn_plaza_manhole', dir: 'into', x: 0.62, y: 0.82 },
    ],
  },
  {
    id: 'scn_plaza_manhole',
    name: 'マンホールの底',
    areaId: 'plaza',
    kind: 'view',
    backdrop: 'manhole',
    npcs: [],
    puzzles: [],
    sparkles: [
      { id: 'skl_manhole_1', itemId: 'it_tile', x: 0.33, y: 0.66 },
      { id: 'skl_manhole_2', itemId: 'it_chain', x: 0.62, y: 0.55 },
    ],
    exits: [{ id: 'ex_manhole_plaza', to: 'scn_plaza_fountain', dir: 'back', x: 0.5, y: 0.13 }],
  },

  /* ---- まんげつ亭 ---- */
  {
    id: 'scn_inn_hall',
    name: 'まんげつ亭の食堂',
    areaId: 'inn',
    kind: 'street',
    bg: 'inn',
    startX: 0.06,
    npcs: [
      { id: 'npc_gear', characterId: 'gear', x: 0.28, scenarioId: 'sc_inn' },
      { id: 'npc_martha_inn', characterId: 'martha', x: 0.78, scenarioId: 'sc_inn_martha' },
    ],
    puzzles: [
      { id: 'pzs_inn_1', puzzleId: 'pz_stopped', x: 0.55, look: 'pocketwatch' },
      { id: 'pzs_inn_2', puzzleId: 'pz_soup', x: 0.94, look: 'clock' },
    ],
    sparkles: [
      { id: 'skl_inn_1', itemId: 'it_paper', x: 0.2, y: 0.44 },
      { id: 'skl_inn_2', itemId: 'it_coaster', x: 0.7, y: 0.76 },
    ],
    exits: [
      { id: 'ex_inn_plaza', to: 'scn_plaza_fountain', dir: 'right', x: 0.92, y: 0.56 },
      // 奥の帳場へ。部屋の中も一枚絵のシーンとして作る。
      { id: 'ex_inn_desk', to: 'scn_inn_desk', dir: 'far', x: 0.46, y: 0.45 },
    ],
  },
  {
    id: 'scn_inn_desk',
    name: { ja: 'まんげつ亭の帳場', en: 'The Inn’s Front Desk' },
    areaId: 'inn',
    kind: 'view',
    backdrop: 'room',
    npcs: [],
    puzzles: [],
    sparkles: [],
    // 部屋の中は、押すと文が出る「調べどころ」で埋める
    props: [
      {
        id: 'prp_desk_shelf',
        name: { ja: '作りつけの棚', en: 'The Built-in Shelf' },
        text: {
          ja: '背に年号を入れた帳簿が、ずらりと並んでいる。いちばん手前の一冊だけ埃が薄い。だれかが最近ひらいたらしい。',
          en: 'Ledgers line the shelf, one per year. Only the nearest is free of dust — someone opened it recently.',
        },
        x: 0.2,
        y: 0.4,
        w: 0.3,
        h: 0.46,
      },
      {
        id: 'prp_desk_vase',
        name: { ja: '青い壺', en: 'The Blue Jar' },
        text: {
          ja: 'まんげつ亭に代々ある壺。マーサいわく「割れたら宿がかたむく」。覗きこむと、底に乾いた花びらが一枚だけ残っている。',
          en: 'A jar the inn has kept for generations. Martha says the place would tilt if it broke. One dried petal rests at the bottom.',
        },
        x: 0.74,
        y: 0.28,
        w: 0.12,
        h: 0.16,
      },
      {
        id: 'prp_desk_painting',
        name: { ja: '壁の風景画', en: 'The Landscape on the Wall' },
        text: {
          ja: '丘の上から町を見おろした絵。よく見ると、描かれた時計塔の窓に、小さく明かりが入れてある。絵が描かれたのは十年前だという。',
          en: 'The town seen from the hill. In the painted clocktower, one window has been given a tiny light. The painting is ten years old.',
        },
        x: 0.515,
        y: 0.25,
        w: 0.2,
        h: 0.2,
      },
      {
        id: 'prp_desk_ledger',
        name: { ja: '開いたままの宿帳', en: 'The Open Guest Book' },
        text: {
          ja: '三日前の欄に、名前がひとつだけ書かれずに空いている。書きかけの線が一本だけ残っていて、そこで筆が止まっている。',
          en: 'On the page for three nights ago, one entry is left blank — a single stroke begun, then abandoned.',
        },
        x: 0.505,
        y: 0.63,
        w: 0.16,
        h: 0.1,
        // 調べると、その場で手に入る
        gives: 'it_quill',
      },
    ],
    exits: [{ id: 'ex_desk_inn', to: 'scn_inn_hall', dir: 'near', x: 0.5, y: 0.9 }],
  },

  /* ---- 時計塔（2 シーン） ---- */
  {
    id: 'scn_tower_foot',
    name: '時計塔の足もと',
    areaId: 'clocktower',
    kind: 'street',
    bg: 'clocktower',
    startX: 0.06,
    npcs: [
      { id: 'npc_gear_tower', characterId: 'gear', x: 0.27, scenarioId: 'sc_clocktower' },
      { id: 'npc_hans', characterId: 'hans', x: 0.75, scenarioId: 'sc_tower_hans' },
    ],
    puzzles: [
      { id: 'pzs_tower_1', puzzleId: 'pz_gears', x: 0.52, look: 'sundial' },
      { id: 'pzs_tower_2', puzzleId: 'pz_order', x: 0.94, look: 'clock' },
    ],
    sparkles: [
      { id: 'skl_tower_1', itemId: 'it_screw', x: 0.14, y: 0.72 },
      { id: 'skl_tower_2', itemId: 'it_shard', x: 0.72, y: 0.4 },
    ],
    exits: [
      { id: 'ex_tower_plaza', to: 'scn_plaza_fountain', dir: 'near', x: 0.06, y: 0.83 },
      { id: 'ex_tower_alley', to: 'scn_alley_back', dir: 'right', x: 0.9, y: 0.6 },
      // 壁の掲示板に寄る。closeup は view をさらに拡大した図。
      { id: 'ex_tower_board', to: 'scn_tower_board', dir: 'into', x: 0.38, y: 0.4 },
    ],
  },
  {
    id: 'scn_tower_board',
    name: '掲示板の貼り紙',
    areaId: 'clocktower',
    kind: 'closeup',
    backdrop: 'noticeboard',
    npcs: [],
    puzzles: [],
    sparkles: [{ id: 'skl_board_1', itemId: 'it_pin', x: 0.74, y: 0.31 }],
    exits: [{ id: 'ex_board_tower', to: 'scn_tower_foot', dir: 'back', x: 0.5, y: 0.88 }],
  },

  /* ---- 裏路地 ---- */
  {
    id: 'scn_alley_back',
    name: '裏路地の突きあたり',
    areaId: 'alley',
    kind: 'street',
    bg: 'alley',
    startX: 0.06,
    npcs: [
      { id: 'npc_pete', characterId: 'pete', x: 0.26, scenarioId: 'sc_alley_pete' },
      { id: 'npc_mint', characterId: 'mint', x: 0.8, scenarioId: 'sc_alley' },
    ],
    puzzles: [{ id: 'pzs_alley_1', puzzleId: 'pz_overlap', x: 0.54, look: 'clock' }],
    sparkles: [
      { id: 'skl_alley_1', itemId: 'it_glove', x: 0.44, y: 0.75 },
      { id: 'skl_alley_2', itemId: 'it_letter', x: 0.9, y: 0.55 },
    ],
    exits: [{ id: 'ex_alley_tower', to: 'scn_tower_foot', dir: 'left', x: 0.06, y: 0.6 }],
  },
];

/** id からシーンを取得する */
export function getScene(id: string): Scene | undefined {
  return SCENES.find((s) => s.id === id);
}

/** そのエリアに属するシーンを、書いた順に返す */
export function scenesOfArea(areaId: string): Scene[] {
  return SCENES.filter((s) => s.areaId === areaId);
}

/** シーンが無いときに使う、道の入口あたりのカメラ位置 */
const FALLBACK_START_X = 0.06;

/**
 * そのシーンに入ってきたときのカメラ位置。
 * 見わたさないシーンと、知らない id には既定値を返す。
 */
export function sceneStartX(id: string): number {
  const scene = getScene(id);
  return scene?.kind === 'street' ? scene.startX : FALLBACK_START_X;
}
