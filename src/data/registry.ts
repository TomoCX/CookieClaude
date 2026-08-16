import { CHARACTERS } from './characters';
import { ITEMS } from './items';
import { AREAS } from './areas';
import { PUZZLES } from './puzzles';
import { SCENARIOS } from './scenarios';
import { SCENES } from './scenes';
import { CAST, STORY_BEATS } from './story';

/**
 * 中身（エリア・シーン・人物・会話・ナゾ・アイテム）のつながりを検査する。
 *
 * データを足すときに id を書きまちがえても、画面が黙って壊れるだけで
 * 原因が分かりにくい。そこで起動時に一度だけ通しで見て、
 * おかしなところをコンソールに並べる。
 *
 * 追加のしかたは docs/DEVELOPMENT.md を参照。
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

  const areaIds = new Set(AREAS.map((p) => p.id));
  const sceneIds = new Set(SCENES.map((s) => s.id));
  const scenarioIds = new Set(SCENARIOS.map((s) => s.id));
  const puzzleIds = new Set(PUZZLES.map((p) => p.id));
  const itemIds = new Set(ITEMS.map((i) => i.id));

  dup('エリア', AREAS.map((a) => a.id));
  dup('シーン', SCENES.map((sc) => sc.id));
  dup('会話', SCENARIOS.map((s) => s.id));
  dup('ナゾ', PUZZLES.map((p) => p.id));
  dup('アイテム', ITEMS.map((i) => i.id));
  dup('ナゾ番号', PUZZLES.map((p) => String(p.no)));

  /* ---- エリアとシーンの対応 ---- */
  for (const area of AREAS) {
    if (!sceneIds.has(area.entrySceneId)) {
      say(`エリア「${area.name}」: 入口のシーン ${area.entrySceneId} が無い`);
    }
    const entry = SCENES.find((sc) => sc.id === area.entrySceneId);
    if (entry && entry.areaId !== area.id) {
      say(`エリア「${area.name}」: 入口のシーン ${entry.id} は別のエリア（${entry.areaId}）のもの`);
    }
    if (!scenarioIds.has(area.mainScenarioId)) {
      say(`エリア「${area.name}」: 本筋の会話 ${area.mainScenarioId} が無い`);
    }
    if (SCENES.every((sc) => sc.areaId !== area.id)) {
      say(`エリア「${area.name}」: 属するシーンが一つも無い`);
    }
  }

  /* ---- シーンの中身 ---- */
  const usedScenarios = new Set<string>();
  const usedPuzzles = new Set<string>();
  const usedItems = new Set<string>();

  for (const scene of SCENES) {
    const where = `${scene.id}（${scene.name}）`;
    if (!areaIds.has(scene.areaId)) {
      say(`シーン ${where}: エリア ${scene.areaId} が無い`);
    }
    if (!scene.name) say(`シーン ${scene.id}: 名前が空`);
    // 同じエリアの中で名前が重なると、現在地の表示で見分けられなくなる
    const twin = SCENES.find(
      (o) => o !== scene && o.areaId === scene.areaId && o.name === scene.name,
    );
    if (twin) say(`シーン ${where}: 同じエリアの ${twin.id} と名前が同じ`);

    if (scene.kind === 'street') {
      if (scene.startX < 0 || scene.startX > 1) say(`シーン ${where}: startX が 0〜1 の外`);
    } else if (scene.kind === 'closeup' && scene.npcs.length > 0) {
      // 拡大図に人を立たせても、身体が画面からはみ出して意味をなさない
      say(`シーン ${where}: closeup には人を置かない`);
    }

    dup(`シーン ${scene.id} の人`, scene.npcs.map((n) => n.id));
    dup(`シーン ${scene.id} のナゾ`, scene.puzzles.map((p) => p.id));
    dup(`シーン ${scene.id} のキラキラ`, scene.sparkles.map((k) => k.id));
    dup(`シーン ${scene.id} の出口`, scene.exits.map((e) => e.id));

    /** 見わたさないシーンでは、縦位置も書いておかないと重なってしまう */
    const needsY = scene.kind !== 'street';

    for (const npc of scene.npcs) {
      if (!CHARACTERS[npc.characterId]) {
        say(`${scene.id}/${npc.id}: 登場人物 ${npc.characterId} が無い`);
      }
      if (!scenarioIds.has(npc.scenarioId)) {
        say(`${scene.id}/${npc.id}: 会話 ${npc.scenarioId} が無い`);
      }
      if (npc.requiresScenario && !scenarioIds.has(npc.requiresScenario)) {
        say(`${scene.id}/${npc.id}: 条件の会話 ${npc.requiresScenario} が無い`);
      }
      if (npc.x < 0 || npc.x > 1) say(`${scene.id}/${npc.id}: x が 0〜1 の外`);
      if (needsY && npc.y == null) say(`${scene.id}/${npc.id}: ${scene.kind} では y も要る`);
      usedScenarios.add(npc.scenarioId);
    }

    for (const sp of scene.puzzles) {
      if (!puzzleIds.has(sp.puzzleId)) {
        say(`${scene.id}/${sp.id}: ナゾ ${sp.puzzleId} が無い`);
      }
      if (sp.x < 0 || sp.x > 1) say(`${scene.id}/${sp.id}: x が 0〜1 の外`);
      if (needsY && sp.y == null) say(`${scene.id}/${sp.id}: ${scene.kind} では y も要る`);
      if (usedPuzzles.has(sp.puzzleId)) {
        say(`ナゾ ${sp.puzzleId} が二か所に置かれている`);
      }
      usedPuzzles.add(sp.puzzleId);
    }

    for (const ex of scene.exits) {
      const dest = SCENES.find((t) => t.id === ex.to);
      if (!dest) {
        say(`${scene.id}/${ex.id}: 行き先のシーン ${ex.to} が無い`);
        continue;
      }
      if (ex.to === scene.id) say(`${scene.id}/${ex.id}: 自分自身へ向かっている`);
      if (ex.x < 0 || ex.x > 1) say(`${scene.id}/${ex.id}: x が 0〜1 の外`);
      if (ex.y < 0 || ex.y > 1) say(`${scene.id}/${ex.id}: y が 0〜1 の外`);
      // 行き来できないと詰むので、戻り道があるかも見ておく
      if (!dest.exits.some((e) => e.to === scene.id)) {
        say(`${scene.id} → ${ex.to} の戻り道が無い`);
      }
      // 覗きこんだ先は同じエリアの中。別エリアへ潜ると現在地が飛んで分かりにくい。
      if (ex.dir === 'into' && dest.areaId !== scene.areaId) {
        say(`${scene.id}/${ex.id}: into の行き先は同じエリアのシーンにする`);
      }
      if (ex.dir === 'back' && dest.areaId !== scene.areaId) {
        say(`${scene.id}/${ex.id}: back の行き先は同じエリアのシーンにする`);
      }
    }

    for (const sk of scene.sparkles) {
      if (!itemIds.has(sk.itemId)) {
        say(`${scene.id}/${sk.id}: アイテム ${sk.itemId} が無い`);
      }
      if (sk.x < 0 || sk.x > 1) say(`${scene.id}/${sk.id}: x が 0〜1 の外`);
      if (sk.y < 0 || sk.y > 1) say(`${scene.id}/${sk.id}: y が 0〜1 の外`);
      if (usedItems.has(sk.itemId)) {
        say(`アイテム ${sk.itemId} が二か所に落ちている`);
      }
      usedItems.add(sk.itemId);
    }
  }

  /* ---- どこからも行けないシーンが無いか ---- */
  const reachable = new Set<string>();
  const start = SCENES[0];
  if (start) {
    const queue = [start.id];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      const here = SCENES.find((t) => t.id === id);
      for (const ex of here?.exits ?? []) queue.push(ex.to);
    }
  }
  for (const scene of SCENES) {
    if (!reachable.has(scene.id)) {
      say(`シーン ${scene.id}（${scene.name}）へは、出口をたどって行き着けない`);
    }
  }

  /* ---- エリアの開きかた ---- */
  // 会話で開くエリアを最初から開けてしまうと、幕開けを飛ばして先へ行けてしまう。
  // 逆に、どこからも開かれないエリアは永久に行けない。
  const unlockedBy = new Map<string, string[]>();
  for (const sc of SCENARIOS) {
    for (const id of sc.unlocks ?? []) {
      unlockedBy.set(id, [...(unlockedBy.get(id) ?? []), sc.title]);
    }
  }
  if (AREAS.every((a) => !a.openFromStart)) say('最初から行けるエリアが一つも無い');
  for (const area of AREAS) {
    const by = unlockedBy.get(area.id);
    if (area.openFromStart && by) {
      say(`エリア「${area.name}」: 最初から開いているのに、会話「${by[0]}」でも開かれる`);
    }
    if (!area.openFromStart && !by) {
      say(`エリア「${area.name}」: 最初から開いておらず、開放する会話も無い`);
    }
  }

  /* ---- 置き忘れ ---- */
  for (const p of PUZZLES) {
    if (!usedPuzzles.has(p.id)) say(`ナゾ「${p.title}」がどのシーンにも置かれていない`);
  }
  for (const i of ITEMS) {
    if (!usedItems.has(i.id)) say(`アイテム「${i.name}」がどのシーンにも落ちていない`);
  }
  for (const s of SCENARIOS) {
    if (!usedScenarios.has(s.id)) say(`会話「${s.title}」を始める人がいない`);
  }

  /* ---- 会話の中身 ---- */
  for (const sc of SCENARIOS) {
    for (const id of sc.unlocks ?? []) {
      if (!areaIds.has(id)) say(`会話「${sc.title}」: 開放するエリア ${id} が無い`);
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
