import { useEffect, useState } from 'react';

/**
 * 同人サークルの古風なホームページ。
 *
 * www16.big.or.jp/~zun/top.html（上海アリス幻樂団）の作りを手本にした習作で、
 * 名前も中身も架空のもの。手本にしたのは **2000 年代の個人サイトの型**で、
 *
 * - 横幅を決め打ちにした 2 段組（左に品書き、右に本文）
 * - 飾りの少ない見出しと、青い下線つきのリンク
 * - 日付を頭に置いた更新履歴が、新しい順にただ積まれていく
 * - 下のほうにアクセスカウンタと Copyright
 *
 * 動きは持たせない。**押したら中身が入れかわるだけ**で、
 * 淡い変化も遅れて出てくるものも無い——それがこの型らしさなので、
 * ほかの二つ（動く商品ページ・頁を持つポータル）と作りを変えてある。
 */

/** 左の品書き */
const MENU = [
  { id: 'top', label: 'ＴＯＰ' },
  { id: 'works', label: '作品紹介' },
  { id: 'music', label: '音楽' },
  { id: 'diary', label: '日記' },
  { id: 'bbs', label: '掲示板' },
  { id: 'link', label: 'リンク' },
] as const;

type PageId = (typeof MENU)[number]['id'];

/** 更新履歴。新しいものが上。 */
const HISTORY = [
  { date: '2026/08/12', body: '「クッキーとクロードのナゾ解き事件簿」体験版を公開しました。' },
  { date: '2026/07/30', body: '音楽のページに、水車小屋の曲を一曲置きました。' },
  { date: '2026/06/18', body: '日記を更新。取材と称して川べりを歩いてきた話です。' },
  { date: '2026/05/02', body: '掲示板の書きこみに返事をしました。まとめて失礼します。' },
  { date: '2026/03/21', body: 'サイトの引っ越しが終わりました。リンクの張りなおしをお願いします。' },
];

/** 作品一覧 */
const WORKS = [
  { no: '第壱作', title: 'メープル町の十三時', year: '2024', kind: '推理' },
  { no: '第弐作', title: '時計塔と歯車の夜', year: '2025', kind: '推理' },
  { no: '第参作', title: 'ナゾ解き事件簿', year: '2026', kind: '推理・体験版' },
];

/** 音楽 */
const TRACKS = [
  { no: '01', title: '街道の馬車', note: '幕開けの曲。少し急いだ拍子で。' },
  { no: '02', title: '大門広場のざわめき', note: '町に着いてすぐ流れる曲。' },
  { no: '03', title: '十三回目の鐘', note: '本題に入るところ。低い音を重ねた。' },
  { no: '04', title: '水車は回りつづける', note: '川ぞいの曲。三拍子。' },
];

/** 日記 */
const DIARY = [
  {
    date: '2026/06/18',
    title: '川べりを歩く',
    body:
      '取材と称して川べりを歩いてきた。水車小屋というものは、近くで見ると思ったより静かで、'
      + '軋む音ばかりが大きい。作中の音を作りなおすことにする。',
  },
  {
    date: '2026/04/07',
    title: '鐘の数え方',
    body:
      '鐘が鳴り終わるまでの時間を計るナゾを入れた。数えるのは鐘ではなく、その間のほう。'
      + '自分でも一度まちがえたので、たぶん出来はよい。',
  },
];

/** 掲示板（読むだけ） */
const BBS = [
  { no: 12, name: '通りすがり', date: '2026/08/13 22:41', body: '体験版遊びました。時計塔の演出が好きです。' },
  { no: 11, name: '管理人', date: '2026/08/12 09:02', body: '体験版を公開しました。感想などいただけると励みになります。' },
  { no: 10, name: 'みなも', date: '2026/07/31 18:20', body: '水車小屋の曲、三拍子なのが良い。' },
];

/** リンク */
const LINKS = [
  { name: '楓花亭', note: '町の宿。うちの絵をよく描いてくださる方のサイト。' },
  { name: '歯車工房', note: '機械の絵と資料。時計の構造を教えていただきました。' },
  { name: '同人音楽の部屋', note: '相互リンク。曲の感想でお世話になっています。' },
];

