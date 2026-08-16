import type { Scenario } from '../../types';

/** 街道の馬車止め（エリア coach）の会話 */
export const COACH_SCENARIOS: Scenario[] = [
  {
    id: 'sc_coach',
    title: '街道の馬車止め',
    bg: 'highway',
    kind: 'main',
    coin: 2,
    lines: [
      {
        text: { ja: '朝もやの立ちこめる街道。乗合馬車が、ゆっくりと速度を落として止まった。', en: 'A misty highway. The coach slowed, and came to a halt.' },
      },
      {
        speaker: 'driver',
        pose: 'normal',
        text: { ja: '着きましたよ、旦那がた。ここから先は歩きだ。馬車は町へは入れません。', en: "Here we are, gentlemen. You walk from here — coaches don't enter the town." },
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: { ja: 'わあ……先生、丘の向こうに屋根が見えます。あれがメープル町ですね！', en: "Wow... Professor, roofs beyond the hill. That must be Maple Town!" },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: 'ああ。……ここからが、我々の仕事だ。', en: 'Indeed. From here, the work begins.' },
      },
      {
        speaker: 'driver',
        pose: 'think',
        text: { ja: '物好きですなあ。近ごろあの町へ行きたがる者なんて、めったにいませんよ。', en: "Odd sort, you two. Hardly anyone asks for that town these days." },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: { ja: 'ほう。それはまた、なぜ。', en: 'Oh? And why is that?' },
      },
      {
        speaker: 'driver',
        pose: 'normal',
        text: { ja: 'さあね。見るものがなくなった、とでも言いますか。……気をつけて。', en: "Who knows. Nothing left to look at, they say. ...Mind yourselves." },
      },
      {
        text: { ja: '馬車は来た道を引き返していった。ふたりは、町へ続く坂道を歩きだす。', en: 'The coach turned back the way it came. The two set off up the slope.' },
      },
    ],
    note: {
      id: 'note_letter',
      title: '差出人のない手紙',
      body: '「町の時計が十三回鳴る夜、町の宝が消える」とだけ記されている。消印はメープル町。筆跡は整っているが、インクがところどころにじんでいる。',
    },
  },
];
