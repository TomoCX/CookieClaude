import { useMemo, useRef, useState } from 'react';
import type { GameState } from '../../types';
import { buildBackupFile, decodeSave, encodeSave } from '../../state/saveCode';
import { playSe } from '../../audio/audio';

interface Props {
  /** セーブ用に、いまいるシーンも含めた状態を組み立てる */
  buildSave: () => GameState;
  /** 読みこんだ状態を反映する */
  onRestore: (state: GameState) => void;
}

/**
 * バックアップ。進行状況を一本のテキストに書きだし、また読みこむ。
 * localStorage が消えても、このコードさえあれば元に戻せる。
 */
export function BackupPanel({ buildSave, onRestore }: Props) {
  const code = useMemo(() => encodeSave(buildSave()), [buildSave]);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'ng'; text: string } | null>(null);
  const [input, setInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const copy = async () => {
    playSe('click');
    try {
      await navigator.clipboard.writeText(code);
      setMsg({ kind: 'ok', text: 'コードをコピーした。' });
    } catch {
      setMsg({
        kind: 'ng',
        text: 'コピーできなかった。枠の中を選んで手で写してほしい。',
      });
    }
  };

  const download = () => {
    playSe('click');
    try {
      const text = buildBackupFile(buildSave(), new Date());
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const d = new Date();
      const stamp =
        `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}` +
        `${String(d.getDate()).padStart(2, '0')}-` +
        `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
      a.href = url;
      a.download = `cookieclaude-backup-${stamp}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg({ kind: 'ok', text: 'テキストファイルとして書きだした。' });
    } catch {
      setMsg({ kind: 'ng', text: 'ファイルに書きだせなかった。' });
    }
  };

  const restore = (text: string) => {
    const result = decodeSave(text);
    if (!result.ok) {
      playSe('wrong');
      setMsg({ kind: 'ng', text: `読みこめない。${result.reason}` });
      return;
    }
    playSe('correct');
    onRestore(result.state);
    setMsg({ kind: 'ok', text: 'バックアップから復元した。' });
    setInput('');
  };

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => restore(String(reader.result ?? ''));
    reader.onerror = () =>
      setMsg({ kind: 'ng', text: 'ファイルを読めなかった。' });
    reader.readAsText(file);
  };

  return (
    <div className="panel__body">
      <h2 className="panel__title">バックアップ</h2>
      <p className="panel__lead">
        進行状況を一本のテキストに書きだせる。
        ブラウザの保存領域が消えても、このコードがあれば元に戻せる。
      </p>

      <h3 className="panel__sub">書きだす</h3>
      <textarea className="codebox" value={code} readOnly spellCheck={false} rows={5} />
      <div className="backup__row">
        <button type="button" className="backup__btn" onClick={copy}>
          コードをコピー
        </button>
        <button type="button" className="backup__btn" onClick={download}>
          ファイルに保存
        </button>
      </div>

      <h3 className="panel__sub">読みこむ</h3>
      <textarea
        className="codebox codebox--input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="バックアップコードを貼りつける（ファイルの全文でもよい）"
        spellCheck={false}
        rows={4}
      />
      <div className="backup__row">
        <button
          type="button"
          className="backup__btn backup__btn--go"
          onClick={() => restore(input)}
          disabled={input.trim() === ''}
        >
          このコードから復元
        </button>
        <button
          type="button"
          className="backup__btn"
          onClick={() => fileRef.current?.click()}
        >
          ファイルを選ぶ
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,text/plain"
          className="backup__file"
          onChange={(e) => {
            pickFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {msg && (
        <p className={`backup__msg backup__msg--${msg.kind}`} role="status">
          {msg.text}
        </p>
      )}

      <p className="panel__note">
        復元すると、いまの進行状況は上書きされる。
        コードは書きだした時点の内容なので、続きを遊んだぶんは含まれない。
      </p>
    </div>
  );
}
