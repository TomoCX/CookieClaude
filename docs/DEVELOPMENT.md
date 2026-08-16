# 開発者向けドキュメント

『クッキーとクロードのナゾ解き事件簿』を引き継ぐ人のための資料。

- 遊びかたと画面の一覧は [`../README.md`](../README.md)
- 作業のながれと書きかたの決まりは [`../CLAUDE.md`](../CLAUDE.md)
- 開発者モードの使いかたは [`DEV-MODE.md`](DEV-MODE.md)（手を動かす手順つき）
- この文書は **ゲーム上の概念** と、**中身の足しかた** を扱う

---

## 1. ゲーム上の概念

用語を先に決めておく。コードの識別子・画面の文言・この文書は、
すべて次の言葉でそろえてある。**別の言いかたを混ぜないこと。**

| 言葉 | 型 | ひとことで言うと |
| --- | --- | --- |
| **エリア** | `Area` | 地図の上でひとつの単位として扱う区画 |
| **シーン** | `Scene` | 背景 1 枚に 1 つ対応する画面 |
| **出口** | `SceneExit` | シーンとシーンをつなぐ通り道 |
| **会話** | `Scenario` | 立ち絵つきの会話イベント |
| **ナゾ** | `Puzzle` | 物語から独立した一問 |
| **アイテム** | `Item` | シーンに落ちている収集物 |
| **調べどころ** | `SceneProp` | 押すと文が出るところ（棚・飾り）。画面は移らない |
| **登場人物** | `Character` | 絵の指定（色・帽子）。誰がどこに立つかは別 |
| **フラグ** | `FlagDef` | 「いま何が済んでいるか」をひとつの名前で呼べるようにしたもの |
| **実績** | `Achievement` | フラグがそろうと解放される記録。知らせが出て一覧に残る |
| **背景画像** | `SceneImage` | シーンの背景に敷く画像。開発者だけが差しかえる |
| **ホームページ** | `SiteDef` | ゲームの外のおまけ。メニューの下にアイコンで並ぶ |

### 1.1 エリアとシーンの関係

**エリアは背景を持たない。絵を持つのはシーンのほうだけ。**

```
エリア「大門広場」                     ← 地図に立つピン 1 本
  ├ シーン「噴水前」      street       ← 背景 1 枚
  └ シーン「マンホールの底」 view       ← 背景 1 枚
```

- エリアは 1 つ以上のシーンを束ねる（**1 対 N**）
- どのシーンがどのエリアに属するかは、シーン側の `areaId` が決める
  （エリア側にシーンの一覧は持たない。シーンを足すとき 1 か所しか触らずに済むため）
- エリアは `entrySceneId` を 1 つ持つ。地図から入ったときはここに立つ
- **地図に並ぶのはエリアであってシーンではない。** シーンへは歩いて行く

### 1.2 シーンの種類

背景の描きかたと、置いたものの座標の読みかたが変わる。

| kind | 見た目 | 見わたし | 座標 | 例 |
| --- | --- | --- | --- | --- |
| `street` | 奥・中・手前の 3 層パララックス | する | 人とナゾは `x` のみ | 道、広場、食堂 |
| `view` | 一枚絵 | しない | すべて `x` と `y` | マンホールの底、部屋の中 |
| `closeup` | 一枚絵＋周囲を落とす | しない | すべて `x` と `y` | 掲示板の貼り紙、机の上 |

`street` だけが横に長い世界を持つ。手前の層は横幅 300% で、
その中の座標がそのまま「道の 0〜1」になる。画面に見えているのは常にその 1/3。

`view` と `closeup` は画面と 1 対 1 なので、`x` も `y` も見えている絵に対する割合。

`closeup` は `view` に暗い縁取りを足しただけで、仕組みは同じ。
人は立たせない（拡大図に全身が入らないため、`registry.ts` が警告する）。

### 1.3 シーンのつなぎかた

シーンどうしは **出口（`SceneExit`）** でつなぐ。向きは 6 種類。

| dir | 矢印 | 意味 |
| --- | --- | --- |
| `far` | ▲ | 奥へ |
| `near` | ▼ | 手前へ |
| `left` | ◀ | 左へ |
| `right` | ▶ | 右へ |
| `into` | ▼ | 覗きこむ・調べる（マンホール、掲示板） |
| `back` | ▲ | もとのシーンへもどる |

**決まりごと**

- 出口は必ず**行きと帰りの両方**を書く（片道だと詰む。起動時の検査ではじかれる）
- `into` と `back` の行き先は、**同じエリアの中**にする
  （別エリアへ潜ると、現在地が飛んで分かりにくくなる）
- `far` / `near` / `left` / `right` は、同じエリアの中でも別のエリアへでもよい

### 1.4 エリアをまたぐということ

出口の行き先が別のエリアのシーンなら、それだけでエリアを移ったことになる。
特別な仕掛けは無い。

```
scn_gate_front（エリア: gate）
  └ far →  scn_plaza_fountain（エリア: plaza）   ← ここでエリアの境を越えた
```

`App.goToScene()` が行き先のシーンの `areaId` を見て、現在地のエリアを差しかえる。
地図のピンも、画面左上の現在地も、それだけで追従する。

**同じエリアの中の移動と、エリアをまたぐ移動のちがい**

| | 同じエリアの中 | 別のエリアへ |
| --- | --- | --- |
| 矢印に出る名前 | シーン名（「マンホールの底」） | エリア名（「大門広場」） |
| 通れる条件 | 常に通れる | そのエリアが開放済みのときだけ |

