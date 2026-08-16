import { useState } from 'react';
import type { Area, GameState } from '../types';
import { AREAS, getArea } from '../data/areas';
import { scenesOfArea } from '../data/scenes';
import { TownMap } from '../components/TownMap';
import { solvedCount } from '../state/gameState';
import { playSe } from '../audio/audio';

interface Props {
  state: GameState;
  /** エリアを選んだとき（その入口シーンへ移る） */
  onEnterArea: (area: Area) => void;
  /** 地図を閉じる */
  onClose: () => void;
}

/**
 * 地図。左上の「地図」アイコンから開く、エリアを移すための画面。
 * 選んだエリアの入口シーンへ飛ぶ。かつてはこれが土台の画面だったが、
 * いまはシーンの上にかぶせて出す。
 */
export function MapOverlay({ state, onEnterArea, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const here = getArea(state.areaId);
  const selectedArea = selected ? getArea(selected) : null;
  const visited =
    selectedArea != null && state.clearedScenarios.includes(selectedArea.mainScenarioId);
  const isHere = selectedArea?.id === state.areaId;
  /** そのエリアにいくつシーンがあるか（複数あるなら地図にも出す） */
  const sceneCount = selectedArea ? scenesOfArea(selectedArea.id).length : 0;

  /** 次に行くとよいエリア（まだ本筋を読んでいない、開放済みのエリア） */
  const nextArea = AREAS.find(
    (a) =>
      state.openAreas.includes(a.id) && !state.clearedScenarios.includes(a.mainScenarioId),
  );

  const hint = selectedArea
    ? isHere
      ? `${selectedArea.name}：いま滞在中のエリア`
      : visited
        ? `${selectedArea.name}：再訪して話を聞ける`
        : `${selectedArea.name}へ向かおう`
    : nextArea
      ? `${nextArea.name}を調べよう`
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
        areas={AREAS}
        openAreas={state.openAreas}
        clearedScenarios={state.clearedScenarios}
        currentAreaId={state.areaId}
        selectedId={selected}
        onSelect={setSelected}
      />

      <div className="mapview__hintbar">
        <p className="mapview__hint">
          <span className="mapview__here">現在地：{here?.name}</span>
          {hint}
          {sceneCount > 1 && (
            <span className="mapview__scenes">シーン {sceneCount} 面</span>
          )}
        </p>
        {selectedArea && !isHere && (
          <button
            type="button"
            className="mapview__go"
            onClick={() => {
              setSelected(null);
              onEnterArea(selectedArea);
            }}
          >
            {visited ? '再訪する' : 'ここへ行く'} ▶
          </button>
        )}
      </div>
    </div>
  );
}
