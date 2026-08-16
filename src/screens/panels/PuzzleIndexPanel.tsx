import { useState } from 'react';
import type { GameState, Puzzle } from '../../types';
import { PUZZLES, picaratFor, puzzleNo } from '../../data/puzzles';
import { TOTAL_PICARAT, solvedCount } from '../../state/gameState';
import { ProgressBar } from '../../components/ProgressBar';

/** ナゾ事典。独立したナゾ解き 1 問ずつを並べる。 */
export function PuzzleIndexPanel({ state }: { state: GameState }) {
  const [open, setOpen] = useState<string | null>(null);
  const solved = solvedCount(state);

  return (
    <div className="panel__body">
      <h2 className="panel__title">ナゾ事典</h2>
      <p className="panel__lead">街を歩いて見つけた時計から挑戦する、独立した一問。</p>

      <ProgressBar
        label="解いたナゾ"
        note={`${solved} / ${PUZZLES.length}（${state.picarat} / ${TOTAL_PICARAT} ピカラット）`}
        percent={(solved / PUZZLES.length) * 100}
      />

      <ul className="indexlist">
        {PUZZLES.map((p) => (
          <PuzzleRow
            key={p.id}
            puzzle={p}
            state={state}
            open={open === p.id}
            onToggle={() => setOpen(open === p.id ? null : p.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function PuzzleRow({
  puzzle,
  state,
  open,
  onToggle,
}: {
  puzzle: Puzzle;
  state: GameState;
  open: boolean;
  onToggle: () => void;
}) {
  const solved = state.solvedPuzzles.includes(puzzle.id);
  const found = state.foundPuzzles.includes(puzzle.id);
  const misses = state.misses[puzzle.id] ?? 0;

  return (
    <li className={`indexlist__item${solved ? ' indexlist__item--cleared' : ''}`}>
      <button
        type="button"
        className="indexlist__row"
        onClick={onToggle}
        disabled={!solved}
        title={solved ? '解説を見る' : '未解答'}
      >
        <span className="indexlist__no">{puzzleNo(puzzle)}</span>
        <span className="indexlist__title">{found ? puzzle.title : '？？？？？'}</span>
        <span className="indexlist__picarat">
          {solved ? `${picaratFor(puzzle, misses)} P` : `— / ${puzzle.picarat[0]} P`}
        </span>
      </button>
      {open && solved && (
        <div className="indexlist__detail">
          <p className="indexlist__q">{puzzle.question}</p>
          <h4>解説</h4>
          <p>{puzzle.explanation}</p>
        </div>
      )}
    </li>
  );
}
