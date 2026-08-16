import type { Scenario } from '../../types';
import { COACH_SCENARIOS } from './coach';
import { GATE_SCENARIOS } from './gate';
import { PLAZA_SCENARIOS } from './plaza';
import { INN_SCENARIOS } from './inn';
import { MILL_SCENARIOS } from './mill';
import { CLOCKTOWER_SCENARIOS } from './clocktower';
import { ALLEY_SCENARIOS } from './alley';

/**
 * 会話。エリアごとにファイルを分けてある。
 *
 * 足すときは、そのエリアのファイルに `Scenario` を一つ書き足すだけでよい。
 * 新しいエリアを作ったら、ここに import を一行と、下の並びに一行足す。
 *
 * 誰がその会話を始めるかは `scenes.ts` の `npcs` が持つ。
 * 会話の中で道を分けたいときは、行に `label` を付けて `choices` から飛ばす
 * （書きかたは docs/DEVELOPMENT.md）。
 */
export const SCENARIOS: Scenario[] = [
  ...COACH_SCENARIOS,
  ...GATE_SCENARIOS,
  ...PLAZA_SCENARIOS,
  ...INN_SCENARIOS,
  ...MILL_SCENARIOS,
  ...CLOCKTOWER_SCENARIOS,
  ...ALLEY_SCENARIOS,
];

/** 本筋だけを、物語の順に並べたもの */
export const MAIN_SCENARIOS = SCENARIOS.filter((s) => s.kind === 'main');

/** id からシナリオを取得する */
export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
