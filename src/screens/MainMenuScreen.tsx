import { useState } from 'react';
import type { GameState, Settings } from '../types';
import { SettingsPanel } from './panels/SettingsPanel';
import { ProgressPanel } from './panels/ProgressPanel';
import { CollectionPanel } from './panels/CollectionPanel';
import { BackupPanel } from './panels/BackupPanel';
import { NotesPanel } from './panels/NotesPanel';
import { StoryPanel } from './panels/StoryPanel';
import { PuzzleIndexPanel } from './panels/PuzzleIndexPanel';
import { CharmsPanel } from './panels/CharmsPanel';
import { MemoPanel } from './panels/MemoPanel';
import { SavePanel } from './panels/SavePanel';
import { playSe } from '../audio/audio';
import { saveGame, solvedCount } from '../state/gameState';

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

/**
 * メインメニュー（写真1枚目の下側）。トランクを開いた道具ばこ。
 * 中身の一つひとつは `screens/panels/` にある。
 */
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

  /** 下段のタブ。もう一度押すと閉じる。 */
  const tab = (id: Panel, icon: string, label: string) => (
    <button
      type="button"
      className={`tab${panel === id ? ' tab--on' : ''}`}
      onClick={() => setPanel(panel === id ? null : id)}
    >
      <span aria-hidden="true">{icon}</span> {label}
    </button>
  );

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
              <TrunkItem icon="🎩" label="深まるナゾ" onClick={() => setPanel('story')} />
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
              <TrunkItem icon="💾" label="バックアップ" onClick={() => setPanel('backup')} />
              <TrunkItem icon="⚙" label="設定" onClick={() => setPanel('settings')} />
              <TrunkItem icon="？" label="？？？" locked />
            </div>
          </>
        ) : (
          <div className="panel">
            {panel === 'progress' && <ProgressPanel state={state} />}
            {panel === 'notes' && <NotesPanel state={state} />}
            {panel === 'story' && <StoryPanel state={state} />}
            {panel === 'index' && <PuzzleIndexPanel state={state} />}
            {panel === 'charms' && <CharmsPanel state={state} />}
            {panel === 'collection' && <CollectionPanel state={state} />}
            {panel === 'backup' && <BackupPanel buildSave={buildSave} onRestore={onRestore} />}
            {panel === 'settings' && (
              <SettingsPanel settings={settings} onChange={onChangeSettings} />
            )}
            {panel === 'memo' && <MemoPanel memo={state.memo} onChange={onChangeMemo} />}
            {panel === 'save' && <SavePanel state={state} message={saveMsg} />}
          </div>
        )}
      </div>

      <div className="trunk__footer">
        {tab('progress', '📊', '進行状況')}
        {tab('memo', '📕', 'メモ')}
        {tab('charms', '💝', 'チャーム')}
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
  /** 右上に出す数（0 のときは出さない） */
  badge?: number;
  /** まだ使えない道具 */
  locked?: boolean;
  onClick?: () => void;
}

/** トランクに並ぶ道具ひとつ */
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
