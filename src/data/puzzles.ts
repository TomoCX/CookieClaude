import type { Puzzle } from '../types';

/**
 * 独立したナゾ解き。ストーリーとは切り離されていて、
 * マップに置かれた「時計のような物体」を押すと挑戦できる。
 */
export const PUZZLES: Puzzle[] = [
  {
    id: 'pz_strike',
    no: 1,
    title: '鐘は何回鳴るか',
    picarat: [30, 25, 20],
    figure: 'strike',
    question:
      'メープル町の時計は、1時に1回、2時に2回……と、時刻の数だけ鐘を鳴らす。\n1時から 12時までのあいだに、鐘はぜんぶで何回鳴るだろうか。',
    answer: { kind: 'number', value: 78, unit: '回' },
    hints: [
      '1 + 2 + 3 + …… + 12 を求めればよい。',
      '端から順に組にしていく。1 と 12、2 と 11、3 と 10 ……。',
      'どの組も足すと 13 になる。組は全部で六つできる。',
    ],
    explanation:
      '1 と 12、2 と 11、3 と 10、4 と 9、5 と 8、6 と 7。どれも足すと 13 で、組は 6 つ。13 × 6 = 78 回。',
  },
  {
    id: 'pz_interval',
    no: 2,
    title: '鐘の鳴り終わり',
    picarat: [40, 35, 30],
    figure: 'bell',
    question:
      'この時計が 6時の鐘を鳴らし終えるまでには、ちょうど 10秒かかる。\nでは 12時の鐘を鳴らし終えるまでには、何秒かかるだろうか。',
    answer: { kind: 'number', value: 22, unit: '秒' },
    hints: [
      '20秒と答えたくなるが、それは誤りだ。',
      '数えるのは鐘の数ではなく、鐘と鐘の間の「間隔」の数。',
      '6回鳴るとき間隔は五つ。10 ÷ 5 = 2秒。12回なら間隔は十一。',
    ],
    explanation:
      '6回鳴るときの間隔は五つ。10 ÷ 5 = 2秒。12回鳴るときの間隔は十一なので、2 × 11 = 22秒。',
  },
  {
    id: 'pz_mirror',
    no: 3,
    title: '鏡の時計',
    picarat: [35, 30, 25],
    figure: 'mirror',
    question:
      'まんげつ亭のスプーンに、時計がうつっていた。\n映った時計は 4時20分をさしている。ほんとうの時刻は何時何分だろうか。',
    answer: {
      kind: 'choice',
      options: ['7時40分', '8時40分', '7時20分', '4時40分'],
      correct: 0,
    },
    hints: [
      '鏡に映すと、左右が入れ替わる。',
      '文字盤の 12 と 6 を結ぶ線を境に、折り返した位置になる。',
      '「11時60分」から映った時刻を引けばよい。',
    ],
    explanation:
      '鏡の中の時刻は、12時を境に折り返した位置。11時60分 − 4時20分 = 7時40分。',
  },
  {
    id: 'pz_gears',
    no: 4,
    title: '噛み合う歯車',
    picarat: [20, 15, 10],
    figure: 'gears',
    question:
      '時計塔の中で、4つの歯車が一列に噛み合っている。\n左はしの歯車を右回りに回すと、右はしの歯車はどちらに回るだろうか。',
    answer: {
      kind: 'choice',
      options: ['右回り', '左回り', '回らない'],
      correct: 1,
    },
    hints: [
      '隣り合う歯車は、必ず逆回りになる。',
      '一つ目が右回りなら、二つ目は左回り、三つ目は右回り……。',
      '四つ目は二つ目と同じ向きになる。',
    ],
    explanation:
      '隣り合う歯車は逆に回るので、右・左・右・左と続く。四つ目は左回り。',
  },
  {
    id: 'pz_overlap',
    no: 5,
    title: '重なる針',
    picarat: [45, 40, 35],
    figure: 'hands',
    question:
      '時計の長針と短針は、12時ちょうどにぴったり重なる。\n一日（24時間）のうちに、2つの針が重なるのは何回だろうか。',
    answer: { kind: 'number', value: 22, unit: '回' },
    hints: [
      'まず 12時間で何回重なるかを考えよう。',
      '1時台、2時台……と各時間に 1回ずつ重なりそうだが、11時台には重ならない。',
      '11時台の分は 12時ちょうどで重なる。12時間で 11回、24時間でその 2倍。',
    ],
    explanation:
      '長針は短針より 1時間あたりちょうど 一周分速い。12時間で 11回追い越すので、24時間では 22回重なる。',
  },
  {
    id: 'pz_stopped',
    no: 6,
    title: '止まった時計',
    picarat: [25, 20, 15],
    figure: 'clocks3',
    question:
      'ギアじいさんの部屋には時計が三つある。\n一つは一日に 1分進み、一つは一日に 1分遅れ、一つは完全に止まっている。\nこの中で、正しい時刻を指す回数が最も多いのはどれか。',
    answer: {
      kind: 'choice',
      options: [
        '一日に 1分進む時計',
        '一日に 1分遅れる時計',
        '止まっている時計',
        'どれも同じ',
      ],
      correct: 2,
    },
    hints: [
      'ずれる時計が再び正しい時刻をさすのは、ずれが 12時間たまったとき。',
      '1分ずつずれる時計は、720日かかってようやく一周する。',
      '止まっている時計は、一日に 2回必ず正しい時刻を指す。',
    ],
    explanation:
      '1分ずつずれる時計が正しくなるのは 720日に 1度きり。止まった時計は一日に 2回かならずあたる。動かないものが最も合うという、皮肉な答え。',
  },
];

/** id からナゾを取得する */
export function getPuzzle(id: string): Puzzle | undefined {
  return PUZZLES.find((p) => p.id === id);
}

/** 誤答に応じてもらえるピカラットを返す */
export function picaratFor(puzzle: Puzzle, misses: number): number {
  const i = Math.min(misses, puzzle.picarat.length - 1);
  return puzzle.picarat[i] ?? puzzle.picarat[puzzle.picarat.length - 1] ?? 0;
}
