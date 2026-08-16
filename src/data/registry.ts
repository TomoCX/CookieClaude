import { CHARACTERS } from './characters';
import { ITEMS } from './items';
import { PLACES } from './places';
import { PUZZLES } from './puzzles';
import { SCENARIOS } from './scenarios';
import { STREETS } from './streets';
import { CAST, STORY_BEATS } from './story';

/**
 * 中身（場所・街並み・人物・会話・ナゾ・アイテム）のつながりを検査する。
 *
 * データを足すときに id を書きまちがえても、画面が黙って壊れるだけで
 * 原因が分かりにくい。そこで起動時に一度だけ通しで見て、
 * おかしなところをコンソールに並べる。
 *
 * 追加のしかたは README の「中身を足す」を参照。
 */
export function checkContent(): string[] {
  const problems: string[] = [];
  const say = (m: string) => problems.push(m);

  /** 同じ id が二度出てこないか */
  const dup = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) say(`${label}: id が重複している → ${id}`);
      seen.add(id);
    }
  };

  const placeIds = new Set(PLACES.map((p) => p.id));
  const streetIds = new Set(STREETS.map((s) => s.id));
  const scenarioIds = new Set(SCENARIOS.map((s) => s.id));
  const puzzleIds = new Set(PUZZLES.map((p) => p.id));
  const itemIds = new Set(ITEMS.map((i) => i.id));

  dup('場所', PLACES.map((p) => p.id));
  dup('街並み', STREETS.map((s) => s.id));
  dup('会話', SCENARIOS.map((s) => s.id));
  dup('ナゾ', PUZZLES.map((p) => p.id));
  dup('アイテム', ITEMS.map((i) => i.id));
  dup('ナゾ番号', PUZZLES.map((p) => String(p.no)));

  /* ---- 場所と街並みの対応 ---- */
  for (const place of PLACES) {
    if (!streetIds.has(place.streetId)) {
      say(`場所「${place.name}」: 街並み ${place.streetId} が無い`);
    }
    if (!scenarioIds.has(place.mainScenarioId)) {
      say(`場所「${place.name}」: 本筋の会話 ${place.mainScenarioId} が無い`);
    }
  }
  for (const street of STREETS) {
    if (!placeIds.has(street.placeId)) {
      say(`街並み ${street.id}: 場所 ${street.placeId} が無い`);
    }
    const back = PLACES.find((p) => p.id === street.placeId);
    if (back && back.streetId !== street.id) {
      say(`街並み ${street.id}: 場所「${back.name}」の行き先と食い違う`);
    }
    if (street.startX < 0 || street.startX > 1) {
      say(`街並み ${street.id}: startX が 0〜1 の外`);
    }
  }

  /* ---- 街並みの中身 ---- */
  const usedScenarios = new Set<string>();
  const usedPuzzles = new Set<string>();
  const usedItems = new Set<string>();

  for (const street of STREETS) {
    dup(`街並み ${street.id} の人`, street.npcs.map((n) => n.id));
    dup(`街並み ${street.id} のナゾ`, street.puzzles.map((p) => p.id));
    dup(`街並み ${street.id} のキラキラ`, street.sparkles.map((s) => s.id));

    for (const npc of street.npcs) {
      if (!CHARACTERS[npc.characterId]) {
        say(`${street.id}/${npc.id}: 登場人物 ${npc.characterId} が無い`);
      }
      if (!scenarioIds.has(npc.scenarioId)) {
        say(`${street.id}/${npc.id}: 会話 ${npc.scenarioId} が無い`);
      }
      if (npc.requiresScenario && !scenarioIds.has(npc.requiresScenario)) {
        say(`${street.id}/${npc.id}: 条件の会話 ${npc.requiresScenario} が無い`);
      }
      if (npc.x < 0 || npc.x > 1) say(`${street.id}/${npc.id}: x が 0〜1 の外`);
      usedScenarios.add(npc.scenarioId);
    }

    for (const sp of street.puzzles) {
      if (!puzzleIds.has(sp.puzzleId)) {
        say(`${street.id}/${sp.id}: ナゾ ${sp.puzzleId} が無い`);
      }
      if (sp.x < 0 || sp.x > 1) say(`${street.id}/${sp.id}: x が 0〜1 の外`);
      if (usedPuzzles.has(sp.puzzleId)) {
        say(`ナゾ ${sp.puzzleId} が二か所に置かれている`);
      }
      usedPuzzles.add(sp.puzzleId);
    }

    dup(`街並み ${street.id} の出口`, street.exits.map((e) => e.id));
    for (const ex of street.exits) {
      if (!streetIds.has(ex.to)) {
        say(`${street.id}/${ex.id}: 行き先の街並み ${ex.to} が無い`);
      }
      if (ex.to === street.id) say(`${street.id}/${ex.id}: 自分自身へ向かっている`);
      if (ex.x < 0 || ex.x > 1) say(`${street.id}/${ex.id}: x が 0〜1 の外`);
      if (ex.y < 0 || ex.y > 1) say(`${street.id}/${ex.id}: y が 0〜1 の外`);
      // 行き来できないと詰むので、戻り道があるかも見ておく
      const back = STREETS.find((t) => t.id === ex.to);
      if (back && !back.exits.some((e) => e.to === street.id)) {
        say(`${street.id} → ${ex.to} の戻り道が無い`);
      }
    }

    for (const sk of street.sparkles) {
      if (!itemIds.has(sk.itemId)) {
        say(`${street.id}/${sk.id}: アイテム ${sk.itemId} が無い`);
      }
      if (sk.x < 0 || sk.x > 1) say(`${street.id}/${sk.id}: x が 0〜1 の外`);
      if (sk.y < 0 || sk.y > 1) say(`${street.id}/${sk.id}: y が 0〜1 の外`);
      if (usedItems.has(sk.itemId)) {
        say(`アイテム ${sk.itemId} が二か所に落ちている`);
      }
      usedItems.add(sk.itemId);
    }
  }

  /* ---- どこからも行けない街並みが無いか ---- */
  const reachable = new Set<string>();
  const start = STREETS[0];
  if (start) {
    const queue = [start.id];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      const here = STREETS.find((t) => t.id === id);
      for (const ex of here?.exits ?? []) queue.push(ex.to);
    }
  }
  for (const street of STREETS) {
    if (!reachable.has(street.id)) {
      say(`街並み ${street.id} へは、出口をたどって行き着けない`);
    }
  }

  /* ---- 置き忘れ ---- */
  for (const p of PUZZLES) {
    if (!usedPuzzles.has(p.id)) say(`ナゾ「${p.title}」がどの街並みにも置かれていない`);
  }
  for (const i of ITEMS) {
    if (!usedItems.has(i.id)) say(`アイテム「${i.name}」がどの街並みにも落ちていない`);
  }
  for (const s of SCENARIOS) {
    if (!usedScenarios.has(s.id)) say(`会話「${s.title}」を始める人がいない`);
  }

  /* ---- 会話の中身 ---- */
  for (const sc of SCENARIOS) {
    for (const id of sc.unlocks ?? []) {
      if (!placeIds.has(id)) say(`会話「${sc.title}」: 開放する場所 ${id} が無い`);
    }
    for (const line of sc.lines) {
      if (line.speaker && !CHARACTERS[line.speaker]) {
        say(`会話「${sc.title}」: 話者 ${line.speaker} が無い`);
      }
    }
    if (sc.lines.length === 0) say(`会話「${sc.title}」: 中身が空`);
  }

  /* ---- ナゾの中身 ---- */
  for (const p of PUZZLES) {
    if (p.hints.length === 0) say(`ナゾ「${p.title}」: ヒントが無い`);
    if (!p.explanation) say(`ナゾ「${p.title}」: 解説が無い`);
    const a = p.answer;
    if (a.kind === 'choice' && (a.correct < 0 || a.correct >= a.options.length)) {
      say(`ナゾ「${p.title}」: 正解の番号が選択肢の外`);
    }
    if (a.kind === 'order') {
      const sorted = [...a.correct].sort((x, y) => x - y);
      const ok =
        a.correct.length === a.items.length &&
        sorted.every((v, i) => v === i);
      if (!ok) say(`ナゾ「${p.title}」: 並べかえの正解が項目とかみ合わない`);
    }
    if (a.kind === 'text' && a.accept.length === 0) {
      say(`ナゾ「${p.title}」: 受けつける答えが無い`);
    }
    if (a.kind === 'grid' && a.rows !== a.cols) {
      say(`ナゾ「${p.title}」: いまの判定は正方形のます目のみに対応`);
    }
  }

  /* ---- 物語まわり ---- */
  for (const b of STORY_BEATS) {
    if (!scenarioIds.has(b.afterScenario)) {
      say(`判明していること「${b.heading}」: 会話 ${b.afterScenario} が無い`);
    }
  }
  for (const c of CAST) {
    if (!CHARACTERS[c.id]) say(`関係者「${c.name}」: 登場人物 ${c.id} が無い`);
    if (!scenarioIds.has(c.from)) say(`関係者「${c.name}」: 会話 ${c.from} が無い`);
  }

  return problems;
}

/** 起動時に一度だけ検査して、問題があればコンソールに並べる */
export function reportContentProblems(): void {
  const problems = checkContent();
  if (problems.length === 0) return;
  console.warn(
    `[CookieClaude] 中身のつながりに ${problems.length} 件の問題:\n` +
      problems.map((p) => ` - ${p}`).join('\n'),
  );
}
