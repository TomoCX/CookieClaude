import { useState } from 'react';
import type { GameState, Puzzle, Settings } from '../types';
import { PUZZLES, picaratFor } from '../data/puzzles';
import { MAIN_SCENARIOS } from '../data/scenarios';
import {
  CENTRAL_QUESTIONS,
  STORY_SUMMARY,
  knownBeats,
  metCast,
} from '../data/story';
import { SettingsPanel } from './SettingsPanel';
import { ProgressPanel } from './ProgressPanel';
import { CollectionPanel } from './CollectionPanel';
import { BackupPanel } from './BackupPanel';
import { playSe } from '../audio/audio';
import {
  TOTAL_PICARAT,
  clearedMainCount,
  progressPercent,
  saveGame,
  solvedCount,
} from '../state/gameState';

/** メインメニューの中で開いているサブ画面 */
type Panel =
  | 'progress'
  | 'notes'
  | 'story'
  | 'index'
  | 'save'
  | 'memo'
  | 'charms'
  | 'settings'
  | 'collection'
  | 'backup'
  | null;

interface Props {
  state: GameState;
  settings: Settings;
  /** セーブ用に、いまいる街並みも含めた状態を組み立てる */
  buildSave: () => GameState;
  /** 設定が変わったとき */
  onChangeSettings: (next: Settings) => void;
  /** バックアップから復元した */
  onRestore: (next: GameState) => void;
  /** 自由記入メモが変わったとき */
  onChangeMemo: (memo: string) => void;
  /** 閉じる（前の画面に戻る） */
  onClose: () => void;
}

/** メインメニュー（写真1枚目の下側）。トランクを開いた道具ばこ。 */
export function MainMenuScreen({
  state,
  settings,
  buildSave,
  onRestore,
  onChangeSettings,
  onChangeMemo,
  onClose,
}: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const [saveMsg, setSaveMsg] = useState('');

  const handleSave = () => {
    playSe('click');
    setPanel('save');
    setSaveMsg(
      saveGame(buildSave())
        ? '冒険の記録を保存した。'
        : 'セーブに失敗した。ブラウザの設定を確認してほしい。',
    );
  };

  return (
    <div className="trunk">
      <div className="trunk__bar">
        <button
          type="button"
          className="iconbtn"
          onClick={() => (panel ? setPanel(null) : onClose())}
          title="戻る"
        >
          ↰
        </button>
        <h1 className="trunk__title">メインメニュー</h1>
        <span className="trunk__spacer" aria-hidden="true" />
      </div>

      <div className="trunk__case">
        {panel === null ? (
          <>
            <div className="trunk__row">
              <TrunkItem
                icon="📖"
                label="調査メモ"
                badge={state.notes.length}
                onClick={() => setPanel('notes')}
              />
              <TrunkItem
                icon="🎩"
                label="深まるナゾ"
                onClick={() => setPanel('story')}
              />
              <TrunkItem
                icon="📙"
                label="ナゾ事典"
                badge={solvedCount(state)}
                onClick={() => setPanel('index')}
              />
              <TrunkItem icon="🖋" label="セーブ" onClick={handleSave} />
            </div>

            <div className="trunk__row">
              <TrunkItem
                icon="🧺"
                label="コレクション"
                badge={state.collected.length}
                onClick={() => setPanel('collection')}
              />
              <TrunkItem
                icon="💾"
                label="バックアップ"
                onClick={() => setPanel('backup')}
              />
              <TrunkItem
                icon="⚙"
                label="設定"
                onClick={() => setPanel('settings')}
              />
              <TrunkItem icon="？" label="？？？" locked />
            </div>
          </>
        ) : (
          <div className="panel">
            {panel === 'progress' && <ProgressPanel state={state} />}
            {panel === 'notes' && <NotesPanel state={state} />}
            {panel === 'story' && <StoryPanel state={state} />}
            {panel === 'index' && <IndexPanel state={state} />}
            {panel === 'charms' && <CharmsPanel state={state} />}
            {panel === 'collection' && <CollectionPanel state={state} />}
            {panel === 'backup' && (
              <BackupPanel buildSave={buildSave} onRestore={onRestore} />
            )}
            {panel === 'settings' && (
              <SettingsPanel settings={settings} onChange={onChangeSettings} />
            )}
            {panel === 'memo' && (
              <MemoPanel memo={state.memo} onChange={onChangeMemo} />
            )}
            {panel === 'save' && (
              <div className="panel__body panel__body--center">
                <p className="panel__lead">{saveMsg}</p>
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
            )}
          </div>
        )}
      </div>

      <div className="trunk__footer">
        <button
          type="button"
          className={`tab${panel === 'progress' ? ' tab--on' : ''}`}
          onClick={() => setPanel(panel === 'progress' ? null : 'progress')}
        >
          <span aria-hidden="true">📊</span> 進行状況
        </button>
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
          <span aria-hidden="true">🧳</span> 閉じる
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
      onClick={() => {
        playSe('click');
        onClick?.();
      }}
      disabled={locked}
      title={locked ? 'まだ使用できない' : label}
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
      <h2 className="panel__title">調査メモ</h2>
      {state.notes.length === 0 ? (
        <p className="panel__empty">まだなにも書かれていない。</p>
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
 * 深まるナゾ。ストーリー全体にかかわることだけを書いてある。
 * （1 問ずつのナゾ解きはナゾ事典のほう）
 */
function StoryPanel({ state }: { state: GameState }) {
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

      <div className="menu__progress">
        <div className="menu__progress-head">
          <span>解明した範囲</span>
          <span>
            {clearedMainCount(state)} / {MAIN_SCENARIOS.length}（{percent}%）
          </span>
        </div>
        <div className="menu__progress-track">
          <div className="menu__progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

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
        {next
          ? `次に調べること：「${next.title}」`
          : 'メープル町の事件は幕を閉じた。'}
      </p>
    </div>
  );
}

/** ナゾ事典。独立したナゾ解き 1 問ずつを並べる。 */
function IndexPanel({ state }: { state: GameState }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="panel__body">
      <h2 className="panel__title">ナゾ事典</h2>
      <p className="panel__lead">
        街を歩いて見つけた時計から挑戦する、独立した一問。
      </p>
      <div className="menu__progress">
        <div className="menu__progress-head">
          <span>解いたナゾ</span>
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
        title={solved ? '解説を見る' : '未解答'}
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
          <h4>解説</h4>
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
      <p className="panel__lead">気づいたことを書き留めておこう。</p>
      <textarea
        className="memopad"
        value={memo}
        onChange={(e) => onChange(e.target.value)}
        placeholder="自由に記入できる"
        spellCheck={false}
      />
    </div>
  );
}
