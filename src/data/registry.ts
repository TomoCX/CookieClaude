import { CHARACTERS } from './characters';
import { ITEMS } from './items';
import { AREAS } from './areas';
import { PUZZLES } from './puzzles';
import { SCENARIOS } from './scenarios';
import { SCENES } from './scenes';
import { CAST, STORY_BEATS } from './story';
import { text } from '../i18n/text';

/**
 * 中身（エリア・シーン・人物・会話・ナゾ・アイテム）のつながりを検査する。
 *
 * データを足すときに id を書きまちがえても、画面が黙って壊れるだけで
 * 原因が分かりにくい。そこで起動時に一度だけ通しで見て、
 * おかしなところをコンソールに並べる。
 *
 * 検査は観点ごとに関数へ分けてある。足すときは、いちばん近い観点の
 * 関数に一行足すか、新しい観点なら関数を作って `CHECKS` に並べる。
 *
 * 中身の追加のしかたは docs/DEVELOPMENT.md を参照。
 */

/** 問題を書きとめる先。各検査はこれを受けとって報告する。 */
interface Report {
  /** 問題を一件書きとめる */
  say: (message: string) => void;
  /** 同じ id が二度出てこないか確かめる */
  dup: (label: string, ids: string[]) => void;
}

/** 実在する id の一覧。あちこちの検査で引くので、一度だけ作って回す。 */
interface Known {
  areas: Set<string>;
  scenes: Set<string>;
  scenarios: Set<string>;
  puzzles: Set<string>;
  items: Set<string>;
}

type Check = (r: Report, known: Known) => void;

/* ---- id そのもの ---- */

const checkIds: Check = ({ dup }) => {
  dup('エリア', AREAS.map((a) => a.id));
  dup('シーン', SCENES.map((s) => s.id));
  dup('会話', SCENARIOS.map((s) => s.id));
  dup('ナゾ', PUZZLES.map((p) => p.id));
  dup('アイテム', ITEMS.map((i) => i.id));
  dup('ナゾ番号', PUZZLES.map((p) => String(p.no)));
};

/* ---- エリアとシーンの対応 ---- */

const checkAreas: Check = ({ say }, known) => {
  for (const area of AREAS) {
    if (!known.scenes.has(area.entrySceneId)) {
      say(`エリア「${text(area.name)}」: 入口のシーン ${area.entrySceneId} が無い`);
    }
    const entry = SCENES.find((sc) => sc.id === area.entrySceneId);
    if (entry && entry.areaId !== area.id) {
      say(
        `エリア「${area.name}」: 入口のシーン ${entry.id} は別のエリア（${entry.areaId}）のもの`,
      );
    }
    if (!known.scenarios.has(area.mainScenarioId)) {
      say(`エリア「${text(area.name)}」: 本筋の会話 ${area.mainScenarioId} が無い`);
    }
    if (SCENES.every((sc) => sc.areaId !== area.id)) {
      say(`エリア「${text(area.name)}」: 属するシーンが一つも無い`);
    }
  }
};

/* ---- シーンの中身 ---- */

/**
 * シーンに置いたものが、実在するものを指しているか。
 * ここで数えた「使われたもの」は、置き忘れの検査でも使う。
 */
interface Used {
  scenarios: Set<string>;
  puzzles: Set<string>;
  items: Set<string>;
}

