import type { GameState } from '../../types';
import { progressPercent, solvedCount } from '../../state/gameState';

/** セーブの結果。押した直後に出す短い報告。 */
export function SavePanel({ state, message }: { state: GameState; message: string }) {
  return (
    <div className="panel__body panel__body--center">
      <p className="panel__lead">{message}</p>
      <dl className="savesheet">
        <div>
          <dt>解いたナゾ</dt>
          <dd>{solvedCount(state)} 問</dd>
        </div>
        <div>
          <dt>ひらめき指数</dt>
          <dd>{state.picarat} ピカラット</dd>
        </div>
        <div>
          <dt>物語</dt>
          <dd>{progressPercent(state)} %</dd>
        </div>
      </dl>
    </div>
  );
}
