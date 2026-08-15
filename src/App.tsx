import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState, Place, ScreenId, Settings } from './types';
import { getScenario } from './data/scenarios';
import { getStreet } from './data/streets';
import { getPuzzle } from './data/puzzles';
import { MainScreen } from './screens/MainScreen';
import { StreetScreen } from './screens/StreetScreen';
import { ScenarioScreen } from './screens/ScenarioScreen';
import { PuzzleScreen } from './screens/PuzzleScreen';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { loadSettings, saveSettings } from './state/settings';
import { playSe, setBgm, setSe, unlock } from './audio/audio';
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
  /** メインメニュー・メニュー画面を「閉じる」で戻る先 */
  const [returnTo, setReturnTo] = useState<ScreenId>('main');
  /** 街並みごとの立ち位置。会話に入って戻ってもその続きから歩けるように覚えておく */
  const streetPos = useRef<Record<string, number>>({});
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [puzzleId, setPuzzleId] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [booting, setBooting] = useState(true);
  const [settings, setSettings] = useState<Settings>(loadSettings);

  // 設定を覚えておき、音にもすぐ反映する
  useEffect(() => {
    saveSettings(settings);
    setBgm(settings.bgmOn, settings.bgmVolume);
    setSe(settings.seOn, settings.seVolume);
  }, [settings]);

  // プレイ時間を数える
  useEffect(() => {
    if (booting) return;
    const id = setInterval(() => {
      setState((s) => ({ ...s, playSeconds: s.playSeconds + 1 }));
    }, 1000);
    return () => clearInterval(id);
  }, [booting]);

  /** マップから街並みへ入る。入りなおしたときは道の入口から。 */
  const enterPlace = useCallback((place: Place) => {
    setState((s) => ({ ...s, placeId: place.id }));
    delete streetPos.current[place.streetId];
    setStreetId(place.streetId);
    setScreen('street');
  }, []);

  /** 街並みで人に話しかけた */
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

  /** 街並みでナゾを押した */
  const openPuzzle = useCallback((id: string) => {
    setState((s) => applyPuzzleFound(s, id));
    setPuzzleId(id);
    setScreen('puzzle');
  }, []);

  /** メインメニューを開く（戻り先を覚えておく） */
  const openOverlayScreen = useCallback(
    (next: 'mainMenu') => {
      setReturnTo((prev) => (screen === 'mainMenu' ? prev : screen));
      setScreen(next);
    },
    [screen],
  );

  const backFromOverlay = useCallback(() => {
    setScreen(returnTo === 'mainMenu' ? 'main' : returnTo);
  }, [returnTo]);

  const scenario = scenarioId ? getScenario(scenarioId) : null;
  const street = streetId ? getStreet(streetId) : null;
  const puzzle = puzzleId ? getPuzzle(puzzleId) : null;

  return (
    <div className={`app app--${settings.screenSize}`}>
      <div className="device">
        {screen === 'main' && (
          <MainScreen
            state={state}
            onEnterPlace={enterPlace}
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
            onOpenPuzzle={openPuzzle}
            onBackToMap={() => {
              setStreetId(null);
              setScreen('main');
            }}
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
              setScreen(streetId ? 'street' : 'main');
            }}
          />
        )}

        {screen === 'mainMenu' && (
          <MainMenuScreen
            state={state}
            settings={settings}
            onChangeSettings={setSettings}
            onChangeMemo={(memo) => setState((s) => ({ ...s, memo }))}
            onClose={backFromOverlay}
          />
        )}

        {result && (
          <ResultOverlay result={result} onClose={() => setResult(null)} />
        )}

        {booting && (
          <BootOverlay
            onNewGame={() => {
              unlock();
              playSe('click');
              setState(createInitialState());
              setBooting(false);
            }}
            onContinue={() => {
              unlock();
              playSe('click');
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
          町の時計が十三回鳴る夜、町の宝が消える――
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
        {!canContinue && (
          <p className="boot__note">※ セーブデータはまだありません</p>
        )}
      </div>
    </div>
  );
}
