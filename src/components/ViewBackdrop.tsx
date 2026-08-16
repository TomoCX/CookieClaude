import { useState, type ReactNode } from 'react';
import type { BackdropId, SceneImage, SceneKind } from '../types';
import { SceneImageArt } from './SceneImageArt';

/**
 * view・closeup シーンの背景。
 *
 * street と違って層に分かれておらず、見わたしもしない。
 * 一枚の絵の上に、置いたものを x・y でそのまま並べる。
 * closeup のときは周囲を落として、一点を凝視している感じにする。
 */

interface Props {
  backdrop: BackdropId;
  kind: SceneKind;
  /** 背景に敷く画像。書かなければ SVG で描いた絵を使う。 */
  image?: SceneImage;
  /** 絵の上に置くもの（人・ナゾ・キラキラ・出口） */
  children: ReactNode;
}

export function ViewBackdrop({ backdrop, kind, image, children }: Props) {
  /** 画像を読めなかったか。読めなければ描いた絵に戻す。 */
  const [imageFailed, setImageFailed] = useState(false);
  const usingImage = image != null && !imageFailed;

  return (
    <div className={`viewscene viewscene--${backdrop}`}>
      {usingImage ? (
        <SceneImageArt
          image={image}
          className="viewscene__art viewscene__art--photo"
          onFail={() => setImageFailed(true)}
        />
      ) : (
        <svg
          className="viewscene__art"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {backdrop === 'manhole' && <Manhole />}
          {backdrop === 'noticeboard' && <Noticeboard />}
          {backdrop === 'room' && <Room />}
          {backdrop === 'mill' && <Mill />}
        </svg>
      )}

      {/* closeup は、まわりを落として真ん中に目を寄せる */}
      {kind === 'closeup' && <div className="viewscene__vignette" aria-hidden="true" />}

      <div className="viewscene__stage">{children}</div>
    </div>
  );
}

/** マンホールの底。上のふたの穴から光が落ちている。 */
function Manhole() {
  return (
    <g>
      <rect x="0" y="0" width="400" height="300" fill="#221f26" />
      {/* 側壁のれんが */}
      {Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 11 }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * 38 - (r % 2 ? 19 : 0)}
            y={r * 34}
            width="35"
            height="30"
            rx="3"
            fill={['#3a3440', '#332e3a', '#413a47'][(r + c) % 3]}
          />
        )),
      )}
      {/* 上から落ちる光 */}
      <ellipse cx="200" cy="-40" rx="120" ry="70" fill="#e8d9a8" opacity="0.16" />
      <path d="M120 0 L280 0 L246 300 L154 300 Z" fill="#f2e3b4" opacity="0.1" />
      {/* 底の水たまり */}
      <ellipse cx="200" cy="262" rx="150" ry="34" fill="#2b3a42" />
      <ellipse cx="200" cy="258" rx="132" ry="26" fill="#3c525c" opacity="0.85" />
      <ellipse cx="176" cy="252" rx="52" ry="10" fill="#6d8f9c" opacity="0.35" />
      {/* 壁を伝う配管 */}
      <rect x="330" y="40" width="16" height="220" rx="6" fill="#4b4550" />
      <rect x="325" y="96" width="26" height="12" rx="3" fill="#5a5360" />
      <rect x="325" y="188" width="26" height="12" rx="3" fill="#5a5360" />
      {/* 見あげたふちの影 */}
      <path d="M0 0 L400 0 L400 22 Q200 46 0 22 Z" fill="#15131a" opacity="0.8" />
    </g>
  );
}

/** まんげつ亭の帳場。棚と飾りの並ぶ部屋の中。 */
function Room() {
  return (
    <g>
      {/* 壁と床 */}
      <rect x="0" y="0" width="400" height="300" fill="#6b543c" />
      <rect x="0" y="0" width="400" height="196" fill="#7d6446" />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={i * 29} y="0" width="2" height="196" fill="#6d573c" opacity="0.5" />
      ))}
      <rect x="0" y="190" width="400" height="10" fill="#5a462f" />
      {/* 床板 */}
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={`f-${i}`} x="0" y={200 + i * 15} width="400" height="13" fill={i % 2 ? '#59422b' : '#624a31'} />
      ))}

      {/* 左の棚 */}
      <rect x="16" y="52" width="122" height="140" rx="3" fill="#4e3a26" />
      <rect x="22" y="58" width="110" height="128" fill="#654c33" />
      {[0, 1, 2].map((r) => (
        <rect key={`s-${r}`} x="22" y={94 + r * 32} width="110" height="5" fill="#4e3a26" />
      ))}
      {/* 棚の中の小物 */}
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect
            key={`b-${r}-${c}`}
            x={30 + c * 25}
            y={70 + r * 32}
            width={9 + ((r + c) % 3) * 3}
            height="22"
            rx="1.5"
            fill={['#a8543c', '#5f7f5a', '#c2a05a', '#7a6ea8'][(r * 4 + c) % 4]}
          />
        )),
      )}

      {/* 右の飾り棚と壺 */}
      <rect x="262" y="96" width="118" height="8" fill="#4e3a26" />
      <ellipse cx="296" cy="86" rx="16" ry="12" fill="#8a9a6d" />
      <path d="M282 86 Q284 62 296 58 Q308 62 310 86 Z" fill="#9aab7b" />
      <rect x="332" y="62" width="30" height="34" rx="2" fill="#c8b58a" />
      <path d="M332 62 L362 62 L347 50 Z" fill="#a8925f" />

      {/* 壁の絵 */}
      <rect x="168" y="46" width="76" height="58" rx="2" fill="#3f3020" />
      <rect x="174" y="52" width="64" height="46" fill="#cfd8c2" />
      <path d="M174 84 Q192 66 210 82 Q226 96 238 84 L238 98 L174 98 Z" fill="#8aa17a" />
      <circle cx="220" cy="64" r="7" fill="#e8d18a" />

      {/* 帳場の机 */}
      <rect x="150" y="196" width="132" height="12" rx="2" fill="#4e3a26" />
      <rect x="158" y="208" width="12" height="44" fill="#43301f" />
      <rect x="262" y="208" width="12" height="44" fill="#43301f" />
      <rect x="182" y="182" width="42" height="16" rx="2" fill="#efe3c4" />
      <rect x="186" y="186" width="34" height="2" fill="#b7a179" />
      <rect x="186" y="191" width="26" height="2" fill="#b7a179" />

      {/* 灯り */}
      <circle cx="200" cy="18" r="26" fill="#f0c86a" opacity="0.24" />
      <rect x="196" y="0" width="8" height="14" fill="#4e3a26" />
      <path d="M182 14 L218 14 L212 30 L188 30 Z" fill="#e8c98a" />
    </g>
  );
}

