import { useEffect, useState } from 'react';
import type { DevApi } from '../types';
import { setDevFlags, toggleDevMode, useDevFlags } from './devFlags';
import { InspectTab } from './tabs/InspectTab';
import { JumpTab } from './tabs/JumpTab';
import { PlaceTab } from './tabs/PlaceTab';
import { TemplateTab } from './tabs/TemplateTab';
import { StateTab } from './tabs/StateTab';
import { FlagTab } from './tabs/FlagTab';
import { EffectsTab } from './tabs/EffectsTab';

const TABS = [
  { id: 'inspect', label: '検査' },
  { id: 'jump', label: '中身へ飛ぶ' },
  { id: 'place', label: '配置' },
  { id: 'template', label: 'ひな型' },
  { id: 'state', label: '状態' },
  { id: 'flags', label: 'フラグ' },
  { id: 'effects', label: 'エフェクト' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/**
 * 開発者モード。
 *
 * 中身（場所・人物・会話・ナゾ・アイテム・エフェクト）を後から足すときの道具箱。
 * 遊びの側には一切かかわらないので、`App` からはこれ一つを置くだけでよい。
 *
 * 入りかたは `Ctrl + Shift + D`、または URL に `?dev=1`。
 * 一度入ると、この端末では次からも開いた状態で始まる。
 */
export function DevTools({ api }: { api: DevApi }) {
  const flags = useDevFlags();
  const [tab, setTab] = useState<TabId>('inspect');
  const [open, setOpen] = useState(true);

  // 出入りの合図。開発者モードが切れているときも聞いている。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        toggleDevMode();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!flags.on) return null;

  return (
    <div className={`dev${open ? ' dev--open' : ''}`}>
      <button
        type="button"
        className="dev__badge"
        onClick={() => setOpen((v) => !v)}
        title={open ? '引き出しを閉じる' : '開発者モードを開く'}
      >
        DEV
        {(flags.probe || flags.guides) && <i className="dev__badge-dot" aria-hidden="true" />}
      </button>

      {open && (
        <div className="dev__drawer">
          <div className="dev__bar">
            <div className="dev__tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`dev__tab${tab === t.id ? ' dev__tab--on' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="dev__close"
              onClick={() => setDevFlags({ on: false })}
              title="開発者モードを出る（Ctrl + Shift + D）"
            >
              ✕
            </button>
          </div>

          {tab === 'inspect' && <InspectTab />}
          {tab === 'jump' && <JumpTab api={api} />}
          {tab === 'place' && <PlaceTab api={api} />}
          {tab === 'template' && <TemplateTab />}
          {tab === 'state' && <StateTab api={api} />}
          {tab === 'flags' && <FlagTab api={api} />}
          {tab === 'effects' && <EffectsTab />}
        </div>
      )}
    </div>
  );
}
