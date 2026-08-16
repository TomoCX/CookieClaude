import type { Scene } from '../types';
import { getCharacter } from '../data/characters';
import { getItem } from '../data/items';
import { getPuzzle } from '../data/puzzles';
import { setPickedSpot, useDevFlags, usePickedSpot } from './devFlags';
import { text } from '../i18n/text';

/**
 * シーンの上に重ねる、置き場所のための道具。
 *
 * - 座標をひろう: クリックした点を「シーンの中の 0〜1」に直して覚える
 * - 置き場所を見せる: いま置いてあるものに目じるしと座標を出す
 *
 * どちらも開発者モードのときだけ現れる。
 */
interface Props {
  scene: Scene;
  /** いま見ている位置（カメラのまんなか） */
  center: number;
  /** 画面に見えている幅。見わたさないシーンでは 1（全体が見えている） */
  view: number;
}

export function DevProbe({ scene, center, view }: Props) {
  const flags = useDevFlags();
  const picked = usePickedSpot();
  if (!flags.on || (!flags.probe && !flags.guides)) return null;

  /** シーンの座標を、いまの画面の中の位置（0〜1）に直す */
  const toScreen = (x: number): number => (x - (center - view / 2)) / view;

  const marks = flags.guides
    ? [
        ...scene.npcs.map((n) => ({
          key: n.id,
          kind: '人',
          x: n.x,
          y: n.y ?? 0.62,
          label: getCharacter(n.characterId)?.name ?? n.characterId,
        })),
        ...scene.puzzles.map((p) => ({
          key: p.id,
          kind: 'ナゾ',
          x: p.x,
          y: p.y ?? 0.7,
          label: getPuzzle(p.puzzleId)?.title ?? p.puzzleId,
        })),
        ...scene.sparkles.map((s) => ({
          key: s.id,
          kind: '品',
          x: s.x,
          y: s.y,
          label: getItem(s.itemId)?.name ?? s.itemId,
        })),
        ...(scene.props ?? []).map((p) => ({
          key: p.id,
          kind: '調べどころ',
          x: p.x,
          y: p.y,
          label: p.name,
        })),
        ...scene.exits.map((e) => ({
          key: e.id,
          kind: '出口',
          x: e.x,
          y: e.y,
          label: `${e.dir} → ${e.to}`,
        })),
      ]
    : [];

  return (
    <div
      className={`probe${flags.probe ? ' probe--live' : ''}`}
      onClick={(e) => {
        if (!flags.probe) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const fx = (e.clientX - rect.left) / rect.width;
        const fy = (e.clientY - rect.top) / rect.height;
        // 画面の中の位置を、シーンぜんたいの 0〜1 に直す
        setPickedSpot({
          x: Math.min(1, Math.max(0, center - view / 2 + fx * view)),
          y: Math.min(1, Math.max(0, fy)),
        });
      }}
      role="presentation"
    >
      {marks.map((m) => {
        const left = toScreen(m.x);
        if (left < -0.1 || left > 1.1) return null;
        return (
          <div
            key={m.key}
            className="probe__mark"
            style={{ left: `${left * 100}%`, top: `${m.y * 100}%` }}
          >
            <span className="probe__label">
              {m.kind}・{text(m.label)}
              <em>
                {m.x.toFixed(2)}, {m.y.toFixed(2)}
              </em>
            </span>
          </div>
        );
      })}

      {picked && flags.probe && (
        <div
          className="probe__pick"
          style={{ left: `${toScreen(picked.x) * 100}%`, top: `${picked.y * 100}%` }}
        >
          <span className="probe__label probe__label--pick">
            {picked.x.toFixed(3)}, {picked.y.toFixed(3)}
          </span>
        </div>
      )}
    </div>
  );
}
