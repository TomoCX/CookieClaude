import type { Scenario } from '../types';

/**
 * シナリオ本編。
 * 場所をタップすると、その場所に紐づいたシナリオが会話画面で再生される。
 */
export const SCENARIOS: Scenario[] = [
  {
    id: 'sc_gate',
    no: 1,
    title: 'メープル町へようこそ',
    bg: 'gate',
    reward: { picarat: 20, coin: 3 },
    unlocks: ['plaza'],
    note: {
      id: 'note_letter',
      title: 'さしだしにんのない手紙',
      body: '「まちの時計が十三回鳴る夜、まちの宝が消える」とだけ書かれている。消印はメープル町。文字はきれいだが、インクがところどころにじんでいる。',
    },
    lines: [
      {
        text: '霧のうすくかかった坂道の先に、赤い屋根の町が見えてきた。',
        sub: 'Beyond the misty slope, a town of red roofs came into view.',
      },
      {
        speaker: 'cookie',
        pose: 'happy',
        text: 'せんせい、ここがメープル町ですね！ 思ってたよりずっと大きい町です。',
        sub: "Professor, so this is Maple Town! It's much bigger than I imagined.",
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: 'ああ。……そして、この町のどこかに手紙の差出人がいる。',
        sub: 'Indeed. And somewhere in this town is the one who sent the letter.',
      },
      {
        speaker: 'cookie',
        pose: 'think',
        text: '「まちの時計が十三回鳴る夜、まちの宝が消える」……。時計って、十三回も鳴りませんよね？',
        sub: '"When the town clock strikes thirteen, the town\'s treasure vanishes." ...Clocks don\'t strike thirteen, do they?',
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: 'ふむ。だからこそ、これはナゾなのだよ、クッキー。',
        sub: "Hmm. That, Cookie, is precisely why it is a mystery.",
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: 'ナゾというものは、いつだって「ありえないこと」の顔をしてやってくる。',
        sub: 'A mystery always arrives wearing the face of the impossible.',
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: 'かっこいい……！ ぼく、いまのメモしておきます！',
        sub: "That's so cool...! I'm writing that down!",
      },
      {
        text: '――こうして、ふたりの調査がはじまった。',
        sub: 'And so, their investigation began.',
      },
    ],
  },
  {
    id: 'sc_plaza',
    no: 2,
    title: '大門広場のうわさ話',
    bg: 'plaza',
    reward: { picarat: 30, coin: 2 },
    unlocks: ['clocktower', 'inn'],
    note: {
      id: 'note_rumor',
      title: '広場のうわさ',
      body: '三日前の夜、時計塔の窓に明かりがついていた。だが時計塔の鍵を持つギアじいさんは、その晩ずっと宿屋にいたという。',
    },
    lines: [
      {
        text: '町の中心、大門広場。市が立ち、人の声がひっきりなしに行き交っている。',
        sub: 'The Great Gate Plaza — a market square alive with voices.',
      },
      {
        speaker: 'cookie',
        pose: 'normal',
        text: 'この辺りに、時計塔の管理人さんがいるって聞いたんですけど……。',
        sub: "I heard the clock tower's caretaker is somewhere around here...",
      },
      {
        speaker: 'martha',
        pose: 'normal',
        text: 'あら、旅の方？ ギアじいさんならもう店じまいだよ。……あの晩からずっと元気がなくてねえ。',
        sub: "Oh, travelers? Old Gear's already closed up. He's been low ever since that night.",
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: 'あの晩、とは？',
        sub: 'That night, you say?',
      },
      {
        speaker: 'martha',
        pose: 'surprised',
        text: '三日前さ。だれもいないはずの時計塔に、明かりがついてたんだよ。ゾッとしたねえ。',
        sub: "Three nights ago. A light in the clock tower, when nobody should've been there. Gave me chills.",
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: 'ええっ！ じゃあ、だれかが忍びこんだってことですか？',
        sub: 'What?! So someone snuck in?',
      },
      {
        speaker: 'martha',
        pose: 'normal',
        text: 'それがねえ、鍵を持ってるのはギアじいさんだけ。その晩はうちの宿で朝までいたのさ。',
        sub: 'Thing is, only Old Gear has the key — and he was at my inn till morning.',
      },
      {
        speaker: 'claude',
        pose: 'happy',
        text: 'なるほど。……鍵はひとつ、人はふたつの場所にいられない。実に結構。',
        sub: 'I see. One key, and no man can be in two places. Splendid.',
      },
      {
        speaker: 'cookie',
        pose: 'think',
        text: 'せんせい、いま「結構」って言いました？',
        sub: 'Professor, did you just say "splendid"?',
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: 'ナゾが深まったのだからね。行こう、クッキー。時計塔だ。',
        sub: 'The mystery deepened. Come, Cookie. To the clock tower.',
      },
    ],
  },
  {
    id: 'sc_inn',
    no: 3,
    title: '宿屋「まんげつ亭」',
    bg: 'inn',
    reward: { picarat: 25, coin: 4 },
    charm: {
      id: 'charm_spoon',
      name: 'まんげつのスプーン',
      desc: 'まんげつ亭の名物スープについてくる銀のスプーン。よく磨くと、鏡のように文字が読める。',
      icon: '🥄',
    },
    note: {
      id: 'note_alibi',
      title: 'ギアじいさんのアリバイ',
      body: 'ギアじいさんは三日前の夜、九時から朝まで宿の食堂にいた。ただし十時ごろ、三十分ほど席をはずしている。「スープをおかわりしに行った」とのこと。',
    },
    lines: [
      {
        text: '宿屋「まんげつ亭」。暖炉の火が、木の壁をやわらかく照らしている。',
        sub: 'The Full Moon Inn. Firelight washing warm over wooden walls.',
      },
      {
        speaker: 'gear',
        pose: 'normal',
        text: 'わしを疑っとるんじゃろ。……かまわんよ。鍵を持っとるのはわしだけじゃからな。',
        sub: "You suspect me. That's fine. I'm the only one with a key, after all.",
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: 'いいえ。わたしは疑ってはいません。確かめているだけです。',
        sub: "No. I do not suspect. I am merely confirming.",
      },
      {
        speaker: 'gear',
        pose: 'think',
        text: '……あの晩は九時からずっとこの食堂じゃった。十時ごろ、三十分ほど厨房に行ったがな。',
        sub: 'That night I was in this dining hall from nine. Stepped out to the kitchen around ten, half an hour or so.',
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: '三十分！ 時計塔まで走れば、行って帰ってこられるんじゃ……？',
        sub: 'Half an hour! You could run to the tower and back in that...',
      },
      {
        speaker: 'martha',
        pose: 'normal',
        text: 'それはないよ。あたしがずっと厨房にいたもの。じいさん、スープのおかわり三杯だったねえ。',
        sub: "Not a chance. I was in the kitchen the whole time. Three helpings of soup, wasn't it?",
      },
      {
        speaker: 'gear',
        pose: 'happy',
        text: 'う、うるさいわい。うまかったんじゃからしかたなかろう。',
        sub: "Q-quiet, you. It was good soup. Nothing to be done about it.",
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: '……ひとつだけ、うかがっても？ 時計塔の鍵は、いつも どこに？',
        sub: 'May I ask one thing? Where do you keep the tower key?',
      },
      {
        speaker: 'gear',
        pose: 'normal',
        text: '上着の内ポケットじゃ。……上着は、そこの掛けにかけてあったがな。',
        sub: 'Inner pocket of my coat. ...The coat was hanging right over there, mind you.',
      },
      {
        speaker: 'claude',
        pose: 'happy',
        text: 'ありがとうございます。ナゾが、ひとつ ほどけました。',
        sub: 'Thank you. One knot has come loose.',
      },
    ],
  },
  {
    id: 'sc_clocktower',
    no: 4,
    title: '十三回鳴る時計',
    bg: 'clocktower',
    reward: { picarat: 45, coin: 3 },
    unlocks: ['alley'],
    note: {
      id: 'note_bell',
      title: '鐘のしかけ',
      body: '時計塔の鐘は、歯車がひとつ ずれると 打つ回数が 1 つ増える。十三回鳴らすのは 故障ではなく、だれかが 意図的に ずらしたということ。',
    },
    lines: [
      {
        text: '時計塔の内部。歯車が、低くうなりながら 噛み合っている。',
        sub: 'Inside the clock tower. Gears meshing with a low, patient growl.',
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: 'うわあ……歯車だらけだ。せんせい、あそこの歯車、なんだか浮いてませんか？',
        sub: "Whoa... gears everywhere. Professor, doesn't that one look loose?",
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: 'よく気づいたね、クッキー。……歯車が ひとつ ずれると、鐘は 一回 多く鳴る。',
        sub: 'Well spotted, Cookie. Shift one gear, and the bell strikes once more than it should.',
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: 'じゃあ「十三回鳴る夜」は――',
        sub: 'Then "the night it strikes thirteen" is—',
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: 'そう。予言ではない。予告だ。だれかが、そうなるように 手を加えたのだよ。',
        sub: "Precisely. Not a prophecy — an announcement. Someone arranged it.",
      },
      {
        speaker: 'cookie',
        pose: 'think',
        text: 'でも、鍵を持ってるのはギアじいさんだけで、アリバイもあって……。',
        sub: 'But only Old Gear has the key, and he has an alibi...',
      },
      {
        speaker: 'claude',
        pose: 'happy',
        text: '鍵を「持っている」ことと、鍵を「使える」ことは、同じではない。',
        sub: 'To hold a key and to be able to use one are not the same thing.',
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: '上着は掛けにかかっていた。あの三十分のあいだ、鍵は 部屋に ひとりで いたわけだ。',
        sub: 'The coat hung on the peg. For that half hour, the key sat in that room alone.',
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: 'あっ……！ じゃあ、あの晩 食堂にいた だれかが……！',
        sub: "Ah...! Then someone who was in the dining hall that night...!",
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: '結論を急がないことだ。まだ、聞いていない声がひとつある。',
        sub: 'Let us not rush. There is still one voice we have not heard.',
      },
    ],
  },
  {
    id: 'sc_alley',
    no: 5,
    title: '裏路地のミント',
    bg: 'alley',
    reward: { picarat: 60, coin: 5 },
    charm: {
      id: 'charm_gear',
      name: 'ちいさな歯車',
      desc: 'ミントが 時計塔から 持ち出した 歯車。返された今も、彼女のポケットの重さを おぼえている。',
      icon: '⚙️',
    },
    note: {
      id: 'note_truth',
      title: '十三回の意味',
      body: 'ミントは 時計塔が 取りこわされると聞いて、町の人に 塔のことを 思い出してほしかった。「まちの宝」とは 時計塔そのもの。手紙は 犯行予告ではなく、助けを呼ぶ声だった。',
    },
    lines: [
      {
        text: '細い裏路地。壁ぎわに、小さな影がひとつ うずくまっている。',
        sub: 'A narrow back alley. A small shadow crouched against the wall.',
      },
      {
        speaker: 'mint',
        pose: 'surprised',
        text: '……っ。だ、だれ？',
        sub: "...! Wh-who's there?",
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: '手紙をありがとう。とてもきれいな字だった。……インクがにじんでいたけれど。',
        sub: 'Thank you for the letter. Lovely handwriting. Though the ink had run a little.',
      },
      {
        speaker: 'mint',
        pose: 'surprised',
        text: 'なんで……なんで わたしだって……！',
        sub: 'How... how did you know it was me...!',
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: '鐘を十三回鳴らすには、歯車をずらすしかない。塔にのぼれた人は 限られている。',
        sub: 'To strike thirteen, a gear must be moved. Few could have climbed that tower.',
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: 'そして――だれよりも あの塔を 好きな人だ。',
        sub: 'And more than that — it had to be someone who loves that tower.',
      },
      {
        speaker: 'mint',
        pose: 'think',
        text: '……こわされちゃうって、聞いたの。古いから、あぶないからって。',
        sub: "...I heard they're tearing it down. Too old, they said. Too dangerous.",
      },
      {
        speaker: 'mint',
        pose: 'normal',
        text: 'でも、だれも 気にしてなかった。だから――十三回 鳴らせば、みんな 顔を上げると思って。',
        sub: "But nobody cared. So I thought — if it struck thirteen, everyone would look up.",
      },
      {
        speaker: 'cookie',
        pose: 'think',
        text: '「まちの宝が消える」って……時計塔のことだったんだ。',
        sub: '"The town\'s treasure vanishes"... you meant the clock tower itself.',
      },
      {
        speaker: 'claude',
        pose: 'happy',
        text: 'きみの手紙は、犯行の予告ではなかった。助けを呼ぶ声だったのだね。',
        sub: 'Your letter was never a threat. It was a call for help.',
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: 'なら、やることは ひとつだ。……今夜、町じゅうに 顔を上げてもらおう。',
        sub: "Then there is but one thing to do. Tonight, we shall make this town look up.",
      },
      {
        speaker: 'cookie',
        pose: 'happy',
        text: 'はいっ、せんせい！',
        sub: 'Yes, Professor!',
      },
      {
        text: '――その夜、メープル町の時計は 十三回 鳴った。だれひとり、こわがらなかった。',
        sub: 'That night, the clock of Maple Town struck thirteen. Not one soul was afraid.',
      },
      {
        text: 'ナゾは とけた。〈おわり〉',
        sub: 'The mystery is solved. — The End —',
      },
    ],
  },
];

/** id からシナリオを取得する */
export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
