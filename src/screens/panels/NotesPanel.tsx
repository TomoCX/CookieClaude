import type { GameState } from '../../types';
import { useText } from '../../i18n/text';
import { UI } from '../../i18n/ui';


/** 調査メモ。会話で手に入れた手がかりを並べる。 */
export function NotesPanel({ state }: { state: GameState }) {
  const t = useText();
  return (
    <div className="panel__body">
      <h2 className="panel__title">{t(UI.notes)}</h2>
      {state.notes.length === 0 ? (
        <p className="panel__empty">{t(UI.notesEmpty)}</p>
      ) : (
        <ul className="notelist">
          {state.notes.map((n) => (
            <li key={n.id} className="notelist__item">
              <h3>{t(n.title)}</h3>
              <p>{t(n.body)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
