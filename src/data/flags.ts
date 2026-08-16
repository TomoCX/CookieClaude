import type { FlagDef, FlagNeeds, GameState } from '../types';
import { ITEMS } from './items';
import { PUZZLES } from './puzzles';
import { SCENARIOS } from './scenarios';

/**
 * フラグ。「いま何が済んでいるか」を、ひとつの名前で呼べるようにしたもの。
 *
 * ## 保守のために決めていること
 *
 * 1. **値を保存しない。** フラグは進行状況（`GameState`）から毎回引き直す。
 *    セーブに旗の一覧を持つと、旗と中身が食いちがう壊れかたをするため。
 * 2. **条件はデータで書く。** `needs` に「どの id を見るか」を並べるだけで、
 *    判定は下の `testFlag()` 一か所しか行わない。おかげで
 *    `registry.ts` が実在しない id を起動時に見つけられる。
 * 3. **旗を足しても画面側は変えない。** 実績もツールも、この並びを読むだけ。
 *
 * 足しかたは docs/DEVELOPMENT.md の「フラグを足す」。
 * id は `fl_*`。
 */
export const FLAGS: FlagDef[] = [
  /* ---- 本筋 ---- */
  {
    id: 'fl_arrived',
    group: '本筋',
    name: '馬車を降りた',
    note: '街道の馬車止めの本筋を読み終えた',
    needs: { scenarios: ['sc_coach'] },
  },
  {
    id: 'fl_entered_town',
    group: '本筋',
    name: '町に入った',
    note: '門番モーリスから話を聞いた',
    needs: { scenarios: ['sc_gate'] },
  },
  {
    id: 'fl_light_seen',
    group: '本筋',
    name: '塔の明かりを知った',
    note: '大門広場の本筋を読み終えた',
    needs: { scenarios: ['sc_plaza'] },
  },
  {
    id: 'fl_alibi',
    group: '本筋',
    name: '三十分の空白を知った',
    note: 'まんげつ亭の本筋を読み終えた。水車小屋が開くのもここ。',
    needs: { scenarios: ['sc_inn'] },
  },
  {
    id: 'fl_gear_moved',
    group: '本筋',
    name: '細工に気づいた',
    note: '時計塔の本筋を読み終えた',
    needs: { scenarios: ['sc_clocktower'] },
  },
  {
    id: 'fl_miller_heard',
    group: '本筋',
    name: '粉屋の話を聞いた',
    note: '水車小屋の本筋を読み終えた',
    needs: { scenarios: ['sc_mill'] },
  },
  {
    id: 'fl_case_closed',
    group: '本筋',
    name: '事件が解けた',
    note: '裏路地の本筋を読み終えた（物語の結び）',
    needs: { scenarios: ['sc_alley'] },
  },

  /* ---- 探索 ---- */
  {
    id: 'fl_desk_searched',
    group: '探索',
    name: '帳場を調べつくした',
    note: 'まんげつ亭の帳場にある調べどころを四つとも見た',
    needs: {
      props: ['prp_desk_shelf', 'prp_desk_vase', 'prp_desk_painting', 'prp_desk_ledger'],
    },
  },
  {
    id: 'fl_mill_searched',
    group: '探索',
    name: '水車小屋を調べつくした',
    note: '水車小屋の中の調べどころを三つとも見た',
    needs: { props: ['prp_mill_wheel', 'prp_mill_sacks', 'prp_mill_coat'] },
  },
  {
    id: 'fl_underground',
    group: '探索',
    name: '地下まで降りた',
    note: 'マンホールの底に落ちているものを両方とも拾った',
    needs: { items: ['it_tile', 'it_chain'] },
  },
  {
    id: 'fl_merchant_met',
    group: '探索',
    name: '旅の商人と話した',
    note: '門前でトビーの立ち話を読んだ（分かれ道のある会話）',
    needs: { scenarios: ['sc_gate_toby'] },
  },
  {
    id: 'fl_whole_town',
    group: '探索',
    name: '町じゅうを歩いた',
    note: '七つのエリアがすべて開いている',
    needs: { areas: ['coach', 'gate', 'plaza', 'inn', 'clocktower', 'mill', 'alley'] },
  },

  /* ---- 収集 ---- */
  {
    id: 'fl_ribbon',
    group: '収集',
    name: '髪ひもを見つけた',
    note: '水車小屋の中に残されていた髪ひもを手に入れた',
    needs: { items: ['it_ribbon'] },
  },
  {
    id: 'fl_all_items',
    group: '収集',
    name: '落とし物をすべて集めた',
    note: 'コレクションが埋まった',
    needs: { allItems: true },
  },

  /* ---- やりこみ ---- */
  {
    id: 'fl_bells_counted',
    group: 'やりこみ',
    name: '鐘のナゾを解いた',
    note: '鐘にまつわる二問（鳴る回数・鳴り終わり）に正解した',
    needs: { puzzles: ['pz_strike', 'pz_interval'] },
  },
  {
    id: 'fl_mill_puzzles',
    group: 'やりこみ',
    name: '水車小屋のナゾを解いた',
    note: '水車小屋の二問に正解した',
    needs: { puzzles: ['pz_wheel', 'pz_sacks'] },
  },
  {
    id: 'fl_all_puzzles',
    group: 'やりこみ',
    name: 'ナゾをすべて解いた',
    note: 'ナゾ事典が埋まった',
    needs: { allPuzzles: true },
  },
  {
    id: 'fl_picarat_300',
    group: 'やりこみ',
    name: 'ひらめき指数 300',
    note: '累計 300 ピカラットに届いた',
    needs: { picarat: 300 },
  },
  {
    id: 'fl_all_talked',
    group: 'やりこみ',
    name: '町の全員と話した',
    note: '立ち話もふくめ、すべての会話を読んだ',
    needs: { allScenarios: true },
  },
];

