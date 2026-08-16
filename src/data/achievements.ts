import type { Achievement } from '../types';

/**
 * 実績。フラグ（`src/data/flags.ts`）が **すべて** 立つと解放される。
 *
 * 実績そのものは条件を持たない。持つのはフラグのほうで、
 * ここに書くのは「どのフラグの組み合わせか」と「なんと呼ぶか」だけ。
 * 条件を足したいときは、まずフラグを一本立ててから、ここで組み合わせる。
 *
 * 解放されると画面の中央上部にしばらく知らせが出て、
 * メインメニューの「実績」に残る。id は `ac_*`。
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ac_arrival',
    name: { ja: 'メープル町に着く', en: 'Arrival at Maple Town' },
    desc: { ja: '街道の馬車を降り、物語が始まった。', en: 'You stepped off the coach, and it began.' },
    icon: '🐎',
    flags: ['fl_arrived'],
  },
  {
    id: 'ac_first_step',
    name: { ja: '町の門をくぐる', en: 'Through the Gate' },
    desc: { ja: '門番モーリスから話を聞いた。', en: 'You heard out Maurice at the gate.' },
    icon: '🚪',
    flags: ['fl_entered_town'],
  },
  {
    id: 'ac_merchant',
    name: { ja: '旅の商人に聞く', en: 'A Word with the Pedlar' },
    desc: {
      ja: 'トビーの荷を検め、どちらの話を選んでも一つ手がかりを得た。',
      en: 'You went through Toby’s wares — either question yielded a clue.',
    },
    icon: '🧳',
    flags: ['fl_merchant_met'],
  },
  {
    id: 'ac_tower_light',
    name: { ja: '塔の明かり', en: 'The Light in the Tower' },
    desc: {
      ja: '誰もいないはずの時計塔に、明かりが灯った晩のことを知った。',
      en: 'You learned of the night a light burned in the empty tower.',
    },
    icon: '🕯',
    flags: ['fl_light_seen'],
  },
  {
    id: 'ac_alibi',
    name: { ja: '三十分の空白', en: 'The Missing Half-Hour' },
    desc: {
      ja: '鍵を持つ人と、鍵を使える人は別だと気づいた。',
      en: 'You saw that holding the key and using it are not the same.',
    },
    icon: '🗝',
    flags: ['fl_alibi'],
  },
  {
    id: 'ac_miller',
    name: { ja: '水車小屋の主', en: 'Keeper of the Mill' },
    desc: {
      ja: '粉屋ネルの話を聞き、小屋の中も残らず調べた。',
      en: 'You heard Nell out and searched every corner of her mill.',
    },
    icon: '🌾',
    // 二本のフラグがそろって初めて解放される例
    flags: ['fl_miller_heard', 'fl_mill_searched'],
  },
  {
    id: 'ac_ribbon',
    name: { ja: '緑の髪ひも', en: 'The Green Ribbon' },
    desc: {
      ja: '水車小屋の掛け釘から、持ち主の分かる品を見つけた。',
      en: 'From a peg in the mill, you took something that names its owner.',
    },
    icon: '🎀',
    flags: ['fl_ribbon'],
  },
  {
    id: 'ac_mill_puzzles',
    name: { ja: '粉屋の出す問い', en: 'The Miller’s Questions' },
    desc: {
      ja: '水車小屋の二問を、どちらも解いた。',
      en: 'You solved both of the puzzles at the mill.',
    },
    icon: '⚖️',
    flags: ['fl_mill_puzzles'],
  },
  {
    id: 'ac_gearwork',
    name: { ja: '歯車ひとつぶんの細工', en: 'One Gear Out of Place' },
    desc: {
      ja: '鐘が十三回鳴る仕組みを、自分の目で確かめた。',
      en: 'You saw for yourself how a bell is made to strike thirteen.',
    },
    icon: '⚙️',
    flags: ['fl_gear_moved'],
  },
  {
    id: 'ac_deskwork',
    name: { ja: '帳場のすみずみ', en: 'Every Inch of the Desk' },
    desc: {
      ja: 'まんげつ亭の帳場にあるものを、四つとも調べた。',
      en: 'You examined all four things at the inn’s front desk.',
    },
    icon: '📚',
    flags: ['fl_desk_searched'],
  },
  {
    id: 'ac_underground',
    name: { ja: '地下の落とし物', en: 'What the Drain Kept' },
    desc: {
      ja: 'マンホールの底に落ちていたものを、両方とも拾った。',
      en: 'You picked up both things lying at the bottom of the manhole.',
    },
    icon: '🕳',
    flags: ['fl_underground'],
  },
  {
    id: 'ac_bells',
    name: { ja: '鐘のかぞえかた', en: 'How to Count a Bell' },
    desc: {
      ja: '鐘にまつわる二問を解いた。数えるのは鐘ではなく、その間である。',
      en: 'You solved both bell puzzles. Count the gaps, not the strokes.',
    },
    icon: '🔔',
    flags: ['fl_bells_counted'],
  },
  {
    id: 'ac_wanderer',
    name: { ja: '町じゅうを歩いた', en: 'All of Maple Town' },
    desc: {
      ja: '七つのエリアをすべて開いた。',
      en: 'You opened up all seven areas of the town.',
    },
    icon: '🗺',
    flags: ['fl_whole_town'],
  },
  {
    id: 'ac_collector',
    name: { ja: '落とし物拾い', en: 'The Collector' },
    desc: {
      ja: '町に散らばっていた品を、ひとつ残らず集めた。',
      en: 'You gathered every last trinket scattered around town.',
    },
    icon: '🧺',
    flags: ['fl_all_items'],
  },
  {
    id: 'ac_puzzle_master',
    name: { ja: 'ナゾ事典を埋める', en: 'The Index Complete' },
    desc: {
      ja: 'すべてのナゾを解き、ひらめき指数 300 に届いた。',
      en: 'Every puzzle solved, and three hundred picarats earned.',
    },
    icon: '📙',
    flags: ['fl_all_puzzles', 'fl_picarat_300'],
  },
  {
    id: 'ac_true_detective',
    name: { ja: 'メープル町の名探偵', en: 'Detective of Maple Town' },
    desc: {
      ja: '事件を解き、ナゾをすべて解き、町の全員と話し、品をすべて集めた。',
      en: 'The case closed, every puzzle solved, everyone met, everything found.',
    },
    icon: '🎩',
    // 四本そろって初めて出る、いちばん重い実績
    flags: ['fl_case_closed', 'fl_all_puzzles', 'fl_all_talked', 'fl_all_items'],
    secret: true,
  },
];

/** id から実績を引く */
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
