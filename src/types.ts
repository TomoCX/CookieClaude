/** アプリ全体で使う型定義 */

/** 画面の種類 */
export type ScreenId =
  | 'main' // メイン画面（マップ / 写真3枚目の下側）
  | 'street' // 街並み画面（マップから入った先。人に話しかける）
  | 'scenario' // シナリオ会話画面（写真2枚目）
  | 'puzzle' // ナゾ解き画面（マップの時計を押すと開く）
  | 'menu' // メニュー画面（ステータス / 写真1枚目の上側）
  | 'mainMenu'; // メインメニュー（トランク / 写真1枚目の下側）

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
  /** 読了時にもらえる ひらめきコイン */
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

/** 街並み（マップから入った先の、道を歩ける画面） */
export interface Street {
  id: string;
  /** どの場所の街並みか */
  placeId: string;
  /** 背景の種類 */
  bg: BackgroundId;
  /** 立っている人たち */
  npcs: Npc[];
  /** 入ってきたときの立ち位置（0〜1） */
  startX: number;
}

/** マップ上の場所 */
export interface Place {
  id: string;
  /** げんざいち表示用の名前 */
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
  | 'strike';

/** こたえの形式 */
export type PuzzleAnswer =
  | { kind: 'number'; value: number; unit: string }
  | { kind: 'choice'; options: string[]; correct: number };

/** 独立したナゾ解き 1 問 */
export interface Puzzle {
  id: string;
  /** ナゾじてんに並ぶ番号 */
  no: number;
  title: string;
  /** 1回目・2回目・3回目以降の正解でもらえるピカラット */
  picarat: [number, number, number];
  question: string;
  figure: FigureId;
  answer: PuzzleAnswer;
  /** ヒントは 1 つにつき ひらめきコイン 1 まい */
  hints: string[];
  /** 正解したあとに読める解説 */
  explanation: string;
}

/** マップに置かれた「時計のような物体」。押すとナゾが始まる。 */
export interface PuzzleSpot {
  id: string;
  puzzleId: string;
  /** マップ上の位置（％） */
  x: number;
  y: number;
  /** 何話 読み終えると現れるか */
  requiresCleared: number;
}

/* ---- 進行状況 ---- */

/** セーブ対象のゲーム進行状況 */
export interface GameState {
  /** トータルひらめきしすう（ピカラット） */
  picarat: number;
  /** ひらめきコイン */
  coin: number;
  /** プレイ時間（秒） */
  playSeconds: number;
  /** げんざいち（Place.id） */
  placeId: string;
  /** 行けるようになった場所 */
  openPlaces: string[];
  /** 読み終えたシナリオ */
  clearedScenarios: string[];
  /** みつけたナゾ（一度でも開いたもの） */
  foundPuzzles: string[];
  /** といたナゾ */
  solvedPuzzles: string[];
  /** ナゾごとの まちがえた回数 */
  misses: Record<string, number>;
  /** ナゾごとに 見たヒントの数 */
  hints: Record<string, number>;
  /** 集めた調査メモ */
  notes: Note[];
  /** 集めたチャーム */
  charms: Charm[];
  /** 自由記入メモ */
  memo: string;
}
