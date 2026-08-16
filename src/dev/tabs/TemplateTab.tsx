import { useState } from 'react';
import { copyText } from '../copy';

/**
 * ひな型。
 * 新しい中身を書き始めるときの骨組みを出す。どの項目が要るのか、
 * どのファイルのどこへ足すのかを、いちいち README に戻らずに済ませるための欄。
 */

interface Template {
  id: string;
  label: string;
  /** どのファイルへ足すか */
  where: string;
  body: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'scenario',
    label: '会話',
    where: 'src/data/scenarios/<エリア>.ts',
    body: `{
  id: 'sc_???',
  title: '???',
  bg: 'plaza',            // highway / gate / plaza / clocktower / inn / river / alley / night
  kind: 'flavor',         // 本筋なら 'main'
  coin: 2,
  lines: [
    { speaker: 'claude', text: '???', sub: '???', pose: 'normal' },
    { speaker: 'cookie', text: '???', pose: 'think' },
    { text: '（話者を書かないとナレーションになる）' },
  ],
  // 読了時にもらえるもの（要らなければ消す）
  note: { id: 'note_???', title: '???', body: '???' },
  charm: { id: 'charm_???', name: '???', desc: '???', icon: '🔎' },
  unlocks: ['???'],
},`,
  },
  {
    id: 'puzzle',
    label: 'ナゾ',
    where: 'src/data/puzzles.ts の PUZZLES',
    body: `{
  id: 'pz_???',
  no: 13,                 // ナゾ事典に並ぶ番号。重複させない
  title: '???',
  picarat: [30, 25, 20],  // 一発正解 / 一度まちがえた / それ以降
  figure: 'riddle',       // src/components/PuzzleFigure.tsx にある図
  question: '???',
  // 答えの形は五つ。同じ形に寄せないこと。
  answer: { kind: 'number', value: 0, unit: '回' },
  // answer: { kind: 'choice', options: ['???', '???'], correct: 0 },
  // answer: { kind: 'text', accept: ['???'], placeholder: '???' },
  // answer: { kind: 'order', items: ['???', '???'], correct: [0, 1] },
  // answer: { kind: 'grid', rows: 4, cols: 4, rule: 'oneEachRowCol' },
  hints: ['???', '???', '???'],
  // ウミガメのスープにするときだけ。無料で開ける「はい／いいえ」。
  // clues: [{ q: '???', a: 'はい' }],
  explanation: '???',
},`,
  },
  {
    id: 'item',
    label: 'アイテム',
    where: 'src/data/items.ts の ITEMS',
    body: `{
  id: 'it_???',
  name: '???',
  flavor: '???',          // 事件の周辺を補う短い文
  icon: 'stone',          // src/components/ItemIcon.tsx にある絵
},`,
  },
  {
    id: 'character',
    label: '登場人物',
    where: 'src/data/characters.ts の CHARACTERS',
    body: `'???': {
  id: '???',
  name: '???',
  side: 'right',          // 会話画面での立ち位置
  hat: 'cap',             // tophat / cap / bonnet / straw / hood / none
  coat: '#7a5b3e',
  accent: '#e2a01c',
  skin: '#f0d0ae',
  hair: '#4a3826',
  scale: 1,               // 子どもや老人は 0.85 など
},`,
  },
  {
    id: 'scene',
    label: 'シーン',
    where: 'src/data/scenes.ts の SCENES',
    body: `// 見わたすシーン（道・広場・室内）
{
  id: 'scn_???_???',      // scn_<エリア>_<場所>
  name: '???',            // そのエリアの中で重ならない固有名。現在地に出る
  areaId: '???',
  kind: 'street',
  bg: 'plaza',            // highway / gate / plaza / clocktower / inn / river / alley / night
  startX: 0.06,           // 入ってきたときのカメラ位置
  npcs: [],               // 道の上に立つので x のみ
  puzzles: [],
  sparkles: [],
  // 背景を画像に差しかえるとき（src/data/images.ts に登録した id）
  // image: 'img_???',
  exits: [
    // 行きと帰りの両方を書く。つなぎ元のシーンにも出口を足すこと。
    { id: 'ex_???_???', to: 'scn_???', dir: 'far', x: 0.5, y: 0.5 },
  ],
},

// 一枚絵のシーン（覗きこんだ図・拡大図）
{
  id: 'scn_???_???',
  name: '???',
  areaId: '???',
  kind: 'view',           // 拡大図なら 'closeup'（人は置かない）
  backdrop: 'manhole',    // manhole / noticeboard / room / mill
  npcs: [],               // 見わたさないので x と y の両方が要る
  puzzles: [],
  sparkles: [{ id: 'skl_???_1', itemId: '???', x: 0.5, y: 0.6 }],
  // 押すと文が出るところ（棚・飾りなど）
  props: [
    { id: 'prp_???_???', name: '???', text: '???', x: 0.5, y: 0.5,
      w: 0.16, h: 0.2, gives: 'it_???' },
  ],
  exits: [
    // 覗きこんだ先からは、必ず同じエリアへ戻れるようにする
    { id: 'ex_???_???', to: 'scn_???', dir: 'back', x: 0.5, y: 0.12 },
  ],
},`,
  },
  {
    id: 'area',
    label: 'エリア',
    where: 'src/data/areas.ts と src/data/scenes.ts',
    body: `// 1) src/data/areas.ts の AREAS へ
{
  id: '???',
  name: '???',
  ruby: '???',
  x: 50,                  // 地図上の位置（％）
  y: 50,
  entrySceneId: 'scn_???', // 地図から入ったとき最初に立つシーン
  mainScenarioId: 'sc_???',
  // 最初から行けるエリアは openFromStart: true。
  // それ以外は、どこかの会話の unlocks に id を入れて開けること。
  // 両方に書くと幕開けを飛ばせてしまうので、どちらか一方だけ。
},

// 2) src/data/scenes.ts に、そのエリアのシーンを 1 枚以上足す
//    （areaId をこのエリアの id に合わせる。「シーン」のひな型を参照）

// 3) 隣のエリアのシーンと出口でつなぐ。行き先が別エリアなら、
//    それだけでエリアをまたいだことになる。`,
  },
  {
    id: 'flag',
    label: 'フラグ',
    where: 'src/data/flags.ts の FLAGS',
    body: `{
  id: 'fl_???',
  group: '探索',           // 本筋 / 探索 / 収集 / やりこみ
  name: '???',            // 開発者ツールに出る名前
  note: '???',            // 何を表すフラグか（開発者向けの覚え書き）
  // 条件は関数ではなくデータで書く。書いたものが「すべて」満たされると立つ。
  // 実在しない id は起動時の検査ではじかれる。
  needs: {
    scenarios: ['sc_???'],  // すべて読了
    // puzzles: ['pz_???'],  // すべて正解
    // items: ['it_???'],    // すべて所持
    // props: ['prp_???'],   // すべて調査
    // areas: ['???'],       // すべて開放
    // picarat: 300,         // これ以上
    // allPuzzles: true, allItems: true, allScenarios: true,
  },
},`,
  },
  {
    id: 'achievement',
    label: '実績',
    where: 'src/data/achievements.ts の ACHIEVEMENTS',
    body: `{
  id: 'ac_???',
  name: { ja: '???', en: '???' },
  desc: { ja: '???', en: '???' },
  icon: '🏅',
  // ここに挙げたフラグが「すべて」立った瞬間に解放され、
  // 画面の中央上部に数秒だけ知らせが出る。
  flags: ['fl_???'],
  // secret: true,        // 解放するまで名前も説明も伏せる
},`,
  },
  {
    id: 'image',
    label: '背景画像',
    where: 'src/data/images.ts の SCENE_IMAGES',
    body: `// 1) src/data/images.ts の SCENE_IMAGES へ
{
  id: 'img_???',
  src: '???',             // URL、または import した画像
  // fit: 'cover',        // contain にすると全体を収める
  credit: '???',          // 出どころ・権利の覚え書き（画面には出ない）
},

// 2) src/data/scenes.ts の、そのシーンに一行
//    image: 'img_???',
//
//    street は横長の一枚（画面 3 枚分の幅）、view / closeup は画面と同じ比率。
//    読めなかったときは、これまでどおり描いた背景に戻る。
//    素材そのものはリポジトリに置かない。`,
  },
  {
    id: 'effect',
    label: 'エフェクト',
    where: 'src/effects/sketches/ と src/effects/registry.ts',
    body: `// 1) src/effects/sketches/???.ts
import type { EffectSketch } from '../../types';

export function create???(): EffectSketch {
  let things: { x: number; y: number }[] = [];

  return {
    // 大きさが決まったとき・変わったときに呼ばれる
    setup({ width, height }) {
      things = Array.from({ length: 30 }, () => ({
        x: Math.random(),
        y: Math.random(),
      }));
    },
    // 毎コマ呼ばれる。画面は消してあるので、描くだけでよい。
    draw({ ctx, width, height, time, dt, pointer, strength, cameraT }) {
      for (const t of things) {
        ctx.beginPath();
        ctx.arc(t.x * width, t.y * height, 2, 0, Math.PI * 2);
        ctx.fillStyle = \`rgba(255, 244, 206, \${0.4 * strength})\`;
        ctx.fill();
      }
    },
  };
}

// 2) src/effects/registry.ts の EFFECTS へ
{
  id: 'fx_???',
  name: '???',
  slot: 'street.front',   // 差しこむ場所
  note: '???',
  enabled: true,
  create: create???,
},`,
  },
];

export function TemplateTab() {
  const [open, setOpen] = useState<string>(TEMPLATES[0]!.id);
  const [copied, setCopied] = useState('');
  const current = TEMPLATES.find((t) => t.id === open) ?? TEMPLATES[0]!;

  return (
    <div className="dev__body">
      <h3 className="dev__head">書き始めの骨組み</h3>
      <div className="dev__chips">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`dev__chip${open === t.id ? ' dev__chip--on' : ''}`}
            onClick={() => {
              setOpen(t.id);
              setCopied('');
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="dev__note">
        足し先： <code>{current.where}</code>
      </p>
      <pre className="dev__code dev__code--tall">{current.body}</pre>
      <div className="dev__actions">
        <button
          type="button"
          className="dev__go"
          onClick={async () => setCopied((await copyText(current.body)) ? current.id : '')}
        >
          書きうつす
        </button>
        {copied === current.id && <span className="dev__ok">写した</span>}
      </div>
      <p className="dev__note">
        貼ったら「検査」の欄を見ること。<code>???</code> のまま残っている参照は、
        つながりの検査ではじかれる。
      </p>
    </div>
  );
}
