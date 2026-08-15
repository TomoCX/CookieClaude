import type { Scenario } from '../types';

/**
 * 会話イベント。
 * 街並みに立っている人をクリックすると、その人に結びついたシナリオが始まる。
 * kind: 'main' が本筋、'flavor' は町の人とのちょっとした立ち話。
 */
export const SCENARIOS: Scenario[] = [
  /* ---- 町の入り口 ---- */
  {
    id: 'sc_gate',
    title: 'メープル町へようこそ',
    bg: 'gate',
    kind: 'main',
    coin: 3,
    unlocks: ['plaza'],
    note: {
      id: 'note_letter',
      title: 'さしだしにんのない手紙',
      body: '「まちの時計が十三回鳴る夜、まちの宝が消える」とだけ書かれている。消印はメープル町。文字はきれいだが、インクがところどころにじんでいる。',
    },
    lines: [
      {
        speaker: 'maurice',
        pose: 'normal',
        text: 'ようこそ、メープル町へ。……おや、めずらしい。旅の方ですかな。',
        sub: 'Welcome to Maple Town. Well now — travelers? We see few of those.',
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: 'クロードと申します。こちらは助手のクッキー。手紙を いただいてまいりました。',
        sub: "The name is Claude. My assistant, Cookie. We came on account of a letter.",
      },
      {
        speaker: 'maurice',
        pose: 'surprised',
        text: '手紙？ この町から？ ……はて、だれが そんなものを。',
        sub: 'A letter? From this town? Now who would send such a thing...',
      },
      {
        speaker: 'cookie',
        pose: 'think',
        text: '差出人の名前が 書いてないんです。中身も 一行だけで。',
        sub: "There's no sender's name. Just a single line inside.",
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: '「まちの時計が十三回鳴る夜、まちの宝が消える」。',
        sub: '"When the town clock strikes thirteen, the town\'s treasure vanishes."',
      },
      {
        speaker: 'maurice',
        pose: 'surprised',
        text: '……じゅうさん回？ うちの時計は そんなに 鳴りませんぞ。',
        sub: '...Thirteen? Our clock has never struck thirteen in its life.',
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: 'ええ。だからこそ、これはナゾなのですよ。',
        sub: 'Quite. And that is precisely why it is a mystery.',
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
        speaker: 'maurice',
        pose: 'normal',
        text: 'ふむ……。話を聞くなら、大門広場へ お行きなさい。町じゅうの うわさが 集まる所です。',
        sub: 'Hm. If it is talk you want, try the Great Gate Plaza. Every rumor in town ends up there.',
      },
      {
        text: '――こうして、ふたりの調査がはじまった。',
        sub: 'And so, their investigation began.',
      },
    ],
  },
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
        text: 'よう。荷を見ていくかい？ ……といっても、売れ残りばかりだがね。',
        sub: "Hey there. Care to see my wares? Though it's all leftovers, mind you.",
      },
      {
        speaker: 'cookie',
        pose: 'think',
        text: 'この町、あまり お客さんが 来ないんですか？',
        sub: "Does this town not get many visitors?",
      },
      {
        speaker: 'toby',
        pose: 'normal',
        text: '昔は 時計塔を 見に、よその町から わんさか 来たもんさ。……いまじゃ、地元の連中でさえ 見上げやしない。',
        sub: 'Folks used to pour in from other towns just to see the clock tower. Now even the locals never look up.',
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: '……見上げない、ですか。',
        sub: '...They never look up, you say.',
      },
    ],
  },

  /* ---- 大門広場 ---- */
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
      body: '三日前の夜、時計塔の窓に明かりがついていた。だが時計塔の鍵を持つギアじいさんは、その晩ずっと宿屋にいたという。',
    },
    lines: [
      {
        speaker: 'martha',
        pose: 'normal',
        text: 'あら、旅の方？ うちは まんげつ亭って宿を やってるマーサだよ。',
        sub: "Oh, travelers? I'm Martha — I run the Full Moon Inn.",
      },
      {
        speaker: 'cookie',
        pose: 'normal',
        text: '時計塔の管理人さんを さがしてるんですけど……。',
        sub: "We're looking for the clock tower's caretaker...",
      },
      {
        speaker: 'martha',
        pose: 'normal',
        text: 'ギアじいさんならもう店じまいだよ。……あの晩からずっと元気がなくてねえ。',
        sub: "Old Gear's already closed up. He's been low ever since that night.",
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
        text: 'ナゾが深まったのだからね。行こう、クッキー。宿屋と 時計塔だ。',
        sub: 'The mystery deepened. Come, Cookie. The inn, and then the tower.',
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
        text: 'お花、いかがですか？ 今朝つんだばかりの メープルベルですよ。',
        sub: 'Flowers, sir? Maple bells, picked just this morning.',
      },
      {
        speaker: 'cookie',
        pose: 'happy',
        text: 'かわいい名前ですね。鐘みたいな形だからかな。',
        sub: 'What a nice name. Is it because they look like little bells?',
      },
      {
        speaker: 'lily',
        pose: 'normal',
        text: 'そう。時計塔の鐘に にてるでしょ。……この町の子は、みんな この花で 育つの。',
        sub: "That's right — like the tower bell. Every child in this town grows up with them.",
      },
      {
        speaker: 'lily',
        pose: 'think',
        text: 'ちいさい子が ひとり、毎朝 ここで 花を 見てるわ。買わないけど、じっと ね。',
        sub: "There's a little one who comes every morning to look. Never buys. Just looks.",
      },
    ],
  },

  /* ---- まんげつ亭 ---- */
  {
    id: 'sc_inn',
    title: '宿屋「まんげつ亭」',
    bg: 'inn',
    kind: 'main',
    coin: 4,
    charm: {
      id: 'charm_spoon',
      name: 'まんげつのスプーン',
      desc: 'まんげつ亭の名物スープについてくる銀のスプーン。よく磨くと、鏡のように文字が読める。',
      icon: '🥄',
    },
    note: {
      id: 'note_alibi',
      title: 'ギアじいさんのアリバイ',
      body: 'ギアじいさんは三日前の夜、九時から朝まで宿の食堂にいた。ただし十時ごろ、三十分ほど席をはずしている。上着は掛けにかけたままだった。',
    },
    lines: [
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
        sub: 'No. I do not suspect. I am merely confirming.',
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
        sub: 'Q-quiet, you. It was good soup. Nothing to be done about it.',
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
    id: 'sc_inn_martha',
    title: 'まんげつ亭のスープ',
    bg: 'inn',
    kind: 'flavor',
    coin: 1,
    lines: [
      {
        speaker: 'martha',
        pose: 'happy',
        text: 'スープ、飲んでいきなよ。うちの名物なんだ。',
        sub: 'Have some soup. House specialty.',
      },
      {
        speaker: 'cookie',
        pose: 'happy',
        text: 'いただきます！ ……あっ、スプーンが ぴかぴかだ。',
        sub: "Don't mind if I do! ...Oh, the spoon's so shiny.",
      },
      {
        speaker: 'martha',
        pose: 'normal',
        text: '磨くのが 好きなのさ。裏返すと 顔が さかさに うつるだろ。子どもらは それで よく 遊んでたよ。',
        sub: "I like polishing them. Flip it over and your face turns upside down. The children used to play with that.",
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: '……さかさに、ね。おぼえておきましょう。',
        sub: '...Upside down. I shall keep that in mind.',
      },
    ],
  },

  /* ---- 時計塔 ---- */
  {
    id: 'sc_clocktower',
    title: '十三回鳴る時計',
    bg: 'clocktower',
    kind: 'main',
    coin: 3,
    unlocks: ['alley'],
    note: {
      id: 'note_bell',
      title: '鐘のしかけ',
      body: '時計塔の鐘は、歯車がひとつずれると打つ回数が 1 つ増える。十三回鳴らすのは故障ではなく、だれかが意図的にずらしたということ。',
    },
    lines: [
      {
        speaker: 'gear',
        pose: 'normal',
        text: '……入りなさい。わしの鍵で 開けてやる。中を見れば、わかることも あろう。',
        sub: "...Go on in. I'll open it with my key. Perhaps seeing inside will tell you something.",
      },
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
        sub: 'Precisely. Not a prophecy — an announcement. Someone arranged it.',
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
        text: '結論を急がないことだ。まだ、聞いていない声がひとつある。裏路地へ 行こう。',
        sub: 'Let us not rush. There is still one voice we have not heard. To the back alley.',
      },
    ],
  },
  {
    id: 'sc_tower_hans',
    title: '見物人のはなし',
    bg: 'clocktower',
    kind: 'flavor',
    coin: 1,
    lines: [
      {
        speaker: 'hans',
        pose: 'normal',
        text: 'この塔もな、来月には 取りこわしだとよ。',
        sub: "They're pulling this tower down next month, you know.",
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: 'ええっ！ こんなに 立派なのに……！',
        sub: "What?! But it's magnificent...!",
      },
      {
        speaker: 'hans',
        pose: 'normal',
        text: '古いからな。あぶないってさ。……まあ、だれも 反対しなかったよ。だれも 見ちゃいなかったからな。',
        sub: "It's old. Dangerous, they say. Nobody objected. Nobody was looking at it anyway.",
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: '……なるほど。「宝が消える」とは、そういうことか。',
        sub: '...I see. So that is what "the treasure vanishes" means.',
      },
    ],
  },

  /* ---- 裏路地 ---- */
  {
    id: 'sc_alley',
    title: '裏路地のミント',
    bg: 'alley',
    kind: 'main',
    coin: 5,
    charm: {
      id: 'charm_gear',
      name: 'ちいさな歯車',
      desc: 'ミントが時計塔から持ち出した歯車。返された今も、彼女のポケットの重さをおぼえている。',
      icon: '⚙️',
    },
    note: {
      id: 'note_truth',
      title: '十三回の意味',
      body: 'ミントは時計塔が取りこわされると聞いて、町の人に塔のことを思い出してほしかった。「まちの宝」とは時計塔そのもの。手紙は犯行予告ではなく、助けを呼ぶ声だった。',
    },
    lines: [
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
        sub: 'Then there is but one thing to do. Tonight, we shall make this town look up.',
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
        text: 'そっちは 行き止まりだよ。……なんで来たの、おじさんたち。',
        sub: "Dead end that way. ...What're you two doing here, anyway?",
      },
      {
        speaker: 'cookie',
        pose: 'normal',
        text: 'ちょっと 人を さがしてて。きみ、いつも ここに いるの？',
        sub: "Looking for someone. Do you always hang around here?",
      },
      {
        speaker: 'pete',
        pose: 'think',
        text: 'ぼくじゃないよ。ミントだよ。……あいつ、三日前の夜も ずぶぬれで 帰ってきた。',
        sub: "Not me. Mint. ...She came back soaked through, three nights back.",
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: '雨の夜に、外に いたということか。……ありがとう、坊や。',
        sub: 'Out in the rain, then. ...Thank you, lad.',
      },
    ],
  },
];

/** id からシナリオを取得する */
export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

/** 本筋のシナリオだけを取り出す */
export const MAIN_SCENARIOS = SCENARIOS.filter((s) => s.kind === 'main');
