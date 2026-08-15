import { useState } from 'react';
import type { GameState, Puzzle } from '../types';
import { PUZZLES, picaratFor } from '../data/puzzles';
import { MAIN_SCENARIOS } from '../data/scenarios';
import {
  CENTRAL_QUESTIONS,
  STORY_SUMMARY,
  knownBeats,
  metCast,
} from '../data/story';
import {
  TOTAL_PICARAT,
  clearedMainCount,
  progressPercent,
  saveGame,
  solvedCount,
} from '../state/gameState';

/** メインメニューの中で開いているサブ画面 */
type Panel = 'notes' | 'story' | 'index' | 'save' | 'memo' | 'charms' | null;

interface Props {
  state: GameState;
  /** 自由記入メモが変わったとき */
  onChangeMemo: (memo: string) => void;
  /** とじる（前の画面に戻る） */
  onClose: () => void;
  /** メニュー画面（ステータス）を開く */
  onOpenMenu: () => void;
}

/** メインメニュー（写真1枚目の下側）。トランクを開いた道具ばこ。 */
export function MainMenuScreen({
  state,
  onChangeMemo,
  onClose,
  onOpenMenu,
}: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const [saveMsg, setSaveMsg] = useState('');

  const handleSave = () => {
    setPanel('save');
    setSaveMsg(
      saveGame(state)
        ? 'ぼうけんの きろくを セーブしました。'
        : 'セーブできませんでした。ブラウザの せっていを かくにんしてください。',
    );
  };

  return (
    <div className="trunk">
      <div className="trunk__bar">
        <button
          type="button"
          className="iconbtn"
          onClick={() => (panel ? setPanel(null) : onClose())}
          title="もどる"
        >
          ↰
        </button>
        <h1 className="trunk__title">メインメニュー</h1>
        <button
          type="button"
          className="iconbtn iconbtn--gear"
          onClick={onOpenMenu}
          title="メニュー画面へ"
        >
          ⚙
        </button>
      </div>

      <div className="trunk__case">
        {panel === null ? (
          <>
            <div className="trunk__row">
              <TrunkItem
                icon="📖"
                label="ちょうさメモ"
                badge={state.notes.length}
                onClick={() => setPanel('notes')}
              />
              <TrunkItem
                icon="🎩"
                label="ふかまるナゾ"
                onClick={() => setPanel('story')}
              />
              <TrunkItem
                icon="📙"
                label="ナゾじてん"
                badge={solvedCount(state)}
                onClick={() => setPanel('index')}
              />
              <TrunkItem icon="🖋" label="セーブ" onClick={handleSave} />
            </div>

            <div className="trunk__row trunk__row--locked">
              <TrunkItem icon="？" label="？？？" locked />
              <TrunkItem icon="？" label="？？？" locked />
              <TrunkItem icon="？" label="？？？" locked />
            </div>
          </>
        ) : (
          <div className="panel">
            {panel === 'notes' && <NotesPanel state={state} />}
            {panel === 'story' && <StoryPanel state={state} />}
            {panel === 'index' && <IndexPanel state={state} />}
            {panel === 'charms' && <CharmsPanel state={state} />}
            {panel === 'memo' && (
              <MemoPanel memo={state.memo} onChange={onChangeMemo} />
            )}
            {panel === 'save' && (
              <div className="panel__body panel__body--center">
                <p className="panel__lead">{saveMsg}</p>
                <dl className="savesheet">
                  <div>
                    <dt>とけたナゾ</dt>
                    <dd>{solvedCount(state)} コ</dd>
                  </div>
                  <div>
                    <dt>ひらめきしすう</dt>
                    <dd>{state.picarat} ピカラット</dd>
                  </div>
                  <div>
                    <dt>ものがたり</dt>
                    <dd>{progressPercent(state)} %</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="trunk__footer">
        <button
          type="button"
          className={`tab${panel === 'memo' ? ' tab--on' : ''}`}
          onClick={() => setPanel(panel === 'memo' ? null : 'memo')}
        >
          <span aria-hidden="true">📕</span> メモ
        </button>
        <button
          type="button"
          className={`tab${panel === 'charms' ? ' tab--on' : ''}`}
          onClick={() => setPanel(panel === 'charms' ? null : 'charms')}
        >
          <span aria-hidden="true">💝</span> チャーム
        </button>
        <button type="button" className="tab tab--close" onClick={onClose}>
          <span aria-hidden="true">🧳</span> とじる
        </button>
      </div>
    </div>
  );
}

interface TrunkItemProps {
  icon: string;
  label: string;
  badge?: number;
  locked?: boolean;
  onClick?: () => void;
}

function TrunkItem({ icon, label, badge, locked, onClick }: TrunkItemProps) {
  return (
    <button
      type="button"
      className={`titem${locked ? ' titem--locked' : ''}`}
      onClick={onClick}
      disabled={locked}
      title={locked ? 'まだ つかえない' : label}
    >
      <span className="titem__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="titem__label">{label}</span>
      {badge != null && badge > 0 && <span className="titem__badge">{badge}</span>}
    </button>
  );
}

function NotesPanel({ state }: { state: GameState }) {
  return (
    <div className="panel__body">
      <h2 className="panel__title">ちょうさメモ</h2>
      {state.notes.length === 0 ? (
        <p className="panel__empty">まだ なにも 書かれていない。</p>
      ) : (
        <ul className="notelist">
          {state.notes.map((n) => (
            <li key={n.id} className="notelist__item">
              <h3>{n.title}</h3>
              <p>{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * ふかまるナゾ。ストーリー全体にかかわることだけを 書いてある。
 * （1 問ずつの ナゾ解きは ナゾじてん のほう）
 */
function StoryPanel({ state }: { state: GameState }) {
  const percent = progressPercent(state);
  const beats = knownBeats(state);
  const cast = metCast(state);
  const next = MAIN_SCENARIOS.find((s) => !state.clearedScenarios.includes(s.id));

  return (
    <div className="panel__body">
      <h2 className="panel__title">ふかまるナゾ</h2>

      <h3 className="panel__sub">あらすじ</h3>
      <p className="panel__lead panel__lead--pre">{STORY_SUMMARY}</p>

      <h3 className="panel__sub">この事件の 問い</h3>
      <ul className="qlist">
        {CENTRAL_QUESTIONS.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>

      <div className="menu__progress">
        <div className="menu__progress-head">
          <span>ときあかした ぶん</span>
          <span>
            {clearedMainCount(state)} / {MAIN_SCENARIOS.length}（{percent}%）
          </span>
        </div>
        <div className="menu__progress-track">
          <div className="menu__progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <h3 className="panel__sub">わかっていること</h3>
      {beats.length === 0 ? (
        <p className="panel__empty">まだ 何も わかっていない。町の人に 話を 聞こう。</p>
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

      <h3 className="panel__sub">出会った人</h3>
      {cast.length === 0 ? (
        <p className="panel__empty">まだ だれにも 会っていない。</p>
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
        {next
          ? `つぎに 調べること：「${next.title}」`
          : 'メープル町の 事件は 幕を とじた。'}
      </p>
    </div>
  );
}

/** ナゾじてん。独立した ナゾ解き 1 問ずつを 並べる。 */
function IndexPanel({ state }: { state: GameState }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="panel__body">
      <h2 className="panel__title">ナゾじてん</h2>
      <p className="panel__lead">
        マップの 時計を 押すと ちょうせんできる、1問ずつの ナゾ。
      </p>
      <div className="menu__progress">
        <div className="menu__progress-head">
          <span>といた ナゾ</span>
          <span>
            {solvedCount(state)} / {PUZZLES.length}（{state.picarat} /{' '}
            {TOTAL_PICARAT} ピカラット）
          </span>
        </div>
        <div className="menu__progress-track">
          <div
            className="menu__progress-fill"
            style={{ width: `${(solvedCount(state) / PUZZLES.length) * 100}%` }}
          />
        </div>
      </div>

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
        title={solved ? 'かいせつを 見る' : 'まだ といていない'}
      >
        <span className="indexlist__no">{String(puzzle.no).padStart(3, '0')}</span>
        <span className="indexlist__title">
          {found ? puzzle.title : '？？？？？'}
        </span>
        <span className="indexlist__picarat">
          {solved ? `${picaratFor(puzzle, misses)} P` : `— / ${puzzle.picarat[0]} P`}
        </span>
      </button>
      {open && solved && (
        <div className="indexlist__detail">
          <p className="indexlist__q">{puzzle.question}</p>
          <h4>かいせつ</h4>
          <p>{puzzle.explanation}</p>
        </div>
      )}
    </li>
  );
}

function CharmsPanel({ state }: { state: GameState }) {
  return (
    <div className="panel__body">
      <h2 className="panel__title">チャーム</h2>
      {state.charms.length === 0 ? (
        <p className="panel__empty">まだ なにも 持っていない。</p>
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

function MemoPanel({
  memo,
  onChange,
}: {
  memo: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="panel__body">
      <h2 className="panel__title">メモ</h2>
      <p className="panel__lead">気づいたことを 書きとめておこう。</p>
      <textarea
        className="memopad"
        value={memo}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ここに 自由に 書けます"
        spellCheck={false}
      />
    </div>
  );
}
