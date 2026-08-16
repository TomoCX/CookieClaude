import type { Achievement, GameState } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';
import { flagOn } from '../data/flags';

/**
 * 実績の解放。
 *
 * 条件を満たしているかは、そのつどフラグから引き直す（`GameState` には
 * 「もう知らせを出した」という覚えだけを残す）。二重に持たないので、
 * あとから条件を書きかえても、状態が食いちがったままにならない。
 */

/** その実績の条件（フラグ）がすべて立っているか */
export function isEarned(achievement: Achievement, state: GameState): boolean {
  return achievement.flags.every((id) => flagOn(id, state));
}

/** 条件を満たしている実績をすべて返す（知らせを出したかは問わない） */
export function earnedAchievements(state: GameState): Achievement[] {
  return ACHIEVEMENTS.filter((a) => isEarned(a, state));
}

/** 条件を満たしていて、まだ知らせを出していないもの */
export function pendingAchievements(state: GameState): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id) && isEarned(a, state));
}

/** 解放を記録した新しい状態を返す */
export function applyAchievements(state: GameState, gained: Achievement[]): GameState {
  if (gained.length === 0) return state;
  return { ...state, achievements: [...state.achievements, ...gained.map((a) => a.id)] };
}

/**
 * 遊びはじめの取りこぼしをならす。
 *
 * 実績を作る前のセーブや、開発者ツールで状態を流しこんだ直後は、
 * すでに条件を満たした実績がまとめて残っている。そのまま始めると
 * 知らせが何枚も出てしまうので、始める時点のぶんは静かに記録しておく。
 */
export function seedAchievements(state: GameState): GameState {
  return applyAchievements(state, pendingAchievements(state));
}
