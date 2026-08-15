import { useState } from 'react';
import type { GameState, Puzzle } from '../types';
import { picaratFor } from '../data/puzzles';
import { PuzzleFigure } from '../components/PuzzleFigure';
import { playSe } from '../audio/audio';

interface Props {
  puzzle: Puzzle;
  state: GameState;
  /** まちがえた */
  onMiss: () => void;
  /** ヒントを 1 つ見る（ひらめきコイン 1 まい） */
  onUseHint: () => void;
  /** 正解した */
  onSolved: () => void;
  /** マップへ戻る */
  onQuit: () => void;
}

/** マップの「時計のような物体」を押すと開く、独立したナゾ解き画面。 */
export function PuzzleScreen({
  puzzle,
  state,
  onMiss,
  onUseHint,
  onSolved,
  onQuit,
}: Props) {
  const [input, setInput] = useState('');
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);
  const [cleared, setCleared] = useState(state.solvedPuzzles.includes(puzzle.id));

  const misses = state.misses[puzzle.id] ?? 0;
  const hintsSeen = state.hints[puzzle.id] ?? 0;
  const reward = picaratFor(puzzle, misses);
  const alreadySolved = state.solvedPuzzles.includes(puzzle.id);

  const check = () => {
    const ok =
      puzzle.answer.kind === 'number'
        ? Number(input) === puzzle.answer.value
        : picked === puzzle.answer.correct;

    if (ok) {
      playSe('correct');
      setWrong(false);
      setCleared(true);
      onSolved();
    } else {
      playSe('wrong');
      setWrong(true);
      onMiss();
      setTimeout(() => setWrong(false), 700);
    }
  };

  const canAnswer =
    puzzle.answer.kind === 'number' ? input.trim() !== '' : picked !== null;

  if (cleared) {
    return (
      <div className="puzzle puzzle--clear">
        <div className="clear">
          <p className="clear__head">せいかい！</p>
          <h2 className="clear__title">
            ナゾ {String(puzzle.no).padStart(3, '0')}・{puzzle.title}
          </h2>
          {!alreadySolved && (
            <p className="clear__picarat">
              +{reward} <em>ピカラット</em>
            </p>
          )}
          {alreadySolved && <p className="clear__again">（このナゾは 解決ずみ）</p>}
          <div className="clear__explain">
            <h3>かいせつ</h3>
            <p>{puzzle.explanation}</p>
          </div>
          <button type="button" className="result__ok" onClick={onQuit}>
            マップへ もどる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="puzzle">
      <div className="puzzle__bar">
        <button type="button" className="iconbtn" onClick={onQuit} title="やめる">
          ↰
        </button>
        <span className="puzzle__no">ナゾ {String(puzzle.no).padStart(3, '0')}</span>
        <span className="puzzle__picarat">{reward} ピカラット</span>
      </div>

      <div className="puzzle__body">
        <h2 className="puzzle__title">{puzzle.title}</h2>
        <PuzzleFigure id={puzzle.figure} />
        <p className="puzzle__question">{puzzle.question}</p>

        {hintsSeen > 0 && (
          <ul className="hintlist">
            {puzzle.hints.slice(0, hintsSeen).map((h, i) => (
              <li key={i}>
                <span className="hintlist__no">ヒント {i + 1}</span>
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className={`answer${wrong ? ' answer--wrong' : ''}`}>
          {puzzle.answer.kind === 'number' ? (
            <label className="answer__num">
              <span className="answer__label">こたえ</span>
              <input
                type="number"
                inputMode="numeric"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canAnswer) check();
                }}
                placeholder="？"
              />
              <span className="answer__unit">{puzzle.answer.unit}</span>
            </label>
          ) : (
            <div className="answer__choices">
              {puzzle.answer.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  className={`choice${picked === i ? ' choice--on' : ''}`}
                  onClick={() => setPicked(i)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {wrong && <p className="puzzle__wrong">ざんねん。もういちど 考えてみよう。</p>}
        {misses > 0 && !wrong && (
          <p className="puzzle__misses">まちがえた回数：{misses} 回</p>
        )}
      </div>

      <div className="puzzle__footer">
        <button
          type="button"
          className="puzzle__hint"
          onClick={() => {
            playSe('coin');
            onUseHint();
          }}
          disabled={hintsSeen >= puzzle.hints.length || state.coin < 1}
        >
          {hintsSeen >= puzzle.hints.length
            ? 'ヒントは もうない'
            : `ヒント ${hintsSeen + 1}（コイン 1まい）`}
        </button>
        <button
          type="button"
          className="puzzle__submit"
          onClick={check}
          disabled={!canAnswer}
        >
          こたえる
        </button>
      </div>
    </div>
  );
}
