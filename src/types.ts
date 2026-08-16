/** アプリ全体で使う型定義 */

/** 画面の種類 */
export type ScreenId =
  | 'scene' // シーン画面。遊びの土台になる画面
  | 'scenario' // シナリオ会話画面
  | 'puzzle' // ナゾ解き画面（シーンの時計を押すと開く）
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
  | 'letter'
  | 'chain'
  | 'pin';

/** シーンに散らばっている収集アイテム */
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
  /** どのエリアで拾ったか（Area.id） */
  areaId: string;
  /** 拾ったときのプレイ時間（秒）。並び順にも使う。 */
  atSeconds: number;
}

/* ---- シーンとエリア ---- */

/**
 * シーンの種類。背景の描きかたと、置いたものの座標の読みかたが変わる。
 *
 * - street  … 道。奥・中・手前の 3 層を別々の速さで動かし、横に見わたせる
 * - view    … 一枚絵。見わたさない。マンホールの底、部屋の中など
 * - closeup … view をさらに寄せた拡大図。周囲を落として一点を見ている感じにする
 */
export type SceneKind = 'street' | 'view' | 'closeup';

/** view・closeup で使う一枚絵の種類 */
export type BackdropId = 'manhole' | 'noticeboard';

/** シーンに立っている人 */
export interface Npc {
  id: string;
  /** どの登場人物か */
  characterId: string;
  /** シーンの中での横位置（0〜1） */
  x: number;
  /** 縦位置（0〜1）。street では使わない（道の上に立つため） */
  y?: number;
  /** 話しかけると始まるシナリオ */
  scenarioId: string;
  /** このシナリオを読み終えるまで現れない */
  requiresScenario?: string;
}

/** シーンに置かれた「時計のような物体」。押すとナゾが始まる。 */
export interface ScenePuzzle {
  id: string;
  puzzleId: string;
  /** シーンの中での横位置（0〜1） */
  x: number;
  /** 縦位置（0〜1）。street では使わない */
  y?: number;
  /** 物体の見た目 */
  look: 'clock' | 'sundial' | 'pocketwatch';
}

/** シーンに落ちているキラキラ。押すとアイテムを拾える。 */
export interface SceneSparkle {
  id: string;
  itemId: string;
  /** シーンの中での横位置（0〜1） */
  x: number;
  /** 縦位置（0〜1。0 が上、1 が下） */
  y: number;
}

/**
 * 出口の向き。
 * far / near / left / right は同じ地面の上での移動、
 * into / back はシーンの重なり（覗きこむ・もどる）を表す。
 */
export type ExitDir = 'far' | 'near' | 'left' | 'right' | 'into' | 'back';

/**
 * 隣のシーンへの出口。
 *
 * street シーンでは靴のアイコンを押したときだけ現れる（見わたす邪魔をしないため）。
 * view・closeup シーンでは、ほかにすることが無いので常に出ている。
 * 行き先が別のエリアのシーンなら、そのままエリアをまたいだことになる。
 */
export interface SceneExit {
  id: string;
  /** 行き先のシーン（Scene.id） */
  to: string;
  dir: ExitDir;
  /** シーンの中での横位置（0〜1） */
  x: number;
  /** 縦位置（0〜1） */
  y: number;
}

/** シーンに共通する中身 */
interface SceneBase {
  id: string;
  /**
   * このシーンだけの名前。
   * 開発者が見分けるためのもので、遊ぶ側にも現在地として出る。
   * 同じエリアの中で重ならないようにする（例「噴水前」「マンホールの底」）。
   */
  name: string;
  /** どのエリアに属するか（Area.id） */
  areaId: string;
  /** 立っている人たち */
  npcs: Npc[];
  /** 置かれているナゾ */
  puzzles: ScenePuzzle[];
  /** 落ちている収集アイテム */
  sparkles: SceneSparkle[];
  /** 隣のシーンへの出口 */
  exits: SceneExit[];
}

/**
 * シーン。背景 1 枚に 1 つ対応する画面。
 *
 * 街の一本道も、マンホールを覗きこんだ図も、掲示板に寄った図も、
 * すべて等しく 1 シーンとして数える。シーンをつなぎ合わせて歩き、
 * エリアの境を越えると、地図上の現在地が隣のエリアへ移る。
 */
export type Scene =
  | (SceneBase & {
      kind: 'street';
      /** 3 層で描く背景 */
      bg: BackgroundId;
      /** 入ってきたときのカメラ位置（0〜1） */
      startX: number;
    })
  | (SceneBase & {
      kind: 'view' | 'closeup';
      /** 一枚絵の背景 */
      backdrop: BackdropId;
    });

/**
 * エリア。地図の上でひとつの単位として扱う区画。
 * いくつかのシーンを束ねる（どのシーンがどのエリアかは Scene.areaId で決まる）。
 */
export interface Area {
  id: string;
  /** 地図と現在地に出す名前 */
  name: string;
  /** ふりがな */
  ruby: string;
  /** 地図上の位置（％） */
  x: number;
  y: number;
  /** そのエリアに地図から入ったとき、最初に立つシーン */
  entrySceneId: string;
  /** このエリアの本筋のシナリオ（進行度の判定に使う） */
  mainScenarioId: string;
  /** 最初から行けるエリアか */
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
  | 'scene.back' // 背景の上、人やナゾより奥
  | 'scene.front' // シーンの何よりも手前
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
  /** street シーンのカメラ位置（0〜1）。見わたさないシーンでは 0。 */
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
  /**
   * 動かすシーンの種類。省略するとどのシーンでも動く。
   * 落ち葉のような屋外のものを、マンホールの底や拡大図で
   * 舞わせないために絞る。
   */
  sceneKinds?: SceneKind[];
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
  /** いま見ているシーン */
  sceneId: string;
  /** そのシーンへ飛ぶ */
  goToScene: (id: string) => void;
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
  /** 現在いるエリア（Area.id） */
  areaId: string;
  /** 最後にいたシーン（Scene.id）。「続きから」でここに戻る。 */
  sceneId: string;
  /** その street シーンでのカメラ位置（0〜1） */
  sceneX: number;
  /** 行けるようになったエリア */
  openAreas: string[];
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
