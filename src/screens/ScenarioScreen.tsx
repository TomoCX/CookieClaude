import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Scenario } from '../types';
import { getCharacter } from '../data/characters';
import { Background } from '../components/Background';
import { CharacterSprite } from '../components/CharacterSprite';
import { EffectLayer } from '../components/EffectLayer';
import { playSe } from '../audio/audio';

/** 1 文字あたりの表示間隔（ミリ秒） */
const TYPE_SPEED_MS = 42;

interface Props {
  scenario: Scenario;
  /** 会話をすべて読み終えたとき */
  onFinish: () => void;
  /** 途中でやめたとき */
  onQuit: () => void;
}

/** シナリオ会話画面（写真2枚目） */
export function ScenarioScreen({ scenario, onFinish, onQuit }: Props) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const line = scenario.lines[index];
  const speaker = getCharacter(line?.speaker);
  const isNarration = !speaker;
  const done = typed.length === (line?.text.length ?? 0);

  /** この行までに登場した人物を、左右それぞれ 1 人ずつ覚えておく */
  const stage = useMemo(() => {
    let left: string | undefined;
    let right: string | undefined;
    for (let i = 0; i <= index; i++) {
      const id = scenario.lines[i]?.speaker;
      const ch = getCharacter(id);
      if (!ch) continue;
      if (ch.side === 'left') left = ch.id;
      else right = ch.id;
    }
    return { left, right };
  }, [scenario, index]);

  // 行が変わるたびに 1 文字ずつ表示する
  useEffect(() => {
    if (!line) return;
    setTyped('');
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setTyped(line.text.slice(0, i));
      if (i >= line.text.length && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }, TYPE_SPEED_MS);

    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [line]);

  /** タップ: 表示途中なら全部出す。出しきっていたら次の行へ */
  const advance = useCallback(() => {
    if (!line) return;
    if (typed.length < line.text.length) {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      setTyped(line.text);
      return;
    }
    playSe('talk');
    if (index + 1 >= scenario.lines.length) onFinish();
    else setIndex(index + 1);
  }, [line, typed, index, scenario.lines.length, onFinish]);

  // スペース / Enter でも進める
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advance();
      } else if (e.key === 'Escape') {
        onQuit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, onQuit]);

  if (!line) return null;

  const leftChar = getCharacter(stage.left);
  const rightChar = getCharacter(stage.right);

  return (
    <div className="scenario" onClick={advance} role="presentation">
      <Background id={scenario.bg} />
      <EffectLayer slot="scenario.front" />

      <div className="scenario__stage">
        {leftChar && (
          <CharacterSprite
            character={leftChar}
            side="left"
            pose={speaker?.id === leftChar.id ? (line.pose ?? 'normal') : 'normal'}
            active={speaker?.id === leftChar.id}
          />
        )}
        {rightChar && (
          <CharacterSprite
            character={rightChar}
            side="right"
            pose={speaker?.id === rightChar.id ? (line.pose ?? 'normal') : 'normal'}
            active={speaker?.id === rightChar.id}
          />
        )}
      </div>

      {/* 上部の情報 */}
      <div className="scenario__topbar">
        <span className="scenario__chapter">
          {scenario.kind === 'main' ? '本筋' : '立ち話'}・{scenario.title}
        </span>
        <button
          type="button"
          className="scenario__skip"
          onClick={(e) => {
            e.stopPropagation();
            onQuit();
          }}
        >
          スキップ ▶▶
        </button>
      </div>

      {/* 会話ウィンドウ */}
      <div className="scenario__box">
        {speaker && <div className="scenario__name">{speaker.name}</div>}
        <p className={`scenario__text${isNarration ? ' scenario__text--narration' : ''}`}>
          {typed}
          <span className="scenario__caret" />
        </p>
        {line.sub && <p className="scenario__sub">{line.sub}</p>}
        {done && <span className="scenario__next">▼</span>}
      </div>

      {/* 進行状況 */}
      <div className="scenario__progress">
        <div
          className="scenario__progress-bar"
          style={{ width: `${((index + 1) / scenario.lines.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
