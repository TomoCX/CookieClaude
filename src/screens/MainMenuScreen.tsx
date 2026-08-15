import { useState } from 'react';
import type { GameState } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { progressPercent, saveGame } from '../state/gameState';

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
                badge={state.clearedScenarios.length}
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
                    <dd>{state.solved} コ</dd>
                  </div>
                  <div>
                    <dt>ひらめきしすう</dt>
                    <dd>{state.picarat} ピカラット</dd>
                  </div>
                  <div>
                    <dt>しんこう</dt>
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

function StoryPanel({ state }: { state: GameState }) {
  const percent = progressPercent(state);
  const next = SCENARIOS.find((s) => !state.clearedScenarios.includes(s.id));

  return (
    <div className="panel__body">
      <h2 className="panel__title">ふかまるナゾ</h2>
      <p className="panel__lead">
        メープル町に とどいた 一通の手紙。
        「まちの時計が十三回鳴る夜、まちの宝が消える」。
      </p>
      <div className="menu__progress">
        <div className="menu__progress-head">
          <span>ときあかした ぶん</span>
          <span>{percent}%</span>
        </div>
        <div className="menu__progress-track">
          <div className="menu__progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <p className="panel__next">
        {next
          ? `つぎの ナゾ：ナゾ${String(next.no).padStart(3, '0')}「${next.title}」`
          : 'すべての ナゾが とけた。おつかれさま、めいたんてい。'}
      </p>
    </div>
  );
}

function IndexPanel({ state }: { state: GameState }) {
  return (
    <div className="panel__body">
      <h2 className="panel__title">ナゾじてん</h2>
      <ul className="indexlist">
        {SCENARIOS.map((s) => {
          const cleared = state.clearedScenarios.includes(s.id);
          return (
            <li
              key={s.id}
              className={`indexlist__item${cleared ? ' indexlist__item--cleared' : ''}`}
            >
              <span className="indexlist__no">
                {String(s.no).padStart(3, '0')}
              </span>
              <span className="indexlist__title">
                {cleared ? s.title : '？？？？？'}
              </span>
              <span className="indexlist__picarat">
                {cleared ? `${s.reward.picarat} P` : '— P'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
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