つまり **エリアの開放（`openAreas`）は、エリアの境でだけ効く。**
一度エリアに入ってしまえば、その中のシーンは自由に行き来できる。

### 1.5 エリアの開放

- `openFromStart: true` のエリアは、最初から地図に出る
- それ以外は、どこかの会話の `unlocks` に id を書いて開ける
- **両方に書いてはいけない**（同じことを二か所で決めることになる）。
  **どちらにも書かないのもいけない**（永久に行けない）。
  どちらも `registry.ts` が起動時に知らせる

いまの段取り:

| いつ開くか | エリア |
| --- | --- |
| 最初から | 街道の馬車止め・町の入り口・大門広場 |
| 大門広場の本筋（`sc_plaza`）を読むと | 時計塔・まんげつ亭 |
| まんげつ亭の本筋（`sc_inn`）を読むと | 水車小屋 |
| 時計塔の本筋（`sc_clocktower`）を読むと | 裏路地 |

**まだ開いていないエリアは、地図に影も名前も出さない。**
開いた瞬間に初めて姿を現す（`TownMap` が `openAreas` で絞りこむ）。
そのぶん、最初の三つは会話なしで自由に行き来できるようにしてある
（遊びはじめに行き先が一つしか無いと、地図を開く意味が無いため）。

### 1.6 画面の重なり

```
     地図（MapOverlay）              ← エリアを選んで飛ぶ。かぶせて出す
        ↑
   ┌────┴──────────────────────┐
   │  シーン画面（SceneScreen）  │   ← 遊びの土台。常にここに戻る
   └────┬──────────────────────┘
        ├ 人をクリック   → 会話（ScenarioScreen）
        ├ ナゾをクリック → ナゾ解き（PuzzleScreen）
        └ 矢印をクリック → 別のシーン
        ↓
  メインメニュー（MainMenuScreen）   ← かぶせて出す
```

会話とナゾ解きだけはシーンと入れ替わる（`ScreenId` が切りかわる）。
地図とメインメニューはシーンの上にかぶさるだけなので、
裏でシーンは生きたまま（カメラ位置も保たれる）。

### 1.7 会話の分かれ道

行に `choices` を書くと、そこで止まって選択肢が出る。
選ぶと `to` の指す**節**（`label` を付けた行）へ飛び、`goto` で合流できる。

```ts
// 分かれ道を出す行
{ speaker: 'claude', text: '——ひとつ、うかがってもよろしいか。',
  choices: [
    { id: 'ch_a', label: '売れ残った品について聞く', to: 'goods',
      gives: { coin: 2, note: { /* この道でだけ手に入るメモ */ } } },
    { id: 'ch_b', label: '丘の道について聞く', to: 'road',
      gives: { coin: 2, note: { /* もう一方の道のメモ */ } } },
  ] },

// 分かれた先。読み終えたら合流する。
{ label: 'goods', speaker: 'toby', text: '……', goto: 'merge' },
{ label: 'road',  speaker: 'toby', text: '……', goto: 'merge' },
{ label: 'merge', speaker: 'cookie', text: '書き留めておきますね。' },
```

- `gives`（`Reward`）で、コイン・調査メモ・チャーム・エリアの開放・
  アイテムが**その道を選んだときだけ**手に入る
- 選んだことは `GameState.picks` に残る
- `end: true` を書くと、その行で会話を終える（別々に終わらせたいとき）

**検査が見ているもの**（`registry.ts`）: 飛び先の節があるか、節の名前が重なって
いないか、**どこからも来られない節**が無いか、`gives` の参照が実在するか。

### 1.8 調べどころ（`SceneProp`）

棚や飾りのように、**押すと文が出るだけ**のもの。シーンは移らない。

```ts
props: [
  { id: 'prp_desk_vase', name: '青い壺', text: '……', x: 0.74, y: 0.28,
    w: 0.12, h: 0.16, gives: 'it_quill' },
],
```

`gives` を書くと、初めて調べたときに品が手に入る。
調べたことは `GameState.examined` に残るので、二度は手に入らない。

### 1.9 フラグと実績

**フラグ（`FlagDef`）** は、「いま何が済んでいるか」をひとつの名前で呼べるように
したもの。**実績（`Achievement`）** は、フラグがそろったときに解放される記録で、
画面の中央上部に数秒だけ知らせが出て、メインメニューの「実績」に残る。

```
進行状況（GameState）
   ↓ 引き直す（保存しない）
フラグ  fl_alibi「三十分の空白を知った」  ●
   ↓ すべて立つと
実績    ac_alibi  →  知らせが出る ＋ 一覧に残る
```

**保守のために決めていること**（`src/data/flags.ts`）

1. **フラグの値は保存しない。** いつでも `GameState` から引き直す。
   セーブに旗の一覧を持つと、旗と中身が食いちがう壊れかたをするため
2. **条件は関数ではなくデータで書く。** `needs` に「どの id を見るか」を並べ、
   判定は `testNeeds()` 一か所だけが行う
3. だから **`registry.ts` が実在しない id を起動時に見つけられる**し、
   開発者ツールが「どの条件がまだ満たされていないか」を並べられる

```ts
// src/data/flags.ts
{
  id: 'fl_mill_searched',
  group: '探索',                 // 本筋 / 探索 / 収集 / やりこみ
  name: '水車小屋を調べつくした',   // 開発者ツールに出る名前
  note: '水車小屋の中の調べどころを三つとも見た',
  needs: { props: ['prp_mill_wheel', 'prp_mill_sacks', 'prp_mill_coat'] },
}
```

