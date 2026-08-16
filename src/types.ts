/** アプリ全体で使う型定義 */

import type { ComponentType } from 'react';

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
  name: LocalizedText;
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

/* ---- ことば ---- */

/** 遊ぶ人が選べる言語 */
export type Language = 'ja' | 'en';

/**
 * 画面に出る文字。
 *
 * **ただの文字列を書いてよい。** その場合は、どちらの言語でもそのまま出る。
 * 訳ができたところだけ `{ ja, en }` に書きかえればよく、
 * 未訳のまま混ざっていても動く（「仕組みは全部に、中身は段階的に」）。
 *
 *   name: 'マーサ'                        … 未訳。どちらでもこう出る
 *   name: { ja: 'マーサ', en: 'Martha' }  … 訳あり
 */
export type LocalizedText = string | { ja: string; en?: string };

/** 会話の分かれ道。選ぶと `to` の節へ飛ぶ。 */
export interface DialogueChoice {
  id: string;
  /** 画面に出る選択肢の文言 */
  label: LocalizedText;
  /** 飛び先。同じ会話の中の `label` を指す。 */
  to: string;
  /** 選んだときに手に入るもの */
  gives?: Reward;
}

/** 会話の 1 行 */
export interface DialogueLine {
  /** 話者の Character.id。省略するとナレーション表示 */
  speaker?: string;
  /** 本文 */
  text: LocalizedText;
  /** 話者のポーズ */
  pose?: Pose;
  /**
   * この行から始まる節の名前。
   * `DialogueChoice.to` と `goto` の飛び先になる。
   */
  label?: string;
  /** ここで選択肢を出す。選ぶまで先へ進まない。 */
  choices?: DialogueChoice[];
  /** この行を読んだら、その節へ飛ぶ（分かれ道を合流させるのに使う） */
  goto?: string;
  /** ここで会話を終える（分かれた先が別々に終わるとき） */
  end?: boolean;
}

/** 会話や選択で手に入るもの */
export interface Reward {
  /** ひらめきコイン */
  coin?: number;
  /** 調査メモ */
  note?: Note;
  /** チャーム */
  charm?: Charm;
  /** 行けるようになるエリア */
  unlocks?: string[];
  /** その場で手に入る収集アイテム（Item.id） */
  items?: string[];
}

/** 背景の種類 */
export type BackgroundId =
  | 'highway'
  | 'gate'
  | 'plaza'
  | 'clocktower'
  | 'inn'
  | 'alley'
  | 'river'
  | 'night';

/** 調査メモ 1 件 */
export interface Note {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
}

/** チャーム（お守り） */
export interface Charm {
  id: string;
  name: LocalizedText;
  desc: LocalizedText;
  icon: string;
}

