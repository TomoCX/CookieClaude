import { useMemo, useState } from 'react';
import {
  GOODS,
  NEWS,
  RELEASES,
  yen,
  type Goods,
  type GoodsArtId,
  type NewsCategory,
  type NewsItem,
  type Release,
} from '../data/records';

/**
 * レーベルのポータルサイト。
 *
 * reissuerecords.net の作りを手本にした習作で、名前も中身も架空のもの。
 * 手本にしたのは **一枚で終わらず、中に頁を持つ型**で、
 *
 * - 上に並んだ品書きから、NEWS / DISCOGRAPHY / SHOP / ABOUT へ移る
 * - NEWS は一覧から記事へ、SHOP は棚から品物へ、さらに下の階層がある
 * - SHOP には買い物かごがあり、入れた数が上の帯に出つづける
 *
 * ほかの二つと違って、**中で行き先が変わる**のがこのサイトの挙動。
 * どこにいるかは下の `Route` 一つだけが持っていて、
 * 「戻る」はすべてその値を書きかえるだけで済ませている。
 */

/** いまどの頁にいるか */
type Route =
  | { name: 'home' }
  | { name: 'news' }
  | { name: 'newsItem'; id: string }
  | { name: 'discography' }
  | { name: 'releaseItem'; id: string }
  | { name: 'shop' }
  | { name: 'goodsItem'; id: string }
  | { name: 'about' }
  | { name: 'cart' };

/** 上の品書き。押すとその行き先へ移る。 */
const NAV: { route: Route; label: string }[] = [
  { route: { name: 'home' }, label: 'HOME' },
  { route: { name: 'news' }, label: 'NEWS' },
  { route: { name: 'discography' }, label: 'DISCOGRAPHY' },
  { route: { name: 'shop' }, label: 'SHOP' },
  { route: { name: 'about' }, label: 'ABOUT' },
];

const CATEGORIES: NewsCategory[] = ['RELEASE', 'LIVE', 'MEDIA', 'GOODS'];

/** かごの中身（品物の id → 個数） */
type Cart = Record<string, number>;

export function RecordsSite() {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [cart, setCart] = useState<Cart>({});

  const cartCount = useMemo(
    () => Object.values(cart).reduce((n, v) => n + v, 0),
    [cart],
  );

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const drop = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });

  /** いまの品書きで灯すもの。下の階層にいても、親を灯したままにする。 */
  const activeNav =
    route.name === 'newsItem'
      ? 'news'
      : route.name === 'releaseItem'
        ? 'discography'
        : route.name === 'goodsItem' || route.name === 'cart'
          ? 'shop'
          : route.name;

  return (
    <div className="rec">
      {/* 上の帯 */}
      <header className="rec__head">
        <button type="button" className="rec__logo" onClick={() => setRoute({ name: 'home' })}>
          RE:PRESS
          <em>RECORDS</em>
        </button>
        <nav className="rec__nav">
          {NAV.map((n) => (
            <button
              key={n.label}
              type="button"
              className={`rec__navlink${activeNav === n.route.name ? ' rec__navlink--on' : ''}`}
              onClick={() => setRoute(n.route)}
            >
              {n.label}
            </button>
          ))}
          <button
            type="button"
            className={`rec__cart${cartCount > 0 ? ' rec__cart--on' : ''}`}
            onClick={() => setRoute({ name: 'cart' })}
          >
            CART<span>{cartCount}</span>
          </button>
        </nav>
      </header>

      <main className="rec__main">
        {route.name === 'home' && <Home go={setRoute} />}
        {route.name === 'news' && <NewsList go={setRoute} />}
        {route.name === 'newsItem' && <NewsDetail id={route.id} go={setRoute} />}
        {route.name === 'discography' && <Discography go={setRoute} />}
        {route.name === 'releaseItem' && <ReleaseDetail id={route.id} go={setRoute} />}
        {route.name === 'shop' && <Shop go={setRoute} onAdd={add} />}
        {route.name === 'goodsItem' && <GoodsDetail id={route.id} go={setRoute} onAdd={add} />}
        {route.name === 'cart' && <CartPage cart={cart} go={setRoute} onDrop={drop} />}
        {route.name === 'about' && <About />}
      </main>

      <footer className="rec__foot">
        <p className="rec__foot-logo">RE:PRESS RECORDS</p>
        <p className="rec__foot-links">NEWS ／ DISCOGRAPHY ／ SHOP ／ ABOUT ／ CONTACT</p>
        <p className="rec__foot-copy">© 2026 RE:PRESS RECORDS</p>
        <p className="rec__foot-note">
          ※ このページは reissuerecords.net の作りを手本にした習作です。
          名前も記事も品物も架空のもので、実在の人物・団体とは関係ありません。
        </p>
      </footer>
    </div>
  );
}

