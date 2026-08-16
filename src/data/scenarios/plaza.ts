import type { Scenario } from '../../types';

/** 大門広場（エリア plaza）の会話 */
export const PLAZA_SCENARIOS: Scenario[] = [
  {
    id: 'sc_plaza',
    title: '大門広場のうわさ話',
    bg: 'plaza',
    kind: 'main',
    coin: 2,
    unlocks: ['clocktower', 'inn'],
    note: {
      id: 'note_rumor',
      title: '広場のうわさ',
      body: '三日前の夜、時計塔の窓に明かりが灯っていた。だが時計塔の鍵を持つギアじいさんは、その晩ずっと宿屋にいたという。',
    },
    lines: [
      {
        speaker: 'martha',
        pose: 'normal',
        text: { ja: 'あら、旅の方？うちはまんげつ亭って宿をやってるマーサだよ。', en: "Oh, travelers? I'm Martha — I run the Full Moon Inn." },
      },
      {
        speaker: 'cookie',
        pose: 'normal',
        text: { ja: '時計塔の管理人さんをさがしてるんですけど……。', en: "We're looking for the clock tower's caretaker..." },
      },
      {
        speaker: 'martha',
        pose: 'normal',
        text: { ja: 'ギアじいさんならもう店じまいだよ。……あの晩からずっと元気がなくてねえ。', en: "Old Gear's already closed up. He's been low ever since that night." },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: { ja: 'あの晩、とは？', en: 'That night, you say?' },
      },
      {
        speaker: 'martha',
        pose: 'surprised',
        text: { ja: '三日前さ。だれもいないはずの時計塔に、明かりがついてたんだよ。ゾッとしたねえ。', en: "Three nights ago. A light in the clock tower, when nobody should've been there. Gave me chills." },
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: { ja: 'ええっ！じゃあ、だれかが忍びこんだってことですか？', en: 'What?! So someone snuck in?' },
      },
      {
        speaker: 'martha',
        pose: 'normal',
        text: { ja: 'それがねえ、鍵を持ってるのはギアじいさんだけ。その晩はうちの宿で朝までいたのさ。', en: 'Thing is, only Old Gear has the key — and he was at my inn till morning.' },
      },
      {
        speaker: 'claude',
        pose: 'happy',
        text: { ja: 'なるほど。……鍵は一つ、人は二つの場所にいられない。実に結構。', en: 'I see. One key, and no man can be in two places. Splendid.' },
      },
      {
        speaker: 'cookie',
        pose: 'think',
        text: { ja: 'せんせい、いま「結構」って言いました？', en: 'Professor, did you just say "splendid"?' },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: 'ナゾが深まったのだからね。行こう、クッキー。宿屋と時計塔だ。', en: 'The mystery deepened. Come, Cookie. The inn, and then the tower.' },
      },
    ],
  },
  {
    id: 'sc_plaza_lily',
    title: '花売りのリリー',
    bg: 'plaza',
    kind: 'flavor',
    coin: 1,
    lines: [
      {
        speaker: 'lily',
        pose: 'happy',
        text: { ja: 'お花、いかがですか？今朝つんだばかりのメープルベルですよ。', en: 'Flowers, sir? Maple bells, picked just this morning.' },
      },
      {
        speaker: 'cookie',
        pose: 'happy',
        text: { ja: 'かわいい名前ですね。鐘みたいな形だからかな。', en: 'What a nice name. Is it because they look like little bells?' },
      },
      {
        speaker: 'lily',
        pose: 'normal',
        text: { ja: 'そう。時計塔の鐘ににてるでしょ。……この町の子は、みんなこの花で育つの。', en: "That's right — like the tower bell. Every child in this town grows up with them." },
      },
      {
        speaker: 'lily',
        pose: 'think',
        text: { ja: '小子がひとり、毎朝ここで花を見てるわ。買わないけど、じっとね。', en: "There's a little one who comes every morning to look. Never buys. Just looks." },
      },
    ],
  },
];
