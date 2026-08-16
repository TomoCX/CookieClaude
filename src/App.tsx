import { useCallback, useEffect, useRef, useState } from 'react';
import type { Area, GameState, ScreenId, Settings } from './types';
import { getScenario } from './data/scenarios';
import { getScene, sceneStartX } from './data/scenes';
import { getArea } from './data/areas';
import { getPuzzle } from './data/puzzles';
import { MapOverlay } from './screens/MapOverlay';
import { SceneScreen } from './screens/SceneScreen';
import { ScenarioScreen } from './screens/ScenarioScreen';
import { PuzzleScreen } from './screens/PuzzleScreen';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { BootOverlay } from './screens/BootOverlay';
import { ResultOverlay, type Result } from './screens/ResultOverlay';
import { PickupToast } from './screens/panels/CollectionPanel';
import { Hud } from './components/Hud';
import { DevTools } from './dev/DevTools';
import { toggleDevMode, useDevFlags } from './dev/devFlags';
import { loadSettings, saveSettings } from './state/settings';
import { playSe, setBgm, setSe, unlock } from './audio/audio';
import { setEffectSettings } from './effects/runtime';
import {
  applyHintUse,
  applyPickup,
  applyPuzzleFound,
  applyPuzzleMiss,
  applyPuzzleSolved,
  applyScenarioClear,
  createInitialState,
  loadGame,
} from './state/gameState';

/** 拾った知らせを出しておく長さ（ミリ秒） */
const PICKUP_TOAST_MS = 2400;

/**
 * 画面のルーティングと進行状況。
 *
 * 遊びの土台はシーン画面で、地図とメインメニューはその上にかぶせて出す。
 * 会話とナゾ解きだけはシーンと入れ替わる。
 */
