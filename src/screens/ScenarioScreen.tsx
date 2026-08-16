import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DialogueChoice, Reward, Scenario } from '../types';
import { getCharacter } from '../data/characters';
import { Background } from '../components/Background';
import { CharacterSprite } from '../components/CharacterSprite';
import { EffectLayer } from '../components/EffectLayer';
import { text as tr, useText } from '../i18n/text';
import { UI } from '../i18n/ui';
import { playSe } from '../audio/audio';

/** 1 文字あたりの表示間隔（ミリ秒） */
const TYPE_SPEED_MS = 42;

interface Props {
  scenario: Scenario;
  /** 会話をすべて読み終えたとき。通った分かれ道もいっしょに渡す。 */
  onFinish: (picked: DialogueChoice[]) => void;
  /** 途中でやめたとき */
  onQuit: () => void;
}

/**
 * シナリオ会話画面。
 *
 * ふつうは `lines` を上から順に読む。行が `choices` を持っていると、
 * そこで止まって選択肢を出し、選んだ先（`label` の付いた行）へ飛ぶ。
 * `goto` で合流でき、`end` でその場で終われる。
 */
export function ScenarioScreen({ scenario, onFinish, onQuit }: Props) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  /** 選んだ分かれ道。読み終えたときにまとめて親へ渡す。 */
  const [picked, setPicked] = useState<DialogueChoice[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = useText();

  /** label から行番号を引く（分かれ道の飛び先） */
  const labels = useMemo(() => {
    const map = new Map<string, number>();
    scenario.lines.forEach((l, i) => {
      if (l.label) map.set(l.label, i);
    });
    return map;
  }, [scenario]);

  const line = scenario.lines[index];
  const speaker = getCharacter(line?.speaker);
  const isNarration = !speaker;
  const body = tr(line?.text);
  const done = typed.length === body.length;
  /** 出しきったところで選択肢を出す */
  const choices = done ? line?.choices : undefined;

  /** この行までに登場した人物を、左右それぞれ 1 人ずつ覚えておく */
  const stage = useMemo(() => {
    let left: string | undefined;
    let right: string | undefined;
    for (let i = 0; i <= index; i++) {
      const ch = getCharacter(scenario.lines[i]?.speaker);
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
    const full = tr(line.text);
    timer.current = setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }, TYPE_SPEED_MS);

    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
    // 言語を変えると本文も変わるので、訳しなおした文字列も見張る
  }, [line, body]);

  /** 次にどの行へ進むかを決める */
  const goNext = useCallback(
    (from: number) => {
      const cur = scenario.lines[from];
      if (!cur) return;
      if (cur.end) {
        onFinish(picked);
        return;
      }
      if (cur.goto) {
        const to = labels.get(cur.goto);
        if (to != null) {
          setIndex(to);
          return;
        }
      }
      if (from + 1 >= scenario.lines.length) onFinish(picked);
      else setIndex(from + 1);
    },
    [scenario.lines, labels, picked, onFinish],
  );

  /** タップ: 表示途中なら全部出す。出しきっていたら次の行へ */
  const advance = useCallback(() => {
    if (!line) return;
    if (typed.length < body.length) {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      setTyped(body);
      return;
    }
    // 選択肢が出ているあいだは、選ぶまで進まない
    if (line.choices?.length) return;
    playSe('talk');
    goNext(index);
  }, [line, typed, body, index, goNext]);

  /** 分かれ道を選んだ */
  const choose = (choice: DialogueChoice) => {
    playSe('click');
    const next = [...picked, choice];
    setPicked(next);
    const to = labels.get(choice.to);
    if (to != null) setIndex(to);
    else onFinish(next);
  };

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
          {t(scenario.kind === 'main' ? UI.chapterMain : UI.chapterFlavor)}・{t(scenario.title)}
        </span>
        <button
          type="button"
          className="scenario__skip"
          onClick={(e) => {
            e.stopPropagation();
            onQuit();
          }}
        >
          {t(UI.skip)}
        </button>
      </div>

      {/* 会話ウィンドウ */}
      <div className="scenario__box">
        {speaker && <div className="scenario__name">{t(speaker.name)}</div>}
        <p className={`scenario__text${isNarration ? ' scenario__text--narration' : ''}`}>
          {typed}
          <span className="scenario__caret" />
        </p>
        {done && !choices && <span className="scenario__next">▼</span>}
      </div>

      {/* 分かれ道。選ぶまで先へ進まない。 */}
      {choices && choices.length > 0 && (
        <div
          className="scenario__choices"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <p className="scenario__prompt">{t(UI.choosePrompt)}</p>
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className="scenario__choice"
              onClick={() => choose(c)}
            >
              {t(c.label)}
            </button>
          ))}
        </div>
      )}

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

/** 選んだ分かれ道でもらえるものを、ひとまとめにする */
export function mergeRewards(picked: DialogueChoice[]): Reward {
  const merged: Reward = { coin: 0, unlocks: [], items: [] };
  for (const c of picked) {
    const g = c.gives;
    if (!g) continue;
    merged.coin = (merged.coin ?? 0) + (g.coin ?? 0);
    if (g.note) merged.note = g.note;
    if (g.charm) merged.charm = g.charm;
    merged.unlocks = [...(merged.unlocks ?? []), ...(g.unlocks ?? [])];
    merged.items = [...(merged.items ?? []), ...(g.items ?? [])];
  }
  return merged;
}