function checkScenes(r: Report, known: Known): Used {
  const { say, dup } = r;
  const used: Used = { scenarios: new Set(), puzzles: new Set(), items: new Set() };

  for (const scene of SCENES) {
    const where = `${scene.id}（${text(scene.name)}）`;

    if (!known.areas.has(scene.areaId)) say(`シーン ${where}: エリア ${scene.areaId} が無い`);
    if (!scene.name) say(`シーン ${scene.id}: 名前が空`);
    // 同じエリアの中で名前が重なると、現在地の表示で見分けられなくなる
    const twin = SCENES.find(
      (o) => o !== scene && o.areaId === scene.areaId && text(o.name) === text(scene.name),
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
      if (!known.scenarios.has(npc.scenarioId)) {
        say(`${scene.id}/${npc.id}: 会話 ${npc.scenarioId} が無い`);
      }
      if (npc.requiresScenario && !known.scenarios.has(npc.requiresScenario)) {
        say(`${scene.id}/${npc.id}: 条件の会話 ${npc.requiresScenario} が無い`);
      }
      if (npc.x < 0 || npc.x > 1) say(`${scene.id}/${npc.id}: x が 0〜1 の外`);
      if (needsY && npc.y == null) say(`${scene.id}/${npc.id}: ${scene.kind} では y も要る`);
      used.scenarios.add(npc.scenarioId);
    }

    for (const sp of scene.puzzles) {
      if (!known.puzzles.has(sp.puzzleId)) say(`${scene.id}/${sp.id}: ナゾ ${sp.puzzleId} が無い`);
      if (sp.x < 0 || sp.x > 1) say(`${scene.id}/${sp.id}: x が 0〜1 の外`);
      if (needsY && sp.y == null) say(`${scene.id}/${sp.id}: ${scene.kind} では y も要る`);
      if (used.puzzles.has(sp.puzzleId)) say(`ナゾ ${sp.puzzleId} が二か所に置かれている`);
      used.puzzles.add(sp.puzzleId);
    }

    for (const prop of scene.props ?? []) {
      if (!prop.name) say(`${scene.id}/${prop.id}: 名前が空`);
      if (!prop.text) say(`${scene.id}/${prop.id}: 本文が空`);
      if (prop.x < 0 || prop.x > 1) say(`${scene.id}/${prop.id}: x が 0〜1 の外`);
      if (prop.y < 0 || prop.y > 1) say(`${scene.id}/${prop.id}: y が 0〜1 の外`);
      if (prop.gives) {
        if (!known.items.has(prop.gives)) {
          say(`${scene.id}/${prop.id}: アイテム ${prop.gives} が無い`);
        }
        if (used.items.has(prop.gives)) {
          say(`アイテム ${prop.gives} が二か所で手に入る`);
        }
        used.items.add(prop.gives);
      }
    }
    dup(`シーン ${scene.id} の調べどころ`, (scene.props ?? []).map((p) => p.id));

    for (const sk of scene.sparkles) {
      if (!known.items.has(sk.itemId)) say(`${scene.id}/${sk.id}: アイテム ${sk.itemId} が無い`);
      if (sk.x < 0 || sk.x > 1) say(`${scene.id}/${sk.id}: x が 0〜1 の外`);
      if (sk.y < 0 || sk.y > 1) say(`${scene.id}/${sk.id}: y が 0〜1 の外`);
      if (used.items.has(sk.itemId)) say(`アイテム ${sk.itemId} が二か所に落ちている`);
      used.items.add(sk.itemId);
    }
  }

  return used;
}

/* ---- 出口のつながり ---- */

const checkExits: Check = ({ say }) => {
  for (const scene of SCENES) {
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
      if ((ex.dir === 'into' || ex.dir === 'back') && dest.areaId !== scene.areaId) {
        say(`${scene.id}/${ex.id}: ${ex.dir} の行き先は同じエリアのシーンにする`);
      }
    }
  }
};

/** どこからも行き着けないシーンが無いか、出口をたどって確かめる */
const checkReachable: Check = ({ say }) => {
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
      say(`シーン ${scene.id}（${text(scene.name)}）へは、出口をたどって行き着けない`);
    }
  }
};

/* ---- エリアの開きかた ---- */

/**
 * 会話で開くエリアを最初から開けてしまうと、幕開けを飛ばして先へ行けてしまう。
 * 逆に、どこからも開かれないエリアは永久に行けない。
 */
const checkUnlocks: Check = ({ say }) => {
  const unlockedBy = new Map<string, string[]>();
  for (const sc of SCENARIOS) {
    for (const id of sc.unlocks ?? []) {
      unlockedBy.set(id, [...(unlockedBy.get(id) ?? []), text(sc.title)]);
    }
  }
  if (AREAS.every((a) => !a.openFromStart)) say('最初から行けるエリアが一つも無い');
  for (const area of AREAS) {
    const by = unlockedBy.get(area.id);
    if (area.openFromStart && by) {
      say(`エリア「${text(area.name)}」: 最初から開いているのに、会話「${by[0]}」でも開かれる`);
    }
    if (!area.openFromStart && !by) {
      say(`エリア「${text(area.name)}」: 最初から開いておらず、開放する会話も無い`);
    }
  }
};

/* ---- 置き忘れ ---- */

/** 作ったのにどこにも置いていないものを拾う */
function checkLeftovers({ say }: Report, used: Used): void {
  for (const p of PUZZLES) {
    if (!used.puzzles.has(p.id)) say(`ナゾ「${text(p.title)}」がどのシーンにも置かれていない`);
  }
  for (const i of ITEMS) {
    if (!used.items.has(i.id))
      say(`アイテム「${text(i.name)}」が、どのシーンにも落ちておらず、調べても手に入らない`);
  }
  for (const s of SCENARIOS) {
    if (!used.scenarios.has(s.id)) say(`会話「${text(s.title)}」を始める人がいない`);
  }
}

/* ---- 会話の中身 ---- */