`needs` に書けるもの（**書いたものがすべて満たされて立つ**。AND）:

| 項目 | 意味 |
| --- | --- |
| `scenarios` | すべて読み終えた会話 |
| `puzzles` | すべて正解したナゾ |
| `items` | すべて手に入れたアイテム |
| `props` | すべて調べ終えた調べどころ |
| `areas` | すべて開放されたエリア |
| `picarat` | これ以上のひらめき指数 |
| `allPuzzles` / `allItems` / `allScenarios` | 全部そろえたか |

「どれか一つで立てたい」ときは、**フラグを分けて実績側で組み合わせる**
（実績は挙げたフラグが全部立ったときに解放されるので、逆は実績を分ければよい）。

実績のほうは条件を持たない。持つのはフラグで、実績が書くのは組み合わせだけ。

```ts
// src/data/achievements.ts
{
  id: 'ac_miller',
  name: { ja: '水車小屋の主', en: 'Keeper of the Mill' },
  desc: { ja: '粉屋ネルの話を聞き、小屋の中も残らず調べた。', en: '…' },
  icon: '🌾',
  flags: ['fl_miller_heard', 'fl_mill_searched'],  // 二本そろって解放
  // secret: true,   // 解放するまで名前も説明も伏せる
}
```

`GameState.achievements` に残るのは **「もう知らせを出した」という覚えだけ**。
解放しているかどうかは、そのつどフラグから引き直す（`state/achievements.ts`）。
遊びはじめの時点で満たしているぶんは、知らせを出さずに静かに記録する
（`seedAchievements`）。実績を足す前のセーブから続けても、知らせが何枚も
まとめて出ることがない。

### 1.10 シーンの背景を画像に差しかえる

絵は基本すべてインライン SVG で描くが、**シーンの背景だけは任意の画像を使える**。
遊ぶ人が選ぶものではなく、**開発者がプログラムを書きかえる**前提の仕組み。

- 素材そのものはリポジトリに置かない（BGM と同じ扱い）
- 既定は今までどおり描いた背景。`Scene.image` を書いたシーンだけが差しかわる
- **画像が読めなければ、描いた背景に戻る**（真っ黒にならない）

```ts
// 1) src/data/images.ts の SCENE_IMAGES に登録する
{ id: 'img_mill_inside', src: millPhoto, credit: '撮影: ???' }

// 2) src/data/scenes.ts の、そのシーンに一行
{ id: 'scn_mill_inside', kind: 'view', backdrop: 'mill',
  image: 'img_mill_inside', /* … */ }
```

| kind | 用意する画像 | 動き |
| --- | --- | --- |
| `street` | 横長の一枚（画面 3 枚分の幅） | 手前の層と同じ速さで動く。座標はそのまま通じる |
| `view` / `closeup` | 画面と同じ比率の一枚 | 動かない |

`src` には URL でも、`src/assets/` に置いて import したものでも書ける。
いま入っている `img_mill_inside` は、素材を置かずに仕組みを通すための**見本**で、
SVG を data URI にしてある。本物を使うときは `src` ごと差しかえる。

### 1.11 ゲームの外（ホームページとアカウント）

遊びとは関係のない、**おまけの二つ**。どちらも進行状況（`GameState`）に
一切さわらないので、消してもゲームは動く。

**ホームページ（`src/sites/`）**

メインメニューのいちばん下に、アイコンだけが小さく並ぶ。押すと画面いっぱいに
そのサイトが開き、「ゲームに戻る」か `Escape` で戻る。

| サイト | 手本 | 挙動 |
| --- | --- | --- |
| 楓花幻燈団 | 古風な個人サイト | 押すと中身が入れかわるだけ。動きは持たない |
| BOUNCE | 一枚ものの商品ページ | 下へ送ると現れる。配色をその場で変える |
| RE:PRESS RECORDS | レーベルのポータル | 中に頁があり、買い物かごを持つ |

**三つとも作りを変えてある**のがこの部屋の趣旨で、共有しているのは
「ゲームに戻る」の細い帯（`SiteOverlay`）だけ。どれも実在するサイトの
作りを手本にした習作で、名前も中身も架空のもの。

```
src/sites/
├── registry.ts      一覧（id・名前・アイコン・中身）。足すときはここへ一行
├── SiteOverlay.tsx  画面いっぱいにかぶせる枠。中身には手を出さない
├── SiteIcon.tsx     メニューに並ぶ小さなアイコン
├── pages/           サイトごとの中身（1 サイト 1 ファイル）
└── data/            中身の多いサイトのぶんだけ、画面と分けてある
```

**アカウント登録（`src/screens/panels/AccountPanel.tsx`）**

メインメニューの「アカウント」。**画面だけの雛形で、サーバーは無い。**
押しても送信されず、入力もどこにも残らない（とくにパスワードは控えない）。

検査の規則は `src/state/account.ts` に分けてある。あとで本物の登録を
つなぐときに、**差しかわるのは `submit` の中の一行だけ**で済む形にしてある。

### 1.12 進行状況（`GameState`）

セーブされるのはこれだけ。画面の状態は入らない。

