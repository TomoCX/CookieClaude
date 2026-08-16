import type { LocalizedText } from '../types';

/**
 * 画面まわりの文言。
 *
 * 物語の中身（会話・ナゾ・アイテム）は `src/data/` の側が
 * それぞれ `LocalizedText` を持っている。ここに置くのは、
 * ボタンや見出しのような「遊びの外側」の文字だけ。
 *
 * 使いかた:
 *   const t = useText();
 *   <button>{t(UI.close)}</button>
 *
 * 訳を書き足すときは `en` を埋めるだけでよい。
 * 空のままなら日本語がそのまま出る。
 */
const s = (ja: string, en: string): LocalizedText => ({ ja, en });

export const UI = {
  /* ---- 共通 ---- */
  back: s('戻る', 'Back'),
  close: s('閉じる', 'Close'),
  continue: s('続ける', 'Continue'),
  unknown: s('？？？', '???'),
  unknownShort: s('？', '?'),
  none: s('不明', 'Unknown'),

  /* ---- HUD ---- */
  map: s('地図', 'Map'),
  menu: s('メニュー', 'Menu'),
  closeMap: s('地図を閉じる', 'Close the map'),

  /* ---- 表紙 ---- */
  bootSub: s('レイトン風シナリオアドベンチャー', 'A Layton-style mystery adventure'),
  bootTitle1: s('クッキーとクロードの', 'Cookie and Claude and'),
  bootTitle2: s('ナゾ解き事件簿', 'the Casebook of Puzzles'),
  bootLead: s(
    '町の時計が十三回鳴る夜、町の宝が消える——',
    'On the night the town clock strikes thirteen, the town’s treasure will vanish—',
  ),
  newGame: s('最初から', 'New game'),
  loadGame: s('続きから', 'Continue'),
  noSave: s('※ セーブデータはまだない', '* No saved game yet'),

  /* ---- シーン ---- */
  lookLeft: s('左を見る', 'Look left'),
  lookRight: s('右を見る', 'Look right'),
  sceneTip: s(
    '◀ ▶ かドラッグで道を見わたす。人やナゾをクリックすると中に入れる。',
    'Use ◀ ▶ or drag to look around. Click a person or a puzzle to enter.',
  ),
  moveTip: s(
    '三角の矢印を押すと、その方向の場所へ移る。',
    'Press a triangle to move that way.',
  ),
  moveOn: s('別の場所へ移動する', 'Move somewhere else'),
  moveOff: s('移動をやめる', 'Stop moving'),
  backTip: s('矢印を押すと、もとの場所へもどる。', 'Press the arrow to go back.'),
  talkTo: s('に話しかける', ''),
  moveTo: s('へ移動する', ''),
  cannotGo: s('まだ行けない', 'Not yet'),
  puzzleHere: s('ナゾ！', 'A puzzle!'),
  puzzleSolvedTag: s('解いたナゾ', 'Solved'),
  puzzleMark: s('ナ', 'P'),
  someoneThere: s('相手', 'them'),
  pickUp: s('光るものを拾う', 'Pick up the shining thing'),
  somethingHere: s('何か落ちている', 'Something is lying here'),

  /* ---- 出口の向き ---- */
  dirFar: s('奥へ', 'Onward'),
  dirNear: s('手前へ', 'Back'),
  dirLeft: s('左へ', 'Left'),
  dirRight: s('右へ', 'Right'),
  dirInto: s('調べる', 'Look'),
  dirBack: s('もどる', 'Return'),

  /* ---- 地図 ---- */
  here: s('現在地', 'You are here'),
  hereSuffix: s('（現在地）', ' (you are here)'),
  goThere: s('ここへ行く', 'Go here'),
  revisit: s('再訪する', 'Revisit'),
  solvedPuzzles: s('解いたナゾ', 'Puzzles solved'),
  sceneCount: s('シーン', 'scenes'),
  hintStaying: s('：いま滞在中のエリア', ': you are staying here'),
  hintVisited: s('：再訪して話を聞ける', ': revisit to hear more'),
  hintGo: s('へ向かおう', ' — head there'),
  hintInvestigate: s('を調べよう', ' — investigate'),
  hintDone: s(
    '物語は完結した。町を巡り、残るナゾを解こう',
    'The story is over. Roam the town and solve what remains',
  ),

  /* ---- 会話 ---- */
  chapterMain: s('本筋', 'Main'),
  chapterFlavor: s('立ち話', 'Chat'),
  skip: s('スキップ ▶▶', 'Skip ▶▶'),
  choosePrompt: s('どうする？', 'What will you do?'),

  /* ---- 会話の結果 ---- */
  resultHead: s('聞き込みを終えた', 'The conversation ends'),
  hintCoins: s('ひらめきコイン', 'Hint Coins'),
  coinUnit: s('枚', ''),
  notes: s('調査メモ', 'Case notes'),
  charms: s('チャーム', 'Charms'),
  items: s('コレクション', 'Collection'),
  unlockedArea: s('新たな行き先が開かれた', 'A new destination has opened'),

  /* ---- ナゾ解き ---- */
  puzzleNoLabel: s('ナゾ', 'Puzzle'),
  picarat: s('ピカラット', 'Picarats'),
  answerLabel: s('答え', 'Answer'),
  submit: s('答える', 'Answer'),
  wrong: s('不正解。もう一度考えてみよう。', 'Not quite. Think again.'),
  missCount: s('誤答', 'Wrong answers'),
  hintN: s('ヒント', 'Hint'),
  hintCost: s('（コイン1枚）', ' (1 coin)'),
  noHintsLeft: s('ヒントは残っていない', 'No hints left'),
  askQuestions: s('質問してみる', 'Ask a question'),
  askMore: s('次の質問をする（無料）', 'Ask another (free)'),
  askDone: s('質問はここまで。あとは考えるだけだ。', 'That is all. Now think it through.'),
  orderPrompt: s('早い順に押す', 'Tap in order, earliest first'),
  reset: s('やり直す', 'Reset'),
  lampsLit: s('灯した明かり', 'Lights lit'),
  correct: s('正解', 'Correct'),
  alreadySolved: s('※ このナゾは解決済み', '* You had already solved this one'),
  explanation: s('解説', 'Explanation'),
  backToScene: s('街へ戻る', 'Back to town'),
  interrupt: s('中断', 'Quit'),
  windowAt: s('階 ', 'F, window '),

  /* ---- メインメニュー ---- */
  mainMenu: s('メインメニュー', 'Main menu'),
  toolNotes: s('調査メモ', 'Case notes'),
  toolStory: s('深まるナゾ', 'The Case'),
  toolIndex: s('ナゾ事典', 'Puzzle Index'),
  toolSave: s('セーブ', 'Save'),
  toolCollection: s('コレクション', 'Collection'),
  toolBackup: s('バックアップ', 'Backup'),
  toolSettings: s('設定', 'Settings'),
  toolDev: s('開発', 'Dev'),
  toolLocked: s('まだ使用できない', 'Not available yet'),
  toolActive: s('（いま入っている）', ' (currently on)'),
  tabProgress: s('進行状況', 'Progress'),
  tabMemo: s('メモ', 'Memo'),
  tabCharms: s('チャーム', 'Charms'),
  saveOk: s('冒険の記録を保存した。', 'Your progress has been saved.'),
  saveNg: s(
    'セーブに失敗した。ブラウザの設定を確認してほしい。',
    'Saving failed. Please check your browser settings.',
  ),

  /* ---- 進行状況 ---- */
  progress: s('進行状況', 'Progress'),
  statSolved: s('解いたナゾ', 'Puzzles solved'),
  statPicarat: s('ひらめき指数（累計）', 'Picarats (total)'),
  statFound: s('発見したナゾ', 'Puzzles found'),
  statCoin: s('ひらめきコイン', 'Hint Coins'),
  playTime: s('プレイ時間', 'Play time'),
  hours: s('時間', 'h'),
  minutes: s('分', 'm'),
  questionUnit: s('問', ''),
  storyProgress: s('物語の進行', 'Story progress'),
  puzzleCollection: s('ナゾの収集', 'Puzzle collection'),
  currentPlace: s('現在地', 'Location'),

  /* ---- 調査メモ・チャーム・メモ ---- */
  notesEmpty: s('まだなにも書かれていない。', 'Nothing written down yet.'),
  charmsEmpty: s('まだなにも持っていない。', 'You have none yet.'),
  memo: s('メモ', 'Memo'),
  memoLead: s('気づいたことを書き留めておこう。', 'Jot down anything you notice.'),
  memoPlaceholder: s('自由に記入できる', 'Write freely'),

  /* ---- 深まるナゾ ---- */
  story: s('深まるナゾ', 'The Case'),
  storySummary: s('概要', 'Summary'),
  centralQuestions: s('本件の争点', 'Open questions'),
  storyKnown: s('判明していること', 'What we know'),
  storyCast: s('関係者', 'People involved'),
  storyRange: s('解明した範囲', 'Uncovered'),
  storyNoneKnown: s(
    'まだ何も判明していない。町の人物に話を聞こう。',
    'Nothing yet. Go and talk to the townsfolk.',
  ),
  storyNoCast: s('まだ誰とも会っていない。', 'You have not met anyone yet.'),
  storyNext: s('次に調べること：', 'Next to investigate: '),
  storyEnd: s('メープル町の事件は幕を閉じた。', 'The case of Maple Town is closed.'),

  /* ---- ナゾ事典 ---- */
  puzzleIndex: s('ナゾ事典', 'Puzzle Index'),
  puzzleIndexLead: s(
    '街を歩いて見つけた時計から挑戦する、独立した一問。',
    'Standalone puzzles found on clocks around the town.',
  ),
  seeExplanation: s('解説を見る', 'See the explanation'),
  unanswered: s('未解答', 'Unanswered'),
  hiddenTitle: s('？？？？？', '?????'),

  /* ---- コレクション ---- */
  collection: s('コレクション', 'Collection'),
  collectionLead: s(
    '街のあちこちに落ちている品。光っているものをクリックすると拾える。',
    'Trinkets scattered around town. Click the shining ones to pick them up.',
  ),
  collectionAll: s(
    'すべての品を集めた。街の隅々まで見て回った証である。',
    'Every trinket found — proof you searched every corner of the town.',
  ),
  notPickedUp: s('まだ拾っていない', 'Not found yet'),
  pickedUp: s('拾った', 'Found'),
  pickedWhere: s('拾った場所', 'Found at'),
  pickedWhen: s('拾った時点', 'Found after'),

  /* ---- セーブ・バックアップ ---- */
  backup: s('バックアップ', 'Backup'),
  backupLead: s(
    '進行状況を一本のテキストに書きだせる。',
    'Export your progress as a single block of text.',
  ),
  backupLead2: s(
    'ブラウザの保存領域が消えても、このコードがあれば元に戻せる。',
    'Even if the browser storage is cleared, this code brings it all back.',
  ),
  backupExport: s('書きだす', 'Export'),
  backupImport: s('読みこむ', 'Import'),
  copyCode: s('コードをコピー', 'Copy the code'),
  saveToFile: s('ファイルに保存', 'Save to a file'),
  restoreFromCode: s('このコードから復元', 'Restore from this code'),
  chooseFile: s('ファイルを選ぶ', 'Choose a file'),
  backupPlaceholder: s(
    'バックアップコードを貼りつける（ファイルの全文でもよい）',
    'Paste a backup code here (the whole file is fine too)',
  ),
  copied: s('コードをコピーした。', 'Code copied.'),
  copyFailed: s(
    'コピーできなかった。枠の中を選んで手で写してほしい。',
    'Could not copy. Please select the text and copy it by hand.',
  ),
  fileWritten: s('テキストファイルとして書きだした。', 'Written out as a text file.'),
  fileWriteFailed: s('ファイルに書きだせなかった。', 'Could not write the file.'),
  fileReadFailed: s('ファイルを読めなかった。', 'Could not read the file.'),
  restored: s('バックアップから復元した。', 'Restored from backup.'),
  cannotRead: s('読みこめない。', 'Cannot read it. '),
  backupNote: s(
    '復元すると、いまの進行状況は上書きされる。コードは書きだした時点の内容なので、続きを遊んだぶんは含まれない。',
    'Restoring overwrites your current progress. A code holds only what existed when it was written.',
  ),
  savedNotes: s('解いたナゾ', 'Puzzles solved'),
  savedPicarat: s('ひらめき指数', 'Picarats'),
  savedStory: s('物語', 'Story'),

  /* ---- 設定 ---- */
  settings: s('設定', 'Settings'),
  settingLanguage: s('ことば', 'Language'),
  settingScreen: s('画面の大きさ', 'Screen size'),
  settingSound: s('音声', 'Sound'),
  settingEffects: s('画面のエフェクト', 'Screen effects'),
  bgm: s('BGM', 'Music'),
  se: s('効果音（SE）', 'Sound effects'),
  effects: s('エフェクト', 'Effects'),
  on: s('オン', 'On'),
  off: s('オフ', 'Off'),
  volume: s('音量', 'Volume'),
  strength: s('強さ', 'Strength'),
  settingsNote: s(
    '設定はこの端末に保存され、セーブデータとは別に残る。',
    'Settings are kept on this device, separately from your saved game.',
  ),
  bgmFile: s('好きな曲を鳴らす', 'Play your own music'),
  bgmFileLead: s(
    '手元の音声ファイル（mp3・wav・ogg）を選ぶと、合成音のかわりに流れる。選んだ曲はこの端末に残る。',
    'Pick an audio file (mp3, wav, ogg) to play instead of the synthesised music. It stays on this device.',
  ),
  bgmChoose: s('曲を選ぶ', 'Choose a track'),
  bgmClear: s('合成音にもどす', 'Back to synthesised'),
  bgmPlaying: s('いま鳴っている曲', 'Now playing'),
  bgmSynth: s('合成音（ファイルなし）', 'Synthesised (no file)'),
  bgmTooBig: s('ファイルが大きすぎる。', 'That file is too large.'),
  bgmBadFile: s('この形式は鳴らせなかった。', 'That format could not be played.'),

  /* ---- 実績 ---- */
  achievements: s('実績', 'Achievements'),
  toolAchievements: s('実績', 'Awards'),
  achievementGained: s('実績を解放', 'ACHIEVEMENT'),
  achievementsLead: s(
    '一定の手がかりがそろうと解放される記録。解放すると画面の上に知らせが出る。',
    'Records that unlock as the pieces come together. A notice appears at the top of the screen.',
  ),
  achievementsUnlocked: s('解放した実績', 'Unlocked'),
  achievementSecret: s('？？？？？', '?????'),
  achievementSecretLead: s(
    'この実績は、解放するまで伏せてある。',
    'This one stays hidden until you earn it.',
  ),
  achievementsNote: s(
    '未解放のものには、あと何が必要かだけを丸印で示してある。',
    'For those still locked, the dots show what is still missing — nothing more.',
  ),

  /* ---- 調べどころ ---- */
  examine: s('調べる', 'Examine'),
  examineClose: s('見るのをやめる', 'Stop looking'),
  gotItem: s('手に入れた', 'Obtained'),
} as const;

export type UiKey = keyof typeof UI;