/** id からフラグを引く */
export function getFlag(id: string): FlagDef | undefined {
  return FLAGS.find((f) => f.id === id);
}

/* ---- 判定 ---- */

/**
 * 条件をひとつずつに分けて、満たしているかを添えて返す。
 *
 * 判定の本体はここだけ。`flagOn()` も開発者ツールも、これを通す。
 * 条件を増やすときは、`FlagNeeds` に項目を足して、ここに一行足す。
 */
export function flagChecklist(
  needs: FlagNeeds,
  state: GameState,
): { label: string; ok: boolean }[] {
  const rows: { label: string; ok: boolean }[] = [];
  const all = <T,>(list: T[] | undefined, has: (v: T) => boolean, label: (v: T) => string) => {
    for (const v of list ?? []) rows.push({ label: label(v), ok: has(v) });
  };

  all(needs.scenarios, (id) => state.clearedScenarios.includes(id), (id) => `会話 ${id} を読了`);
  all(needs.puzzles, (id) => state.solvedPuzzles.includes(id), (id) => `ナゾ ${id} に正解`);
  all(
    needs.items,
    (id) => state.collected.some((c) => c.itemId === id),
    (id) => `アイテム ${id} を所持`,
  );
  all(needs.props, (id) => state.examined.includes(id), (id) => `調べどころ ${id} を調査`);
  all(needs.areas, (id) => state.openAreas.includes(id), (id) => `エリア ${id} が開放`);

  if (needs.picarat != null) {
    rows.push({
      label: `ピカラット ${needs.picarat} 以上（いま ${state.picarat}）`,
      ok: state.picarat >= needs.picarat,
    });
  }
  if (needs.allPuzzles) {
    rows.push({
      label: `ナゾをすべて正解（${state.solvedPuzzles.length} / ${PUZZLES.length}）`,
      ok: PUZZLES.every((p) => state.solvedPuzzles.includes(p.id)),
    });
  }
  if (needs.allItems) {
    rows.push({
      label: `アイテムをすべて所持（${state.collected.length} / ${ITEMS.length}）`,
      ok: ITEMS.every((i) => state.collected.some((c) => c.itemId === i.id)),
    });
  }
  if (needs.allScenarios) {
    rows.push({
      label: `会話をすべて読了（${state.clearedScenarios.length} / ${SCENARIOS.length}）`,
      ok: SCENARIOS.every((s) => state.clearedScenarios.includes(s.id)),
    });
  }

  return rows;
}

/** その条件を満たしているか */
export function testNeeds(needs: FlagNeeds, state: GameState): boolean {
  return flagChecklist(needs, state).every((r) => r.ok);
}

/** そのフラグが立っているか。知らない id は立っていないものとして扱う。 */
export function flagOn(id: string, state: GameState): boolean {
  const def = getFlag(id);
  return def ? testNeeds(def.needs, state) : false;
}