| 項目 | 意味 |
| --- | --- |
| `areaId` | いまいるエリア |
| `sceneId` | 最後にいたシーン。「続きから」でここに戻る |
| `sceneX` | その street シーンでのカメラ位置（0〜1） |
| `openAreas` | 行けるようになったエリア |
| `clearedScenarios` | 読み終えた会話 |
| `foundPuzzles` / `solvedPuzzles` | 見つけたナゾ／解いたナゾ |
| `misses` / `hints` | ナゾごとの誤答数・見たヒント数 |
| `notes` / `charms` / `collected` | 手に入れたもの |
| `picks` | 会話の分かれ道で選んだもの |
| `examined` | 調べ終えた「調べどころ」 |
| `achievements` | 知らせを出しおえた実績（解放の判定そのものはフラグから引く） |
| `picarat` / `coin` / `playSeconds` / `memo` | 数値とメモ |

状態を変える関数は `src/state/gameState.ts` の `apply*` に集めてある。
すべて**新しい状態を返す**（元の値は書きかえない）。

**自動保存**: 進行が変わると 0.8 秒後に `localStorage` へ書く（`App.tsx`）。
プレイ時間は毎秒変わるので、保存の合図には使っていない。
メインメニューの「セーブ」は残してあるが、押さなくても消えない。

---

## 2. ディレクトリと責任の分担

```
src/
├── App.tsx            画面の出し分けと進行状況。絵は持たない
├── types.ts           型はすべてここ。ほかのファイルで型を定義しない
├── data/              中身。ここだけで完結させ、画面側に埋めこまない
│   ├── scenarios/     会話。エリアごとにファイルを分ける
│   ├── flags.ts       フラグの定義と判定（条件はデータで書く）
│   ├── achievements.ts 実績。フラグの組み合わせだけを持つ
│   └── images.ts      シーンの背景に使う画像の登録簿
├── i18n/              ことばの切りかえ（text.ts）と UI の文言（ui.ts）
├── screens/           画面まるごと
│   └── panels/        メインメニューを開いた中に出るもの
├── components/        画面をまたいで使う部品
├── hooks/             状態と時間が絡むもの（カメラなど）
├── effects/           canvas に描くエフェクト
├── dev/               開発者モード。遊びの側から切り離す
├── sites/             ゲームの外のホームページ。遊びの側とつながらない
├── state/             進行状況・セーブ・設定・入力の検査
├── audio/             Web Audio API による合成音
└── styles/            画面ごとの素の CSS
```

**ことばの扱い**

画面に出る文字は `LocalizedText`。**ただの文字列を書いてよく**、
訳ができたところだけ `{ ja, en }` にする（未訳が混ざっていても動く）。
画面側は `useText()` の `t(...)` を通して出す。
ボタンや見出しの文言は `src/i18n/ui.ts` にまとめてある。

**守っている境目**

- `data/` は React を知らない（ただのデータと、id で引く関数だけ）
- `screens/` と `components/` は進行状況を書きかえない（`on*` で親に知らせる）
- `App.tsx` だけが `setState` を持つ
- `dev/` は遊びの側に何も足さない。`screens/` と `components/` は `dev/` を import しない。
  つなぎ目は `App` だけ（`<DevTools api={...} />` と、メインメニューへ渡す出入りの手）
- `sites/` も同じ扱い。ゲームの中身（`data/`）も進行状況（`GameState`）も見ない。
  つなぎ目は `App`（`<SiteOverlay />`）と、メインメニューのアイコン一列だけ

---

## 3. 中身の足しかた

**書きまちがえは起動時に見つかる。** `src/data/registry.ts` が id のつながりを
通しで検査し、問題があればコンソールに並べる。
開発者モード（`Ctrl + Shift + D`）の「検査」でも同じものが読める。

検査は観点ごとの関数（`checkIds` / `checkAreas` / `checkScenes` / `checkExits` …）に
分けてある。増やすときは、いちばん近い観点の関数に一行足すか、
新しい観点なら関数を作って `CHECKS` の並びに加える。

### 3.1 id の付けかた

| もの | 形 | 例 |
| --- | --- | --- |
| エリア | 素の語 | `plaza` |
| シーン | `scn_<エリア>_<場所>` | `scn_plaza_manhole` |
| 会話 | `sc_*` | `sc_plaza_lily` |
| ナゾ | `pz_*` | `pz_lamps` |
| アイテム | `it_*` | `it_chain` |
| 登場人物 | 素の語 | `martha` |
| 立っている人 | `npc_*` | `npc_martha` |
| ナゾの置き場 | `pzs_<シーン>_<番号>` | `pzs_plaza_1` |
| キラキラ | `skl_<シーン>_<番号>` | `skl_manhole_2` |
| 調べどころ | `prp_<シーン>_<もの>` | `prp_mill_coat` |
| 出口 | `ex_<from>_<to>` | `ex_plaza_manhole` |
| エフェクト | `fx_*` | `fx_leaves` |
| フラグ | `fl_*` | `fl_mill_searched` |
| 実績 | `ac_*` | `ac_miller` |
| 背景画像 | `img_*` | `img_mill_inside` |

会話は `sc_`、シーンは `scn_` と、**一文字ちがうので注意**。

### 3.2 シーンを足す

いちばんよくやる作業。既存のエリアにシーンを 1 枚足す場合。

1. `src/data/scenes.ts` の `SCENES` に `Scene` を追加する
   - `areaId` に属するエリアの id
   - `name` は**そのエリアの中で重ならない固有名**（現在地に出る）
   - `kind` を選ぶ。`street` なら `bg` と `startX`、それ以外は `backdrop`
2. **つなぎ元のシーンに出口を足す**（`into` や `far` など）
3. **新しいシーンに戻り道の出口を足す**（`back` や `near` など）
4. ブラウザのコンソール（または開発者モードの「検査」）を見る

