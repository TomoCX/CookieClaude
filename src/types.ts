/** アプリ全体で使う型定義 */

/** 画面の種類 */
export type ScreenId =
  | 'street' // 街並み画面。遊びの土台になる画面
  | 'scenario' // シナリオ会話画面
  | 'puzzle' // ナゾ解き画面（街並みの時計を押すと開く）
  | 'mainMenu'; // メインメニュー（トランク）

/** 立ち絵の表示位置 */
export type Side = 'left' | 'right';

/** 立ち絵の表情・ポーズ */
export type Pose = 'normal' | 'think' | 'happy' | 'surprised';

/** 帽子の種類 */
export type Hat = 'tophat' | 'cap' | 'bonnet' | 'straw' | 'hood' | 'none';

/** 登場人物 */
export interface Character {
  id: string;
  name: string;
  /** 会話画面での既定の立ち位置 */
  side: Side;
  hat: Hat;
  /** 服の色 */
  coat: string;
  /** 差し色 */
  accent: string;
  /** 肌の色 */
  skin: string;
  /** 髪の色 */
  hair: string;
  /** 立ち絵の大きさの倍率（子どもや老人を描き分ける） */
  scale?: number;
}

/** 会話の 1 行 */
export interface DialogueLine {
  /** 話者の Character.id。省略するとナレーション表示 */
  speaker?: string;
  /** 本文（日本語） */
  text: string;
  /** 字幕（英語） */
  sub?: string;
  /** 話者のポーズ */
  pose?: Pose;
}

/** 背景の種類 */
export type BackgroundId =
  | 'highway'
  | 'gate'
  | 'plaza'
  | 'clocktower'
  | 'inn'
  | 'alley'
  | 'night';

/** 調査メモ 1 件 */
export interface Note {
  id: string;
  title: string;
  body: string;
}