/* ---- HOME ---- */

function Home({ go }: { go: (r: Route) => void }) {
  const latest = RELEASES[0];
  return (
    <>
      {latest && (
        <section className="rec-hero">
          <div className="rec-hero__art">
            <Jacket release={latest} />
          </div>
          <div className="rec-hero__text">
            <p className="rec-hero__tag">NEW RELEASE</p>
            <h1 className="rec-hero__title">{latest.title}</h1>
            <p className="rec-hero__meta">
              {latest.kind}　{latest.date}
            </p>
            <p className="rec-hero__note">{latest.note}</p>
            <button
              type="button"
              className="rec__button"
              onClick={() => go({ name: 'releaseItem', id: latest.id })}
            >
              MORE →
            </button>
          </div>
        </section>
      )}

      <Section head="NEWS" onMore={() => go({ name: 'news' })}>
        <ul className="rec-newslist">
          {NEWS.slice(0, 4).map((n) => (
            <NewsRow key={n.id} item={n} onClick={() => go({ name: 'newsItem', id: n.id })} />
          ))}
        </ul>
      </Section>

      <Section head="SHOP" onMore={() => go({ name: 'shop' })}>
        <div className="rec-goods">
          {GOODS.slice(0, 3).map((g) => (
            <GoodsCard key={g.id} item={g} onClick={() => go({ name: 'goodsItem', id: g.id })} />
          ))}
        </div>
      </Section>
    </>
  );
}

/* ---- NEWS ---- */

