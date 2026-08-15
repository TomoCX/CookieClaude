import { useState } from 'react';
import type { GameState, Place } from '../types';
import { PLACES, getPlace } from '../data/places';
import { TownMap } from '../components/TownMap';
import { solvedCount } from '../state/gameState';
import { playSe } from '../audio/audio';

interface Props {
  state: GameState;
  /** 場所を選んだとき（その街並みへ移る） */
  onEnterPlace: (place: Place) => void;
  /** 地図を閉じる */
  onClose: () => void;
}

/**
 * 地図。左上の「地図」アイコンから開く、地点を移すための画面。
 * かつてはこれが土台の画面だったが、いまは街並みの上にかぶせて出す。
 */
export function MapOverlay({ state, onEnterPlace, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const here = getPlace(state.placeId);
  const selectedPlace = selected ? getPlace(selected) : null;
  const visited =
    selectedPlace != null &&
    state.clearedScenarios.includes(selectedPlace.mainScenarioId);
  const isHere = selectedPlace?.id === state.placeId;

  /** 次に行くとよい場所（まだ本筋を読んでいない、開放済みの場所） */
  const nextPlace = PLACES.find(
    (p) =>
      state.openPlaces.includes(p.id) &&
      !state.clearedScenarios.includes(p.mainScenarioId),
  );

  const hint = selectedPlace
    ? isHere
      ? `${selectedPlace.name}：いま滞在中の場所`
      : visited
        ? `${selectedPlace.name}：再訪して話を聞ける`
        : `${selectedPlace.name}へ向かおう`
    : nextPlace
      ? `${nextPlace.name}を調べよう`
      : '物語は完結した。町を巡り、残るナゾを解こう';

  return (
    <div className="mapview">
      <div className="mapview__topbar">
        <div className="mapview__counter">
          <span className="mapview__counter-label">解いたナゾ</span>
          <span className="mapview__counter-value">
            {String(solvedCount(state)).padStart(3, '0')}
          </span>
        </div>
        <h1 className="mapview__title">地図</h1>
        <button
          type="button"
          className="iconbtn"
          onClick={() => {
            playSe('click');
            onClose();
          }}
          title="地図を閉じる"
        >
          ✕
        </button>
      </div>

      <TownMap
        places={PLACES}
        openPlaces={state.openPlaces}
        clearedScenarios={state.clearedScenarios}
        currentPlaceId={state.placeId}
        selectedId={selected}
        onSelect={setSelected}
      />

      <div className="mapview__hintbar">
        <p className="mapview__hint">
          <span className="mapview__here">現在地：{here?.name}</span>
          {hint}
        </p>
        {selectedPlace && !isHere && (
          <button
            type="button"
            className="mapview__go"
            onClick={() => {
              setSelected(null);
              onEnterPlace(selectedPlace);
            }}
          >
            {visited ? '再訪する' : 'ここへ行く'} ▶
          </button>
        )}
      </div>
    </div>
  );
}
