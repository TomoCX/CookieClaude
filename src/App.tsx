import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState, Place, ScreenId, Settings } from './types';
import { getScenario } from './data/scenarios';
import { getStreet } from './data/streets';
import { getPlace } from './data/places';
import { getPuzzle } from './data/puzzles';
import { MapOverlay } from './screens/MapOverlay';
import { StreetScreen } from './screens/StreetScreen';
import { ScenarioScreen } from './screens/ScenarioScreen';
import { PuzzleScreen } from './screens/PuzzleScreen';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { Hud } from './components/Hud';
import { PickupToast } from './screens/CollectionPanel';
import { loadSettings, saveSettings } from './state/settings';
import { playSe, setBgm, setSe, unlock } from './audio/audio';
import {
  applyHintUse,
  applyPickup,
  applyPuzzleFound,
  applyPuzzleMiss,
  applyPuzzleSolved,
  applyScenarioClear,
  createInitialState,
  hasSave,
  loadGame,
} from './state/gameState';

/** シナリオを読み終えたときに出す結果表示 */
interface Result {
  title: string;
  coin: number;
  unlocked: boolean;
  note?: string;
  charm?: string;
}

export function App() {
  const [state, setState] = useState<GameState>(createInitialState);
  /** 遊びの土台は街並み。地図・メインメニューはこの上にかぶせて出す。 */
  const [screen, setScreen] = useState<ScreenId>('street');
  const [streetId, setStreetId] = useState<string>(() => createInitialState().streetId);
  /** 地図を開いているか */
  const [mapOpen, setMapOpen] = useState(false);
  /** メインメニューを「閉じる」で戻る先 */
  const [returnTo, setReturnTo] = useState<ScreenId>('street');
  /** 街並みごとのカメラ位置。会話に入って戻ってもその続きから見渡せるように覚えておく */
  const streetPos = useRef<Record<string, number>>({});
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [puzzleId, setPuzzleId] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  /** アイテムを拾った直後に出す知らせ */
  const [pickup, setPickup] = useState<{ itemId: string; placeId: string } | null>(null);
  const [booting, setBooting] = useState(true);
  const [settings, setSettings] = useState<Settings>(loadSettings);

  // 設定を覚えておき、音にもすぐ反映する
  useEffect(() => {
    saveSettings(settings);
    setBgm(settings.bgmOn, settings.bgmVolume);
    setSe(settings.seOn, settings.seVolume);
  }, [settings]);

  // 拾った知らせは 2.4 秒で消す
  useEffect(() => {
    if (!pickup) return;
    const id = setTimeout(() => setPickup(null), 2400);
    return () => clearTimeout(id);
  }, [pickup]);

  // プレイ時間を数える
  useEffect(() => {
    if (booting) return;
    const id = setInterval(() => {
      setState((s) => ({ ...s, playSeconds: s.playSeconds + 1 }));
    }, 1000);
    return () => clearInterval(id);
  }, [booting]);

  /** 街並みを移る。入りなおすときは道の入口から見わたす。 */
  const goToStreet = useCallback((id: string) => {
    const street = getStreet(id);
    if (!street) return;
    setState((s) => ({ ...s, placeId: street.placeId }));
    delete streetPos.current[id];
    setStreetId(id);
    setMapOpen(false);
    setScreen('street');
  }, []);

  /** 地図から別の場所へ移る */
  const enterPlace = useCallback(
    (place: Place) => goToStreet(place.streetId),
    [goToStreet],
  );

  /** 街並みで人に話しかけた */
  const talkTo = useCallback((id: string) => {
    setScenarioId(id);
    setScreen('scenario');
  }, []);

  /** 会話を読み終えた／中断した。どちらも街並みへ戻る。 */
  const endScenario = useCallback(
    (finished: boolean) => {
      const sc = scenarioId ? getScenario(scenarioId) : null;
      if (finished && sc) {
        const first = !state.clearedScenarios.includes(sc.id);
        setState((s) => applyScenarioClear(s, sc));
        if (first) {
          setResult({
            title: sc.title,
            coin: sc.coin,
            unlocked: (sc.unlocks?.length ?? 0) > 0,
            note: sc.note?.title,
            charm: sc.charm?.name,
          });
        }
      }
      setScenarioId(null);
      setScreen('street');
    },
    [scenarioId, state.clearedScenarios],
  );

  /** キラキラを押してアイテムを拾った */
  const pickUpItem = useCallback(
    (itemId: string) => {
      const placeId = state.placeId;
      setState((s) => applyPickup(s, itemId, placeId));
      setPickup({ itemId, placeId });
    },
    [state.placeId],
  );

  /** 街並みでナゾを押した */
  const openPuzzle = useCallback((id: string) => {
    setState((s) => applyPuzzleFound(s, id));
    setPuzzleId(id);
    setScreen('puzzle');
  }, []);

  /** メインメニューを開く（戻り先を覚えておく） */
  const openMainMenu = useCallback(() => {
    playSe('click');
    setMapOpen(false);
    setReturnTo((prev) => (screen === 'mainMenu' ? prev : screen));
    setScreen('mainMenu');
  }, [screen]);

  const closeMainMenu = useCallback(() => {
    setScreen(returnTo === 'mainMenu' ? 'street' : returnTo);
  }, [returnTo]);

  /** バックアップから復元する */
  const restoreFromBackup = useCallback((next: GameState) => {
    setState(next);
    setStreetId(next.streetId);
    streetPos.current = { [next.streetId]: next.streetX };
    setPuzzleId(null);
    setScenarioId(null);
    setMapOpen(false);
  }, []);

  /** セーブ用に、いまいる街並みとカメラ位置も含めた状態を組み立てる */
  const buildSave = useCallback(
    (): GameState => ({
      ...state,
      streetId,
      streetX: streetPos.current[streetId] ?? getStreet(streetId)?.startX ?? 0.06,
    }),
    [state, streetId],
  );

  const scenario = scenarioId ? getScenario(scenarioId) : null;
  const street = getStreet(streetId);
  const puzzle = puzzleId ? getPuzzle(puzzleId) : null;
  const place = getPlace(state.placeId);

  /** 地図とメインメニューのアイコンを出す場面か */
  const showHud = !booting && (screen === 'street' || mapOpen);

  return (
    <div className={`app app--${settings.screenSize}`}>
      <div className="device">
        {/* 街並みは常に土台として置いておく（地図はこの上にかぶさる） */}
        {(screen === 'street' || mapOpen) && street && (
          <StreetScreen
            key={street.id}
            street={street}
            state={state}
            initialX={streetPos.current[street.id] ?? street.startX}
            onMove={(x) => {
              streetPos.current[street.id] = x;
            }}
            onTalk={talkTo}
            onOpenPuzzle={openPuzzle}
            onPickup={pickUpItem}
            onGoTo={goToStreet}
            frozen={mapOpen}
          />
        )}

        {screen === 'scenario' && scenario && (
          <ScenarioScreen
            scenario={scenario}
            onFinish={() => endScenario(true)}
            onQuit={() => endScenario(false)}
          />
        )}

        {screen === 'puzzle' && puzzle && (
          <PuzzleScreen
            puzzle={puzzle}
            state={state}
            onMiss={() => setState((s) => applyPuzzleMiss(s, puzzle.id))}
            onUseHint={() => setState((s) => applyHintUse(s, puzzle))}
            onSolved={() => setState((s) => applyPuzzleSolved(s, puzzle))}
            onQuit={() => {
              setPuzzleId(null);
              setScreen('street');
            }}
          />
        )}

        {screen === 'mainMenu' && (
          <MainMenuScreen
            state={state}
            settings={settings}
            buildSave={buildSave}
            onRestore={restoreFromBackup}
            onChangeSettings={setSettings}
            onChangeMemo={(memo) => setState((s) => ({ ...s, memo }))}
            onClose={closeMainMenu}
          />
        )}

        {mapOpen && (
          <MapOverlay
            state={state}
            onEnterPlace={enterPlace}
            onClose={() => setMapOpen(false)}
          />
        )}

        {showHud && (
          <Hud
            onOpenMap={() => {
              playSe('click');
              setMapOpen((v) => !v);
            }}
            onOpenMenu={openMainMenu}
            placeName={mapOpen ? undefined : place?.name}
          />
        )}

        {pickup && <PickupToast itemId={pickup.itemId} placeId={pickup.placeId} />}

        {result && <ResultOverlay result={result} onClose={() => setResult(null)} />}

        {booting && (
          <BootOverlay
            onNewGame={() => {
              unlock();
              playSe('click');
              const fresh = createInitialState();
              streetPos.current = {};
              setState(fresh);
              setStreetId(fresh.streetId);
              setScreen('street');
              setBooting(false);
            }}
            onContinue={() => {
              unlock();
              playSe('click');
              const saved = loadGame();
              if (saved) {
                setState(saved);
                setStreetId(saved.streetId);
                streetPos.current = { [saved.streetId]: saved.streetX };
              }
              setScreen('street');
              setBooting(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ResultOverlay({
  result,
  onClose,
}: {
  result: Result;
  onClose: () => void;
}) {
  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div className="result" onClick={(e) => e.stopPropagation()}>
        <p className="result__head">聞き込みを終えた</p>
        <h2 className="result__title">{result.title}</h2>
        <ul className="result__rewards">
          <li>
            <span>ひらめきコイン</span>
            <strong>+{result.coin} 枚</strong>
          </li>
          {result.note && (
            <li>
              <span>調査メモ</span>
              <strong>{result.note}</strong>
            </li>
          )}
          {result.charm && (
            <li>
              <span>チャーム</span>
              <strong>{result.charm}</strong>
            </li>
          )}
        </ul>
        {result.unlocked && (
          <p className="result__unlock">新たな行き先が開かれた</p>
        )}
        <button type="button" className="result__ok" onClick={onClose}>
          続ける
        </button>
      </div>
    </div>
  );
}

function BootOverlay({
  onNewGame,
  onContinue,
}: {
  onNewGame: () => void;
  onContinue: () => void;
}) {
  const canContinue = hasSave();

  return (
    <div className="overlay overlay--boot">
      <div className="boot">
        <p className="boot__sub">レイトン風シナリオアドベンチャー</p>
        <h1 className="boot__title">
          クッキーとクロードの
          <br />
          ナゾ解き事件簿
        </h1>
        <p className="boot__lead">
          町の時計が十三回鳴る夜、町の宝が消える——
        </p>
        <div className="boot__buttons">
          <button type="button" className="boot__btn" onClick={onNewGame}>
            最初から
          </button>
          <button
            type="button"
            className="boot__btn boot__btn--sub"
            onClick={onContinue}
            disabled={!canContinue}
          >
            続きから
          </button>
        </div>
        {!canContinue && <p className="boot__note">※ セーブデータはまだない</p>}
      </div>
    </div>
  );
}
