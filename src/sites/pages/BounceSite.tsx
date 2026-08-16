import { useEffect, useRef, useState } from 'react';

/**
 * 一枚ものの商品ページ。
 *
 * www.nike-react.com の作りを手本にした習作で、商品も文句も架空のもの。
 * 手本にしたのは **一つの商品だけを、上から下へ見せきる型**で、
 *
 * - 画面いっぱいの色面を、下へ送るたびに切りかえていく
 * - 文字は大きく詰めて置き、行間より字の主張が強い
 * - 見えたところから順に、遅れて浮かびあがる
 * - 色を選ばせて、ページ全体の配色をその場で変える
 *
 * 古風な個人サイト（`CircleSite`）とは逆に、**動きそのものが中身**の型。
 */

/** 選べる配色。押すとページ全体の色が入れかわる。 */
const COLORWAYS = [
  { id: 'volt', name: 'VOLT', ink: '#141414', base: '#d8f24a', deep: '#233a05' },
  { id: 'ember', name: 'EMBER', ink: '#1a0d08', base: '#ff5a1f', deep: '#4a1405' },
  { id: 'tide', name: 'TIDE', ink: '#04161f', base: '#3fd2e8', deep: '#06323f' },
  { id: 'plum', name: 'PLUM', ink: '#170a1e', base: '#c07bff', deep: '#3a1152' },
] as const;

type ColorwayId = (typeof COLORWAYS)[number]['id'];

/** 言いたいこと三つ。数と単位を大きく出す。 */
const CLAIMS = [
  { value: '13', unit: '%', head: 'よりやわらかく', body: '前の世代より沈みこみが深い。着地の角が丸くなる。' },
  { value: '11', unit: '%', head: 'より軽く', body: '同じ厚みのまま、持ったときの手ごたえだけが減っている。' },
  { value: '2.1', unit: '×', head: 'より長く', body: '踏みかためても、へたるまでの距離が倍以上に伸びた。' },
];

/** 品ぞろえ */
const SHOES = [
  { name: 'BOUNCE ONE', use: '毎日の道', price: '¥13,200' },
  { name: 'BOUNCE TRAIL', use: '土と石', price: '¥16,500' },
  { name: 'BOUNCE LOW', use: '町なか', price: '¥11,000' },
];

export function BounceSite() {
  const [colorway, setColorway] = useState<ColorwayId>('volt');
  const page = useRef<HTMLDivElement>(null);
  const current = COLORWAYS.find((c) => c.id === colorway) ?? COLORWAYS[0];

  useReveal(page);

  return (
    <div
      className="bounce"
      ref={page}
      style={
        {
          '--bnc-ink': current.ink,
          '--bnc-base': current.base,
          '--bnc-deep': current.deep,
        } as React.CSSProperties
      }
    >
      {/* 幕開け */}
      <section className="bnc-hero">
        <div className="bnc-hero__mark" aria-hidden="true">
          <Blob />
        </div>
        <h1 className="bnc-hero__title">
          <span>B</span>
          <span>O</span>
          <span>U</span>
          <span>N</span>
          <span>C</span>
          <span>E</span>
        </h1>
        <p className="bnc-hero__lead">踏むたびに、返ってくる。</p>
        <p className="bnc-hero__scroll">SCROLL ↓</p>
      </section>

      {/* 言いたいこと */}
      <section className="bnc-claims">
        {CLAIMS.map((c) => (
          <article key={c.head} className="bnc-claim reveal">
            <p className="bnc-claim__value">
              {c.value}
              <em>{c.unit}</em>
            </p>
            <h2 className="bnc-claim__head">{c.head}</h2>
            <p className="bnc-claim__body">{c.body}</p>
          </article>
        ))}
      </section>

      {/* 色を選ぶ */}
      <section className="bnc-color">
        <h2 className="bnc-section__head reveal">COLORWAY</h2>
        <p className="bnc-section__lead reveal">押すと、このページごと色が変わる。</p>
        <div className="bnc-color__chips">
          {COLORWAYS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`bnc-chip${c.id === colorway ? ' bnc-chip--on' : ''}`}
              style={{ background: c.base, borderColor: c.deep }}
              onClick={() => setColorway(c.id)}
            >
              <span style={{ color: c.deep }}>{c.name}</span>
            </button>
          ))}
        </div>
        <div className="bnc-color__stage reveal">
          <Blob big />
          <p className="bnc-color__name">{current.name}</p>
        </div>
      </section>

      {/* 品ぞろえ */}
      <section className="bnc-shoes">
        <h2 className="bnc-section__head reveal">THE LINE</h2>
        <div className="bnc-shoes__grid">
          {SHOES.map((s) => (
            <article key={s.name} className="bnc-shoe reveal">
              <div className="bnc-shoe__art" aria-hidden="true">
                <Shoe />
              </div>
              <h3 className="bnc-shoe__name">{s.name}</h3>
              <p className="bnc-shoe__use">{s.use}</p>
              <p className="bnc-shoe__price">{s.price}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 締め */}
      <section className="bnc-end">
        <p className="bnc-end__big reveal">GO ON.</p>
        <p className="bnc-end__note">
          ※ このページは www.nike-react.com の作りを手本にした習作です。
          商品も文句も架空のもので、実在の会社とは関係ありません。
        </p>
      </section>
    </div>
  );
}