/**
 * 水車小屋の中。右手に大きな歯車、左手に麦袋、奥の壁に掛け釘。
 *
 * このシーンは `src/data/images.ts` の画像に差しかえてあるので、
 * ふだんはこの絵は出ない。画像を読めなかったときにここへ戻る。
 */
function Mill() {
  return (
    <g>
      {/* 板張りの壁と床 */}
      <rect x="0" y="0" width="400" height="300" fill="#4b3f2e" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x="0" y={i * 34} width="400" height="30" fill={i % 2 ? '#54472f' : '#4b3f2e'} />
      ))}
      <rect x="0" y="252" width="400" height="48" fill="#3a3021" />

      {/* 高窓から差す光 */}
      <rect x="24" y="26" width="58" height="46" rx="4" fill="#cddbe0" opacity="0.85" />
      <path d="M24 72 L82 72 L150 300 L36 300 Z" fill="#f2e3b4" opacity="0.1" />

      {/* 右手の大きな歯車 */}
      <g transform="translate(292 150)">
        <circle r="86" fill="none" stroke="#6b5942" strokeWidth="13" />
        <circle r="16" fill="#6b5942" />
        {[0, 45, 90, 135].map((a) => (
          <rect
            key={a}
            x="-92"
            y="-5"
            width="184"
            height="10"
            rx="4"
            fill="#6b5942"
            transform={`rotate(${a})`}
          />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <rect
            key={`t-${i}`}
            x="-6"
            y="-100"
            width="12"
            height="16"
            rx="2"
            fill="#7d694e"
            transform={`rotate(${i * 22.5})`}
          />
        ))}
      </g>

      {/* 左手の麦袋 */}
      <g>
        <path d="M22 268 Q16 200 46 194 Q78 200 72 268 Z" fill="#cbb68d" />
        <path d="M28 210 Q46 202 66 210" stroke="#a8906a" strokeWidth="3" fill="none" />
        <path d="M78 268 Q74 216 98 212 Q124 216 120 268 Z" fill="#bda87f" />
        <ellipse cx="99" cy="214" rx="14" ry="5" fill="#a8906a" />
      </g>

      {/* 奥の壁の掛け釘 */}
      <g transform="translate(168 74)">
        <rect x="-4" y="0" width="52" height="6" rx="3" fill="#33291c" />
        <circle cx="6" cy="10" r="4" fill="#6b5942" />
        <circle cx="40" cy="10" r="4" fill="#6b5942" />
        <path d="M2 12 Q-8 60 8 96 L38 96 Q52 58 44 12 Z" fill="#5e7f74" />
        <path d="M18 12 L18 96" stroke="#4c6b61" strokeWidth="3" />
      </g>

      {/* 床に散った粉 */}
      <ellipse cx="196" cy="276" rx="86" ry="14" fill="#d8c9a6" opacity="0.28" />
    </g>
  );
}

/** 時計塔の掲示板。貼り紙に寄った図。 */
function Noticeboard() {
  return (
    <g>
      <rect x="0" y="0" width="400" height="300" fill="#5b4630" />
      {/* 板目 */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={i}
          x="0"
          y={i * 52}
          width="400"
          height="48"
          fill={i % 2 ? '#654d34' : '#5a422c'}
        />
      ))}
      {/* 主役の貼り紙 */}
      <g transform="rotate(-1.5 200 150)">
        <rect x="86" y="52" width="228" height="196" rx="3" fill="#efe3c4" />
        <rect x="86" y="52" width="228" height="196" rx="3" fill="none" stroke="#c9b68e" strokeWidth="2" />
        <text x="200" y="92" textAnchor="middle" fontSize="21" fontWeight="800" fill="#6b4f30">
          町からのお報せ
        </text>
        <path d="M112 106 H288" stroke="#c2ab7e" strokeWidth="2" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x="112"
            y={124 + i * 17}
            width={i === 5 ? 96 : 176}
            height="6"
            rx="3"
            fill="#b7a179"
            opacity="0.75"
          />
        ))}
        <text x="200" y="232" textAnchor="middle" fontSize="13" fill="#8a6b45">
          十三回目の鐘に、ご用心
        </text>
      </g>
      {/* 剥がれかけた別の紙 */}
      <g transform="rotate(6 60 90)">
        <rect x="16" y="56" width="70" height="84" rx="2" fill="#e4d6b6" opacity="0.9" />
        <path d="M16 56 L86 56 L82 74 L20 70 Z" fill="#d6c69f" />
      </g>
      {/* 画鋲の穴 */}
      <circle cx="200" cy="62" r="2.6" fill="#3d2c1a" opacity="0.7" />
      <circle cx="104" cy="238" r="2.6" fill="#3d2c1a" opacity="0.7" />
    </g>
  );
}