export function App() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [screen, setScreen] = useState<ScreenId>('scene');
  const [sceneId, setSceneId] = useState<string>(() => createInitialState().sceneId);
  /** 地図を開いているか */
  const [mapOpen, setMapOpen] = useState(false);
  /** メインメニューを「閉じる」で戻る先 */
  const [returnTo, setReturnTo] = useState<ScreenId>('scene');
  /** シーンごとのカメラ位置。会話に入って戻ってもその続きから見わたせるように覚えておく */
  const scenePos = useRef<Record<string, number>>({});
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [puzzleId, setPuzzleId] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  /** アイテムを拾った直後に出す知らせ */
  const [pickup, setPickup] = useState<{ itemId: string; areaId: string } | null>(null);
  const [booting, setBooting] = useState(true);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const devFlags = useDevFlags();

  // 設定を覚えておき、音とエフェクトにもすぐ反映する
  useEffect(() => {
    saveSettings(settings);
    setBgm(settings.bgmOn, settings.bgmVolume);
    setSe(settings.seOn, settings.seVolume);
    setEffectSettings(settings.effectsOn, settings.effectStrength);
  }, [settings]);

  // 拾った知らせは、しばらくしたら消す
  useEffect(() => {
    if (!pickup) return;
    const id = setTimeout(() => setPickup(null), PICKUP_TOAST_MS);
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

  /**
   * シーンを移る。地図からの移動と、矢印からの移動の両方がここを通る。
   * 行き先が別のエリアなら、現在地のエリアもそこで移る。
   * 入りなおすときは道の入口から見わたす。
   */
  const goToScene = useCallback((id: string) => {
    const scene = getScene(id);
    if (!scene) return;
    setState((s) => ({ ...s, areaId: scene.areaId }));
    delete scenePos.current[id];
    setSceneId(id);
    setMapOpen(false);
    setScreen('scene');
  }, []);

  /** 地図から別のエリアへ移る（そのエリアの入口シーンに立つ） */
  const enterArea = useCallback((area: Area) => goToScene(area.entrySceneId), [goToScene]);

  /** シーンで人に話しかけた */
  const talkTo = useCallback((id: string) => {
    setScenarioId(id);
    setScreen('scenario');
  }, []);

  /** 会話を読み終えた／中断した。どちらもシーンへ戻る。 */
  const endScenario = useCallback(
    (finished: boolean) => {
      const sc = scenarioId ? getScenario(scenarioId) : null;
      if (finished && sc) {
        const first = !state.clearedScenarios.includes(sc.id);
        setState((s) => applyScenarioClear(s, sc));
        // 手に入れたものの一覧は、初めて読んだときだけ出す
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
      setScreen('scene');
    },
    [scenarioId, state.clearedScenarios],
  );

  /** キラキラを押してアイテムを拾った */
  const pickUpItem = useCallback(
    (itemId: string) => {
      const areaId = state.areaId;
      setState((s) => applyPickup(s, itemId, areaId));
      setPickup({ itemId, areaId });
    },
    [state.areaId],
  );

  /** シーンでナゾを押した */
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
    setScreen(returnTo === 'mainMenu' ? 'scene' : returnTo);
  }, [returnTo]);

  /** その進行状況で遊びはじめる。「最初から」「続きから」「復元」で共通。 */
  const startWith = useCallback((next: GameState) => {
    setState(next);
    setSceneId(next.sceneId);
    scenePos.current = { [next.sceneId]: next.sceneX };
    setScenarioId(null);
    setPuzzleId(null);
    setMapOpen(false);
    setScreen('scene');
  }, []);

  /** セーブ用に、いまいるシーンとカメラ位置も含めた状態を組み立てる */
  const buildSave = useCallback(
    (): GameState => ({
      ...state,
      sceneId,
      sceneX: scenePos.current[sceneId] ?? sceneStartX(sceneId),
    }),
    [state, sceneId],
  );

  const scenario = scenarioId ? getScenario(scenarioId) : null;
  const scene = getScene(sceneId);
  const puzzle = puzzleId ? getPuzzle(puzzleId) : null;
  const area = getArea(state.areaId);

  /** 地図とメインメニューのアイコンを出す場面か */
  const showHud = !booting && (screen === 'scene' || mapOpen);

  return (
    <div className={`app app--${settings.screenSize}`}>
      <div className="device">
        {/* シーンは常に土台として置いておく（地図はこの上にかぶさる） */}
        {(screen === 'scene' || mapOpen) && scene && (
          <SceneScreen
            key={scene.id}
            scene={scene}
            state={state}
            initialX={scenePos.current[scene.id] ?? sceneStartX(scene.id)}
            onMove={(x) => {
              scenePos.current[scene.id] = x;
            }}
            onTalk={talkTo}
            onOpenPuzzle={openPuzzle}
            onPickup={pickUpItem}
            onGoTo={goToScene}
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
              setScreen('scene');
            }}
          />
        )}

        {screen === 'mainMenu' && (
          <MainMenuScreen
            state={state}
            settings={settings}
            buildSave={buildSave}
            onRestore={startWith}
            onChangeSettings={setSettings}
            onChangeMemo={(memo) => setState((s) => ({ ...s, memo }))}
            devOn={devFlags.on}
            onToggleDev={toggleDevMode}
            onClose={closeMainMenu}
          />
        )}

        {mapOpen && (
          <MapOverlay
            state={state}
            onEnterArea={enterArea}
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
            areaName={mapOpen ? undefined : area?.name}
            sceneName={mapOpen ? undefined : scene?.name}
          />
        )}

        {pickup && <PickupToast itemId={pickup.itemId} areaId={pickup.areaId} />}

        {/* 中身を足すための道具箱。Ctrl + Shift + D で出入りする。 */}
        <DevTools
          api={{
            state,
            setState,
            sceneId,
            goToScene,
            playScenario: talkTo,
            openPuzzle,
          }}
        />

        {result && <ResultOverlay result={result} onClose={() => setResult(null)} />}

        {booting && (
          <BootOverlay
            onNewGame={() => {
              unlock();
              playSe('click');
              startWith(createInitialState());
              setBooting(false);
            }}
            onContinue={() => {
              unlock();
              playSe('click');
              startWith(loadGame() ?? createInitialState());
              setBooting(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