function NewsList({ go }: { go: (r: Route) => void }) {
  const [filter, setFilter] = useState<NewsCategory | 'ALL'>('ALL');
  const shown = filter === 'ALL' ? NEWS : NEWS.filter((n) => n.category === filter);

  return (
    <>
      <PageHead head="NEWS" lead="お知らせ" />
      <div className="rec__filters">
        {(['ALL', ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            className={`rec__filter${filter === c ? ' rec__filter--on' : ''}`}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="rec-newslist">
        {shown.map((n) => (
          <NewsRow key={n.id} item={n} onClick={() => go({ name: 'newsItem', id: n.id })} />
        ))}
      </ul>
      {shown.length === 0 && <p className="rec__empty">この区分のお知らせはありません。</p>}
    </>
  );
}

function NewsRow({ item, onClick }: { item: NewsItem; onClick: () => void }) {
  return (
    <li className="rec-newsrow">
      <button type="button" onClick={onClick}>
        <span className="rec-newsrow__date">{item.date}</span>
        <span className={`rec-tag rec-tag--${item.category.toLowerCase()}`}>{item.category}</span>
        <span className="rec-newsrow__title">{item.title}</span>
      </button>
    </li>
  );
}

function NewsDetail({ id, go }: { id: string; go: (r: Route) => void }) {
  const item = NEWS.find((n) => n.id === id);
  if (!item) return <NotFound go={go} />;
  return (
    <article className="rec-article">
      <Back label="NEWS 一覧へ" onClick={() => go({ name: 'news' })} />
      <p className="rec-article__meta">
        <span>{item.date}</span>
        <span className={`rec-tag rec-tag--${item.category.toLowerCase()}`}>{item.category}</span>
      </p>
      <h1 className="rec-article__title">{item.title}</h1>
      {item.body.map((p) => (
        <p key={p} className="rec-article__p">
          {p}
        </p>
      ))}
    </article>
  );
}

/* ---- DISCOGRAPHY ---- */

function Discography({ go }: { go: (r: Route) => void }) {
  return (
    <>
      <PageHead head="DISCOGRAPHY" lead="作品" />
      <div className="rec-discs">
        {RELEASES.map((r) => (
          <button
            key={r.id}
            type="button"
            className="rec-disc"
            onClick={() => go({ name: 'releaseItem', id: r.id })}
          >
            <Jacket release={r} />
            <span className="rec-disc__kind">{r.kind}</span>
            <span className="rec-disc__title">{r.title}</span>
            <span className="rec-disc__date">{r.date}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function ReleaseDetail({ id, go }: { id: string; go: (r: Route) => void }) {
  const item = RELEASES.find((r) => r.id === id);
  if (!item) return <NotFound go={go} />;
  return (
    <article className="rec-article">
      <Back label="DISCOGRAPHY へ" onClick={() => go({ name: 'discography' })} />
      <div className="rec-release">
        <div className="rec-release__art">
          <Jacket release={item} />
        </div>
        <div>
          <p className="rec-article__meta">
            <span>{item.date}</span>
            <span className="rec-tag rec-tag--release">{item.kind}</span>
          </p>
          <h1 className="rec-article__title">{item.title}</h1>
          <p className="rec-article__p">{item.note}</p>
          <h2 className="rec__sub">TRACK LIST</h2>
          <ol className="rec-tracks">
            {item.tracks.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}

/* ---- SHOP ---- */

function Shop({ go, onAdd }: { go: (r: Route) => void; onAdd: (id: string) => void }) {
  return (
    <>
      <PageHead head="SHOP" lead="通販" />
      <div className="rec-goods">
        {GOODS.map((g) => (
          <GoodsCard
            key={g.id}
            item={g}
            onClick={() => go({ name: 'goodsItem', id: g.id })}
            onAdd={g.soldOut ? undefined : () => onAdd(g.id)}
          />
        ))}
      </div>
      <p className="rec__note">
        送料は全国一律 600 円（税込 10,000 円以上で無料）。これは見本の売り場なので、
        押しても注文は行われません。
      </p>
    </>
  );
}

function GoodsCard({
  item,
  onClick,
  onAdd,
}: {
  item: Goods;
  onClick: () => void;
  onAdd?: () => void;
}) {
  return (
    <div className={`rec-goodscard${item.soldOut ? ' rec-goodscard--out' : ''}`}>
      <button type="button" className="rec-goodscard__body" onClick={onClick}>
        <span className="rec-goodscard__art">
          <GoodsArt art={item.art} />
        </span>
        <span className="rec-goodscard__name">{item.name}</span>
        <span className="rec-goodscard__price">{yen(item.price)}</span>
      </button>
      {item.soldOut ? (
        <p className="rec-goodscard__out">SOLD OUT</p>
      ) : (
        onAdd && (
          <button type="button" className="rec__button rec__button--slim" onClick={onAdd}>
            カートに入れる
          </button>
        )
      )}
    </div>
  );
}

function GoodsDetail({
  id,
  go,
  onAdd,
}: {
  id: string;
  go: (r: Route) => void;
  onAdd: (id: string) => void;
}) {
  const item = GOODS.find((g) => g.id === id);
  const [size, setSize] = useState<string | null>(null);
  if (!item) return <NotFound go={go} />;
  const needsSize = (item.sizes?.length ?? 0) > 0;

  return (
    <article className="rec-article">
      <Back label="SHOP へ" onClick={() => go({ name: 'shop' })} />
      <div className="rec-release">
        <div className="rec-release__art">
          <GoodsArt art={item.art} />
        </div>
        <div>
          <p className="rec-article__meta">
            <span className={`rec-tag rec-tag--${item.category.toLowerCase()}`}>
              {item.category}
            </span>
          </p>
          <h1 className="rec-article__title">{item.name}</h1>
          <p className="rec-price">{yen(item.price)}</p>
          <p className="rec-article__p">{item.note}</p>

          {needsSize && (
            <>
              <h2 className="rec__sub">SIZE</h2>
              <div className="rec__filters">
                {item.sizes?.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`rec__filter${size === s ? ' rec__filter--on' : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {item.soldOut ? (
            <p className="rec-goodscard__out">SOLD OUT</p>
          ) : (
            <button
              type="button"
              className="rec__button"
              disabled={needsSize && size === null}
              onClick={() => onAdd(item.id)}
            >
              {needsSize && size === null ? 'サイズを選ぶ' : 'カートに入れる'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function CartPage({
  cart,
  go,
  onDrop,
}: {
  cart: Record<string, number>;
  go: (r: Route) => void;
  onDrop: (id: string) => void;
}) {
  const rows = GOODS.filter((g) => (cart[g.id] ?? 0) > 0);
  const total = rows.reduce((sum, g) => sum + g.price * (cart[g.id] ?? 0), 0);

  return (
    <>
      <PageHead head="CART" lead="買い物かご" />
      {rows.length === 0 ? (
        <>
          <p className="rec__empty">かごは空です。</p>
          <button type="button" className="rec__button" onClick={() => go({ name: 'shop' })}>
            SHOP へ →
          </button>
        </>
      ) : (
        <>
          <ul className="rec-cart">
            {rows.map((g) => (
              <li key={g.id}>
                <span className="rec-cart__art">
                  <GoodsArt art={g.art} />
                </span>
                <span className="rec-cart__name">{g.name}</span>
                <span className="rec-cart__qty">× {cart[g.id]}</span>
                <span className="rec-cart__price">{yen(g.price * (cart[g.id] ?? 0))}</span>
                <button type="button" className="rec-cart__drop" onClick={() => onDrop(g.id)}>
                  削除
                </button>
              </li>
            ))}
          </ul>
          <p className="rec-cart__total">
            合計 <strong>{yen(total)}</strong>
          </p>
          <p className="rec__note">
            見本の売り場なので、ここから先へは進めません（注文も送信もされません）。
          </p>
        </>
      )}
    </>
  );
}

/* ---- ABOUT ---- */

function About() {
  return (
    <article className="rec-article">
      <PageHead head="ABOUT" lead="レーベルについて" />
      <p className="rec-article__p">
        RE:PRESS RECORDS は、一度きりで消えていく録音を、もう一度組み直して世に出すための小さなレーベルです。
        2019 年、四畳半の一室から始めました。
      </p>
      <p className="rec-article__p">
        原盤の管理から、ジャケットの絵、通販の梱包まで、いまも二人で行っています。
        取り扱いは年に数枚ですが、そのぶん一枚ずつ長く売り続けます。
      </p>
      <h2 className="rec__sub">CONTACT</h2>
      <dl className="rec-contact">
        <div>
          <dt>作品について</dt>
          <dd>info(at)example.invalid</dd>
        </div>
        <div>
          <dt>通販について</dt>
          <dd>shop(at)example.invalid</dd>
        </div>
        <div>
          <dt>取材・出演</dt>
          <dd>press(at)example.invalid</dd>
        </div>
      </dl>
    </article>
  );
}

/* ---- 小さな部品 ---- */

function Section({
  head,
  onMore,
  children,
}: {
  head: string;
  onMore: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rec-section">
      <div className="rec-section__bar">
        <h2 className="rec-section__head">{head}</h2>
        <button type="button" className="rec-section__more" onClick={onMore}>
          VIEW ALL →
        </button>
      </div>
      {children}
    </section>
  );
}

function PageHead({ head, lead }: { head: string; lead: string }) {
  return (
    <div className="rec-pagehead">
      <h1>{head}</h1>
      <p>{lead}</p>
    </div>
  );
}

function Back({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="rec-back" onClick={onClick}>
      ← {label}
    </button>
  );
}

function NotFound({ go }: { go: (r: Route) => void }) {
  return (
    <>
      <PageHead head="404" lead="頁が見つかりません" />
      <button type="button" className="rec__button" onClick={() => go({ name: 'home' })}>
        HOME へ →
      </button>
    </>
  );
}

/** ジャケット。色相だけを変えて、同じ幾何の絵を描く。 */
function Jacket({ release }: { release: Release }) {
  const h = release.hue;
  return (
    <svg viewBox="0 0 120 120" className="rec-jacket" aria-hidden="true">
      <rect width="120" height="120" fill={`hsl(${h} 32% 18%)`} />
      <circle cx="60" cy="60" r="42" fill="none" stroke={`hsl(${h} 62% 62%)`} strokeWidth="1.2" />
      <circle cx="60" cy="60" r="30" fill={`hsl(${h} 52% 48%)`} opacity="0.5" />
      <circle cx="60" cy="60" r="17" fill={`hsl(${h} 68% 72%)`} />
      <circle cx="60" cy="60" r="4" fill={`hsl(${h} 32% 18%)`} />
      <path
        d={`M0 ${86 + (h % 12)} Q30 ${70 + (h % 20)} 60 ${86 + (h % 12)} T120 ${86 + (h % 12)} L120 120 L0 120 Z`}
        fill={`hsl(${h} 46% 34%)`}
        opacity="0.85"
      />
    </svg>
  );
}

/** 品物の絵。写真は使わず、輪郭だけで見分ける。 */
function GoodsArt({ art }: { art: GoodsArtId }) {
  return (
    <svg viewBox="0 0 120 120" className="rec-goodsart" aria-hidden="true">
      <rect width="120" height="120" fill="#f2f0eb" />
      {art === 'tee' && (
        <g fill="#2b2b2b">
          <path d="M40 30 L52 24 Q60 32 68 24 L80 30 L88 44 L76 50 L76 96 L44 96 L44 50 L32 44 Z" />
          <rect x="52" y="60" width="16" height="16" fill="#f2f0eb" />
        </g>
      )}
      {art === 'tote' && (
        <g>
          <rect x="34" y="44" width="52" height="54" fill="#2b2b2b" />
          <path
            d="M46 44 V36 A14 14 0 0 1 74 36 V44"
            fill="none"
            stroke="#2b2b2b"
            strokeWidth="4"
          />
          <rect x="50" y="62" width="20" height="18" fill="#f2f0eb" />
        </g>
      )}
      {art === 'disc' && (
        <g>
          <rect x="24" y="24" width="72" height="72" fill="#2b2b2b" />
          <circle cx="60" cy="60" r="24" fill="none" stroke="#f2f0eb" strokeWidth="1.4" />
          <circle cx="60" cy="60" r="9" fill="#f2f0eb" />
          <circle cx="60" cy="60" r="2.4" fill="#2b2b2b" />
        </g>
      )}
      {art === 'print' && (
        <g>
          <rect x="30" y="20" width="60" height="80" fill="#fff" stroke="#2b2b2b" strokeWidth="2" />
          <rect x="38" y="30" width="44" height="30" fill="#2b2b2b" opacity="0.82" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="38" y={68 + i * 7} width={i === 3 ? 24 : 44} height="3" fill="#8a8a8a" />
          ))}
        </g>
      )}
    </svg>
  );
}
