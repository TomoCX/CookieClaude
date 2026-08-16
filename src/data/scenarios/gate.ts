import type { Scenario } from '../../types';

/** 町の入り口（エリア gate）の会話 */
export const GATE_SCENARIOS: Scenario[] = [
  {
    id: 'sc_gate',
    title: 'メープル町へようこそ',
    bg: 'gate',
    kind: 'main',
    coin: 3,
    note: {
      id: 'note_gatekeeper',
      title: '門番モーリスの証言',
      body: 'この町の時計が十三回鳴ったことは、一度もない。手紙が告げているのは、まだ起きていない出来事である。',
    },
    lines: [
      {
        speaker: 'maurice',
        pose: 'normal',
        text: { ja: 'ようこそ、メープル町へ。……おや、めずらしい。旅の方ですかな。', en: 'Welcome to Maple Town. Well now — travelers? We see few of those.' },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: 'クロードと申します。こちらは助手のクッキー。手紙をいただいてまいりました。', en: "The name is Claude. My assistant, Cookie. We came on account of a letter." },
      },
      {
        speaker: 'maurice',
        pose: 'surprised',
        text: { ja: '手紙？この町から？……はて、だれがそんなものを。', en: 'A letter? From this town? Now who would send such a thing...' },
      },
      {
        speaker: 'cookie',
        pose: 'think',
        text: { ja: '差出人の名前が書いてないんです。中身も一行だけで。', en: "There's no sender's name. Just a single line inside." },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: '「町の時計が十三回鳴る夜、町の宝が消える」。', en: '"When the town clock strikes thirteen, the town\'s treasure vanishes."' },
      },
      {
        speaker: 'maurice',
        pose: 'surprised',
        text: { ja: '……じゅうさん回？うちの時計はそんなに鳴りませんぞ。', en: '...Thirteen? Our clock has never struck thirteen in its life.' },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: { ja: 'ええ。だからこそ、これはナゾなのですよ。', en: 'Quite. And that is precisely why it is a mystery.' },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: 'ナゾというものは、いつだって「ありえないこと」の顔をしてやってくる。', en: 'A mystery always arrives wearing the face of the impossible.' },
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: { ja: 'かっこいい……！ぼく、いまのメモしておきます！', en: "That's so cool...! I'm writing that down!" },
      },
      {
        speaker: 'maurice',
        pose: 'normal',
        text: { ja: 'ふむ……。話を聞くなら、大門広場へお行きなさい。町じゅうのうわさが集まる所です。', en: 'Hm. If it is talk you want, try the Great Gate Plaza. Every rumor in town ends up there.' },
      },
      {
        text: { ja: '――こうして、ふたりの調査がはじまった。', en: 'And so, their investigation began.' },
      },
    ],
  },
  /*
   * 分かれ道のある会話。
   * トビーに何を尋ねるかで話が分かれ、選んだほうだけの手がかりが手に入る。
   * 分かれた先は `label: 'merge'` の行で合流する。
   */
  {
    id: 'sc_gate_toby',
    title: '旅商人のぼやき',
    bg: 'gate',
    kind: 'flavor',
    coin: 1,
    lines: [
      {
        speaker: 'toby',
        pose: 'normal',
        text: { ja: 'よう。荷を見ていくかい？……といっても、売れ残りばかりだがね。', en: "Hey there. Care to see my wares? Though it's all leftovers, mind you." },
      },
      {
        speaker: 'cookie',
        pose: 'think',
        text: { ja: 'この町、あまりお客さんが来ないんですか？', en: "Does this town not get many visitors?" },
      },
      {
        speaker: 'toby',
        pose: 'normal',
        text: { ja: '昔は時計塔を見に、よその町からわんさか来たもんさ。……いまじゃ、地元の連中でさえ見上げやしない。', en: 'Folks used to pour in from other towns just to see the clock tower. Now even the locals never look up.' },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: { ja: '……見上げない、ですか。', en: '...They never look up, you say.' },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: {
          ja: '——ひとつ、うかがってもよろしいか。',
          en: '—Might I ask you one thing?',
        },
        choices: [
          {
            id: 'ch_toby_goods',
            label: { ja: '売れ残った品について聞く', en: 'Ask about the unsold wares' },
            to: 'goods',
            gives: {
              coin: 2,
              note: {
                id: 'note_toby_goods',
                title: { ja: '旅商人の売れ残り', en: 'The Pedlar’s Leftovers' },
                body: {
                  ja: '丘を越えて運んできた品が、ほとんど売れずに残っている。三日前だけは、花を一束だけ買った者がいたという。',
                  en: 'Almost nothing sold. Only three days ago did someone buy a single bunch of flowers.',
                },
              },
            },
          },
          {
            id: 'ch_toby_road',
            label: { ja: '丘の道について聞く', en: 'Ask about the road over the hill' },
            to: 'road',
            gives: {
              coin: 2,
              note: {
                id: 'note_toby_road',
                title: { ja: '丘を越える道', en: 'The Road Over the Hill' },
                body: {
                  ja: '町へ入る道は門のほかにもう一本、丘を回りこむ細い道がある。荷車は通れないが、人ひとりなら歩ける。',
                  en: 'Besides the gate there is a thin path around the hill. No cart fits, but one person can walk it.',
                },
              },
            },
          },
        ],
      },
      {
        label: 'goods',
        speaker: 'toby',
        pose: 'normal',
        text: {
          ja: 'ああ、これかい。丘を越えて担いできたが、さっぱりでね。……三日前に、花を一束だけ買っていった子がいたが。',
          en: 'These? Hauled them over the hill and sold near nothing. ...Though a child bought one bunch of flowers, three days back.',
        },
        goto: 'merge',
      },
      {
        label: 'road',
        speaker: 'toby',
        pose: 'normal',
        text: {
          ja: '門のほかにも道はあるさ。丘を回りこむ細いのがね。荷車は無理だが、身ひとつなら通れる。',
          en: 'There is another way in — a thin path around the hill. No cart fits, but a person does.',
        },
        goto: 'merge',
      },
      {
        label: 'merge',
        speaker: 'cookie',
        pose: 'think',
        text: {
          ja: '……せんせい。いまの、書き留めておきますね。',
          en: '...Professor. I shall write that down.',
        },
      },
    ],
  },
];