/** チャーム（お守り） */
export interface Charm {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

/** シナリオ（1 つの会話イベント） */
export interface Scenario {
  id: string;
  title: string;
  bg: BackgroundId;
  /** 本筋の会話か、町の人とのちょっとした立ち話か */
  kind: 'main' | 'flavor';
  lines: DialogueLine[];
  /** 読了時にもらえるひらめきコイン */
  coin: number;
  /** 読了時に手に入る調査メモ */
  note?: Note;
  /** 読了時に開放される場所の id */
  unlocks?: string[];
  /** 読了時に手に入るチャーム */
  charm?: Charm;
}

/** 街並みに立っている人 */
export interface Npc {
  id: string;
  /** どの登場人物か */
  characterId: string;
  /** 街並みの中での位置（0〜1） */
  x: number;
  /** 話しかけると始まるシナリオ */
  scenarioId: string;
  /** このシナリオを読み終えるまで現れない */
  requiresScenario?: string;
}

/* ---- 収集アイテム ---- */

/** アイテムの絵の種類 */
export type ItemIcon =
  | 'ticket'
  | 'berry'
  | 'stone'
  | 'key'
  | 'flower'
  | 'tile'
  | 'paper'
  | 'coaster'
  | 'screw'
  | 'shard'
  | 'glove'
  | 'letter';

/** 街に散らばっている収集アイテム */
export interface Item {
  id: string;
  name: string;
  /** ひとこと添える説明 */
  flavor: string;
  icon: ItemIcon;
}

/** 拾ったアイテムの記録 */
export interface CollectedItem {
  itemId: string;
  /** どの場所で拾ったか（Place.id） */
  placeId: string;
  /** 拾ったときのプレイ時間（秒）。並び順にも使う。 */
  atSeconds: number;
}

/** 街並みに落ちているキラキラ。押すとアイテムを拾える。 */
export interface StreetSparkle {
  id: string;
  itemId: string;
  /** 街並みの中での位置（0〜1） */
  x: number;
  /** 画面の高さに対する位置（0 が上、1 が下） */
  y: number;
}

/** 出口の向き。奥へ、手前へ、左へ、右へ。 */
export type ExitDir = 'far' | 'near' | 'left' | 'right';

/**
 * 隣の街並みへの出口。
 * 靴のアイコンを押すと、この位置に三角の矢印が出る。
 */
export interface StreetExit {
  id: string;
  /** 行き先の街並み（Street.id） */
  to: string;
  dir: ExitDir;
  /** 街並みの中での位置（0〜1） */
  x: number;
  /** 画面の高さに対する位置（0 が上、1 が下） */
  y: number;
}

/** 街並みに置かれた「時計のような物体」。押すとナゾが始まる。 */
export interface StreetPuzzle {
  id: string;
  puzzleId: string;
  /** 街並みの中での位置（0〜1） */
  x: number;
  /** 物体の見た目 */
  look: 'clock' | 'sundial' | 'pocketwatch';
}

/** 街並み（マップから入った先の、道を見わたせる画面） */
export interface Street {
  id: string;
  /** どの場所の街並みか */
  placeId: string;
  /** 背景の種類 */
  bg: BackgroundId;
  /** 立っている人たち */
  npcs: Npc[];
  /** 置かれているナゾ */
  puzzles: StreetPuzzle[];
  /** 落ちている収集アイテム */
  sparkles: StreetSparkle[];
  /** 隣の街並みへの出口 */
  exits: StreetExit[];
  /** 入ってきたときのカメラの位置（0〜1） */
  startX: number;
}

/** マップ上の場所 */
export interface Place {
  id: string;
  /** 現在地表示用の名前 */
  name: string;
  /** ふりがな */
  ruby: string;
  /** マップ上の位置（％） */
  x: number;
  y: number;
  /** 入ったときに開く街並みの id */
  streetId: string;
  /** この場所の本筋のシナリオ（進行度の判定に使う） */
  mainScenarioId: string;
  /** 最初から行ける場所か */
  openFromStart?: boolean;
}

/* ---- ナゾ解き ---- */

/** ナゾに添える図 */
export type FigureId =
  | 'bell'
  | 'gears'
  | 'mirror'
  | 'hands'
  | 'clocks3'
  | 'strike'
  | 'riddle'
  | 'flower'
  | 'lamps'
  | 'timeline';

/** ウミガメのスープ用。ひとつずつ開いていく「はい／いいえ」の手がかり。 */
export interface Clue {
  q: string;
  a: string;
}

/** 答えの形式 */
export type PuzzleAnswer =
  /** 数を入れる */
  | { kind: 'number'; value: number; unit: string }
  /** 選択肢から選ぶ */
  | { kind: 'choice'; options: string[]; correct: number }
  /** 言葉で答える（表記ゆれは accept に並べる） */
  | { kind: 'text'; accept: string[]; placeholder: string }
  /** 早い順などに並べかえる。correct は items の番号を正しい順に並べたもの。 */
  | { kind: 'order'; items: string[]; correct: number[] }
  /**
   * ます目を押していく二次元パズル。
   * rule 'oneEachRowCol' は「どの行にも、どの列にも、ちょうど一つ」。
   */
  | { kind: 'grid'; rows: number; cols: number; rule: 'oneEachRowCol' };

/** 独立したナゾ解き 1 問 */
export interface Puzzle {
  id: string;
  /** ナゾ事典に並ぶ番号 */
  no: number;
  title: string;
  /** 1回目・2回目・3回目以降の正解でもらえるピカラット */
  picarat: [number, number, number];
  question: string;
  figure: FigureId;
  answer: PuzzleAnswer;
  /** ヒントは一つにつきひらめきコイン 1 枚 */
  hints: string[];
  /** ウミガメのスープ形式のときの「はい／いいえ」。無料で開ける。 */
  clues?: Clue[];
  /** 正解したあとに読める解説 */
  explanation: string;
}

/* ---- エフェクト ---- */

/**
 * エフェクトを差しこめる場所。
 * 画面ごとに、絵の奥（back）と手前（front）が用意してある。
 */
export type EffectSlot =
  | 'street.back' // 空と建物の上、人やナゾより奥
  | 'street.front' // 街並みの何よりも手前
  | 'scenario.front'
  | 'puzzle.front'
  | 'menu.back'
  | 'boot.front';

/** 大きさが決まったときに渡すもの */
export interface EffectSize {
  /** CSS ピクセル。devicePixelRatio は EffectLayer 側で吸収してある。 */
  width: number;
  height: number;
}

/** 一コマ描くときに渡すもの */
export interface EffectFrame extends EffectSize {
  ctx: CanvasRenderingContext2D;
  /** 動きだしてからの秒数 */
  time: number;
  /** 前のコマからの秒数（大きく飛ばないよう頭打ちにしてある） */
  dt: number;
  /** 画面の中の指の位置（0〜1）。触れていなければ null */
  pointer: { x: number; y: number } | null;
  /** 0〜1。設定の「エフェクトの強さ」。0 のときは描画そのものを止める。 */
  strength: number;
  /** 街並みのカメラ位置（0〜1）。街並み以外の場所では 0。 */
  cameraT: number;
}

/**
 * ひとつのエフェクトの中身。Processing の setup / draw と同じ組み立て。
 * 粒などの持ちものは create() の中に閉じこめる。
 */
export interface EffectSketch {
  /** 大きさが決まったとき・変わったときに呼ぶ */
  setup?: (size: EffectSize) => void;
  /** 毎コマ呼ぶ。画面は EffectLayer 側で消してある。 */
  draw: (frame: EffectFrame) => void;
  /** 片づけ（タイマーなどを持ったとき用） */
  teardown?: () => void;
}

/** 差しこめるエフェクト 1 つ */
export interface Effect {
  id: string;
  name: string;
  slot: EffectSlot;
  /** 開発者モードの一覧に出すひとこと */
  note: string;
  /** 既定で動かすか */
  enabled: boolean;
  /** 一枚の画面につき一度だけ呼ばれる。ここで持ちものを作る。 */
  create: () => EffectSketch;
}

/* ---- 設定 ---- */

/** 画面の大きさ */
export type ScreenSize = 'small' | 'medium' | 'large' | 'xlarge' | 'full';

/** ゲームの設定。進行状況とは別に保存する。 */
export interface Settings {
  screenSize: ScreenSize;
  bgmOn: boolean;
  /** 0〜100 */
  bgmVolume: number;
  seOn: boolean;
  /** 0〜100 */
  seVolume: number;
  /** 画面のエフェクトを動かすか */
  effectsOn: boolean;
  /** エフェクトの強さ（0〜100） */
  effectStrength: number;
}

/* ---- 開発者モード ---- */

/**
 * 開発者モードから遊びの側をさわるための口。
 * `App` が持っている操作のうち、中身を足すときに要るものだけを渡す。
 */
export interface DevApi {
  state: GameState;
  /** 進行状況を丸ごと差しかえる */
  setState: (next: GameState) => void;
  /** いま見ている街並み */
  streetId: string;
  /** その街並みへ飛ぶ */
  goToStreet: (id: string) => void;
  /** その会話を頭から読む */
  playScenario: (id: string) => void;
  /** そのナゾを開く */
  openPuzzle: (id: string) => void;
}

/* ---- 進行状況 ---- */

/** セーブ対象のゲーム進行状況 */
export interface GameState {
  /** ひらめき指数（累計）（ピカラット） */
  picarat: number;
  /** ひらめきコイン */
  coin: number;
  /** プレイ時間（秒） */
  playSeconds: number;
  /** 現在地（Place.id） */
  placeId: string;
  /** 最後にいた街並み（Street.id）。「続きから」でここに戻る。 */
  streetId: string;
  /** その街並みでのカメラ位置（0〜1） */
  streetX: number;
  /** 行けるようになった場所 */
  openPlaces: string[];
  /** 読み終えたシナリオ */
  clearedScenarios: string[];
  /** 発見したナゾ（一度でも開いたもの） */
  foundPuzzles: string[];
  /** 解いたナゾ */
  solvedPuzzles: string[];
  /** ナゾごとの誤答 */
  misses: Record<string, number>;
  /** ナゾごとに見たヒントの数 */
  hints: Record<string, number>;
  /** 集めた調査メモ */
  notes: Note[];
  /** 集めたチャーム */
  charms: Charm[];
  /** 拾った収集アイテム */
  collected: CollectedItem[];
  /** 自由記入メモ */
  memo: string;
}
