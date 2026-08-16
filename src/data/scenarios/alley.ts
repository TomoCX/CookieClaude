import type { Scenario } from '../../types';

/** 裏路地（エリア alley）の会話 */
export const ALLEY_SCENARIOS: Scenario[] = [
  {
    id: 'sc_alley',
    title: '裏路地のミント',
    bg: 'alley',
    kind: 'main',
    coin: 5,
    charm: {
      id: 'charm_gear',
      name: 'ちいさな歯車',
      desc: 'ミントが時計塔から持ち出した歯車。返却された今も、彼女のポケットの重みを覚えている。',
      icon: '⚙️',
    },
    note: {
      id: 'note_truth',
      title: '十三回の意味',
      body: 'ミントは時計塔が取り壊されると聞いて、町の人に塔のことを思い出してほしかった。「町の宝」とは時計塔そのもの。手紙は犯行予告ではなく、助けを呼ぶ声だった。',
    },
    lines: [
      {
        speaker: 'mint',
        pose: 'surprised',
        text: { ja: '……っ。だ、だれ？', en: "...! Wh-who's there?" },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: '手紙をありがとう。とてもきれいな字だった。……インクがにじんでいたけれど。', en: 'Thank you for the letter. Lovely handwriting. Though the ink had run a little.' },
      },
      {
        speaker: 'mint',
        pose: 'surprised',
        text: { ja: 'なんで……なんでわたしだって……！', en: 'How... how did you know it was me...!' },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: '鐘を十三回鳴らすには、歯車をずらすしかない。塔にのぼれた人は限られている。', en: 'To strike thirteen, a gear must be moved. Few could have climbed that tower.' },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: { ja: 'そして――だれよりもあの塔を好きな人だ。', en: 'And more than that — it had to be someone who loves that tower.' },
      },
      {
        speaker: 'mint',
        pose: 'think',
        text: { ja: '……こわされちゃうって、聞いたの。古いから、あぶないからって。', en: "...I heard they're tearing it down. Too old, they said. Too dangerous." },
      },
      {
        speaker: 'mint',
        pose: 'normal',
        text: { ja: 'でも、だれも気にしてなかった。だから――十三回鳴らせば、みんな顔を上げると思って。', en: "But nobody cared. So I thought — if it struck thirteen, everyone would look up." },
      },
      {
        speaker: 'cookie',
        pose: 'think',
        text: { ja: '「町の宝が消える」って……時計塔のことだったんだ。', en: '"The town\'s treasure vanishes"... you meant the clock tower itself.' },
      },
      {
        speaker: 'claude',
        pose: 'happy',
        text: { ja: 'きみの手紙は、犯行の予告ではなかった。助けを呼ぶ声だったのだね。', en: 'Your letter was never a threat. It was a call for help.' },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: 'なら、やることはひとつだ。……今夜、町じゅうに顔を上げてもらおう。', en: 'Then there is but one thing to do. Tonight, we shall make this town look up.' },
      },
      {
        speaker: 'cookie',
        pose: 'happy',
        text: { ja: 'はいっ、せんせい！', en: 'Yes, Professor!' },
      },
      {
        text: { ja: '――その夜、メープル町の時計は十三回鳴った。だれひとり、こわがらなかった。', en: 'That night, the clock of Maple Town struck thirteen. Not one soul was afraid.' },
      },
      {
        text: { ja: 'ナゾはとけた。〈おわり〉', en: 'The mystery is solved. — The End —' },
      },
    ],
  },
  {
    id: 'sc_alley_pete',
    title: '路地の見張り番',
    bg: 'alley',
    kind: 'flavor',
    coin: 1,
    lines: [
      {
        speaker: 'pete',
        pose: 'normal',
        text: { ja: 'そっちは行き止まりだよ。……なんで来たの、おじさんたち。', en: "Dead end that way. ...What're you two doing here, anyway?" },
      },
      {
        speaker: 'cookie',
        pose: 'normal',
        text: { ja: 'ちょっと人をさがしてて。きみ、いつもここにいるの？', en: "Looking for someone. Do you always hang around here?" },
      },
      {
        speaker: 'pete',
        pose: 'think',
        text: { ja: 'ぼくじゃないよ。ミントだよ。……あいつ、三日前の夜もずぶぬれで帰ってきた。', en: "Not me. Mint. ...She came back soaked through, three nights back." },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: { ja: '雨の夜に、外にいたということか。……ありがとう、坊や。', en: 'Out in the rain, then. ...Thank you, lad.' },
      },
    ],
  },
];
