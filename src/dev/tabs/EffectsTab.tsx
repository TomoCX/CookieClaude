import { EFFECTS, EFFECT_SLOTS } from '../../effects/registry';
import { isEffectOn, resetEffectOverrides, setEffectOn, subscribeEffects } from '../../effects/runtime';
import { useSyncExternalStore } from 'react';

/** 入り切りが変わるたびに数えなおすための、ごく小さな目印 */
function useEffectRevision(): number {
  return useSyncExternalStore(
    subscribeEffects,
    () => EFFECTS.filter((e) => isEffectOn(e.id)).length,
    () => 0,
  );
}

/**
 * エフェクト。
 * どの場所に何が差さっているかを見て、一つずつ入り切りして確かめる欄。
 * ここでの入り切りは、その場かぎり（読みこみなおすと既定に戻る）。
 */
export function EffectsTab() {
  useEffectRevision();

  return (
    <div className="dev__body">
      <h3 className="dev__head">差しこめる場所</h3>
      <p className="dev__note">
        画面のどこに <code>&lt;EffectLayer slot="..." /&gt;</code> を置いてあるか。
        中身は <code>src/effects/registry.ts</code> の <code>slot</code> で決まる。
      </p>

      {EFFECT_SLOTS.map((slot) => {
        const here = EFFECTS.filter((e) => e.slot === slot.id);
        return (
          <div key={slot.id} className="dev__slot">
            <h4 className="dev__slot-head">
              {slot.label} <code>{slot.id}</code>
            </h4>
            {here.length === 0 ? (
              <p className="dev__slot-empty">まだ何も差さっていない（ここへ足せる）</p>
            ) : (
              <ul className="dev__list">
                {here.map((e) => {
                  const on = isEffectOn(e.id);
                  return (
                    <li key={e.id} className="dev__row">
                      <span className="dev__row-main">
                        <strong>{e.name}</strong>
                        <code>{e.id}</code>
                      </span>
                      <span className="dev__row-note">{e.note}</span>
                      <button
                        type="button"
                        className={`dev__chip dev__chip--slim${on ? ' dev__chip--on' : ''}`}
                        onClick={() => setEffectOn(e.id, !on)}
                      >
                        {on ? 'オン' : 'オフ'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      <div className="dev__actions">
        <button type="button" className="dev__go" onClick={resetEffectOverrides}>
          既定に戻す
        </button>
      </div>
      <p className="dev__note">
        全体の入り切りと強さは、メインメニューの「設定」から。
        足しかたは「ひな型」の欄にある。
      </p>
    </div>
  );
}
