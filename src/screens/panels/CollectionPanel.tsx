import { useState } from 'react';
import type { GameState } from '../../types';
import { ITEMS, getItem } from '../../data/items';
import { getArea } from '../../data/areas';
import { formatPlayTime } from '../../state/gameState';
import { ItemArt } from '../../components/ItemIcon';
import { ProgressBar } from '../../components/ProgressBar';
import { DetailView } from '../../components/DetailView';
import { useText } from '../../i18n/text';
import { UI } from '../../i18n/ui';

interface Props {
  state: GameState;
}

/** 拾った品の一覧。選ぶと画面いっぱいの説明にかわる。 */
export function CollectionPanel({ state }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const t = useText();

  const found = new Map(state.collected.map((c) => [c.itemId, c]));
  const percent = Math.round((found.size / ITEMS.length) * 100);

  const shown = open ? ITEMS.find((i) => i.id === open) : undefined;
  const got = shown ? found.get(shown.id) : undefined;

  // 一件を選んでいるあいだは、一覧のかわりにその説明だけを出す
  if (shown && got) {
    const when = formatPlayTime(got.atSeconds);
    return (
      <DetailView
        eyebrow={t(UI.pickedUp)}
        title={t(shown.name)}
        art={<ItemArt icon={shown.icon} className="detail__icon" />}
        onBack={() => setOpen(null)}
      >
        <p className="detail__lead">{t(shown.flavor)}</p>
        <dl className="detail__meta">
          <div>
            <dt>{t(UI.pickedWhere)}</dt>
            <dd>{t(getArea(got.areaId)?.name) || t(UI.none)}</dd>
          </div>
          <div>
            <dt>{t(UI.pickedWhen)}</dt>
            <dd>
              {when.h} {t(UI.hours)} {when.m} {t(UI.minutes)}
            </dd>
          </div>
        </dl>
      </DetailView>
    );
  }

  return (
    <div className="panel__body">
      <h2 className="panel__title">{t(UI.collection)}</h2>
      <p className="panel__lead">{t(UI.collectionLead)}</p>

      <ProgressBar
        label={t(UI.pickedUp)}
        note={`${found.size} / ${ITEMS.length}（${percent}%）`}
        percent={percent}
      />

      <ul className="collection">
        {ITEMS.map((item) => {
          const has = found.get(item.id);
          return (
            <li
              key={item.id}
              className={`collection__item${has ? '' : ' collection__item--unknown'}`}
            >
              <button
                type="button"
                className="collection__row"
                onClick={() => setOpen(item.id)}
                disabled={!has}
                title={has ? t(item.name) : t(UI.notPickedUp)}
              >
                <span className="collection__icon">
                  {has ? (
                    <ItemArt icon={item.icon} className="collection__art" />
                  ) : (
                    <span className="collection__q">{t(UI.unknownShort)}</span>
                  )}
                </span>
                <span className="collection__name">
                  {has ? t(item.name) : t(UI.unknown)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {found.size === ITEMS.length && (
        <p className="panel__next">{t(UI.collectionAll)}</p>
      )}
    </div>
  );
}

/** 拾った直後に出す小さな知らせ */
export function PickupToast({ itemId, areaId }: { itemId: string; areaId: string }) {
  const t = useText();
  const item = getItem(itemId);
  if (!item) return null;
  return (
    <div className="pickup" role="status">
      <ItemArt icon={item.icon} className="pickup__art" />
      <div className="pickup__body">
        <span className="pickup__head">{t(UI.pickedUp)}</span>
        <strong className="pickup__name">{t(item.name)}</strong>
        <span className="pickup__place">{t(getArea(areaId)?.name)}</span>
      </div>
    </div>
  );
}
