/** アプリ全体で使う型定義 */

/** 画面の種類 */
export type ScreenId =
  | 'main' // メイン画面（探索マップ / 写真3枚目の下側）
  | 'scenario' // シナリオ会話画面（写真2枚目）
  | 'menu' // メニュー画面（ステータス / 写真1枚目の上側）
  | 'mainMenu'; // メインメニュー（トランク / 写真1枚目の下側）

/** 立ち絵の表示位置 */
export type Side = 'left' | 'right';

/** 立ち絵の表情・ポーズ */
export type Pose = 'normal' | 'think' | 'happy' | 'surprised';

/** 登場人物 */
export interface Character {
  id: string;
  name: string;
  /** 既定の立ち位置 */
  side: Side;
  /** 帽子の種類（立ち絵の描き分けに使用） */
  hat: 'tophat' | 'cap' | 'bonnet' | 'none';
  /** 服の色 */
  coat: string;
  /** 差し色 */
  accent: string;
  /** 肌の色 */
  skin: string;
  /** 髪の色 */
  hair: string;
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

/** シナリオ（1 つの会話イベント） */
export interface Scenario {
  id: string;
  /** ナゾ番号（ナゾじてん用） */
  no: number;
  title: string;
  bg: BackgroundId;
  lines: DialogueLine[];
  /** 読了時の報酬 */
  reward: { picarat: number; coin: number };
  /** 読了時に手に入る調査メモ */
  note?: Note;
  /** 読了時に開放される場所の id */
  unlocks?: string[];
  /** 読了時に手に入るチャーム */
  charm?: { id: string; name: string; desc: string; icon: string };
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
  /** ここで発生するシナリオ id */
  scenarioId: string;
  /** 最初から行ける場所か */
  openFromStart?: boolean;
}

/** チャーム（お守り） */
export interface Charm {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

/** セーブ対象のゲーム進行状況 */
export interface GameState {
  /** とけたナゾの数 */
  solved: number;
  /** みつけたナゾの数 */
  found: number;
  /** トータルひらめきしすう（ピカラット） */
  picarat: number;
  /** ひらめきコイン */
  coin: number;
  /** プレイ時間（秒） */
  playSeconds: number;
  /** げんざいち（Place.id） */
  placeId: string;
  /** 開放済みの場所 */
  openPlaces: string[];
  /** 読了済みシナリオ */
  clearedScenarios: string[];
  /** 集めた調査メモ */
  notes: Note[];
  /** 集めたチャーム */
  charms: Charm[];
  /** 自由記入メモ */
  memo: string;
}
