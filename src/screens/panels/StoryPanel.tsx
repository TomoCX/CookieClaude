import type { GameState } from '../../types';
import { MAIN_SCENARIOS } from '../../data/scenarios';
import { CENTRAL_QUESTIONS, STORY_SUMMARY, knownBeats, metCast } from '../../data/story';
import { clearedMainCount, progressPercent } from '../../state/gameState';
import { ProgressBar } from '../../components/ProgressBar';

/**
 * 深まるナゾ。物語全体にかかわることだけを書いてある。
 * （1 問ずつのナゾ解きはナゾ事典のほう）
 */
export function StoryPanel({ state }: { state: GameState }) {
  const percent = progressPercent(state);
  const beats = knownBeats(state);
  const cast = metCast(state);
  const next = MAIN_SCENARIOS.find((s) => !state.clearedScenarios.includes(s.id));

  return (
    <div className="panel__body">
      <h2 className="panel__title">深まるナゾ</h2>

      <h3 className="panel__sub">概要</h3>
      <p className="panel__lead panel__lead--pre">{STORY_SUMMARY}</p>

      <h3 className="panel__sub">本件の争点</h3>
      <ul className="qlist">
        {CENTRAL_QUESTIONS.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>

      <ProgressBar
        label="解明した範囲"
        note={`${clearedMainCount(state)} / ${MAIN_SCENARIOS.length}（${percent}%）`}
        percent={percent}
      />

      <h3 className="panel__sub">判明していること</h3>
      {beats.length === 0 ? (
        <p className="panel__empty">まだ何も判明していない。町の人物に話を聞こう。</p>
      ) : (
        <ol className="beatlist">
          {beats.map((b) => (
            <li key={b.id}>
              <h4>{b.heading}</h4>
              <p>{b.body}</p>
            </li>
          ))}
        </ol>
      )}

      <h3 className="panel__sub">関係者</h3>
      {cast.length === 0 ? (
        <p className="panel__empty">まだ誰とも会っていない。</p>
      ) : (
        <ul className="castlist">
          {cast.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong>
              <span>{c.role}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="panel__next">
        {next ? `次に調べること：「${next.title}」` : 'メープル町の事件は幕を閉じた。'}
      </p>
    </div>
  );
}
