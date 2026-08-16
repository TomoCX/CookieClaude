import { useMemo, useState } from 'react';
import type { AccountField, AccountForm, LocalizedText } from '../../types';
import {
  EMPTY_ACCOUNT,
  passwordStrength,
  validateAccount,
} from '../../state/account';
import { playSe } from '../../audio/audio';
import { useText } from '../../i18n/text';
import { UI } from '../../i18n/ui';

/** 強さの目もりに添える言葉（0〜4） */
const STRENGTH_WORDS: LocalizedText[] = [
  UI.accStrength0,
  UI.accStrength1,
  UI.accStrength2,
  UI.accStrength3,
  UI.accStrength4,
];

/**
 * アカウント登録（雛形・フロント部分のみ）。
 *
 * **サーバーは無い。** 押しても送信されず、入力もどこにも残らない。
 * 検査の規則は `src/state/account.ts` にあり、この画面は
 * 「入れる・見せる・叱る」だけを持つ。あとで本物の登録をつなぐときに
 * 差しかわるのは、`submit` の中の一行だけで済むようにしてある。
 */
export function AccountPanel() {
  const t = useText();
  const [form, setForm] = useState<AccountForm>(EMPTY_ACCOUNT);
  /** 一度でも触った項目。触る前から赤くしないため。 */
  const [touched, setTouched] = useState<Partial<Record<AccountField, boolean>>>({});
  /** 「登録する」を押したか。押したあとは全部の項目を見せる。 */
  const [tried, setTried] = useState(false);
  /** 入力がそろったあとの確認画面 */
  const [done, setDone] = useState<AccountForm | null>(null);
  const [reveal, setReveal] = useState(false);

  const errors = useMemo(() => validateAccount(form), [form]);
  const strength = passwordStrength(form.password);

  /** その項目の言い分。触るか、送ろうとしたときだけ出す。 */
  const errorOf = (field: AccountField): LocalizedText | undefined =>
    tried || touched[field] ? errors[field] : undefined;

  const set = (field: AccountField, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  /** その項目から離れた。ここで初めて言い分を出す。 */
  const touch = (field: AccountField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const submit = () => {
    setTried(true);
    if (Object.keys(errors).length > 0) {
      playSe('wrong');
      return;
    }
    playSe('correct');
    // ここが本物の登録につなぐところ。いまは受けとった内容を見せるだけ。
    setDone(form);
  };

  if (done) {
    return (
      <div className="panel__body">
        <h2 className="panel__title">{t(UI.accDone)}</h2>
        <p className="panel__lead">{t(UI.accDoneLead)}</p>
        <h3 className="panel__sub">{t(UI.accSent)}</h3>
        <dl className="acc__recap">
          <div>
            <dt>{t(UI.accName)}</dt>
            <dd>{done.username}</dd>
          </div>
          <div>
            <dt>{t(UI.accMail)}</dt>
            <dd>{done.email}</dd>
          </div>
          <div>
            <dt>{t(UI.accPass)}</dt>
            <dd className="acc__masked">
              {'•'.repeat(Math.min(done.password.length, 16))} {t(UI.accHidden)}
            </dd>
          </div>
        </dl>
        <div className="acc__actions">
          <button
            type="button"
            className="acc__submit acc__submit--ghost"
            onClick={() => {
              playSe('click');
              setDone(null);
            }}
          >
            {t(UI.accBack)}
          </button>
        </div>
        <p className="panel__note">{t(UI.accountStub)}</p>
      </div>
    );
  }

  return (
    <div className="panel__body">
      <h2 className="panel__title">{t(UI.account)}</h2>
      <p className="panel__lead">{t(UI.accountLead)}</p>

      <form
        className="acc"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
      >
        <Field
          field="username"
          label={t(UI.accName)}
          hint={t(UI.accNameHint)}
          value={form.username}
          error={errorOf('username')}
          autoComplete="username"
          onChange={set}
          onBlur={touch}
        />
        <Field
          field="email"
          label={t(UI.accMail)}
          value={form.email}
          error={errorOf('email')}
          type="email"
          autoComplete="email"
          onChange={set}
          onBlur={touch}
        />
        <Field
          field="password"
          label={t(UI.accPass)}
          hint={t(UI.accPassHint)}
          value={form.password}
          error={errorOf('password')}
          type={reveal ? 'text' : 'password'}
          autoComplete="new-password"
          onChange={set}
          onBlur={touch}
        >
          {/* 強さの目もり。入れはじめてから出す。 */}
          {form.password !== '' && (
            <span className="acc__meter">
              <span className={`acc__meter-bar acc__meter-bar--${strength}`} />
              <em>
                {t(UI.accStrength)}: {t(STRENGTH_WORDS[strength] ?? UI.accStrength0)}
              </em>
            </span>
          )}
        </Field>
        <Field
          field="passwordConfirm"
          label={t(UI.accConfirm)}
          value={form.passwordConfirm}
          error={errorOf('passwordConfirm')}
          type={reveal ? 'text' : 'password'}
          autoComplete="new-password"
          onChange={set}
          onBlur={touch}
        />

        <label className="acc__reveal">
          <input
            type="checkbox"
            checked={reveal}
            onChange={(e) => setReveal(e.target.checked)}
          />
          <span>{t(UI.accShow)}</span>
        </label>

        <div className="acc__actions">
          <button type="submit" className="acc__submit">
            {t(UI.accSubmit)}
          </button>
          <button
            type="button"
            className="acc__submit acc__submit--ghost"
            onClick={() => {
              playSe('click');
              setForm(EMPTY_ACCOUNT);
              setTouched({});
              setTried(false);
            }}
          >
            {t(UI.accReset)}
          </button>
        </div>
      </form>

      <p className="panel__note">{t(UI.accountStub)}</p>
    </div>
  );
}

interface FieldProps {
  field: AccountField;
  label: string;
  hint?: string;
  value: string;
  error?: LocalizedText;
  type?: string;
  autoComplete?: string;
  onChange: (field: AccountField, value: string) => void;
  onBlur: (field: AccountField) => void;
  children?: React.ReactNode;
}

/** 入力欄ひとつ。見出し・注意書き・言い分をひとまとめにする。 */
function Field({
  field,
  label,
  hint,
  value,
  error,
  type = 'text',
  autoComplete,
  onChange,
  onBlur,
  children,
}: FieldProps) {
  const t = useText();
  return (
    <label className={`acc__field${error ? ' acc__field--bad' : ''}`}>
      <span className="acc__label">
        {label}
        {hint && <em className="acc__hint">{hint}</em>}
      </span>
      <input
        className="acc__input"
        type={type}
        value={value}
        autoComplete={autoComplete}
        spellCheck={false}
        onChange={(e) => onChange(field, e.target.value)}
        onBlur={() => onBlur(field)}
      />
      {children}
      {error && <span className="acc__error">{t(error)}</span>}
    </label>
  );
}
