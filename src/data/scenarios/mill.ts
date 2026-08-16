import type { Scenario } from '../../types';

/** 水車小屋（エリア mill）の会話 */
export const MILL_SCENARIOS: Scenario[] = [
  {
    id: 'sc_mill',
    title: '川ぞいの水車小屋',
    bg: 'river',
    kind: 'main',
    coin: 4,
    note: {
      id: 'note_gear_source',
      title: '歯車の出どころ',
      body:
        '時計塔の予備の歯車は、川ぞいの水車小屋に寝かせてある。三日前の夕方、粉屋のネルは小屋の戸を開けたまま町へ出た。'
        + '戻ったとき、積んであった歯車の山がひとつぶん低くなっていたという。子どもの背丈でも届く高さだった。',
    },
    lines: [
      {
        speaker: 'nell',
        pose: 'normal',
        text: {
          ja: 'あら、お客さんなんて珍しい。粉なら明日の朝までひけないよ。',
          en: 'Well now, visitors. If it’s flour you want, nothing’s ground till morning.',
        },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: {
          ja: '粉ではなく、歯車のことでうかがいました。塔の予備を預かっておいでとか。',
          en: 'Not flour — gears. I hear you keep the tower’s spares.',
        },
      },
      {
        speaker: 'nell',
        pose: 'think',
        text: {
          ja: '……ギアじいさんに聞いたね。ええ、奥に積んであるよ。錆びる前に、ときどき油を差してやってる。',
          en: '...Old Gear told you, did he. Aye, they’re stacked in the back. I oil them now and then so they don’t rust.',
        },
      },
      {
        speaker: 'cookie',
        pose: 'normal',
        text: {
          ja: '三日前の夜のこと、覚えていませんか。塔に明かりがついた晩です。',
          en: 'Do you remember three nights ago? The night a light showed in the tower.',
        },
      },
      {
        speaker: 'nell',
        pose: 'surprised',
        text: {
          ja: 'あの晩ねえ。……そういえば、山がひとつぶん低くなってたよ。',
          en: 'That night, eh. ...Come to think of it, the stack was one shorter after.',
        },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: {
          ja: 'なくなったのは、どのあたりから。',
          en: 'From where in the stack?',
        },
      },
      {
        speaker: 'nell',
        pose: 'normal',
        text: {
          ja: 'いちばん下の段さ。上の段には手つかず。……背の高い人なら、上から取るだろうにねえ。',
          en: 'The bottom row. The top was untouched. ...A tall body would’ve taken from the top, wouldn’t they.',
        },
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: {
          ja: '背の低い人……子ども、ということですか。',
          en: 'Someone short. ...A child, you mean.',
        },
      },
      {
        speaker: 'nell',
        pose: 'think',
        text: {
          ja: 'さあね。あたしは戸を開けっぱなしで町へ出てたから、誰が来ても分からないよ。',
          en: 'Couldn’t say. I’d left the door open and gone into town. Anyone could have come.',
        },
      },
      {
        speaker: 'claude',
        pose: 'happy',
        text: {
          ja: '充分です。……盗んだのではなく、借りたのかもしれません。返せる場所を知っている者なら。',
          en: 'That is enough. ...Perhaps it was not stolen but borrowed — by someone who knew where to return it.',
        },
      },
    ],
  },
  {
    id: 'sc_mill_toby',
    title: '川ぞいの荷車',
    bg: 'river',
    kind: 'flavor',
    coin: 2,
    lines: [
      {
        speaker: 'toby',
        pose: 'normal',
        text: {
          ja: 'おや、探偵さん。こんな川っぷちまで。荷車が泥にはまって往生してますよ。',
          en: 'Why, the detective — all the way out here. My cart’s stuck fast in the mud.',
        },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: {
          ja: 'この道は、丘へ抜けられるのですか。',
          en: 'Does this road carry on to the hill?',
        },
      },
      {
        speaker: 'toby',
        pose: 'think',
        text: {
          ja: 'ええ。門を通らずに町へ入るなら、この川ぞいだけです。もっとも、荷車では無理ですがね。',
          en: 'It does. It’s the only way into town without passing the gate. Not with a cart, mind.',
        },
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: {
          ja: '——門を通らずに、町へ。',
          en: '—Into town, without the gate.',
        },
      },
      {
        speaker: 'claude',
        pose: 'happy',
        text: {
          ja: '身ひとつなら通れる道、ということですね。覚えておきましょう。',
          en: 'Passable on foot alone, then. Worth remembering.',
        },
      },
    ],
  },
];
