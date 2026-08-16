/**
 * 遊ぶ人が選んだ BGM のファイルを、この端末に残しておく。
 *
 * 曲は数 MB になるので localStorage には入らない（文字列しか置けず、上限も小さい）。
 * IndexedDB へそのまま Blob で置き、起動のたびに読みだして鳴らす。
 *
 * ファイルを選んでいないときは、これまでどおり `audio.ts` の合成音が鳴る。
 */

const DB_NAME = 'cookieclaude.audio';
const STORE = 'bgm';
const KEY = 'track';

/** これより大きいファイルは断る（端末の保存領域を埋めないため） */
export const MAX_BGM_BYTES = 20 * 1024 * 1024;

/** 端末に残しておく曲 */
export interface StoredTrack {
  name: string;
  type: string;
  blob: Blob;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** 選んだ曲を残す */
export async function putTrack(file: File): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const record: StoredTrack = { name: file.name, type: file.type, blob: file };
    tx.objectStore(STORE).put(record, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

/** 残してある曲を読みだす。無ければ null。 */
export async function getTrack(): Promise<StoredTrack | null> {
  try {
    const db = await open();
    const found = await new Promise<StoredTrack | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as StoredTrack) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return found;
  } catch {
    // 保存領域が使えない環境（プライベート閲覧など）では、合成音で通す
    return null;
  }
}

/** 曲を捨てて、合成音にもどす */
export async function clearTrack(): Promise<void> {
  try {
    const db = await open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* 消せなくても遊びは続けられる */
  }
}
