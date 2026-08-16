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
    where: "src/data/scenarios.ts の SCENARIOS",
    body: `{
  id: 'sc_???',
  title: '???',
  bg: 'plaza',            // highway / gate / plaza / clocktower / inn / alley / night
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
  no: 11,                 // ナゾ事典に並ぶ番号。重複させない
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
    id: 'place',
    label: '場所（ステージ）',
    where: 'src/data/places.ts と src/data/streets.ts',
    body: `// 1) src/data/places.ts の PLACES へ
{
  id: '???',
  name: '???',
  ruby: '???',
  x: 50,                  // 地図上の位置（％）
  y: 50,
  streetId: 'st_???',
  mainScenarioId: 'sc_???',
  // 最初から行ける場所は openFromStart: true。
  // それ以外は、どこかの会話の unlocks に id を入れて開けること。
},

// 2) src/data/streets.ts の STREETS へ
{
  id: 'st_???',
  placeId: '???',
  bg: 'plaza',
  startX: 0.06,           // 入ってきたときのカメラ位置
  npcs: [],
  puzzles: [],
  sparkles: [],
  exits: [
    // 行きと帰りの両方を書く。隣の街並みにも戻り道を足すこと。
    { id: 'ex_???', to: 'st_???', dir: 'far', x: 0.5, y: 0.5 },
  ],
},`,
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
