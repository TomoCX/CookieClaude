import type { Scenario } from '../../types';

/** 時計塔（エリア clocktower）の会話 */
export const CLOCKTOWER_SCENARIOS: Scenario[] = [
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
      body: '時計塔の鐘は、歯車がひとつずれると打つ回数が 1 つ増える。十三回鳴らすのは故障ではなく、何者かが意図的にずらしたということ。',
    },
    lines: [
      {
        speaker: 'gear',
        pose: 'normal',
        text: { ja: '……入りなさい。わしの鍵で開けてやる。中を見れば、わかることもあろう。', en: "...Go on in. I'll open it with my key. Perhaps seeing inside will tell you something." },
      },
      {
        text: { ja: '時計塔の内部。歯車が、低くうなりながら噛み合っている。', en: 'Inside the clock tower. Gears meshing with a low, patient growl.' },
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: { ja: 'うわあ……歯車だらけだ。せんせい、あそこの歯車、なんだか浮いてませんか？', en: "Whoa... gears everywhere. Professor, doesn't that one look loose?" },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: { ja: 'よく気づいたね、クッキー。……歯車がひとつずれると、鐘は一回多く鳴る。', en: 'Well spotted, Cookie. Shift one gear, and the bell strikes once more than it should.' },
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: { ja: 'じゃあ「十三回鳴る夜」は――', en: 'Then "the night it strikes thirteen" is—' },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: 'そう。予言ではない。予告だ。だれかが、そうなるように手を加えたのだよ。', en: 'Precisely. Not a prophecy — an announcement. Someone arranged it.' },
      },
      {
        speaker: 'cookie',
        pose: 'think',
        text: { ja: 'でも、鍵を持ってるのはギアじいさんだけで、アリバイもあって……。', en: 'But only Old Gear has the key, and he has an alibi...' },
      },
      {
        speaker: 'claude',
        pose: 'happy',
        text: { ja: '鍵を「持っている」ことと、鍵を「使える」ことは、同じではない。', en: 'To hold a key and to be able to use one are not the same thing.' },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: '上着は掛けにかかっていた。あの三十分のあいだ、鍵は部屋にひとりでいたわけだ。', en: 'The coat hung on the peg. For that half hour, the key sat in that room alone.' },
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: { ja: 'あっ……！じゃあ、あの晩食堂にいただれかが……！', en: "Ah...! Then someone who was in the dining hall that night...!" },
      },
      {
        speaker: 'claude',
        pose: 'normal',
        text: { ja: '結論を急がないことだ。まだ、聞いていない声がひとつある。裏路地へ行こう。', en: 'Let us not rush. There is still one voice we have not heard. To the back alley.' },
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
        text: { ja: 'この塔もな、来月には取りこわしだとよ。', en: "They're pulling this tower down next month, you know." },
      },
      {
        speaker: 'cookie',
        pose: 'surprised',
        text: { ja: 'ええっ！こんなに立派なのに……！', en: "What?! But it's magnificent...!" },
      },
      {
        speaker: 'hans',
        pose: 'normal',
        text: { ja: '古いからな。あぶないってさ。……まあ、だれも反対しなかったよ。だれも見ちゃいなかったからな。', en: "It's old. Dangerous, they say. Nobody objected. Nobody was looking at it anyway." },
      },
      {
        speaker: 'claude',
        pose: 'think',
        text: { ja: '……なるほど。「宝が消える」とは、そういうことか。', en: '...I see. So that is what "the treasure vanishes" means.' },
      },
    ],
  },
];
