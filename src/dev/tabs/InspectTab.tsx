import { useMemo } from 'react';
import { CHARACTERS } from '../../data/characters';
import { ITEMS } from '../../data/items';
import { PLACES } from '../../data/places';
import { PUZZLES } from '../../data/puzzles';
import { SCENARIOS, MAIN_SCENARIOS } from '../../data/scenarios';
import { STREETS } from '../../data/streets';
import { checkContent } from '../../data/registry';
import { TOTAL_PICARAT } from '../../state/gameState';

/**
 * 検査。
 * 起動時にコンソールへ出しているものと同じ検査を、画面の中でも読めるようにする。
 * 中身を足しながら開きっぱなしにしておくと、書きまちがえがその場で分かる。
 */
export function InspectTab() {
  // 中身は起動後に変わらないので、開くたびに数えなおす必要はない
  const problems = useMemo(() => checkContent(), []);

  const counts = [
    { label: '場所', n: PLACES.length },
    { label: '街並み', n: STREETS.length },
    { label: '出口', n: STREETS.reduce((s, t) => s + t.exits.length, 0) },
    { label: '登場人物', n: Object.keys(CHARACTERS).length },
    { label: '会話', n: SCENARIOS.length, note: `本筋 ${MAIN_SCENARIOS.length}` },
    { label: 'ナゾ', n: PUZZLES.length, note: `${TOTAL_PICARAT} ピカラット` },
    { label: 'アイテム', n: ITEMS.length },
    { label: '立っている人', n: STREETS.reduce((s, t) => s + t.npcs.length, 0) },
  ];

  return (
    <div className="dev__body">
      <h3 className="dev__head">中身のつながり</h3>
      {problems.length === 0 ? (
        <p className="dev__ok">問題なし。すべての id がつながっている。</p>
      ) : (
        <ul className="dev__problems">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <h3 className="dev__head">数えたもの</h3>
      <div className="dev__counts">
        {counts.map((c) => (
          <div key={c.label} className="dev__count">
            <span className="dev__count-label">{c.label}</span>
            <span className="dev__count-value">{c.n}</span>
            {c.note && <span className="dev__count-note">{c.note}</span>}
          </div>
        ))}
      </div>

      <p className="dev__note">
        同じ検査は起動時にも走り、問題があればブラウザのコンソールに並ぶ。
        検査そのものを増やすときは <code>src/data/registry.ts</code>。
      </p>
    </div>
  );
}
