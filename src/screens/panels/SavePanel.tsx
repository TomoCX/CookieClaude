import type { GameState } from '../../types';
import { progressPercent, solvedCount } from '../../state/gameState';
import { useText } from '../../i18n/text';
import { UI } from '../../i18n/ui';


/** セーブの結果。押した直後に出す短い報告。 */
export function SavePanel({ state, message }: { state: GameState; message: string }) {
  const t = useText();
  return (
    <div className="panel__body panel__body--center">
      <p className="panel__lead">{message}</p>
      <dl className="savesheet">
        <div>
          <dt>{t(UI.savedNotes)}</dt>
          <dd>{solvedCount(state)}</dd>
        </div>
        <div>
          <dt>{t(UI.savedPicarat)}</dt>
          <dd>{state.picarat}</dd>
        </div>
        <div>
          <dt>{t(UI.savedStory)}</dt>
          <dd>{progressPercent(state)} %</dd>
        </div>
      </dl>
    </div>
  );
}
