import type { AccountErrors, AccountForm } from '../types';
import { UI } from '../i18n/ui';

/**
 * アカウント登録の入力検査。
 *
 * **これは雛形（フロント部分）で、サーバーは無い。**
 * 送信先も、控えを残す場所も用意していない。ここにあるのは
 * 「その場で分かる誤り」を見つける規則だけで、
 * 名前の重複のように問い合わせないと分からないことは扱わない。
 *
 * 画面（`AccountPanel`）から切り離してあるのは、あとで本物の登録を
 * つなぐときに、**差しかえるのが画面ではなく送信の部分だけで済む**ようにするため。
 */

/** 利用者名に使える長さ */
const NAME_MIN = 3;
const NAME_MAX = 16;
/** パスワードの下限 */
const PASSWORD_MIN = 8;

/** 利用者名に使える文字（英数字とアンダースコア） */
const NAME_CHARS = /^[A-Za-z0-9_]+$/;
/** メールアドレスの形。厳密な規格ではなく、打ちまちがいを拾う程度に見る。 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 何も入っていない状態 */
export const EMPTY_ACCOUNT: AccountForm = {
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
};

/** パスワードの強さ（0〜4）。画面のめやすに使う。 */
export function passwordStrength(password: string): number {
  if (password.length === 0) return 0;
  let score = 0;
  if (password.length >= PASSWORD_MIN) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

/**
 * 入力を検査して、項目ごとの言い分を返す。
 * 空のオブジェクトが返れば、その場で分かる誤りは無い。
 */
export function validateAccount(form: AccountForm): AccountErrors {
  const errors: AccountErrors = {};

  const name = form.username.trim();
  if (name === '') errors.username = UI.accNameEmpty;
  else if (name.length < NAME_MIN || name.length > NAME_MAX) errors.username = UI.accNameLength;
  else if (!NAME_CHARS.test(name)) errors.username = UI.accNameChars;

  const email = form.email.trim();
  if (email === '') errors.email = UI.accMailEmpty;
  else if (!EMAIL_SHAPE.test(email)) errors.email = UI.accMailShape;

  if (form.password === '') errors.password = UI.accPassEmpty;
  else if (form.password.length < PASSWORD_MIN) errors.password = UI.accPassShort;
  else if (/^\s|\s$/.test(form.password)) errors.password = UI.accPassSpace;

  if (form.passwordConfirm === '') errors.passwordConfirm = UI.accConfirmEmpty;
  else if (form.passwordConfirm !== form.password) errors.passwordConfirm = UI.accConfirmDiffer;

  return errors;
}

