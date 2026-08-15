import { useState } from 'react';
import type { GameState, Place, PuzzleSpot } from '../types';
import { PLACES, getPlace } from '../data/places';
import { TownMap } from '../components/TownMap';
import { solvedCount, visibleSpots } from '../state/gameState';

interface Props {
  state: GameState;
  /** 場所を選んだとき（街並みへ） */
  onEnterPlace: (place: Place) => void;
  /** 時計を押したとき（ナゾ解きへ） */
  onOpenPuzzle: (spot: PuzzleSpot) => void;
  /** 右上ボタン: メニュー画面へ戻る */
  onOpenMenu: () => void;
  /** 右下ボタン: メインメニューへ戻る */
  onOpenMainMenu: () => void;
}

/** メイン画面（写真3枚目の下側）。町のマップから 街並みや ナゾへ 入っていく。 */
export function MainScreen({
  state,
  onEnterPlace,
  onOpenPuzzle,
  onOpenMenu,
  onOpenMainMenu,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const here = getPlace(state.placeId);
  const selectedPlace = selected ? getPlace(selected) : null;
  const visited =
    selectedPlace != null &&
    state.clearedScenarios.includes(selectedPlace.mainScenarioId);

  /** 次に行くとよい場所（まだ本筋を読んでいない、開放済みの場所） */
  const nextPlace = PLACES.find(
    (p) =>
      state.openPlaces.includes(p.id) &&
      !state.clearedScenarios.includes(p.mainScenarioId),
  );

  const hint = selectedPlace
    ? visited
      ? `${selectedPlace.name}：もういちど 町の人に 会ってみよう`
      : `${selectedPlace.name}へ 行ってみよう`
    : nextPlace
      ? `${nextPlace.name}のことを 調べてみよう`
      : 'ものがたりは 終わった。のこりの ナゾを といてみよう';

  return (
    <div className="main">
      {/* 上部バー：とけたナゾの数と げんざいち */}
      <div className="main__topbar">
        <div className="main__counter">
          <span className="main__counter-label">とけたナゾ</span>
          <span className="main__counter-value">
            {String(solvedCount(state)).padStart(3, '0')}
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
        spots={visibleSpots(state)}
        solvedPuzzles={state.solvedPuzzles}
        onOpenPuzzle={onOpenPuzzle}
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
            {visited ? 'もういちど 行く' : 'ここへ 行く'} ▶
          </button>
        )}
      </div>
    </div>
  );
}