const checkScenarios: Check = ({ say, dup }, known) => {
  for (const sc of SCENARIOS) {
    const where = `会話「${text(sc.title)}」`;
    for (const id of sc.unlocks ?? []) {
      if (!known.areas.has(id)) say(`${where}: 開放するエリア ${id} が無い`);
    }
    for (const line of sc.lines) {
      if (line.speaker && !CHARACTERS[line.speaker]) {
        say(`${where}: 話者 ${line.speaker} が無い`);
      }
    }
    if (sc.lines.length === 0) say(`${where}: 中身が空`);

    /* ---- 分かれ道 ---- */
    const labels = new Set(sc.lines.flatMap((l) => (l.label ? [l.label] : [])));
    dup(`${where} の節`, sc.lines.flatMap((l) => (l.label ? [l.label] : [])));
    dup(
      `${where} の選択肢`,
      sc.lines.flatMap((l) => (l.choices ?? []).map((c) => c.id)),
    );

    for (const line of sc.lines) {
      if (line.goto && !labels.has(line.goto)) {
        say(`${where}: goto の飛び先 ${line.goto} という節が無い`);
      }
      for (const choice of line.choices ?? []) {
        if (!labels.has(choice.to)) {
          say(`${where}/${choice.id}: 飛び先 ${choice.to} という節が無い`);
        }
        for (const id of choice.gives?.unlocks ?? []) {
          if (!known.areas.has(id)) say(`${where}/${choice.id}: エリア ${id} が無い`);
        }
        for (const id of choice.gives?.items ?? []) {
          if (!known.items.has(id)) say(`${where}/${choice.id}: アイテム ${id} が無い`);
        }
      }
      // 選択肢を出した行から素通りできてしまうと、分かれ道の意味が無い
      if (line.choices?.length === 0) say(`${where}: 空の選択肢がある`);
    }

    // 節を作ったのに、どの選択肢からも goto からも来られない
    for (const label of labels) {
      const reached = sc.lines.some(
        (l) => l.goto === label || (l.choices ?? []).some((c) => c.to === label),
      );
      if (!reached) say(`${where}: 節「${label}」へ来る道が無い`);
    }
  }
};

/* ---- ナゾの中身 ---- */

const checkPuzzles: Check = ({ say }) => {
  for (const p of PUZZLES) {
    if (p.hints.length === 0) say(`ナゾ「${text(p.title)}」: ヒントが無い`);
    if (!p.explanation) say(`ナゾ「${text(p.title)}」: 解説が無い`);
    const a = p.answer;
    if (a.kind === 'choice' && (a.correct < 0 || a.correct >= a.options.length)) {
      say(`ナゾ「${text(p.title)}」: 正解の番号が選択肢の外`);
    }
    if (a.kind === 'order') {
      const sorted = [...a.correct].sort((x, y) => x - y);
      const ok = a.correct.length === a.items.length && sorted.every((v, i) => v === i);
      if (!ok) say(`ナゾ「${text(p.title)}」: 並べかえの正解が項目とかみ合わない`);
    }
    if (a.kind === 'text' && a.accept.length === 0) {
      say(`ナゾ「${text(p.title)}」: 受けつける答えが無い`);
    }
    if (a.kind === 'grid' && a.rows !== a.cols) {
      say(`ナゾ「${text(p.title)}」: いまの判定は正方形のます目のみに対応`);
    }
  }
};

/* ---- 物語まわり ---- */

const checkStory: Check = ({ say }, known) => {
  for (const b of STORY_BEATS) {
    if (!known.scenarios.has(b.afterScenario)) {
      say(`判明していること「${b.heading}」: 会話 ${b.afterScenario} が無い`);
    }
  }
  for (const c of CAST) {
    if (!CHARACTERS[c.id]) say(`関係者「${c.name}」: 登場人物 ${c.id} が無い`);
    if (!known.scenarios.has(c.from)) say(`関係者「${c.name}」: 会話 ${c.from} が無い`);
  }
};

/** 置いたものを数える必要がない検査は、ここに並べておけば順に走る */
const CHECKS: Check[] = [
  checkIds,
  checkAreas,
  checkExits,
  checkReachable,
  checkUnlocks,
  checkScenarios,
  checkPuzzles,
  checkStory,
];

/** 中身をひととおり検査して、見つかった問題を並べて返す */
export function checkContent(): string[] {
  const problems: string[] = [];
  const report: Report = {
    say: (m) => problems.push(m),
    dup: (label, ids) => {
      const seen = new Set<string>();
      for (const id of ids) {
        if (seen.has(id)) problems.push(`${label}: id が重複している → ${id}`);
        seen.add(id);
      }
    },
  };

  const known: Known = {
    areas: new Set(AREAS.map((a) => a.id)),
    scenes: new Set(SCENES.map((s) => s.id)),
    scenarios: new Set(SCENARIOS.map((s) => s.id)),
    puzzles: new Set(PUZZLES.map((p) => p.id)),
    items: new Set(ITEMS.map((i) => i.id)),
  };

  for (const check of CHECKS) check(report, known);

  // シーンの検査だけは「何を使ったか」を返すので、置き忘れの検査と組にする
  const used = checkScenes(report, known);
  checkLeftovers(report, used);

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
