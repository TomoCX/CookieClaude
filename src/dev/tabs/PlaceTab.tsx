import { useState } from 'react';
import type { DevApi } from '../../types';
import { getStreet } from '../../data/streets';
import { setDevFlags, useDevFlags, usePickedSpot } from '../devFlags';
import { copyText } from '../copy';

/** 拾った座標から書きだせるもの */
const KINDS = [
  { id: 'npc', label: '立っている人', field: 'npcs' },
  { id: 'puzzle', label: 'ナゾ', field: 'puzzles' },
  { id: 'sparkle', label: 'キラキラ', field: 'sparkles' },
  { id: 'exit', label: '出口', field: 'exits' },
] as const;

type Kind = (typeof KINDS)[number]['id'];

/** 街並みの中の連番。すでにある id とぶつからないところから始める。 */
function nextIndex(streetId: string, kind: Kind): number {
  const street = getStreet(streetId);
  if (!street) return 1;
  const lists: Record<Kind, { id: string }[]> = {
    npc: street.npcs,
    puzzle: street.puzzles,
    sparkle: street.sparkles,
    exit: street.exits,
  };
  return lists[kind].length + 1;
}

/** 貼りつけられる一行を組み立てる */
function snippet(kind: Kind, streetId: string, x: number, y: number): string {
  const short = streetId.replace(/^st_/, '');
  const n = nextIndex(streetId, kind);
  const fx = x.toFixed(2);
  const fy = y.toFixed(2);
  switch (kind) {
    case 'npc':
      return `{ id: 'npc_${short}_${n}', characterId: '???', x: ${fx}, scenarioId: '???' },`;
    case 'puzzle':
      return `{ id: 'sp_${short}_${n}', puzzleId: '???', x: ${fx}, look: 'clock' },`;
    case 'sparkle':
      return `{ id: 'sk_${short}_${n}', itemId: '???', x: ${fx}, y: ${fy} },`;
    case 'exit':
      return `{ id: 'ex_${short}_${n}', to: '???', dir: 'far', x: ${fx}, y: ${fy} },`;
  }
}

/**
 * 配置。
 * 街並みを直接クリックして座標を読みとり、`src/data/streets.ts` に
 * そのまま貼れる一行にして返す。目分量で 0〜1 を書かずに済ませるための欄。
 */
export function PlaceTab({ api }: { api: DevApi }) {
  const flags = useDevFlags();
  const spot = usePickedSpot();
  const [kind, setKind] = useState<Kind>('sparkle');
  const [copied, setCopied] = useState(false);

  const line = spot ? snippet(kind, api.streetId, spot.x, spot.y) : '';
  const field = KINDS.find((k) => k.id === kind)?.field;

  return (
    <div className="dev__body">
      <h3 className="dev__head">街並みの上での道具</h3>

      <label className="dev__switch">
        <input
          type="checkbox"
          checked={flags.probe}
          onChange={(e) => setDevFlags({ probe: e.target.checked })}
        />
        <span>
          <strong>座標をひろう</strong>
          街並みをクリックすると、その位置の x と y を読みとる
        </span>
      </label>

      <label className="dev__switch">
        <input
          type="checkbox"
          checked={flags.guides}
          onChange={(e) => setDevFlags({ guides: e.target.checked })}
        />
        <span>
          <strong>置き場所を見せる</strong>
          いま置いてある人・ナゾ・キラキラ・出口に、目じるしと座標を出す
        </span>
      </label>

      <h3 className="dev__head">拾った座標</h3>
      {!spot ? (
        <p className="dev__note">
          「座標をひろう」を入れてから、街並みの置きたいところをクリックする。
          （このまま操作できるよう、引き出しは閉じてかまわない）
        </p>
      ) : (
        <>
          <p className="dev__coords">
            x <strong>{spot.x.toFixed(3)}</strong> ／ y <strong>{spot.y.toFixed(3)}</strong>
            <span className="dev__count-note">{api.streetId}</span>
          </p>

          <div className="dev__chips">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                className={`dev__chip${kind === k.id ? ' dev__chip--on' : ''}`}
                onClick={() => {
                  setKind(k.id);
                  setCopied(false);
                }}
              >
                {k.label}
              </button>
            ))}
          </div>

          <pre className="dev__code">{line}</pre>
          <div className="dev__actions">
            <button
              type="button"
              className="dev__go"
              onClick={async () => setCopied(await copyText(line))}
            >
              書きうつす
            </button>
            {copied && <span className="dev__ok">写した</span>}
          </div>
          <p className="dev__note">
            <code>src/data/streets.ts</code> の <code>{api.streetId}</code> の{' '}
            <code>{field}</code> に貼り、<code>???</code> を埋める。
            {kind === 'npc' && ' 人は x だけを見るので、y は使わない。'}
            {kind === 'puzzle' && ' ナゾも x だけを見る。look は clock / sundial / pocketwatch。'}
            {kind === 'exit' && ' 出口は行き帰りの両方を書くこと。dir は far / near / left / right。'}
          </p>
        </>
      )}
    </div>
  );
}