新しい一枚絵が要るときは、`src/types.ts` の `BackdropId` と
`src/components/ViewBackdrop.tsx` に足す。

### 3.3 エリアを足す

1. `src/data/areas.ts` の `AREAS` に `Area` を追加（地図の `x` / `y` と `entrySceneId`）
2. `src/data/scenes.ts` にそのエリアのシーンを 1 枚以上追加（`areaId` を合わせる）
3. 隣のエリアのシーンと出口でつなぐ（行き帰り両方）
4. どこかの会話の `unlocks` に新しいエリアの id を入れて開放する
5. 3 層の背景を増やすときは `BackgroundId` と
   `src/components/StreetBackdrop.tsx`・`Background.tsx` に足す

### 3.4 会話を足す

1. `src/data/scenarios/<エリア>.ts` に `Scenario` を追加
   （`kind` は `'main'` か `'flavor'`）
2. `src/data/scenes.ts` の `npcs` に、その会話を持つ人を並べる
   （`requiresScenario` を書くと、その会話のあとに現れる）
3. 分かれ道を入れるなら 1.7 の形で。新しいエリアを作ったときは
   `src/data/scenarios/index.ts` に import を一行足す

`note` / `charm` / `unlocks` を書いておくと、読了時に自動で増える。
本筋を足したときは `src/data/story.ts` の `STORY_BEATS` にも一行。

### 3.5 ナゾを足す

1. `src/data/puzzles.ts` の `PUZZLES` に一問追加
   （`answer` は number / choice / text / order / grid。`hints` と `explanation` は必須）
2. `src/data/scenes.ts` の `puzzles` に置き場を足す
3. 新しい図は `FigureId` と `src/components/PuzzleFigure.tsx` へ

**ナゾは形式を散らすこと。** 数値入力ばかりに寄せない。

### 3.6 アイテムを足す

1. `src/data/items.ts` の `ITEMS` に追加（`name` / `flavor` / `icon`）
2. `src/data/scenes.ts` の `sparkles` に落ちている場所を足す
3. 新しい絵は `ItemIcon` と `src/components/ItemIcon.tsx` へ

### 3.7 調べどころを足す

1. `src/data/scenes.ts` の、そのシーンの `props` に一つ追加
2. 座標は開発者モードの「配置」で拾う（`w` / `h` は押せる範囲の広さ）
3. 品を置くなら `gives` にアイテムの id

### 3.8 背景を画像に差しかえる

1. 画像を用意する（**リポジトリには置かない**。URL を指すか、
   各自で `src/assets/` に置いて import する）
2. `src/data/images.ts` の `SCENE_IMAGES` に `SceneImage` を一つ足す
3. `src/data/scenes.ts` の、そのシーンに `image: 'img_???'` と一行足す

`street` は横長の一枚（画面 3 枚分の幅）、`view` / `closeup` は画面と同じ比率。
読めなかったときは描いた背景に戻る（コンソールにも出る）。詳しくは 1.10。

### 3.9 フラグを足す

1. `src/data/flags.ts` の `FLAGS` に一つ足す（`group` / `name` / `note` / `needs`）
2. `needs` には **id を並べるだけ**。判定は書かない（1.9 の表を参照）
3. 起動時の検査で、実在しない id を見ていないか確かめる

**フラグは進行状況から引き直すだけのもの。** 立てる／降ろすという操作は無く、
条件になっている中身のほうが満たされれば、自然に立つ。

### 3.10 実績を足す

1. まず条件をフラグにする（3.9）。すでにあるフラグを使ってもよい
2. `src/data/achievements.ts` の `ACHIEVEMENTS` に一つ足す
3. `flags` に並べたフラグが **すべて** 立つと解放される
4. 隠したいものは `secret: true`（解放するまで名前も説明も伏せる）

画面側には手を入れなくてよい。知らせも一覧も、この並びを読むだけになっている。

> **検査**: どの実績からも見られていないフラグがあると、起動時に知らせが出る。
> 使い道の無いフラグを置き去りにしないため。

### 3.11 ホームページを足す

ゲームの外のおまけ。遊びの側とはつながらないので、`src/data/` は触らない。

1. `src/sites/pages/` に一つ書く（中身が多いなら `src/sites/data/` に分ける）
2. `src/styles/site-<名前>.css` を作り、`src/styles/index.css` に一行足す
3. `src/sites/registry.ts` の `SITES` に一行足す（アイコンは `SiteIcon.tsx`）

画面側には手を入れなくてよい。メインメニューの下のアイコン列は、
この一覧をそのまま並べているだけ。

**作りは互いに変えること。** いまの三つは「動かない／動きが中身／頁を持つ」と
役わりを分けてある。四つめを足すなら、また別の型にする。

### 3.12 エフェクトを足す

1. `src/effects/sketches/` に `create???(): EffectSketch` を書く（`setup` / `draw`）
2. `src/effects/registry.ts` の `EFFECTS` に一行足す
   - `slot` で差しこむ場所が決まる
   - `sceneKinds` を書くと、その種類のシーンだけで動く
     （落ち葉を `['street']` にして、マンホールの底で舞わせないなど）

画面側には手を入れなくてよい。詳しくは README の「エフェクト」。

---

## 4. 実例：エリアをまるごと一つ足す

