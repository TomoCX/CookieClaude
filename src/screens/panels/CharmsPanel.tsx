import type { GameState } from '../../types';
import { useText } from '../../i18n/text';
import { UI } from '../../i18n/ui';


/** チャーム（お守り）。会話の読了で手に入る。 */
export function CharmsPanel({ state }: { state: GameState }) {
  const t = useText();
  return (
    <div className="panel__body">
      <h2 className="panel__title">{t(UI.charms)}</h2>
      {state.charms.length === 0 ? (
        <p className="panel__empty">{t(UI.charmsEmpty)}</p>
      ) : (
        <ul className="charmlist">
          {state.charms.map((c) => (
            <li key={c.id} className="charmlist__item">
              <span className="charmlist__icon" aria-hidden="true">
                {c.icon}
              </span>
              <div>
                <h3>{t(c.name)}</h3>
                <p>{t(c.desc)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
