import { useCallback, useEffect, useState } from 'react';
import type { GameState, Place, ScreenId } from './types';
import { getScenario } from './data/scenarios';
import { MainScreen } from './screens/MainScreen';
import { ScenarioScreen } from './screens/ScenarioScreen';
import { MenuScreen } from './screens/MenuScreen';
import { MainMenuScreen } from './screens/MainMenuScreen';
import {
  applyScenarioClear,
  createInitialState,
  hasSave,
  loadGame,
} from './state/gameState';

/** シナリオを読み終えたときに出す結果表示 */
interface Result {
  title: string;
  picarat: number;
  coin: number;
  unlocked: string[];
}

export function App() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [screen, setScreen] = useState<ScreenId>('main');
  /** メインメニューを「とじる」で戻る先 */
  const [returnTo, setReturnTo] = useState<ScreenId>('main');
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [booting, setBooting] = useState(true);

  // プレイ時間を数える（会話中・探索中のみ）
  useEffect(() => {
    if (booting) return;
    const id = setInterval(() => {
      setState((s) => ({ ...s, playSeconds: s.playSeconds + 1 }));
    }, 1000);
    return () => clearInterval(id);
  }, [booting]);

  const openPlace = useCallback((place: Place) => {
    setState((s) => ({ ...s, placeId: place.id }));
    setScenarioId(place.scenarioId);
    setScreen('scenario');
  }, []);

  const finishScenario = useCallback(() => {
    const sc = scenarioId ? getScenario(scenarioId) : null;
    if (sc) {
      const first = !state.clearedScenarios.includes(sc.id);
      setState((s) => applyScenarioClear(s, sc));
      if (first) {
        setResult({
          title: sc.title,
          picarat: sc.reward.picarat,
          coin: sc.reward.coin,
          unlocked: sc.unlocks ?? [],
        });
      }
    }
    setScenarioId(null);
    setScreen('main');
  }, [scenarioId, state.clearedScenarios]);

  const quitScenario = useCallback(() => {
    setScenarioId(null);
    setScreen('main');
  }, []);

  /** メインメニューを開く（戻り先を覚えておく） */
  const openMainMenu = useCallback(() => {
    setReturnTo((prev) => (screen === 'mainMenu' ? prev : screen));
    setScreen('mainMenu');
  }, [screen]);

  const scenario = scenarioId ? getScenario(scenarioId) : null;

  return (
    <div className="app">
      <div className="device">
        {screen === 'main' && (
          <MainScreen
            state={state}
            onEnterPlace={openPlace}
            onOpenMenu={() => setScreen('menu')}
            onOpenMainMenu={openMainMenu}
          />
        )}

        {screen === 'scenario' && scenario && (
          <ScenarioScreen
            scenario={scenario}
            onFinish={finishScenario}
            onQuit={quitScenario}
          />
        )}

        {screen === 'menu' && (
          <MenuScreen
            state={state}
            onBack={() => setScreen('main')}
            onOpenMainMenu={openMainMenu}
          />
        )}

        {screen === 'mainMenu' && (
          <MainMenuScreen
            state={state}
            onChangeMemo={(memo) => setState((s) => ({ ...s, memo }))}
            onClose={() => setScreen(returnTo === 'mainMenu' ? 'main' : returnTo)}
            onOpenMenu={() => setScreen('menu')}
          />
        )}

        {result && (
          <ResultOverlay result={result} onClose={() => setResult(null)} />
        )}

        {booting && (
          <BootOverlay
            onNewGame={() => {
              setState(createInitialState());
              setBooting(false);
            }}
            onContinue={() => {
              const saved = loadGame();
              if (saved) setState(saved);
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
        <p className="result__head">ナゾが とけた！</p>
        <h2 className="result__title">{result.title}</h2>
        <ul className="result__rewards">
          <li>
            <span>ひらめきしすう</span>
            <strong>+{result.picarat} ピカラット</strong>
          </li>
          <li>
            <span>ひらめきコイン</span>
            <strong>+{result.coin} まい</strong>
          </li>
        </ul>
        {result.unlocked.length > 0 && (
          <p className="result__unlock">あたらしい 行き先が ふえた！</p>
        )}
        <button type="button" className="result__ok" onClick={onClose}>
          つづける
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
          謎解き事件簿
        </h1>
        <p className="boot__lead">
          まちの時計が 十三回 鳴る夜、まちの宝が 消える――
        </p>
        <div className="boot__buttons">
          <button type="button" className="boot__btn" onClick={onNewGame}>
            はじめから
          </button>
          <button
            type="button"
            className="boot__btn boot__btn--sub"
            onClick={onContinue}
            disabled={!canContinue}
          >
            つづきから
          </button>
        </div>
        {!canContinue && (
          <p className="boot__note">※ セーブデータは まだ ありません</p>
        )}
      </div>
    </div>
  );
}
