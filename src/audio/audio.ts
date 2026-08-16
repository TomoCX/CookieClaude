/**
 * 音まわり。音声ファイルは持たず、Web Audio API でその場で音を作る。
 * （画像とおなじく、素材ファイルは使わない方針）
 *
 * ブラウザの決まりで、AudioContext は人の操作がないと動きださない。
 * タイトルのボタンを押したときに unlock() を呼ぶこと。
 */

/** 効果音の種類 */
export type SeName =
  | 'click' // ボタン・決定
  | 'talk' // 会話をすすめる
  | 'correct' // ナゾに正解
  | 'wrong' // 誤答
  | 'coin' // コインをつかう
  | 'fade'; // 画面のきりかえ

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bgmGain: GainNode | null = null;
let seGain: GainNode | null = null;

let bgmOn = true;
let bgmVolume = 0.45;
let seOn = true;
let seVolume = 0.7;

/** BGM の次に鳴らす音の位置 */
let step = 0;
let nextNoteAt = 0;
let timer: ReturnType<typeof setInterval> | null = null;

const BPM = 96;
/** 8 分音符ひとつぶんの長さ（秒） */
const STEP_SEC = 60 / BPM / 2;

/** BGM の和音進行（Am - F - C - G）。1 小節 = 4 ステップ。 */
const CHORDS: number[][] = [
  [220.0, 261.63, 329.63], // Am
  [174.61, 220.0, 261.63], // F
  [261.63, 329.63, 392.0], // C
  [196.0, 246.94, 293.66], // G
];

/** 上でなぞるメロディ（和音の何番目の音か。-1 は休み） */
const MELODY = [0, 2, 1, 2, 0, -1, 1, 2, 2, 1, 0, 1, 2, -1, 1, 0];

function ensure(): boolean {
  if (ctx) return true;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return false;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);

    bgmGain = ctx.createGain();
    bgmGain.gain.value = bgmOn ? bgmVolume * 0.22 : 0;
    bgmGain.connect(master);

    seGain = ctx.createGain();
    seGain.gain.value = seOn ? seVolume * 0.5 : 0;
    seGain.connect(master);
    return true;
  } catch {
    ctx = null;
    return false;
  }
}

