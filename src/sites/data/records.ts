/**
 * ポータル「RE:PRESS RECORDS」の中身。
 *
 * 画面（`RecordsSite.tsx`）と分けてあるのは、ゲームの `src/data/` と同じ考えかた。
 * 記事や品物を足すときに、画面のほうを開かずに済むようにしてある。
 * 中身はすべて架空。
 */

/** お知らせの区分。一覧の絞りこみにも使う。 */
export type NewsCategory = 'RELEASE' | 'LIVE' | 'MEDIA' | 'GOODS';

export interface NewsItem {
  id: string;
  date: string;
  category: NewsCategory;
  title: string;
  /** 本文。段落ごとに分けて持つ。 */
  body: string[];
}

export interface Release {
  id: string;
  /** 発売日 */
  date: string;
  title: string;
  kind: 'ALBUM' | 'EP' | 'SINGLE';
  /** ジャケットの色（絵はその場で描く） */
  hue: number;
  tracks: string[];
  note: string;
}

/** 品物の絵。区分とは別に、品ごとの見た目を選ぶ。 */
export type GoodsArtId = 'tee' | 'tote' | 'disc' | 'print';

export interface Goods {
  id: string;
  name: string;
  price: number;
  category: 'APPAREL' | 'MUSIC' | 'PRINT';
  art: GoodsArtId;
  sizes?: string[];
  note: string;
  /** 売り切れ */
  soldOut?: boolean;
}

export const NEWS: NewsItem[] = [
  {
    id: 'n_08',
    date: '2026.08.14',
    category: 'RELEASE',
    title: '3rd ALBUM『再演』本日より配信開始',
    body: [
      '3 枚目のアルバム『再演』を、本日 0 時より各配信サービスにて公開しました。全 12 曲、収録時間 48 分。',
      '初回盤には、水車小屋で録音した環境音をそのまま収めた 13 曲目が入っています。CD をお持ちの方は、最後まで再生してみてください。',
    ],
  },
  {
    id: 'n_07',
    date: '2026.08.02',
    category: 'LIVE',
    title: 'ツアー「再演 2026」全 7 公演を発表',
    body: [
      '秋から冬にかけて、7 都市を回ります。会場はいずれも 500 人前後の小さなところを選びました。',
      'チケットの先行受付は 8 月 20 日 12 時より。詳細は各会場のページをご確認ください。',
    ],
  },
  {
    id: 'n_06',
    date: '2026.07.21',
    category: 'GOODS',
    title: 'ツアーグッズ 6 種を SHOP に追加しました',
    body: [
      'ツアーで販売する品を、先行して SHOP にも並べました。T シャツは 4 サイズ、トートは一種類です。',
      '数に限りがあるため、会場での販売分がなくなり次第、通販も締め切ります。',
    ],
  },
  {
    id: 'n_05',
    date: '2026.06.30',
    category: 'MEDIA',
    title: 'ラジオ「深夜の再生装置」に出演します',
    body: ['7 月 4 日 25 時より、ラジオ番組に出演します。新譜の話と、選曲を少し。'],
  },
  {
    id: 'n_04',
    date: '2026.05.15',
    category: 'RELEASE',
    title: 'EP『十三時』配信開始',
    body: [
      '4 曲入りの EP を公開しました。表題曲は、鐘が一回多く鳴る町の話です。',
      'ジャケットは今回も自分で描いています。',
    ],
  },
  {
    id: 'n_03',
    date: '2026.04.02',
    category: 'LIVE',
    title: '春の単独公演、ありがとうございました',
    body: ['2 日間で 1,100 人の方にお越しいただきました。録音を編集して、いずれ形にする予定です。'],
  },
  {
    id: 'n_02',
    date: '2026.02.11',
    category: 'MEDIA',
    title: '楽曲が短編映画の主題歌に決まりました',
    body: ['3 月公開の短編映画に、書き下ろしの一曲を提供しています。'],
  },
  {
    id: 'n_01',
    date: '2026.01.09',
    category: 'RELEASE',
    title: 'シングル『歯車』配信開始',
    body: ['年明けの一曲目です。三拍子で、少しだけ速い。'],
  },
];

export const RELEASES: Release[] = [
  {
    id: 'r_saien',
    date: '2026.08.14',
    title: '再演',
    kind: 'ALBUM',
    hue: 18,
    note: '3 枚目。録りなおした古い曲と、書き下ろしを半分ずつ。',
    tracks: ['再演', '十三時（album ver.）', '水の記憶', '歯車', '朝の停留所', '灯を落とす'],
  },
  {
    id: 'r_juusanji',
    date: '2026.05.15',
    title: '十三時',
    kind: 'EP',
    hue: 208,
    note: '4 曲入り。鐘が一回多く鳴る町の話。',
    tracks: ['十三時', '掲示板', '雨の便箋', '十三時（instrumental）'],
  },
  {
    id: 'r_haguruma',
    date: '2026.01.09',
    title: '歯車',
    kind: 'SINGLE',
    hue: 96,
    note: '三拍子。少しだけ速い。',
    tracks: ['歯車', '歯車（instrumental）'],
  },
  {
    id: 'r_toumei',
    date: '2025.03.20',
    title: '透明な塔',
    kind: 'ALBUM',
    hue: 282,
    note: '2 枚目。全編を一人で録った。',
    tracks: ['透明な塔', '午前四時', '窓辺', '螺旋階段', '鐘の内側'],
  },
];

export const GOODS: Goods[] = [
  {
    id: 'g_tee',
    art: 'tee',
    name: 'ツアー T シャツ「再演」',
    price: 4200,
    category: 'APPAREL',
    sizes: ['S', 'M', 'L', 'XL'],
    note: '厚手の綿。背中に公演日程を小さく刷ってあります。',
  },
  {
    id: 'g_tote',
    art: 'tote',
    name: 'トートバッグ',
    price: 3000,
    category: 'APPAREL',
    note: 'A4 が入る大きさ。内側に小さなポケットがひとつ。',
  },
  {
    id: 'g_cd',
    art: 'disc',
    name: 'CD『再演』初回盤',
    price: 3300,
    category: 'MUSIC',
    note: '13 曲目に、水車小屋で録音した環境音を収録。ブックレット 16 頁つき。',
  },
  {
    id: 'g_lp',
    art: 'disc',
    name: 'LP『透明な塔』',
    price: 5500,
    category: 'MUSIC',
    note: '重量盤。2 枚組。ダウンロードコードつき。',
    soldOut: true,
  },
  {
    id: 'g_poster',
    art: 'print',
    name: 'ポスター（B2）',
    price: 2200,
    category: 'PRINT',
    note: 'ジャケットの元絵から起こしたもの。筒に入れて送ります。',
  },
  {
    id: 'g_zine',
    art: 'print',
    name: 'ZINE「録音の記録」',
    price: 1800,
    category: 'PRINT',
    note: '48 頁。制作中の写真と、曲ごとの覚え書き。',
  },
];

/** 値段の書きかた（¥3,300 のように三桁ずつ区切る） */
export function yen(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`;
}