/** シナリオ（1 つの会話イベント） */
export interface Scenario {
  id: string;
  title: LocalizedText;
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
  | 'pin'
  | 'grain'
  | 'ribbon';

/** シーンに散らばっている収集アイテム */
export interface Item {
  id: string;
  name: LocalizedText;
  /** ひとこと添える説明 */
  flavor: LocalizedText;
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
export type BackdropId = 'manhole' | 'noticeboard' | 'room' | 'mill';

/**
 * シーンの背景に使う画像。
 *
 * 絵は基本すべてインライン SVG で描くが、シーンの背景だけは
 * **開発者がプログラムを書きかえて**任意の画像に差しかえられる。
 * 遊ぶ人が選ぶものではない（設定にも出ない）。
 *
 * 素材そのものはリポジトリに置かない（BGM と同じ扱い）。
 * `src` には、自分で用意した画像への URL か、import した中身を書く。
 * 登録簿は `src/data/images.ts`、使いかたは docs/DEVELOPMENT.md。
 */
export interface SceneImage {
  id: string;
  /** 画像の在りか（URL・data URI・import したもの） */
  src: string;
  /** 枠への収めかた。既定は cover（はみ出しても埋める） */
  fit?: 'cover' | 'contain';
  /** 出どころや権利の覚え書き。画面には出ない。 */
  credit?: string;
}

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
 * シーンに置かれた「調べどころ」。
 * 押すと短い文がポップアップで出るだけで、画面は移らない。
 * 棚・飾り・貼り紙など、部屋の中を見てまわるためのもの。
 */
export interface SceneProp {
  id: string;
  /** ポップアップの見出し */
  name: LocalizedText;
  /** ポップアップの本文 */
  text: LocalizedText;
  /** シーンの中での位置（0〜1） */
  x: number;
  y: number;
  /** 押せる範囲の広さ（0〜1。省略すると小さめ） */
  w?: number;
  h?: number;
  /** 一度調べたら手に入る収集アイテム（Item.id） */
  gives?: string;
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
  name: LocalizedText;
  /** どのエリアに属するか（Area.id） */
  areaId: string;
  /** 立っている人たち */
  npcs: Npc[];
  /** 置かれているナゾ */
  puzzles: ScenePuzzle[];
  /** 落ちている収集アイテム */
  sparkles: SceneSparkle[];
  /** 調べると文が出るところ（棚・飾りなど） */
  props?: SceneProp[];
  /** 隣のシーンへの出口 */
  exits: SceneExit[];
  /**
   * 背景を任意の画像に差しかえる（`SceneImage.id`）。
   * 書かなければ、これまでどおり SVG で描いた背景を使う。
   * 画像が読めなかったときも、描いた背景に戻る。
   */
  image?: string;
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
  name: LocalizedText;
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
  | 'timeline'
  | 'water'
  | 'sacks';

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
  title: LocalizedText;
  /** 1回目・2回目・3回目以降の正解でもらえるピカラット */
  picarat: [number, number, number];
  question: LocalizedText;
  figure: FigureId;
  answer: PuzzleAnswer;
  /** ヒントは一つにつきひらめきコイン 1 枚 */
  hints: string[];
  /** ウミガメのスープ形式のときの「はい／いいえ」。無料で開ける。 */
  clues?: Clue[];
  /** 正解したあとに読める解説 */
  explanation: LocalizedText;
}

/* ---- フラグと実績 ---- */

/** フラグの仲間わけ。開発者ツールで並べるときに使う。 */
export type FlagGroup = '本筋' | '探索' | '収集' | 'やりこみ';

/**
 * フラグが立つ条件。
 *
 * **条件は関数ではなく、データとして書く。** 判定は `flags.ts` の
 * `testFlag()` 一か所だけが行う。こうしておくと、
 *
 * - `registry.ts` が「実在しない id を見ている条件」を起動時に見つけられる
 * - 開発者ツールが「どの条件がまだ満たされていないか」を並べられる
 * - 条件のたてかたが増えても、判定の書き場所は一か所のまま
 *
 * 書いた項目は **すべて** 満たされたときに、そのフラグが立つ（AND）。
 * 「どれか一つ」で立てたいときは、フラグを分けて実績側で組み合わせる。
 */
export interface FlagNeeds {
  /** すべて読み終えた会話（Scenario.id） */
  scenarios?: string[];
  /** すべて正解したナゾ（Puzzle.id） */
  puzzles?: string[];
  /** すべて手に入れたアイテム（Item.id） */
  items?: string[];
  /** すべて調べ終えた調べどころ（SceneProp.id） */
  props?: string[];
  /** すべて行けるようになったエリア（Area.id） */
  areas?: string[];
  /** これ以上のひらめき指数（ピカラット） */
  picarat?: number;
  /** ナゾをすべて解いたか */
  allPuzzles?: boolean;
  /** アイテムをすべて集めたか */
  allItems?: boolean;
  /** 会話をすべて読んだか */
  allScenarios?: boolean;
}

/**
 * フラグ 1 本。
 *
 * **フラグの値は保存しない。** いつでも進行状況（`GameState`）から引き直す。
 * 二重に持たないので、片方だけ書きかわって食いちがう、という壊れかたをしない。
 */
export interface FlagDef {
  id: string;
  group: FlagGroup;
  /** 開発者ツールに出す名前 */
  name: LocalizedText;
  /** 何を表すフラグか（開発者向けの覚え書き） */
  note: string;
  needs: FlagNeeds;
}

/**
 * 実績 1 件。
 * `flags` に挙げたフラグが **すべて** 立った瞬間に解放され、
 * 画面の中央上部にしばらく知らせが出る。
 */
export interface Achievement {
  id: string;
  name: LocalizedText;
  desc: LocalizedText;
  /** 一覧と知らせに出す絵文字 */
  icon: string;
  /** 解放の条件になるフラグ（FlagDef.id）。すべて立つと解放。 */
  flags: string[];
  /** 解放するまで名前と説明を伏せる */
  secret?: boolean;
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
  /** 画面に出す言語。既定は日本語。併記はしない。 */
  language: Language;
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

/* ---- アカウント登録（雛形・フロントのみ） ---- */

/**
 * アカウント登録フォームの入力。
 *
 * **サーバーは無い。** 送信先も、保存する場所も用意していない雛形なので、
 * ここに入った値は画面を閉じれば消える（とくにパスワードはどこにも残さない）。
 */
export interface AccountForm {
  username: string;
  email: string;
  password: string;
  /** 確認用。password と一致するかだけを見る。 */
  passwordConfirm: string;
}

/** 入力の項目名。検査の結果を項目ごとに持つときの鍵にする。 */
export type AccountField = keyof AccountForm;

/** 項目ごとの言い分。空なら通っている。 */
export type AccountErrors = Partial<Record<AccountField, LocalizedText>>;

/* ---- ホームページ（ゲームの外） ---- */

/**
 * メインメニューの下に並ぶ、ゲームとは別のホームページ。
 *
 * 遊びの側とはつながっていない「おまけ」で、それぞれ作りも挙動も違う
 * （静かな個人サイト、動く商品ページ、頁を持つポータル）。
 * 一覧は `src/sites/registry.ts`。
 */
export interface SiteDef {
  id: string;
  /** アイコンに添える名前（吹き出しに出る） */
  name: LocalizedText;
  /** どんなサイトか。開発者と、アイコンの吹き出しの両方で使う。 */
  note: LocalizedText;
  /** アイコンの絵 */
  icon: SiteIconId;
  /** 画面いっぱいに出す中身。枠（SiteOverlay）がそのまま描く。 */
  page: ComponentType;
}

/** ホームページのアイコンの絵 */
export type SiteIconId = 'lantern' | 'bounce' | 'disc';

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
  /** 会話の分かれ道で選んだもの（会話 id → 選択肢 id） */
  picks: Record<string, string>;
  /** 調べた「調べどころ」（SceneProp.id） */
  examined: string[];
  /**
   * 解放した実績（Achievement.id）。
   * 条件そのものはフラグから引き直すので、ここに残すのは
   * 「もう知らせを出した」という覚えだけ。
   */
  achievements: string[];
  /** 自由記入メモ */
  memo: string;
}