export function CircleSite() {
  const [page, setPage] = useState<PageId>('top');
  const count = useAccessCount();

  return (
    <div className="circle">
      <div className="circle__frame">
        {/* 看板 */}
        <div className="circle__banner">
          <h1 className="circle__title">楓花幻燈団</h1>
          <p className="circle__sub">ふうかげんとうだん ／ since 2003</p>
        </div>

        <div className="circle__body">
          {/* 左の品書き */}
          <nav className="circle__menu">
            <p className="circle__menu-head">■ もくじ</p>
            <ul>
              {MENU.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className={`circle__link${page === m.id ? ' circle__link--on' : ''}`}
                    onClick={() => setPage(m.id)}
                  >
                    {m.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="circle__menu-note">
              このサイトはリンクフリーです。
              <br />
              相互リンクをご希望の方は
              <br />
              掲示板までどうぞ。
            </p>
          </nav>

          {/* 右の本文 */}
          <main className="circle__main">
            {page === 'top' && <TopPage />}
            {page === 'works' && <WorksPage />}
            {page === 'music' && <MusicPage />}
            {page === 'diary' && <DiaryPage />}
            {page === 'bbs' && <BbsPage />}
            {page === 'link' && <LinkPage />}
          </main>
        </div>

        {/* 下の帯 */}
        <div className="circle__footer">
          <p className="circle__counter">
            あなたは <span className="circle__digits">{count}</span> 人目のお客様です
          </p>
          <p className="circle__copy">Copyright (C) 2003-2026 楓花幻燈団 All Rights Reserved.</p>
          <p className="circle__note">
            ※ このページは www16.big.or.jp/~zun/top.html の作りを手本にした習作です。
            名前も中身も架空のものです。
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---- 中身 ---- */

function TopPage() {
  return (
    <>
      <h2 className="circle__h2">■ ごあいさつ</h2>
      <p className="circle__p">
        個人でゲームと音楽を作っています。いまは推理仕立ての作品を一本、
        少しずつ組み立てているところです。
        <br />
        更新は気まぐれですが、月に一度は何かしら置くようにしています。
      </p>

      <h2 className="circle__h2">■ 更新履歴</h2>
      <dl className="circle__history">
        {HISTORY.map((h) => (
          <div key={h.date}>
            <dt>{h.date}</dt>
            <dd>{h.body}</dd>
          </div>
        ))}
      </dl>

      <h2 className="circle__h2">■ おしらせ</h2>
      <p className="circle__p">
        体験版の配布を始めました。「作品紹介」からどうぞ。
        <br />
        感想は掲示板か、下のメールアドレスまで。
      </p>
      <p className="circle__mail">mail : fuuka(at)example.invalid</p>
    </>
  );
}

function WorksPage() {
  return (
    <>
      <h2 className="circle__h2">■ 作品紹介</h2>
      <table className="circle__table">
        <thead>
          <tr>
            <th>番号</th>
            <th>題名</th>
            <th>頒布</th>
            <th>種別</th>
          </tr>
        </thead>
        <tbody>
          {WORKS.map((w) => (
            <tr key={w.no}>
              <td>{w.no}</td>
              <td>{w.title}</td>
              <td>{w.year}</td>
              <td>{w.kind}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="circle__p">
        いずれも一人で作っています。動作環境はごく普通の窓辺の機械であれば大丈夫です。
      </p>
    </>
  );
}

function MusicPage() {
  return (
    <>
      <h2 className="circle__h2">■ 音楽</h2>
      <p className="circle__p">
        作中で使っている曲です。試聴用に短くしたものを置いています。
      </p>
      <ul className="circle__tracks">
        {TRACKS.map((t) => (
          <li key={t.no}>
            <span className="circle__trackno">{t.no}</span>
            <span className="circle__trackname">{t.title}</span>
            <span className="circle__tracknote">{t.note}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function DiaryPage() {
  return (
    <>
      <h2 className="circle__h2">■ 日記</h2>
      {DIARY.map((d) => (
        <div key={d.date} className="circle__entry">
          <p className="circle__entry-head">
            {d.date}　{d.title}
          </p>
          <p className="circle__p">{d.body}</p>
        </div>
      ))}
    </>
  );
}

function BbsPage() {
  return (
    <>
      <h2 className="circle__h2">■ 掲示板</h2>
      <p className="circle__p">
        書きこみは受け付けを止めています（読むだけの見本です）。
      </p>
      {BBS.map((b) => (
        <div key={b.no} className="circle__post">
          <p className="circle__post-head">
            [{b.no}] {b.name} ／ {b.date}
          </p>
          <p className="circle__p">{b.body}</p>
        </div>
      ))}
    </>
  );
}

function LinkPage() {
  return (
    <>
      <h2 className="circle__h2">■ リンク</h2>
      <ul className="circle__links">
        {LINKS.map((l) => (
          <li key={l.name}>
            <span className="circle__linkname">{l.name}</span>
            <span className="circle__linknote">{l.note}</span>
          </li>
        ))}
      </ul>
      <p className="circle__p">当サイトはリンクフリーです。ご報告も不要です。</p>
    </>
  );
}

/* ---- アクセスカウンタ ---- */

/** カウンタの見せかけ。開くたびに一つ増え、たまに勝手に回る。 */
function useAccessCount(): string {
  const [n, setN] = useState(() => 128_400 + Math.floor(Math.random() * 90));
  useEffect(() => {
    const id = setInterval(() => setN((v) => v + 1), 9000);
    return () => clearInterval(id);
  }, []);
  return String(n).padStart(7, '0');
}
