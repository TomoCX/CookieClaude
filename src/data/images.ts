import type { SceneImage } from '../types';

/**
 * シーンの背景に使える画像の登録簿。
 *
 * ## 決まりごと
 *
 * - **遊ぶ人は差しかえられない。** 開発者がこのファイルを書きかえる前提。
 *   設定にも出さない（BGM のように端末へ保存したりもしない）
 * - **素材そのものはリポジトリに置かない。** 画像は各自で用意し、
 *   `src` に URL を書くか、`src/assets/` へ置いたものを import して渡す
 * - 既定は今までどおり SVG で描いた背景。`Scene.image` を書いたシーンだけが
 *   画像に差しかわり、**画像が読めなければ描いた背景に戻る**
 *
 * ## 足しかた
 *
 * 1. ここに `SceneImage` を一つ足す（id は `img_*`）
 * 2. `src/data/scenes.ts` の、そのシーンに `image: 'img_*'` を書く
 * 3. `street` シーンでは横長の一枚（画面 3 枚分の幅）を、
 *    `view` / `closeup` では画面と同じ比率の一枚を用意する
 *
 * ```ts
 * // 手元の画像を束ねる場合
 * import millPhoto from '../assets/mill.jpg';
 * { id: 'img_mill_inside', src: millPhoto }
 *
 * // 外に置いた画像を指す場合
 * { id: 'img_mill_inside', src: 'https://example.com/mill.jpg' }
 * ```
 */

/**
 * 見本用に、その場で作る一枚。
 * リポジトリへ素材を置かずに仕組みを通せるよう、SVG を data URI にしてある。
 * 本物の写真や絵を使うときは、この行ごと `src` を差しかえる。
 */
function drawn(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' '))}`;
}

export const SCENE_IMAGES: SceneImage[] = [
  {
    id: 'img_mill_inside',
    credit: '見本。手元の画像を使うときは src を差しかえる。',
    src: drawn(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6b5c46"/>
            <stop offset="100%" stop-color="#463b2c"/>
          </linearGradient>
          <linearGradient id="ray" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stop-color="#f5e6b8" stop-opacity="0.34"/>
            <stop offset="100%" stop-color="#f5e6b8" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#wall)"/>
        <g stroke="#3c3123" stroke-width="4" opacity="0.55">
          <path d="M0 60 H400"/><path d="M0 122 H400"/><path d="M0 184 H400"/>
        </g>
        <rect x="26" y="24" width="62" height="50" rx="4" fill="#cddbe0" opacity="0.9"/>
        <path d="M26 74 L88 74 L164 260 L44 260 Z" fill="url(#ray)"/>
        <circle cx="300" cy="150" r="94" fill="none" stroke="#5a4a34" stroke-width="15"/>
        <g stroke="#5a4a34" stroke-width="11">
          <path d="M300 58 V242"/><path d="M208 150 H392"/>
          <path d="M235 85 L365 215"/><path d="M365 85 L235 215"/>
        </g>
        <circle cx="300" cy="150" r="19" fill="#6b5942"/>
        <rect x="162" y="54" width="56" height="7" rx="3" fill="#2e2619"/>
        <circle cx="172" cy="64" r="5" fill="#7d694e"/><circle cx="208" cy="64" r="5" fill="#7d694e"/>
        <path d="M172 66 Q156 76 158 96 L168 98 Q162 84 172 78 Z" fill="#4f6f65"/>
        <path d="M208 66 Q224 76 222 96 L212 98 Q218 84 208 78 Z" fill="#4f6f65"/>
        <path d="M172 66 Q190 76 208 66 Q216 112 206 152 L174 152 Q164 112 172 66 Z" fill="#5e7f74"/>
        <path d="M190 72 V152" stroke="#4c6b61" stroke-width="3"/>
        <path d="M30 262 Q22 196 64 190 Q106 196 98 262 Z" fill="#cbb68d"/>
        <ellipse cx="64" cy="192" rx="17" ry="6" fill="#a8906a"/>
        <path d="M40 224 Q64 216 88 224" stroke="#a8906a" stroke-width="3" fill="none"/>
        <path d="M100 262 Q94 208 128 202 Q162 208 156 262 Z" fill="#bda87f"/>
        <ellipse cx="128" cy="204" rx="14" ry="5" fill="#9c8767"/>
        <rect x="0" y="258" width="400" height="42" fill="#332a1e"/>
        <ellipse cx="196" cy="268" rx="96" ry="15" fill="#d8c9a6" opacity="0.22"/>
      </svg>
    `),
  },
];

/** id から背景画像を引く */
export function getSceneImage(id: string | undefined): SceneImage | undefined {
  return id ? SCENE_IMAGES.find((i) => i.id === id) : undefined;
}
