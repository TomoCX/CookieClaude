import type { GameState } from '../../types';

/** 調査メモ。会話で手に入れた手がかりを並べる。 */
export function NotesPanel({ state }: { state: GameState }) {
  return (
    <div className="panel__body">
      <h2 className="panel__title">調査メモ</h2>
      {state.notes.length === 0 ? (
        <p className="panel__empty">まだなにも書かれていない。</p>
      ) : (
        <ul className="notelist">
          {state.notes.map((n) => (
            <li key={n.id} className="notelist__item">
              <h3>{n.title}</h3>
              <p>{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
