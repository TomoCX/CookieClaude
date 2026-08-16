import { useState } from 'react';
import type { DevApi, FlagDef, FlagGroup, FlagNeeds, GameState } from '../../types';
import { ACHIEVEMENTS } from '../../data/achievements';
import { FLAGS, flagChecklist, testNeeds } from '../../data/flags';
import { ITEMS } from '../../data/items';
import { PUZZLES } from '../../data/puzzles';
import { SCENARIOS } from '../../data/scenarios';
import { isEarned } from '../../state/achievements';
import { text } from '../../i18n/text';
import { copyText } from '../copy';

const GROUPS: FlagGroup[] = ['本筋', '探索', '収集', 'やりこみ'];

/**
 * フラグ。
 *
 * フラグは進行状況から引き直すだけの「見かた」なので、旗そのものを
 * 押して立てることはできない。かわりに、**条件になっている中身のほうを
 * 満たす**（会話を読了にする、ナゾを正解にする……）。
 * 遊んだ結果と同じ形の状態しか作らないので、ここで試した状態が
 * 実際には起こりえない、ということにならない。
 */
export function FlagTab({ api }: { api: DevApi }) {
  const { state, setState } = api;
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  /** その条件を満たす状態にする（遊んだのと同じ形に整える） */
  const satisfy = (needs: FlagNeeds) => {
    setState(applyNeeds(state, needs));
    setMsg('条件を満たした。');
  };

  /** その条件を取り消す（元に戻して試しなおすため） */
  const revoke = (needs: FlagNeeds) => {
    setState(removeNeeds(state, needs));
    setMsg('条件を取り消した。');
  };

  const lit = FLAGS.filter((f) => testNeeds(f.needs, state)).length;

  return (
    <div className="dev__body">
      <h3 className="dev__head">フラグ</h3>
      <p className="dev__note">
        立っている {lit} ／ 全 {FLAGS.length} 本。値は保存していない。いつでも進行状況から
        引き直すので、旗と中身が食いちがうことがない。定義は{' '}
        <code>src/data/flags.ts</code>。
      </p>

      {GROUPS.map((group) => {
        const rows = FLAGS.filter((f) => f.group === group);
        if (rows.length === 0) return null;
        return (
          <div key={group} className="dev__slot">
            <h4 className="dev__slot-head">{group}</h4>
            <ul className="dev__list">
              {rows.map((flag) => (
                <FlagRow
                  key={flag.id}
                  flag={flag}
                  state={state}
                  open={open === flag.id}
                  onToggle={() => setOpen(open === flag.id ? null : flag.id)}
                  onSatisfy={() => satisfy(flag.needs)}
                  onRevoke={() => revoke(flag.needs)}
                />
              ))}
            </ul>
          </div>
        );
      })}

      <h3 className="dev__head">実績</h3>
      <p className="dev__note">
        並べたフラグがすべて立つと解放され、画面の中央上部に知らせが出る。
        定義は <code>src/data/achievements.ts</code>。
      </p>
      <ul className="dev__list">
        {ACHIEVEMENTS.map((a) => {
          const earned = isEarned(a, state);
          const told = state.achievements.includes(a.id);
          return (
            <li key={a.id} className="dev__row">
              <span className="dev__row-main">
                <strong>
                  {a.icon} {text(a.name)}
                </strong>
                <code>{a.id}</code>
              </span>
              <span className="dev__row-note">
                {a.flags.join(' ＋ ')}
                {a.secret && ' ／ 伏せてある'}
                {earned && !told && ' ／ 知らせ待ち'}
              </span>
              <button
                type="button"
                className={`dev__chip dev__chip--slim${earned ? ' dev__chip--on' : ''}`}
                title="条件のフラグをまとめて満たす／取り消す"
                onClick={() => {
                  const merged = a.flags.flatMap((id) => {
                    const def = FLAGS.find((f) => f.id === id);
                    return def ? [def.needs] : [];
                  });
                  setState(
                    merged.reduce(
                      (s, needs) => (earned ? removeNeeds(s, needs) : applyNeeds(s, needs)),
                      state,
                    ),
                  );
                  setMsg(earned ? '条件を取り消した。' : '条件を満たした。');
                }}
              >
                {earned ? '解放' : '未解放'}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="dev__actions">
        <button
          type="button"
          className="dev__go"
          onClick={() => {
            setState({ ...state, achievements: [] });
            setMsg('知らせの覚えを消した。条件を満たしているぶんは、もう一度出る。');
          }}
        >
          知らせをもう一度出す
        </button>
        <button
          type="button"
          className="dev__go"
          onClick={async () => {
            const lines = FLAGS.map(
              (f) => `${testNeeds(f.needs, state) ? '●' : '○'} ${f.id}  ${text(f.name)}`,
            ).join('\n');
            setMsg((await copyText(lines)) ? 'いまの旗を写した。' : '写せなかった。');
          }}
        >
          いまの旗を写す
        </button>
        {msg && <span className="dev__ok">{msg}</span>}
      </div>
    </div>
  );
}

/** フラグ 1 行。開くと、条件をひとつずつ並べて出す。 */
function FlagRow({
  flag,
  state,
  open,
  onToggle,
  onSatisfy,
  onRevoke,
}: {
  flag: FlagDef;
  state: GameState;
  open: boolean;
  onToggle: () => void;
  onSatisfy: () => void;
  onRevoke: () => void;
}) {
  const rows = flagChecklist(flag.needs, state);
  const on = rows.every((r) => r.ok);

  return (
    <li className={`dev__row${open ? ' dev__row--here' : ''}`}>
      <span className="dev__row-main">
        <strong>
          {on ? '●' : '○'} {text(flag.name)}
        </strong>
        <code>{flag.id}</code>
      </span>
      <span className="dev__row-note">
        {flag.note}
        {open && (
          <span className="dev__needs">
            {rows.map((r) => (
              <span key={r.label} className={`dev__need${r.ok ? ' dev__need--on' : ''}`}>
                {r.ok ? '✓' : '—'} {r.label}
              </span>
            ))}
          </span>
        )}
      </span>
      <button type="button" className="dev__chip dev__chip--slim" onClick={onToggle}>
        {open ? '閉じる' : '条件'}
      </button>
      <button type="button" className="dev__go" onClick={on ? onRevoke : onSatisfy}>
        {on ? '取り消す' : '満たす'}
      </button>
    </li>
  );
}

/* ---- 条件を状態に落とす ---- */

/** 重複せずに足す */
function add(list: string[], ids: string[]): string[] {
  return [...list, ...ids.filter((id) => !list.includes(id))];
}

/** その条件を満たした状態を返す（遊んだ結果と同じ形にそろえる） */
function applyNeeds(state: GameState, needs: FlagNeeds): GameState {
  const next: GameState = { ...state };

  next.clearedScenarios = add(
    next.clearedScenarios,
    needs.allScenarios ? SCENARIOS.map((s) => s.id) : (needs.scenarios ?? []),
  );
  const puzzles = needs.allPuzzles ? PUZZLES.map((p) => p.id) : (needs.puzzles ?? []);
  next.solvedPuzzles = add(next.solvedPuzzles, puzzles);
  // 解いたナゾは、当然もう見つけている
  next.foundPuzzles = add(next.foundPuzzles, puzzles);
  next.examined = add(next.examined, needs.props ?? []);
  next.openAreas = add(next.openAreas, needs.areas ?? []);

  const items = needs.allItems ? ITEMS.map((i) => i.id) : (needs.items ?? []);
  next.collected = [
    ...next.collected,
    ...items
      .filter((id) => !next.collected.some((c) => c.itemId === id))
      .map((id) => ({ itemId: id, areaId: state.areaId, atSeconds: state.playSeconds })),
  ];

  if (needs.picarat != null && next.picarat < needs.picarat) next.picarat = needs.picarat;

  return next;
}

/** その条件を取り消した状態を返す */
function removeNeeds(state: GameState, needs: FlagNeeds): GameState {
  const next: GameState = { ...state };
  const drop = (list: string[], ids: string[]) => list.filter((v) => !ids.includes(v));

  next.clearedScenarios = needs.allScenarios
    ? []
    : drop(next.clearedScenarios, needs.scenarios ?? []);
  next.solvedPuzzles = needs.allPuzzles ? [] : drop(next.solvedPuzzles, needs.puzzles ?? []);
  next.examined = drop(next.examined, needs.props ?? []);
  next.openAreas = drop(next.openAreas, needs.areas ?? []);
  const items = needs.allItems ? ITEMS.map((i) => i.id) : (needs.items ?? []);
  next.collected = next.collected.filter((c) => !items.includes(c.itemId));
  if (needs.picarat != null && next.picarat >= needs.picarat) next.picarat = needs.picarat - 1;

  return next;
}
