import { useState } from 'react';
import type { DevApi } from '../../types';
import { ITEMS } from '../../data/items';
import { PLACES } from '../../data/places';
import { PUZZLES } from '../../data/puzzles';
import { SCENARIOS } from '../../data/scenarios';
import { createInitialState, healSave } from '../../state/gameState';
import { copyText } from '../copy';

/**
 * 状態。
 * 進行の途中からしか出ない画面を確かめるための欄。
 * ここでの書きかえは、遊びとしての筋道を通さずに直接ねじこむ。
 */
export function StateTab({ api }: { api: DevApi }) {
  const { state, setState } = api;
  const [draft, setDraft] = useState('');
  const [msg, setMsg] = useState('');

  /** すべて開いた状態にする（会話・ナゾ・アイテム・場所） */
  const openAll = () => {
    setState({
      ...state,
      openPlaces: PLACES.map((p) => p.id),
      clearedScenarios: SCENARIOS.map((s) => s.id),
      foundPuzzles: PUZZLES.map((p) => p.id),
      solvedPuzzles: PUZZLES.map((p) => p.id),
      notes: SCENARIOS.flatMap((s) => (s.note ? [s.note] : [])),
      charms: SCENARIOS.flatMap((s) => (s.charm ? [s.charm] : [])),
      collected: ITEMS.map((i) => ({
        itemId: i.id,
        placeId: state.placeId,
        atSeconds: state.playSeconds,
      })),
    });
    setMsg('すべて開いた。');
  };

  return (
    <div className="dev__body">
      <h3 className="dev__head">数値</h3>
      <div className="dev__nums">
        <label className="dev__num">
          <span>ひらめきコイン</span>
          <input
            type="number"
            value={state.coin}
            onChange={(e) => setState({ ...state, coin: Number(e.target.value) })}
          />
        </label>
        <label className="dev__num">
          <span>ピカラット</span>
          <input
            type="number"
            value={state.picarat}
            onChange={(e) => setState({ ...state, picarat: Number(e.target.value) })}
          />
        </label>
        <label className="dev__num">
          <span>プレイ時間（秒）</span>
          <input
            type="number"
            value={state.playSeconds}
            onChange={(e) => setState({ ...state, playSeconds: Number(e.target.value) })}
          />
        </label>
      </div>

      <h3 className="dev__head">まとめて</h3>
      <div className="dev__actions">
        <button type="button" className="dev__go" onClick={openAll}>
          すべて開く
        </button>
        <button
          type="button"
          className="dev__go"
          onClick={() => {
            setState(createInitialState());
            setMsg('最初の状態に戻した。');
          }}
        >
          初期状態に戻す
        </button>
        {msg && <span className="dev__ok">{msg}</span>}
      </div>

      <h3 className="dev__head">生の進行状況</h3>
      <div className="dev__actions">
        <button
          type="button"
          className="dev__go"
          onClick={async () => {
            const ok = await copyText(JSON.stringify(state, null, 2));
            setMsg(ok ? 'いまの状態を写した。' : '写せなかった。');
          }}
        >
          いまの状態を写す
        </button>
      </div>
      <textarea
        className="dev__json"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="JSON を貼りつけて読みこむ"
        spellCheck={false}
      />
      <div className="dev__actions">
        <button
          type="button"
          className="dev__go"
          disabled={draft.trim() === ''}
          onClick={() => {
            try {
              const parsed = JSON.parse(draft) as Record<string, unknown>;
              // 足りない項目は初期値で埋め、街並みと現在地の食い違いも直す
              setState(healSave({ ...createInitialState(), ...parsed }));
              setMsg('読みこんだ。');
            } catch {
              setMsg('JSON として読めなかった。');
            }
          }}
        >
          この JSON を読みこむ
        </button>
      </div>

      <p className="dev__note">
        遊ぶ人向けの書きだし・読みこみは、メインメニューの「バックアップ」のほう。
        こちらは検算も版の確認もせず、そのまま流しこむ。
      </p>
    </div>
  );
}
