import type { GameState } from '../../types';

/** チャーム（お守り）。会話の読了で手に入る。 */
export function CharmsPanel({ state }: { state: GameState }) {
  return (
    <div className="panel__body">
      <h2 className="panel__title">チャーム</h2>
      {state.charms.length === 0 ? (
        <p className="panel__empty">まだなにも持っていない。</p>
      ) : (
        <ul className="charmlist">
          {state.charms.map((c) => (
            <li key={c.id} className="charmlist__item">
              <span className="charmlist__icon" aria-hidden="true">
                {c.icon}
              </span>
              <div>
                <h3>{c.name}</h3>
                <p>{c.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
