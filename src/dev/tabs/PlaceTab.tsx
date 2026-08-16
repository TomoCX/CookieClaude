import { useState } from 'react';
import type { DevApi } from '../../types';
import { getScene } from '../../data/scenes';
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

/** シーンの中の連番。すでにある id とぶつからないところから始める。 */
function nextIndex(sceneId: string, kind: Kind): number {
  const scene = getScene(sceneId);
  if (!scene) return 1;
  const lists: Record<Kind, { id: string }[]> = {
    npc: scene.npcs,
    puzzle: scene.puzzles,
    sparkle: scene.sparkles,
    exit: scene.exits,
  };
  return lists[kind].length + 1;
}

/** 貼りつけられる一行を組み立てる */
function snippet(kind: Kind, sceneId: string, x: number, y: number): string {
  const short = sceneId.replace(/^scn_/, '');
  const n = nextIndex(sceneId, kind);
  const fx = x.toFixed(2);
  const fy = y.toFixed(2);
  // 見わたすシーンでは、人とナゾは道の上に立つので y を書かない
  const walkable = getScene(sceneId)?.kind === 'street';
  const yPart = walkable ? '' : `, y: ${fy}`;
  switch (kind) {
    case 'npc':
      return `{ id: 'npc_${short}_${n}', characterId: '???', x: ${fx}${yPart}, scenarioId: '???' },`;
    case 'puzzle':
      return `{ id: 'pzs_${short}_${n}', puzzleId: '???', x: ${fx}${yPart}, look: 'clock' },`;
    case 'sparkle':
      return `{ id: 'skl_${short}_${n}', itemId: '???', x: ${fx}, y: ${fy} },`;
    case 'exit':
      return `{ id: 'ex_${short}_${n}', to: '???', dir: 'far', x: ${fx}, y: ${fy} },`;
  }
}

/**
 * 配置。
 * シーンを直接クリックして座標を読みとり、`src/data/scenes.ts` に
 * そのまま貼れる一行にして返す。目分量で 0〜1 を書かずに済ませるための欄。
 */
export function PlaceTab({ api }: { api: DevApi }) {
  const flags = useDevFlags();
  const spot = usePickedSpot();
  const [kind, setKind] = useState<Kind>('sparkle');
  const [copied, setCopied] = useState(false);

  const line = spot ? snippet(kind, api.sceneId, spot.x, spot.y) : '';
  const field = KINDS.find((k) => k.id === kind)?.field;

  return (
    <div className="dev__body">
      <h3 className="dev__head">シーンの上での道具</h3>

      <label className="dev__switch">
        <input
          type="checkbox"
          checked={flags.probe}
          onChange={(e) => setDevFlags({ probe: e.target.checked })}
        />
        <span>
          <strong>座標をひろう</strong>
          シーンをクリックすると、その位置の x と y を読みとる
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
          「座標をひろう」を入れてから、シーンの置きたいところをクリックする。
          （このまま操作できるよう、引き出しは閉じてかまわない）
        </p>
      ) : (
        <>
          <p className="dev__coords">
            x <strong>{spot.x.toFixed(3)}</strong> ／ y <strong>{spot.y.toFixed(3)}</strong>
            <span className="dev__count-note">{api.sceneId}</span>
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
            <code>src/data/scenes.ts</code> の <code>{api.sceneId}</code> の{' '}
            <code>{field}</code> に貼り、<code>???</code> を埋める。
            {kind === 'puzzle' && ' look は clock / sundial / pocketwatch。'}
            {kind === 'exit' &&
              ' 出口は行き帰りの両方を書くこと。dir は far / near / left / right / into / back。'}
          </p>
        </>
      )}
    </div>
  );
}