/** 人の操作のあとに呼ぶ。音を鳴らせる状態にする。 */
export function unlock(): void {
  // 最初の操作を待っていた曲があれば、ここで鳴らしはじめる
  if (track && track.paused && bgmOn) void track.play().catch(() => {});
  if (!ensure() || !ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
  // ファイルの曲を鳴らしているときは、合成音を重ねない
  if (bgmOn && !track) startBgm();
}

/** ひとつの音を鳴らす */
function tone(
  freq: number,
  at: number,
  dur: number,
  type: OscillatorType,
  peak: number,
  out: GainNode,
): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  // ぷつっと切れないよう、立ち上がりと減衰をつける
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(peak, at + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(env);
  env.connect(out);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

/** 少し先のぶんまで BGM を予約しておく */
function schedule(): void {
  if (!ctx || !bgmGain) return;
  const lookahead = 0.25;
  while (nextNoteAt < ctx.currentTime + lookahead) {
    const bar = Math.floor(step / 4) % CHORDS.length;
    const chord = CHORDS[bar] ?? CHORDS[0]!;

    // 小節あたまのベース
    if (step % 4 === 0) {
      tone(chord[0]! / 2, nextNoteAt, 0.5, 'sine', 0.5, bgmGain);
    }
    // 和音をそっと重ねる
    if (step % 2 === 0) {
      tone(chord[1]!, nextNoteAt, 0.34, 'sine', 0.13, bgmGain);
    }
    // メロディ
    const m = MELODY[step % MELODY.length] ?? -1;
    if (m >= 0) {
      tone(chord[m]! * 2, nextNoteAt, 0.26, 'triangle', 0.16, bgmGain);
    }

    nextNoteAt += STEP_SEC;
    step += 1;
  }
}

/** BGM を鳴らしはじめる */
export function startBgm(): void {
  if (!ensure() || !ctx || timer) return;
  nextNoteAt = ctx.currentTime + 0.1;
  timer = setInterval(schedule, 60);
}

/** BGM を止める */
export function stopBgm(): void {
  if (timer) clearInterval(timer);
  timer = null;
}

/** BGM の設定を変える */
export function setBgm(on: boolean, volume: number): void {
  bgmOn = on;
  bgmVolume = Math.min(Math.max(volume, 0), 100) / 100;
  applyTrackVolume();
  if (!ctx || !bgmGain) return;
  // 曲のファイルを鳴らしているあいだ、合成音は止めておく
  bgmGain.gain.setTargetAtTime(on && !track ? bgmVolume * 0.22 : 0, ctx.currentTime, 0.05);
  if (on && !track) startBgm();
  else stopBgm();
}

/* ---- 遊ぶ人が選んだ曲 ---- */

/**
 * ファイルの BGM。選ばれているあいだは、合成音のかわりにこれを流す。
 * Web Audio へ通さず素の <audio> で鳴らす。長い曲を丸ごと復号せずに済むため。
 */
let track: HTMLAudioElement | null = null;
let trackUrl: string | null = null;

function applyTrackVolume(): void {
  if (track) track.volume = bgmOn ? bgmVolume : 0;
}

/**
 * 曲を差しかえる。null を渡すと合成音にもどる。
 * 鳴らしはじめは、ブラウザの決まりで最初の操作のあとになる。
 */
export function setBgmTrack(blob: Blob | null): void {
  if (track) {
    track.pause();
    track.src = '';
    track = null;
  }
  if (trackUrl) {
    URL.revokeObjectURL(trackUrl);
    trackUrl = null;
  }

  if (!blob) {
    // 合成音にもどす
    if (ctx && bgmGain) {
      bgmGain.gain.setTargetAtTime(bgmOn ? bgmVolume * 0.22 : 0, ctx.currentTime, 0.05);
      if (bgmOn) startBgm();
    }
    return;
  }

  // 合成音を黙らせてから、ファイルのほうを鳴らす
  stopBgm();
  if (ctx && bgmGain) bgmGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);

  trackUrl = URL.createObjectURL(blob);
  track = new Audio(trackUrl);
  track.loop = true;
  applyTrackVolume();
  void track.play().catch(() => {
    /* まだ操作されていないだけ。unlock() のあとで鳴りはじめる。 */
  });
}

/** 曲のファイルを鳴らしているか */
export function hasBgmTrack(): boolean {
  return track !== null;
}

/** 効果音の設定を変える */
export function setSe(on: boolean, volume: number): void {
  seOn = on;
  seVolume = Math.min(Math.max(volume, 0), 100) / 100;
  if (!ctx || !seGain) return;
  seGain.gain.setValueAtTime(on ? seVolume * 0.5 : 0, ctx.currentTime);
}

/** 効果音を鳴らす */
export function playSe(name: SeName): void {
  if (!seOn || !ctx || !seGain) return;
  const t = ctx.currentTime;
  switch (name) {
    case 'click':
      tone(660, t, 0.09, 'square', 0.18, seGain);
      break;
    case 'talk':
      tone(880, t, 0.045, 'square', 0.1, seGain);
      break;
    case 'correct':
      tone(523.25, t, 0.14, 'triangle', 0.24, seGain);
      tone(659.25, t + 0.1, 0.14, 'triangle', 0.24, seGain);
      tone(783.99, t + 0.2, 0.28, 'triangle', 0.26, seGain);
      break;
    case 'wrong':
      tone(207.65, t, 0.16, 'sawtooth', 0.16, seGain);
      tone(155.56, t + 0.13, 0.28, 'sawtooth', 0.16, seGain);
      break;
    case 'coin':
      tone(987.77, t, 0.07, 'square', 0.16, seGain);
      tone(1318.51, t + 0.06, 0.16, 'square', 0.16, seGain);
      break;
    case 'fade':
      tone(392, t, 0.1, 'sine', 0.14, seGain);
      tone(523.25, t + 0.07, 0.16, 'sine', 0.12, seGain);
      break;
  }
}
