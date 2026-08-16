import { useState } from 'react';
import type { GameState } from '../../types';
import { ITEMS, getItem } from '../../data/items';
import { getArea } from '../../data/areas';
import { formatPlayTime } from '../../state/gameState';
import { ItemArt } from '../../components/ItemIcon';

interface Props {
  state: GameState;
}

/**
 * コレクション。街で拾ったアイテムを並べる。
 * まだ拾っていないものは伏せておき、いくつ残っているかだけが分かるようにする。
 */
export function CollectionPanel({ state }: Props) {
  const [open, setOpen] = useState<string | null>(null);

  const found = new Map(state.collected.map((c) => [c.itemId, c]));
  const percent = Math.round((found.size / ITEMS.length) * 100);

  return (
    <div className="panel__body">
      <h2 className="panel__title">コレクション</h2>
      <p className="panel__lead">
        街のあちこちに落ちている品。光っているものをクリックすると拾える。
      </p>

      <div className="menu__progress">
        <div className="menu__progress-head">
          <span>拾った品</span>
          <span>
            {found.size} / {ITEMS.length}（{percent}%）
          </span>
        </div>
        <div className="menu__progress-track">
          <div className="menu__progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <ul className="collection">
        {ITEMS.map((item) => {
          const got = found.get(item.id);
          const isOpen = open === item.id;
          return (
            <li
              key={item.id}
              className={`collection__item${got ? '' : ' collection__item--unknown'}`}
            >
              <button
                type="button"
                className="collection__row"
                onClick={() => setOpen(isOpen ? null : item.id)}
                disabled={!got}
                title={got ? item.name : 'まだ拾っていない'}
              >
                <span className="collection__icon">
                  {got ? (
                    <ItemArt icon={item.icon} className="collection__art" />
                  ) : (
                    <span className="collection__q">？</span>
                  )}
                </span>
                <span className="collection__name">{got ? item.name : '？？？'}</span>
              </button>

              {isOpen && got && (
                <div className="collection__detail">
                  <p className="collection__flavor">{item.flavor}</p>
                  <dl className="collection__meta">
                    <div>
                      <dt>拾った場所</dt>
                      <dd>{getArea(got.areaId)?.name ?? '不明'}</dd>
                    </div>
                    <div>
                      <dt>拾った時点</dt>
                      <dd>
                        プレイ{formatPlayTime(got.atSeconds).h}時間
                        {formatPlayTime(got.atSeconds).m}分
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {found.size === ITEMS.length && (
        <p className="panel__next">すべての品を集めた。街の隅々まで見て回った証である。</p>
      )}
    </div>
  );
}

/** 拾った直後に出す小さな知らせ */
export function PickupToast({ itemId, areaId }: { itemId: string; areaId: string }) {
  const item = getItem(itemId);
  if (!item) return null;
  return (
    <div className="pickup" role="status">
      <ItemArt icon={item.icon} className="pickup__art" />
      <div className="pickup__body">
        <span className="pickup__head">拾った</span>
        <strong className="pickup__name">{item.name}</strong>
        <span className="pickup__place">{getArea(areaId)?.name}</span>
      </div>
    </div>
  );
}
