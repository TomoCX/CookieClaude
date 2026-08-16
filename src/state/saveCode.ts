import type { GameState } from '../types';
import { reviveSave } from './gameState';

/**
 * セーブデータを一本のテキストに書きだす／読みこむ。
 *
 * かたちは `CC1.<本体>.<検算>`。
 * - 本体は進行状況の JSON を UTF-8 → base64url にしたもの
 * - 検算は本体の文字コードを足しあわせた値（36 進数 4 桁）。
 *   写しまちがいや途中で切れたコードを、読みこむ前にはじくために付けている。
 *
 * 改行や空白はどこに入っていてもよい（読みこむ側で落とす）。
 */

/** コードの版。中身の形を変えたら上げること。 */
const CODE_TAG = 'CC2';
/** 「場所・街並み」と呼んでいたころの版。読みこみだけ受けつける。 */
const OLD_CODE_TAGS = ['CC1'];

/* ---- base64url ---- */

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code: string): string {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '='));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** 本体から検算の値をつくる */
function checksum(body: string): string {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum = (sum * 31 + body.charCodeAt(i)) % 1679616; // 36^4
  }
  return sum.toString(36).padStart(4, '0');
}

/* ---- 書きだし ---- */

/** 読みやすいように 60 文字ごとに折り返す */
function wrap(code: string, width = 60): string {
  const lines: string[] = [];
  for (let i = 0; i < code.length; i += width) lines.push(code.slice(i, i + width));
  return lines.join('\n');
}

/** 進行状況をバックアップコードにする */
export function encodeSave(state: GameState): string {
  const body = toBase64Url(JSON.stringify(state));
  return wrap(`${CODE_TAG}.${body}.${checksum(body)}`);
}

/** バックアップコードに添える説明文（テキストファイル用） */
export function buildBackupFile(state: GameState, savedAt: Date): string {
  const stamp = savedAt.toLocaleString('ja-JP');
  return [
    'クッキーとクロードのナゾ解き事件簿 — バックアップ',
    `書きだした日時: ${stamp}`,
    '',
    'このコードを、ゲーム内の「バックアップ」から読みこむと復元できる。',
    '改行や空白は入っていてかまわない。',
    '',
    encodeSave(state),
    '',
  ].join('\n');
}

/* ---- 読みこみ ---- */

export type DecodeResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: string };

/** バックアップコードから進行状況を読みこむ */
export function decodeSave(input: string): DecodeResult {
  // ファイルごと貼られても拾えるよう、コードらしき部分だけ抜きだす
  const squeezed = input.replace(/\s+/g, '');
  const found = squeezed.match(/CC\d+\.[A-Za-z0-9\-_]+\.[a-z0-9]{4}/);
  if (!found) return { ok: false, reason: 'コードが見つからない。全文を貼りつけてほしい。' };

  const [tag, body, sum] = found[0].split('.');
  if (tag !== CODE_TAG && !OLD_CODE_TAGS.includes(tag ?? '')) {
    return { ok: false, reason: `対応していない版のコード（${tag}）。` };
  }
  if (!body || !sum) return { ok: false, reason: 'コードの形が壊れている。' };
  if (checksum(body) !== sum) {
    return { ok: false, reason: '検算が合わない。写しそこねか、途中で切れている。' };
  }

  try {
    const parsed = JSON.parse(fromBase64Url(body)) as Record<string, unknown>;
    if (typeof parsed !== 'object' || parsed === null) {
      return { ok: false, reason: '中身を読み取れなかった。' };
    }
    // 欠けている項目は初期値で埋め、古い呼び名や食い違いも直す
    return { ok: true, state: reviveSave(parsed) };
  } catch {
    return { ok: false, reason: '中身を読み取れなかった。' };
  }
}
