import type { GameState } from '../types';

/**
 * 「ふかまるナゾ」に出す、ストーリー全体にかかわる情報。
 * ナゾじてん（独立したナゾ解き）とは役わりを分けている。
 */

/** あらすじ */
export const STORY_SUMMARY =
  'ある朝、探偵クロードのもとに 一通の手紙が とどいた。差出人の名前はなく、' +
  '書かれていたのは たった一行。\n' +
  '「まちの時計が十三回鳴る夜、まちの宝が消える」\n' +
  '消印は メープル町。クロードと 助手のクッキーは、その町へ 向かうことにした。';

/** 事件の中心にある問い */
export const CENTRAL_QUESTIONS = [
  '手紙を 書いたのは だれか',
  '「十三回鳴る」とは どういうことか',
  '「まちの宝」とは 何を さすのか',
];

/** 本筋を読み進めると増えていく「わかっていること」 */
export interface StoryBeat {
  id: string;
  /** このシナリオを読み終えると 明らかになる */
  afterScenario: string;
  heading: string;
  body: string;
}

export const STORY_BEATS: StoryBeat[] = [
  {
    id: 'beat_letter',
    afterScenario: 'sc_gate',
    heading: '手紙は この町から 出された',
    body:
      '消印は メープル町。門番のモーリスも、町の時計が 十三回 鳴ったことは 一度もないと言う。' +
      'つまり 手紙は、まだ 起きていないことを 書いている。',
  },
  {
    id: 'beat_light',
    afterScenario: 'sc_plaza',
    heading: '三日前の夜、塔に 明かりがついた',
    body:
      'だれもいないはずの 時計塔に 明かりが見えた。だが 鍵を持つ ギアじいさんは、' +
      'その晩 まんげつ亭に いたという。鍵はひとつ、人はふたつの場所にいられない。',
  },
  {
    id: 'beat_coat',
    afterScenario: 'sc_inn',
    heading: '鍵は 三十分だけ ひとりになった',
    body:
      'ギアじいさんは 十時ごろ、三十分ほど 厨房へ 行っている。そのあいだ、' +
      '鍵の入った上着は 食堂の掛けに かかったままだった。鍵を「持つ人」と「使える人」は 別だ。',
  },
  {
    id: 'beat_gear',
    afterScenario: 'sc_clocktower',
    heading: '鐘は 故障ではなく、細工されている',
    body:
      '歯車を ひとつ ずらせば、鐘は 一回 多く鳴る。十三回は 予言ではなく 予告。' +
      'そして 塔は 来月 取りこわされることが 決まっている。',
  },
  {
    id: 'beat_truth',
    afterScenario: 'sc_alley',
    heading: '「まちの宝」は 時計塔だった',
    body:
      '手紙を書いたのは ミント。塔が こわされると知り、町の人に 顔を上げてほしかった。' +
      '手紙は 犯行予告ではなく、助けを呼ぶ声だった。',
  },
];

/** 出会った登場人物（本筋・立ち話 どちらでもよい） */
export const CAST: { id: string; name: string; role: string; from: string }[] = [
  { id: 'maurice', name: 'モーリス', role: '町の門番', from: 'sc_gate' },
  { id: 'toby', name: 'トビー', role: '旅の商人', from: 'sc_gate_toby' },
  { id: 'martha', name: 'マーサ', role: 'まんげつ亭の女将', from: 'sc_plaza' },
  { id: 'lily', name: 'リリー', role: '広場の花売り', from: 'sc_plaza_lily' },
  { id: 'gear', name: 'ギアじいさん', role: '時計塔の管理人', from: 'sc_inn' },
  { id: 'hans', name: 'ハンス', role: '塔の見物人', from: 'sc_tower_hans' },
  { id: 'pete', name: 'ピート', role: '路地の少年', from: 'sc_alley_pete' },
  { id: 'mint', name: 'ミント', role: '手紙の差出人', from: 'sc_alley' },
];

/** いま読める「わかっていること」だけを返す */
export function knownBeats(state: GameState): StoryBeat[] {
  return STORY_BEATS.filter((b) => state.clearedScenarios.includes(b.afterScenario));
}

/** すでに出会った登場人物だけを返す */
export function metCast(state: GameState) {
  return CAST.filter((c) => state.clearedScenarios.includes(c.from));
}