**実際に足した「水車小屋」を、そのままの順で書き起こした手順書。**
シーン 2 枚・ナゾ 2 問・アイテム 2 個・会話 2 本・人物 1 人・背景画像 1 枚が
どうつながるかを、一周たどれるようになっている。
`git log` で `水車小屋` のコミットを見れば、ここに書いた差分がそのまま出る。

> 一つ足すだけなら 3.2〜3.7 のほうが早い。ここはエリアという **いちばん大きい単位**
> を足すときの通し手順で、触るファイルが 12 か所に散る。順番に意味があるので、
> **上から順にやること**（先に型を通しておかないと、検査の警告が読みにくくなる）。

### 4-0. 決めておくこと

書きはじめる前に、この 5 つだけ決めておく。あとから変えると id を直して回ることになる。

| 決めること | 水車小屋の場合 |
| --- | --- |
| エリアの id と名前 | `mill` ／ 水車小屋 |
| シーンの構成 | 屋外 `scn_mill_yard`（street）＋ 屋内 `scn_mill_inside`（view） |
| どこからつなぐか | 時計塔の足もと ↔ 水車小屋の前（`far` / `near`） |
| いつ開くか | まんげつ亭の本筋 `sc_inn` を読んだとき |
| 物語での役わり | 「塔の歯車の出どころ」。犯人が子どもだと絞りこむ材料 |

**いつ開くかは物語の順序で決める。** 手がかりの出る順に開かないと、
先に真相へ届いてしまう。

### 4-1. 型を先に増やす（`src/types.ts`）

新しい絵が要るぶんだけ、先に共用体へ足しておく。ここを飛ばすと、
このあとの `src/data/` がぜんぶ型エラーになって読みにくい。

```ts
export type BackgroundId = … | 'river' | 'night';   // 屋外の 3 層背景
export type BackdropId   = … | 'mill';              // 屋内の一枚絵
export type FigureId     = … | 'water' | 'sacks';   // ナゾに添える図
export type ItemIcon     = … | 'grain' | 'ribbon';  // アイテムの絵
```

### 4-2. 絵を描く（4 ファイル）

型に足した名前ごとに、描く先が決まっている。**外部の画像素材は使わない。**

| 足した名前 | 描く場所 |
| --- | --- |
| `BackgroundId: 'river'` | `components/StreetBackdrop.tsx`（`PALETTES` に色 ＋ 中の層に水車小屋）と `components/Background.tsx`（会話画面の背景） |
| `BackdropId: 'mill'` | `components/ViewBackdrop.tsx` に `Mill()` を足し、分岐に一行 |
| `FigureId` 2 つ | `components/PuzzleFigure.tsx` に一つずつ |
| `ItemIcon` 2 つ | `components/ItemIcon.tsx` に一つずつ |

`StreetBackdrop` は屋外を建物の列で埋めるので、町の外のエリアでは
並木のほうへ振り分ける（`bg === 'highway' || bg === 'river'` の判定）。

### 4-3. 登場人物を足す（`src/data/characters.ts`）

```ts
nell: { id: 'nell', name: 'ネル', side: 'left', hat: 'bonnet',
        coat: '#8a9a6d', accent: '#5c6b45', skin: '#f2d3b0', hair: '#a8763f' },
```

立ち絵は色と帽子の指定だけで組み上がる。**どこに立つかはシーン側**（4-7）。

### 4-4. アイテムを足す（`src/data/items.ts`）

```ts
{ id: 'it_grain',  name: 'ひとつかみの麦', flavor: '…', icon: 'grain' },
{ id: 'it_ribbon', name: '緑の髪ひも',     flavor: '…', icon: 'ribbon' },
```

置き場所はまだ書かない。**同じアイテムを二か所に置くと検査ではじかれる**ので、
「落ちている（`sparkles`）」か「調べて手に入る（`props.gives`）」のどちらかに決める。
ここでは麦を屋外のキラキラ、髪ひもを屋内の調べどころにした。

### 4-5. ナゾを足す（`src/data/puzzles.ts`）

```ts
{ id: 'pz_wheel', no: 11, title: '回りつづけるもの', figure: 'water',
  answer: { kind: 'text', accept: ['水車', 'すいしゃ', …], placeholder: '答えを入力' }, … },
{ id: 'pz_sacks', no: 12, title: '四つの麦袋', figure: 'sacks',
  answer: { kind: 'order', items: ['小麦の袋', '大麦の袋', 'そばの袋', 'ライ麦の袋'],
            correct: [1, 3, 0, 2] }, … },
```

- `no` は事典に並ぶ番号。**重複させない**（検査が見ている）
- **形式を散らす。** 既にあるものを数えてから選ぶ
  （このときは数値入力 3・選択 4・言葉 1・並べかえ 1・ます目 1 だったので、
  少ないほうの「言葉」と「並べかえ」にした）
- `order` の `correct` は **`items` の番号を正しい順に並べたもの**。
  上の例は「大麦(1) → ライ麦(3) → 小麦(0) → そば(2)」
- `hints` は 3 本、`explanation` は必ず書く

### 4-6. 会話を足す（`src/data/scenarios/mill.ts` ＋ `index.ts`）

エリアごとにファイルを分けてあるので、**新しいファイルを一つ作る**。

```ts
// src/data/scenarios/mill.ts
export const MILL_SCENARIOS: Scenario[] = [
  { id: 'sc_mill',      title: '川ぞいの水車小屋', bg: 'river', kind: 'main',   coin: 4,
    note: { id: 'note_gear_source', title: '歯車の出どころ', body: '…' }, lines: [ … ] },
  { id: 'sc_mill_toby', title: '川ぞいの荷車',     bg: 'river', kind: 'flavor', coin: 2,
    lines: [ … ] },
];
```

