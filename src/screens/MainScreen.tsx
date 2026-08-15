import { useState } from 'react';
import type { GameState, Place } from '../types';
import { PLACES, getPlace } from '../data/places';
import { getScenario } from '../data/scenarios';
import { TownMap } from '../components/TownMap';

interface Props {
  state: GameState;
  /** 場所を選んだとき（会話画面へ） */
  onEnterPlace: (place: Place) => void;
  /** 右上ボタン: メニュー画面へ戻る */
  onOpenMenu: () => void;
  /** 右下ボタン: メインメニューへ戻る */
  onOpenMainMenu: () => void;
}

/** メイン画面（写真3枚目の下側）。町のマップを歩いて場所を選ぶ。 */
export function MainScreen({
  state,
  onEnterPlace,
  onOpenMenu,
  onOpenMainMenu,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const here = getPlace(state.placeId);
  const selectedPlace = selected ? getPlace(selected) : null;
  const selectedScenario = selectedPlace
    ? getScenario(selectedPlace.scenarioId)
    : null;
  const cleared =
    selectedScenario != null &&
    state.clearedScenarios.includes(selectedScenario.id);

  /** 次に行くとよい場所（まだ読んでいない、開放済みの場所） */
  const nextPlace = PLACES.find(
    (p) =>
      state.openPlaces.includes(p.id) &&
      !state.clearedScenarios.includes(p.scenarioId),
  );

  const hint = selectedPlace
    ? cleared
      ? `${selectedPlace.name}：もういちど 話を 聞いてみよう`
      : `${selectedPlace.name}へ 行ってみよう`
    : nextPlace
      ? `${nextPlace.name}のことを 調べてみよう`
      : 'すべてのナゾが とけた！ メインメニューで きろくを 見てみよう';

  return (
    <div className="main">
      {/* 上部バー：とけたナゾの数と げんざいち */}
      <div className="main__topbar">
        <div className="main__counter">
          <span className="main__counter-label">とけたナゾ</span>
          <span className="main__counter-value">
            {String(state.solved).padStart(3, '0')}
          </span>
        </div>
        <div className="main__place">
          <span className="main__place-ruby">{here?.ruby}</span>
          <span className="main__place-name">{here?.name}</span>
        </div>
      </div>

      {/* マップ本体 */}
      <TownMap
        places={PLACES}
        openPlaces={state.openPlaces}
        clearedScenarios={state.clearedScenarios}
        currentPlaceId={state.placeId}
        selectedId={selected}
        onSelect={setSelected}
      />

      {/* 右上：メニュー画面へ戻るボタン */}
      <button
        type="button"
        className="main__corner main__corner--tr"
        onClick={onOpenMenu}
        title="メニュー画面へ"
      >
        <span className="main__corner-icon" aria-hidden="true">
          ⚙
        </span>
        <span className="main__corner-label">メニュー</span>
      </button>

      {/* 右下：メインメニューへ戻るボタン */}
      <button
        type="button"
        className="main__corner main__corner--br"
        onClick={onOpenMainMenu}
        title="メインメニューへ"
      >
        <span className="main__corner-icon" aria-hidden="true">
          🧳
        </span>
        <span className="main__corner-label">メインメニュー</span>
      </button>

      {/* 下部：ヒント / 移動ボタン */}
      <div className="main__hintbar">
        <p className="main__hint">{hint}</p>
        {selectedPlace && (
          <button
            type="button"
            className="main__go"
            onClick={() => {
              setSelected(null);
              onEnterPlace(selectedPlace);
            }}
          >
            {cleared ? 'もういちど 見る' : 'ここへ 行く'} ▶
          </button>
        )}
      </div>
    </div>
  );
}
