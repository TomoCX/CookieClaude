import { useState } from 'react';
import type { GameState } from '../../types';
import { PUZZLES, picaratFor, puzzleNo } from '../../data/puzzles';
import { TOTAL_PICARAT, solvedCount } from '../../state/gameState';
import { ProgressBar } from '../../components/ProgressBar';
import { DetailView } from '../../components/DetailView';
import { PuzzleFigure } from '../../components/PuzzleFigure';
import { useText } from '../../i18n/text';
import { UI } from '../../i18n/ui';

/** ナゾ事典。独立したナゾ解き 1 問ずつを並べる。 */
export function PuzzleIndexPanel({ state }: { state: GameState }) {
  const [open, setOpen] = useState<string | null>(null);
  const t = useText();
  const solved = solvedCount(state);

  const shown = open ? PUZZLES.find((p) => p.id === open) : undefined;

  // 一問を選んでいるあいだは、一覧のかわりに解説だけを大きく出す
  if (shown && state.solvedPuzzles.includes(shown.id)) {
    const misses = state.misses[shown.id] ?? 0;
    return (
      <DetailView
        eyebrow={`${t(UI.puzzleNoLabel)} ${puzzleNo(shown)}`}
        title={t(shown.title)}
        onBack={() => setOpen(null)}
      >
        <PuzzleFigure id={shown.figure} />
        <p className="detail__lead detail__lead--pre">{t(shown.question)}</p>
        <h4 className="detail__sub">{t(UI.explanation)}</h4>
        <p className="detail__text">{t(shown.explanation)}</p>
        <dl className="detail__meta">
          <div>
            <dt>{t(UI.picarat)}</dt>
            <dd>{picaratFor(shown, misses)}</dd>
          </div>
          <div>
            <dt>{t(UI.missCount)}</dt>
            <dd>{misses}</dd>
          </div>
        </dl>
      </DetailView>
    );
  }

  return (
    <div className="panel__body">
      <h2 className="panel__title">{t(UI.puzzleIndex)}</h2>
      <p className="panel__lead">{t(UI.puzzleIndexLead)}</p>

      <ProgressBar
        label={t(UI.solvedPuzzles)}
        note={`${solved} / ${PUZZLES.length}（${state.picarat} / ${TOTAL_PICARAT} ${t(UI.picarat)}）`}
        percent={(solved / PUZZLES.length) * 100}
      />

      <ul className="indexlist">
        {PUZZLES.map((puzzle) => {
          const isSolved = state.solvedPuzzles.includes(puzzle.id);
          const found = state.foundPuzzles.includes(puzzle.id);
          const misses = state.misses[puzzle.id] ?? 0;
          return (
            <li
              key={puzzle.id}
              className={`indexlist__item${isSolved ? ' indexlist__item--cleared' : ''}`}
            >
              <button
                type="button"
                className="indexlist__row"
                onClick={() => setOpen(puzzle.id)}
                disabled={!isSolved}
                title={isSolved ? t(UI.seeExplanation) : t(UI.unanswered)}
              >
                <span className="indexlist__no">{puzzleNo(puzzle)}</span>
                <span className="indexlist__title">
                  {found ? t(puzzle.title) : t(UI.hiddenTitle)}
                </span>
                <span className="indexlist__picarat">
                  {isSolved ? `${picaratFor(puzzle, misses)} P` : `— / ${puzzle.picarat[0]} P`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