```ts
// src/data/scenarios/index.ts に 2 行
import { MILL_SCENARIOS } from './mill';
export const SCENARIOS: Scenario[] = [ …, ...MILL_SCENARIOS, … ];
```

**並べる順は物語の順**にしておく（`MAIN_SCENARIOS` がそのまま進行度になる）。

### 4-7. シーンを 2 枚足す（`src/data/scenes.ts`）

屋外（見わたす）と屋内（一枚絵）で、書く項目が変わる。

```ts
{ id: 'scn_mill_yard', name: '水車小屋の前', areaId: 'mill',
  kind: 'street', bg: 'river', startX: 0.06,
  npcs: [ { id: 'npc_nell', characterId: 'nell', x: 0.28, scenarioId: 'sc_mill' },
          { id: 'npc_toby_mill', …, requiresScenario: 'sc_mill' } ],  // 本筋のあとに現れる
  puzzles:  [ { id: 'pzs_mill_1', puzzleId: 'pz_wheel', x: 0.56, look: 'sundial' } ],
  sparkles: [ { id: 'skl_mill_1', itemId: 'it_grain', x: 0.17, y: 0.72 } ],
  exits: [ { id: 'ex_mill_tower',  to: 'scn_tower_foot',   dir: 'near', x: 0.06, y: 0.83 },
           { id: 'ex_mill_inside', to: 'scn_mill_inside',  dir: 'far',  x: 0.42, y: 0.46 } ] },

{ id: 'scn_mill_inside', name: '水車小屋の中', areaId: 'mill',
  kind: 'view', backdrop: 'mill', image: 'img_mill_inside',   // ← 背景画像（4-9）
  npcs: [], sparkles: [],
  puzzles: [ { id: 'pzs_mill_2', puzzleId: 'pz_sacks', x: 0.44, y: 0.62, look: 'pocketwatch' } ],
  props:   [ …, { id: 'prp_mill_coat', …, x: 0.47, y: 0.32, gives: 'it_ribbon' } ],
  exits:   [ { id: 'ex_inside_mill', to: 'scn_mill_yard', dir: 'near', x: 0.5, y: 0.9 } ] },
```

そして **つなぎ元にも出口を足す**。ここを忘れると片道になって検査ではじかれる。

```ts
// scn_tower_foot の exits に一行
{ id: 'ex_tower_mill', to: 'scn_mill_yard', dir: 'far', x: 0.62, y: 0.46 },
```

座標は目分量で書かない。**開発者モードの「配置」でクリックして拾う**
（[DEV-MODE.md](DEV-MODE.md) の 2 章）。

### 4-8. エリアを足して、開く道をつくる

```ts
// src/data/areas.ts
{ id: 'mill', name: '水車小屋', ruby: 'すいしゃごや', x: 56, y: 10,
  entrySceneId: 'scn_mill_yard', mainScenarioId: 'sc_mill' },
```

```ts
// src/data/scenarios/inn.ts — 開ける側の会話に一行
unlocks: ['mill'],
```

`openFromStart` と `unlocks` は **どちらか一方だけ**（1.5）。
開放を足したら、その会話に **なぜそこへ行くのかを話す行**も足しておく
（このときはギアじいさんに「歯車は川ぞいの水車小屋にある」と言わせた）。
行き先だけ増えて理由が無いと、地図に見知らぬピンが生えたようにしか見えない。

### 4-9. 背景を画像に差しかえる（`src/data/images.ts`）

```ts
{ id: 'img_mill_inside', src: /* URL か import した画像 */, credit: '…' }
```

シーン側に `image: 'img_mill_inside'` と書けば差しかわる（1.10）。
**素材はリポジトリに置かない。** いま入っているのは見本で、読めなければ
4-2 で描いた `Mill()` に戻る。

### 4-10. 物語まわりに反映する（`src/data/story.ts`）

```ts
STORY_BEATS … { id: 'beat_mill', afterScenario: 'sc_mill', heading: '…', body: '…' }
CAST        … { id: 'nell', name: 'ネル', role: '川ぞいの粉屋', from: 'sc_mill' }
```

本筋を足したら `STORY_BEATS` に一行。**並べる順は物語の順**。

### 4-11. フラグと実績を足す

新しい中身は、たいてい「済んだかどうか」を呼びたくなる。3.9 と 3.10 の手順で。

```ts
// src/data/flags.ts
{ id: 'fl_miller_heard',  group: '本筋', …, needs: { scenarios: ['sc_mill'] } },
{ id: 'fl_mill_searched', group: '探索', …, needs: { props: ['prp_mill_wheel', …] } },
{ id: 'fl_mill_puzzles',  group: 'やりこみ', …, needs: { puzzles: ['pz_wheel', 'pz_sacks'] } },

// src/data/achievements.ts
{ id: 'ac_miller', …, flags: ['fl_miller_heard', 'fl_mill_searched'] },
```

エリアが増えたぶん、**既にあるフラグの中身も見直す**
（`fl_whole_town` の `areas` に `mill` を足す、など）。ここは検査では拾えない。

### 4-12. 確かめる

```bash
bun run typecheck
bun run build
bun run dev        # ブラウザで開く
```

1. **「検査」タブが「問題なし」** と言うまで直す。よく出るのは
   「戻り道が無い」「アイテムが二か所で手に入る」「置かれていないナゾ」
