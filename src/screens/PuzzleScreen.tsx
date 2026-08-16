import { useState } from 'react';
import type { GameState, Puzzle } from '../types';
import { picaratFor, puzzleNo } from '../data/puzzles';
import { PuzzleFigure } from '../components/PuzzleFigure';
import { EffectLayer } from '../components/EffectLayer';
import { playSe } from '../audio/audio';
import { useText } from '../i18n/text';
import { UI } from '../i18n/ui';

interface Props {
  puzzle: Puzzle;
  state: GameState;
  /** 誤答した */
  onMiss: () => void;
  /** ヒントを一つ見る（ひらめきコイン1枚） */
  onUseHint: () => void;
  /** 正解した */
  onSolved: () => void;
  /** シーンへ戻る */
  onQuit: () => void;
}

/** 答えを組み立てるための、形式ごとの入力状態 */
interface Draft {
  /** 数値・言葉 */
  text: string;
  /** 選択 */
  picked: number | null;
  /** 並べかえ（押した順に items の番号が入る） */
  order: number[];
  /** 二次元パズル（押されているます目の "row,col"） */
  cells: string[];
}

const EMPTY: Draft = { text: '', picked: null, order: [], cells: [] };

/** シーンに置かれた時計を押すと開く、独立したナゾ解き画面。 */
export function PuzzleScreen({
  puzzle,
  state,
  onMiss,
  onUseHint,
  onSolved,
  onQuit,
}: Props) {
  const t = useText();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [wrong, setWrong] = useState(false);
  /**
   * 開いた時点で すでに解いていたか。
   * 正解すると state 側の solvedPuzzles が増えるので、
   * 描画のたびに数えなおすと初回でも「解決済み」になってしまう。
   */
  const [wasSolved] = useState(() => state.solvedPuzzles.includes(puzzle.id));
  const [cleared, setCleared] = useState(wasSolved);
  /** ウミガメのスープの、開いた手がかりの数 */
  const [cluesOpen, setCluesOpen] = useState(0);

  const a = puzzle.answer;
  const misses = state.misses[puzzle.id] ?? 0;
  const hintsSeen = state.hints[puzzle.id] ?? 0;
  const reward = picaratFor(puzzle, misses);

  /** いまの入力で答えられる状態か */
  const canAnswer = (() => {
    switch (a.kind) {
      case 'number':
      case 'text':
        return draft.text.trim() !== '';
      case 'choice':
        return draft.picked !== null;
      case 'order':
        return draft.order.length === a.items.length;
      case 'grid':
        return draft.cells.length === a.rows;
    }
  })();

  /** 正誤の判定 */
  const judge = (): boolean => {
    switch (a.kind) {
      case 'number':
        return Number(draft.text) === a.value;
      case 'text': {
        // 表記ゆれを吸収するため、空白と記号を落としてから比べる
        const norm = (v: string) => v.replace(/[\s・、。「」]/g, '');
        return a.accept.some((v) => norm(v) === norm(draft.text));
      }
      case 'choice':
        return draft.picked === a.correct;
      case 'order':
        return a.correct.every((v, i) => draft.order[i] === v);
      case 'grid': {
        // どの行にも、どの列にも、ちょうど一つ
        if (draft.cells.length !== a.rows) return false;
        const rows = new Set<number>();
        const cols = new Set<number>();
        for (const key of draft.cells) {
          const [r, c] = key.split(',').map(Number);
          rows.add(r!);
          cols.add(c!);
        }
        return rows.size === a.rows && cols.size === a.rows;
      }
    }
  };

  const check = () => {
    if (judge()) {
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

  if (cleared) {
    return (
      <div className="puzzle puzzle--clear">
        <div className="clear">
          <p className="clear__head">{t(UI.correct)}</p>
          <h2 className="clear__title">
            {t(UI.puzzleNoLabel)} {puzzleNo(puzzle)}・{t(puzzle.title)}
          </h2>
          {!wasSolved && (
            <p className="clear__picarat">
              +{reward} <em>{t(UI.picarat)}</em>
            </p>
          )}
          {wasSolved && <p className="clear__again">{t(UI.alreadySolved)}</p>}
          <div className="clear__explain">
            <h3>{t(UI.explanation)}</h3>
            <p>{t(puzzle.explanation)}</p>
          </div>
          <button type="button" className="result__ok" onClick={onQuit}>
            {t(UI.backToScene)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="puzzle">
      <EffectLayer slot="puzzle.front" />
      <div className="puzzle__bar">
        <button type="button" className="iconbtn" onClick={onQuit} title={t(UI.interrupt)}>
          ↰
        </button>
        <span className="puzzle__no">{t(UI.puzzleNoLabel)} {puzzleNo(puzzle)}</span>
        <span className="puzzle__picarat">{reward} {t(UI.picarat)}</span>
      </div>

      <div className="puzzle__body">
        <h2 className="puzzle__title">{t(puzzle.title)}</h2>
        <PuzzleFigure id={puzzle.figure} />
        <p className="puzzle__question">{t(puzzle.question)}</p>

        {/* ウミガメのスープ：はい／いいえを一つずつ開く */}
        {puzzle.clues && (
          <div className="cluebox">
            <h3 className="cluebox__head">{t(UI.askQuestions)}</h3>
            <ol className="cluelist">
              {puzzle.clues.slice(0, cluesOpen).map((c) => (
                <li key={c.q}>
                  <span className="cluelist__q">{c.q}？</span>
                  <span className="cluelist__a">{c.a}</span>
                </li>
              ))}
            </ol>
            {cluesOpen < puzzle.clues.length ? (
              <button
                type="button"
                className="cluebox__more"
                onClick={() => {
                  playSe('click');
                  setCluesOpen(cluesOpen + 1);
                }}
              >
                {t(UI.askMore)}
              </button>
            ) : (
              <p className="cluebox__done">{t(UI.askDone)}</p>
            )}
          </div>
        )}

        {hintsSeen > 0 && (
          <ul className="hintlist">
            {puzzle.hints.slice(0, hintsSeen).map((h, i) => (
              <li key={h}>
                <span className="hintlist__no">{t(UI.hintN)}{i + 1}</span>
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className={`answer${wrong ? ' answer--wrong' : ''}`}>
          {(a.kind === 'number' || a.kind === 'text') && (
            <label className="answer__num">
              <span className="answer__label">{t(UI.answerLabel)}</span>
              <input
                type={a.kind === 'number' ? 'number' : 'text'}
                inputMode={a.kind === 'number' ? 'numeric' : 'text'}
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canAnswer) check();
                }}
                placeholder={a.kind === 'number' ? t(UI.unknownShort) : a.placeholder}
              />
              {a.kind === 'number' && <span className="answer__unit">{a.unit}</span>}
            </label>
          )}

          {a.kind === 'choice' && (
            <div className="answer__choices">
              {a.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  className={`choice${draft.picked === i ? ' choice--on' : ''}`}
                  onClick={() => setDraft({ ...draft, picked: i })}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {a.kind === 'order' && (
            <div className="answer__order">
              <div className="answer__orderhead">
                <span className="answer__label">{t(UI.orderPrompt)}</span>
                <button
                  type="button"
                  className="answer__reset"
                  onClick={() => setDraft({ ...draft, order: [] })}
                  disabled={draft.order.length === 0}
                >
                  {t(UI.reset)}
                </button>
              </div>
              {a.items.map((item, i) => {
                const at = draft.order.indexOf(i);
                return (
                  <button
                    key={item}
                    type="button"
                    className={`orderitem${at >= 0 ? ' orderitem--on' : ''}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        order:
                          at >= 0
                            ? draft.order.filter((v) => v !== i)
                            : [...draft.order, i],
                      })
                    }
                  >
                    <span className="orderitem__no">{at >= 0 ? at + 1 : '・'}</span>
                    {item}
                  </button>
                );
              })}
            </div>
          )}

          {a.kind === 'grid' && (
            <div className="answer__grid">
              <div className="answer__orderhead">
                <span className="answer__label">
                  {t(UI.lampsLit)} {draft.cells.length} / {a.rows}
                </span>
                <button
                  type="button"
                  className="answer__reset"
                  onClick={() => setDraft({ ...draft, cells: [] })}
                  disabled={draft.cells.length === 0}
                >
                  やり直す
                </button>
              </div>
              <div
                className="lampgrid"
                style={{ gridTemplateColumns: `repeat(${a.cols}, 1fr)` }}
              >
                {Array.from({ length: a.rows * a.cols }, (_, n) => {
                  const r = Math.floor(n / a.cols);
                  const c = n % a.cols;
                  const key = `${r},${c}`;
                  const on = draft.cells.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`lampcell${on ? ' lampcell--on' : ''}`}
                      aria-label={`${r + 1}${t(UI.windowAt)}${c + 1}`}
                      aria-pressed={on}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          cells: on
                            ? draft.cells.filter((v) => v !== key)
                            : [...draft.cells, key],
                        })
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {wrong && <p className="puzzle__wrong">{t(UI.wrong)}</p>}
        {misses > 0 && !wrong && <p className="puzzle__misses">{t(UI.missCount)}：{misses}</p>}
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
            ? t(UI.noHintsLeft)
            : `${t(UI.hintN)}${hintsSeen + 1}${t(UI.hintCost)}`}
        </button>
        <button
          type="button"
          className="puzzle__submit"
          onClick={check}
          disabled={!canAnswer}
        >
          {t(UI.submit)}
        </button>
      </div>
    </div>
  );
}