/* ---- 絵 ---- */

/** 弾む球。着地でつぶれ、跳ねあがるところで伸びる。 */
function Blob({ big }: { big?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className={`bnc-blob${big ? ' bnc-blob--big' : ''}`} aria-hidden="true">
      <ellipse className="bnc-blob__shadow" cx="100" cy="158" rx="52" ry="9" />
      <g className="bnc-blob__body">
        <circle cx="100" cy="96" r="56" />
        <circle className="bnc-blob__gloss" cx="80" cy="76" r="16" />
      </g>
    </svg>
  );
}

/** 靴の輪郭。細部は描かず、影だけで形を出す。 */
function Shoe() {
  return (
    <svg viewBox="0 0 220 110" className="bnc-shoeart" aria-hidden="true">
      <path
        className="bnc-shoeart__sole"
        d="M12 84 Q10 96 24 98 L188 98 Q210 96 208 82 Q206 72 188 70 L150 66 Q120 62 96 48 Q72 34 52 34 Q30 34 24 52 Q18 70 12 84 Z"
      />
      <path
        className="bnc-shoeart__upper"
        d="M28 62 Q34 42 54 42 Q72 42 94 56 Q116 70 150 74 L184 78 Q196 80 196 86 L28 86 Z"
      />
      <path className="bnc-shoeart__swash" d="M60 74 Q104 58 152 82 L150 88 Q104 68 62 80 Z" />
      <rect className="bnc-shoeart__foam" x="12" y="86" width="196" height="12" rx="6" />
    </svg>
  );
}

/* ---- 見えたら浮かびあがらせる ---- */

/**
 * `.reveal` の付いたものを、枠に入ったところで灯す。
 *
 * **見張る枠はこのページ自身ではない。** サイトは画面の中で入れ子になっていて、
 * 縦に流れるのは一つ外側（`.siteview__page`）のほう。自分を `root` に渡すと、
 * 枠が中身の丈と同じになってしまい、最初から全部が「見えている」ことになる。
 * そこで、縦に流れる先祖をたどって渡す。
 */
function useReveal(page: React.RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const el = page.current;
    if (!el) return;
    const targets = el.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('reveal--on');
            io.unobserve(e.target);
          }
        }
      },
      { root: scrollParent(el), rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    );
    for (const t of targets) io.observe(t);
    return () => io.disconnect();
  }, [page]);
}

/** 縦に流れるいちばん近い先祖。見つからなければ null（＝ウィンドウ）。 */
function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const overflow = getComputedStyle(p).overflowY;
    if (overflow === 'auto' || overflow === 'scroll') return p;
  }
  return null;
}
