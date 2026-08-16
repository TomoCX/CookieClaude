import type { Scenario } from '../../types';

/** まんげつ亭（エリア inn）の会話 */
export const INN_SCENARIOS: Scenario[] = [
  {
    id: 'sc_inn',
    title: '宿屋「まんげつ亭」',
    bg: 'inn',
    kind: 'main',
    coin: 4,
    // 川ぞいの水車小屋は、ここでギアじいさんに聞いて初めて行けるようになる
    unlocks: ['mill'],
    charm: {
      id: 'charm_spoon',
      name: 'まんげつのスプーン',
      desc: 'まんげつ亭の名物スープについてくる銀のスプーン。よく磨けば、鏡のように文字が読める。',
      icon: '🥄',
    },
    note: {
      id: 'note_alibi',
      title: 'ギアじいさんのアリバイ',
      body: 'ギアじいさんは三日前の夜、九時から朝まで宿の食堂にいた。ただし十時頃、三十分ほど席を外している。上着は掛けにかけたままだった。',
    },
    lines: [
      {
        speaker: 'gear',
        pose: 'normal',
        text: { ja: 'わしを疑っとるんじゃろ。……かまわんよ。鍵を持っとるのはわしだけじゃからな。', en: "You suspect me. That's fine. I'm the only one with a key, after all." },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: 'いいえ。わたしは疑ってはいません。確かめているだけです。', en: 'No. I do not suspect. I am merely confirming.' },
      },
      {
        speaker: 'gear',
        pose: 'think',
        text: { ja: '……あの晩は九時からずっとこの食堂じゃった。十時ごろ、三十分ほど厨房に行ったがな。', en: 'That night I was in this dining hall from nine. Stepped out to the kitchen around ten, half an hour or so.' },
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: { ja: '三十分！時計塔まで走れば、行って帰ってこられるんじゃ……？', en: 'Half an hour! You could run to the tower and back in that...' },
      },
      {
        speaker: 'martha',
        pose: 'normal',
        text: { ja: 'それはないよ。あたしがずっと厨房にいたもの。じいさん、スープのおかわり三杯だったねえ。', en: "Not a chance. I was in the kitchen the whole time. Three helpings of soup, wasn't it?" },
      },
      {
        speaker: 'gear',
        pose: 'happy',
        text: { ja: 'う、うるさいわい。うまかったんじゃからしかたなかろう。', en: 'Q-quiet, you. It was good soup. Nothing to be done about it.' },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: { ja: '……ひとつだけ、うかがっても？時計塔の鍵は、いつもどこに？', en: 'May I ask one thing? Where do you keep the tower key?' },
      },
      {
        speaker: 'gear',
        pose: 'normal',
        text: { ja: '上着の内ポケットじゃ。……上着は、そこの掛けにかけてあったがな。', en: 'Inner pocket of my coat. ...The coat was hanging right over there, mind you.' },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: { ja: 'もうひとつ。塔の歯車は、どこで手に入れておいでですか。', en: 'One more thing. Where do you come by the tower’s gears?' },
      },
      {
        speaker: 'gear',
        pose: 'normal',
        text: { ja: '川ぞいの水車小屋じゃ。粉屋のネルが、古い歯車を山ほど寝かせておる。', en: 'The mill down by the river. Nell the miller keeps a heap of old gears lying about.' },
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: { ja: '……歯車が手に入る場所が、町にもうひとつあったんですね。', en: '...So there is somewhere else in town to get a gear.' },
      },
      {
        speaker: 'claude',
        pose: 'happy',
        text: { ja: 'ありがとうございます。ナゾが、ひとつほどけました。', en: 'Thank you. One knot has come loose.' },
      },
    ],
  },
  {
    id: 'sc_inn_martha',
    title: 'まんげつ亭のスープ',
    bg: 'inn',
    kind: 'flavor',
    coin: 1,
    lines: [
      {
        speaker: 'martha',
        pose: 'happy',
        text: { ja: 'スープ、飲んでいきなよ。うちの名物なんだ。', en: 'Have some soup. House specialty.' },
      },
      {
        speaker: 'cookie',
        pose: 'happy',
        text: { ja: 'いただきます！……あっ、スプーンがぴかぴかだ。', en: "Don't mind if I do! ...Oh, the spoon's so shiny." },
      },
      {
        speaker: 'martha',
        pose: 'normal',
        text: { ja: '磨くのが好きなのさ。裏返すと顔がさかさにうつるだろ。子どもらはそれでよく遊んでたよ。', en: "I like polishing them. Flip it over and your face turns upside down. The children used to play with that." },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: { ja: '……さかさに、ね。おぼえておきましょう。', en: '...Upside down. I shall keep that in mind.' },
      },
    ],
  },
];
