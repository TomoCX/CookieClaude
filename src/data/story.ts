import type { GameState } from '../types';

/**
 * 「深まるナゾ」に出す、ストーリー全体にかかわる情報。
 * ナゾ事典（独立したナゾ解き）とは役わりを分けている。
 */

/** 概要 */
export const STORY_SUMMARY =
  'ある朝、探偵クロードのもとに一通の手紙が届いた。差出人の名前はなく、' +
  '書かれていたのはたった一行。\n' +
  '「町の時計が十三回鳴る夜、町の宝が消える」\n' +
  '消印はメープル町。クロードと助手のクッキーは、その町へ向かった。';

/** 事件の中心にある問い */
export const CENTRAL_QUESTIONS = [
  '手紙の差出人は誰か',
  '「十三回鳴る」とはどういうことか',
  '「町の宝」とは何を指すのか',
];

/** 本筋を読み進めると増えていく「判明していること」 */
export interface StoryBeat {
  id: string;
  /** このシナリオを読み終えると明らかになる */
  afterScenario: string;
  heading: string;
  body: string;
}

export const STORY_BEATS: StoryBeat[] = [
  {
    id: 'beat_letter',
    afterScenario: 'sc_gate',
    heading: '手紙はこの町から出された',
    body:
      '消印はメープル町。門番のモーリスも、町の時計が十三回鳴ったことは一度もないと言う。' +
      'つまり手紙は、まだ起きていないことを書いている。',
  },
  {
    id: 'beat_light',
    afterScenario: 'sc_plaza',
    heading: '三日前の夜、塔に明かりが灯った',
    body:
      'だれもいないはずの時計塔に明かりが見えた。だが鍵を持つギアじいさんは、' +
      'その晩まんげつ亭にいたという。鍵は一つ、人は二つの場所にいられない。',
  },
  {
    id: 'beat_coat',
    afterScenario: 'sc_inn',
    heading: '鍵は三十分だけ無人になった',
    body:
      'ギアじいさんは十時頃、三十分ほど厨房へ向かっている。その間、' +
      '鍵の入った上着は食堂の掛けに残されたままだった。鍵を「持つ人」と「使える人」は別だ。',
  },
  {
    id: 'beat_mill',
    afterScenario: 'sc_mill',
    heading: '歯車は水車小屋から持ち出された',
    body:
      '塔の予備の歯車は、川ぞいの水車小屋に寝かせてある。三日前の夕方、山はひとつぶん低くなった。' +
      '減ったのはいちばん下の段だけ。背の高い者なら、わざわざ下から取らない。',
  },
  {
    id: 'beat_gear',
    afterScenario: 'sc_clocktower',
    heading: '鐘は故障ではなく、細工されている',
    body:
      '歯車を一つずらせば、鐘は一回多く鳴る。十三回は予言ではなく予告。' +
      'そして塔は来月取り壊されることが決まっている。',
  },
  {
    id: 'beat_truth',
    afterScenario: 'sc_alley',
    heading: '「町の宝」は時計塔だった',
    body:
      '手紙を書いたのはミント。塔が壊されると知り、町の人に空を見上げてほしかった。' +
      '手紙は犯行予告ではなく、助けを呼ぶ声だった。',
  },
];

/** 出会った登場人物（本筋・立ち話どちらでもよい） */
export const CAST: { id: string; name: string; role: string; from: string }[] = [
  { id: 'maurice', name: 'モーリス', role: '町の門番', from: 'sc_gate' },
  { id: 'toby', name: 'トビー', role: '旅の商人', from: 'sc_gate_toby' },
  { id: 'martha', name: 'マーサ', role: 'まんげつ亭の女将', from: 'sc_plaza' },
  { id: 'lily', name: 'リリー', role: '広場の花売り', from: 'sc_plaza_lily' },
  { id: 'gear', name: 'ギアじいさん', role: '時計塔の管理人', from: 'sc_inn' },
  { id: 'nell', name: 'ネル', role: '川ぞいの粉屋', from: 'sc_mill' },
  { id: 'hans', name: 'ハンス', role: '塔の見物人', from: 'sc_tower_hans' },
  { id: 'pete', name: 'ピート', role: '路地の少年', from: 'sc_alley_pete' },
  { id: 'mint', name: 'ミント', role: '手紙の差出人', from: 'sc_alley' },
];

/** いま読める「判明していること」だけを返す */
export function knownBeats(state: GameState): StoryBeat[] {
  return STORY_BEATS.filter((b) => state.clearedScenarios.includes(b.afterScenario));
}

/** すでに出会った登場人物だけを返す */
export function metCast(state: GameState) {
  return CAST.filter((c) => state.clearedScenarios.includes(c.from));
}