2. 「中身へ飛ぶ」で新しいシーン 2 枚に飛び、絵と置き場所を見る
3. **歩いて行けるか**を試す。地図から時計塔 → 靴 → 奥へ → 水車小屋
4. ナゾを 2 問とも解く。答えの判定と解説を確かめる
5. 「フラグ」タブで新しいフラグが順に立つのを見る
6. コンソールにエラーも警告も出ていないこと

### 4-13. 触ったファイルの一覧

一周すると、これだけ動く。**この 12 か所より外は触らない**
（画面側に中身を書かない、という決まりが守れているかの目安になる）。

| ファイル | 何を足したか |
| --- | --- |
| `src/types.ts` | 背景・一枚絵・図・アイコンの名前 |
| `components/StreetBackdrop.tsx` | 屋外の色と、中の層の水車小屋 |
| `components/Background.tsx` | 会話画面の川ぞいの背景 |
| `components/ViewBackdrop.tsx` | 屋内の一枚絵 `Mill()` |
| `components/PuzzleFigure.tsx` | ナゾの図 2 つ |
| `components/ItemIcon.tsx` | アイテムの絵 2 つ |
| `data/characters.ts` | 粉屋ネル |
| `data/items.ts` | 麦・髪ひも |
| `data/puzzles.ts` | ナゾ 2 問 |
| `data/scenarios/mill.ts` ＋ `index.ts` | 会話 2 本 |
| `data/scenes.ts` | シーン 2 枚 ＋ つなぎ元の出口 |
| `data/areas.ts` ／ `scenarios/inn.ts` | エリアと、開く道 |
| `data/images.ts` | 背景画像の登録 |
| `data/story.ts` ／ `flags.ts` ／ `achievements.ts` | 物語・フラグ・実績 |

---

## 5. 開発者モード

入りかたは三つ。

- メインメニューの **開発**（トランクの二段目。入っていると灯る）
- `Ctrl + Shift + D`
- URL に `?dev=1`（`?dev=0` で出る）

| 欄 | 使いどころ |
| --- | --- |
| 検査 | 中身を足しながら開きっぱなしにしておく |
| 中身へ飛ぶ | 書いたシーン・会話・ナゾを、歩かずに確かめる |
| **配置** | シーンをクリックして座標を読みとり、貼れる一行にする |
| ひな型 | 書き始めの骨組みを写す |
| 状態 | 進行の途中からしか出ない画面を確かめる |
| **フラグ** | 旗の立ち／未立ちと、残っている条件。実績の解放もここから試す |
| エフェクト | どの差しこみ口に何が入っているか |

**「配置」がいちばん時間を節約する。** 座標を目分量で書く必要がなくなる。
`street` シーンでは人とナゾの `y` を省いた行が、
`view` / `closeup` では `y` 付きの行が出る（種類を見て切りかえている）。

---

## 6. 完了とみなす条件

`main` にマージする前に必ず通す。

```bash
bun run typecheck   # tsc --noEmit
bun run build       # dist/ へのバンドル
```

画面まわりを変えたときは、実際にブラウザで見る
（`bun run dev` → Playwright ＋ `/opt/pw-browsers/chromium`）。
コンソールにエラーも警告も出ていないこと。

---

## 7. 過去にはまった落とし穴

同じところで転ばないように残しておく。

| 症状 | 原因 |
| --- | --- |
| 3 層の背景がずれる | `translateX(%)` は**要素自身の幅**に対する割合。幅 L% の層が端から端まで動く量は `(L-100)/L` |
| 人やナゾが押せない | `pointerdown` で `setPointerCapture` すると click の宛先を奪う。しきい値を超えてから捕まえる |
| CSS が効かない | `background` の一括指定が `background-image` を打ち消す。`background-color` と分けて書く |
| 会話から戻ると見わたし位置が戻る | シーン画面は会話中に外される。カメラ位置は `App` の `scenePos` に預ける |
| ナゾが初回から「解決済み」 | 正解で `state` が変わるため、開いた時点の値を `useState` で凍らせる |
| エフェクトを切っても絵が残る | ループを止めるだけでは最後のコマが残る。`canvas` を一度消す |
| 現在地とシーンが食いちがう | 古いセーブ。`healSave()` がエリアから引き直す |
| 開発者モードの目じるしが 1/3 ずれる | 見わたさないシーンは画面と 1 対 1。カメラ位置ではなく `center=0.5` / `view=1` を渡す |
| 窓の listener が毎コマ貼りなおされる | hook が返すオブジェクトを毎回作ると、依存に置いた `useEffect` が回りつづける。ref しか触らない関数は `useCallback` で固める |
| 会話が進まなくなる | 選択肢の出ている行では `Space` を無視している。選ぶまで進まない |
| 右を押しっぱなしで左を叩くと止まる | 押した向きを上書きすると、離したとき残りが分からない。押されているキーの集合から向きを引き直す |
| 実績の知らせが消えない | 親はプレイ時間で毎秒描きなおされる。`onDone` をそのまま `useEffect` の依存に置くと、数え終わる前にタイマーが張りなおされる。ref に預ける |
| サイトの中で「見えたら出す」が効かない | `IntersectionObserver` の `root` はウィンドウではない。サイトは画面の中で入れ子になっていて、外側は動かない。載せている入れもの（`.siteview__page`）を `root` に渡す |
| 続きから始めると実績の知らせが山ほど出る | 旗は保存していないので、古いセーブでも条件は満たされている。始める時点のぶんは `seedAchievements()` で静かに記録する |
