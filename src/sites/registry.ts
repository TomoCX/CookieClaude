import type { SiteDef } from '../types';
import { CircleSite } from './pages/CircleSite';
import { BounceSite } from './pages/BounceSite';
import { RecordsSite } from './pages/RecordsSite';

/**
 * ホームページの一覧。
 *
 * ゲームとは関係のないおまけで、メインメニューのいちばん下に
 * アイコンだけで並ぶ。三つとも作りが違い、共有しているのは
 * 「ゲームに戻る」の帯（`SiteOverlay`）だけ。
 *
 * | サイト | 手本 | 挙動 |
 * | --- | --- | --- |
 * | 楓花幻燈団 | 古風な個人サイト | 押すと中身が入れかわるだけ。動きは持たない |
 * | BOUNCE | 一枚ものの商品ページ | 下へ送ると現れる。配色をその場で変える |
 * | RE:PRESS RECORDS | レーベルのポータル | 中に頁があり、買い物かごを持つ |
 *
 * どれも実在するサイトの作りを手本にした習作で、名前も中身も架空のもの。
 * 足すときは、`pages/` に一つ書いてここへ一行。画面側は触らなくてよい。
 */
export const SITES: SiteDef[] = [
  {
    id: 'site_circle',
    name: '楓花幻燈団',
    note: '同人サークルの古風なホームページ',
    icon: 'lantern',
    page: CircleSite,
  },
  {
    id: 'site_bounce',
    name: 'BOUNCE',
    note: '一枚ものの商品ページ',
    icon: 'bounce',
    page: BounceSite,
  },
  {
    id: 'site_records',
    name: 'RE:PRESS RECORDS',
    note: 'レーベルのポータルサイト',
    icon: 'disc',
    page: RecordsSite,
  },
];

/** id からホームページを引く */
export function getSite(id: string | null): SiteDef | undefined {
  return id ? SITES.find((s) => s.id === id) : undefined;
}
