import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState, Place, PuzzleSpot, ScreenId } from './types';
import { getScenario } from './data/scenarios';
import { getStreet } from './data/streets';
import { getPuzzle } from './data/puzzles';
import { MainScreen } from './screens/MainScreen';
import { StreetScreen } from './screens/StreetScreen';
import { ScenarioScreen } from './screens/ScenarioScreen';
import { PuzzleScreen } from './screens/PuzzleScreen';
import { MenuScreen } from './screens/MenuScreen';
import { MainMenuScreen } from './screens/MainMenuScreen';
import {
  applyHintUse,
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
  const [screen, setScreen] = useState<ScreenId>('main');
  /** 街並みに戻れるように、いま入っている街並みを覚えておく */
  const [streetId, setStreetId] = useState<string | null>(null);
  /** メインメニュー・メニュー画面を「とじる」で戻る先 */
  const [returnTo, setReturnTo] = useState<ScreenId>('main');
  /** 街並みごとの 立ち位置。会話に入って戻っても そのつづきから 歩けるように覚えておく */
  const streetPos = useRef<Record<string, number>>({});
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [puzzleId, setPuzzleId] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [booting, setBooting] = useState(true);

  // プレイ時間を数える
  useEffect(() => {
    if (booting) return;
    const id = setInterval(() => {
      setState((s) => ({ ...s, playSeconds: s.playSeconds + 1 }));
    }, 1000);
    return () => clearInterval(id);
  }, [booting]);

  /** マップから 街並みへ入る。入りなおしたときは 道の入口から。 */
  const enterPlace = useCallback((place: Place) => {
    setState((s) => ({ ...s, placeId: place.id }));
    delete streetPos.current[place.streetId];
    setStreetId(place.streetId);
    setScreen('street');
  }, []);

  /** 街並みで 人に話しかけた */
  const talkTo = useCallback((id: string) => {
    setScenarioId(id);
    setScreen('scenario');
  }, []);

  /** 会話を読み終えた／やめた。どちらも街並みへ戻る。 */
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
      setScreen(streetId ? 'street' : 'main');
    },
    [scenarioId, state.clearedScenarios, streetId],
  );

  /** マップの時計を押した */
  const openPuzzle = useCallback((spot: PuzzleSpot) => {
    setState((s) => applyPuzzleFound(s, spot.puzzleId));
    setPuzzleId(spot.puzzleId);
    setScreen('puzzle');
  }, []);

  /** メニュー画面・メインメニューを開く（戻り先を覚えておく） */
  const openOverlayScreen = useCallback(
    (next: 'menu' | 'mainMenu') => {
      setReturnTo((prev) =>
        screen === 'menu' || screen === 'mainMenu' ? prev : screen,
      );
      setScreen(next);
    },
    [screen],
  );

  const backFromOverlay = useCallback(() => {
    setScreen(returnTo === 'menu' || returnTo === 'mainMenu' ? 'main' : returnTo);
  }, [returnTo]);

  const scenario = scenarioId ? getScenario(scenarioId) : null;
  const street = streetId ? getStreet(streetId) : null;
  const puzzle = puzzleId ? getPuzzle(puzzleId) : null;

  return (
    <div className="app">
      <div className="device">
        {screen === 'main' && (
          <MainScreen
            state={state}
            onEnterPlace={enterPlace}
            onOpenPuzzle={openPuzzle}
            onOpenMenu={() => openOverlayScreen('menu')}
            onOpenMainMenu={() => openOverlayScreen('mainMenu')}
          />
        )}

        {screen === 'street' && street && (
          <StreetScreen
            key={street.id}
            street={street}
            state={state}
            initialX={streetPos.current[street.id] ?? street.startX}
            onMove={(x) => {
              streetPos.current[street.id] = x;
            }}
            onTalk={talkTo}
            onBackToMap={() => {
              setStreetId(null);
              setScreen('main');
            }}
            onOpenMenu={() => openOverlayScreen('menu')}
            onOpenMainMenu={() => openOverlayScreen('mainMenu')}
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
              setScreen('main');
            }}
          />
        )}

        {screen === 'menu' && (
          <MenuScreen
            state={state}
            onBack={backFromOverlay}
            onOpenMainMenu={() => openOverlayScreen('mainMenu')}
          />
        )}

        {screen === 'mainMenu' && (
          <MainMenuScreen
            state={state}
            onChangeMemo={(memo) => setState((s) => ({ ...s, memo }))}
            onClose={backFromOverlay}
            onOpenMenu={() => openOverlayScreen('menu')}
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
        <p className="result__head">話を 聞いた</p>
        <h2 className="result__title">{result.title}</h2>
        <ul className="result__rewards">
          <li>
            <span>ひらめきコイン</span>
            <strong>+{result.coin} まい</strong>
          </li>
          {result.note && (
            <li>
              <span>ちょうさメモ</span>
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
