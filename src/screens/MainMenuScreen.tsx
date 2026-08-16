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
import { EffectLayer } from '../components/EffectLayer';
import { playSe } from '../audio/audio';
import { saveGame, solvedCount } from '../state/gameState';
import { useText } from '../i18n/text';
import { UI } from '../i18n/ui';

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
  /** セーブ用に、いまいるシーンも含めた状態を組み立てる */
  buildSave: () => GameState;
  /** 設定が変わったとき */
  onChangeSettings: (next: Settings) => void;
  /** バックアップから復元した */
  onRestore: (next: GameState) => void;
  /** 自由記入メモが変わったとき */
  onChangeMemo: (memo: string) => void;
  /** 開発者モードが入っているか */
  devOn: boolean;
  /** 開発者モードを出入りする */
  onToggleDev: () => void;
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
  devOn,
  onToggleDev,
  onClose,
}: Props) {
  const t = useText();
  const [panel, setPanel] = useState<Panel>(null);
  const [saveMsg, setSaveMsg] = useState('');

  const handleSave = () => {
    playSe('click');
    setPanel('save');
    setSaveMsg(
      saveGame(buildSave()) ? t(UI.saveOk) : t(UI.saveNg),
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
      <EffectLayer slot="menu.back" />
      <div className="trunk__bar">
        <button
          type="button"
          className="iconbtn"
          onClick={() => (panel ? setPanel(null) : onClose())}
          title={t(UI.back)}
        >
          ↰
        </button>
        <h1 className="trunk__title">{t(UI.mainMenu)}</h1>
        <span className="trunk__spacer" aria-hidden="true" />
      </div>

      <div className="trunk__case">
        {panel === null ? (
          <>
            <div className="trunk__row">
              <TrunkItem
                icon="📖"
                label={t(UI.toolNotes)}
                badge={state.notes.length}
                onClick={() => setPanel('notes')}
              />
              <TrunkItem icon="🎩" label={t(UI.toolStory)} onClick={() => setPanel('story')} />
              <TrunkItem
                icon="📙"
                label={t(UI.toolIndex)}
                badge={solvedCount(state)}
                onClick={() => setPanel('index')}
              />
              <TrunkItem icon="🖋" label={t(UI.toolSave)} onClick={handleSave} />
            </div>

            <div className="trunk__row">
              <TrunkItem
                icon="🧺"
                label={t(UI.toolCollection)}
                badge={state.collected.length}
                onClick={() => setPanel('collection')}
              />
              <TrunkItem icon="💾" label={t(UI.toolBackup)} onClick={() => setPanel('backup')} />
              <TrunkItem icon="⚙" label={t(UI.toolSettings)} onClick={() => setPanel('settings')} />
              {/* 中身を足すための道具箱。Ctrl + Shift + D でも出入りできる。 */}
              <TrunkItem
                icon="🛠"
                label={t(UI.toolDev)}
                on={devOn}
                onClick={() => {
                  onToggleDev();
                  onClose();
                }}
              />
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
        {tab('progress', '📊', t(UI.tabProgress))}
        {tab('memo', '📕', t(UI.tabMemo))}
        {tab('charms', '💝', t(UI.tabCharms))}
        <button type="button" className="tab tab--close" onClick={onClose}>
          <span aria-hidden="true">🧳</span> {t(UI.close)}
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
  /** いま入っている道具（開発者モードなど）は灯して見せる */
  on?: boolean;
  onClick?: () => void;
}

/** トランクに並ぶ道具ひとつ */
function TrunkItem({ icon, label, badge, locked, on, onClick }: TrunkItemProps) {
  const t = useText();
  return (
    <button
      type="button"
      className={`titem${locked ? ' titem--locked' : ''}${on ? ' titem--on' : ''}`}
      onClick={() => {
        playSe('click');
        onClick?.();
      }}
      disabled={locked}
      title={locked ? t(UI.toolLocked) : on ? `${label}${t(UI.toolActive)}` : label}
    >
      <span className="titem__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="titem__label">{label}</span>
      {badge != null && badge > 0 && <span className="titem__badge">{badge}</span>}
    </button>
  );
}
