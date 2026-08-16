import { useState, type HTMLAttributes, type ReactNode } from 'react';
import type { BackgroundId, SceneImage } from '../types';
import { SceneImageArt } from './SceneImageArt';

/** 場所ごとの色づかい */
interface Palette {
  sky: [string, string];
  far: string;
  wall: string[];
  roof: string[];
  road: string;
  roadEdge: string;
}

const PALETTES: Record<BackgroundId, Palette> = {
  highway: {
    sky: ['#c7e2ee', '#f6ecd6'],
    far: '#94b47e',
    wall: ['#a8c48e', '#98b880', '#b4cf9a'],
    roof: ['#7f9a68', '#6e8a59', '#8fa876'],
    road: '#c9b183',
    roadEdge: '#a8906a',
  },
  gate: {
    sky: ['#cfe4ef', '#f5e8d0'],
    far: '#9db785',
    wall: ['#e8d6b4', '#e0cba5', '#efdfc0'],
    roof: ['#c56b52', '#d2a05c', '#b3654e'],
    road: '#c2a878',
    roadEdge: '#a98d5f',
  },
  plaza: {
    sky: ['#bcdcea', '#f7ecd4'],
    far: '#a8bd8c',
    wall: ['#f0dfbe', '#e6cfa8', '#f6e7c8'],
    roof: ['#b3543f', '#c89a58', '#a85b46'],
    road: '#d3bb8d',
    roadEdge: '#b39c6f',
  },
  clocktower: {
    sky: ['#9fbdd2', '#e6dac2'],
    far: '#8fa87c',
    wall: ['#ddcaa8', '#cbb692', '#e4d3b3'],
    roof: ['#8a6a4c', '#a3784f', '#7c5d45'],
    road: '#b8a37c',
    roadEdge: '#9a8666',
  },
  inn: {
    sky: ['#e8c9a0', '#f7dfba'],
    far: '#a08359',
    wall: ['#8a6644', '#7a5637', '#96714d'],
    roof: ['#5c3f27', '#6e4c30', '#4f351f'],
    road: '#7b5c3c',
    roadEdge: '#63482e',
  },
  alley: {
    sky: ['#8ca3bb', '#c4bda9'],
    far: '#6f7a77',
    wall: ['#5f5548', '#544b40', '#6a5f51'],
    roof: ['#3f382f', '#4a4239', '#372f28'],
    road: '#6f6553',
    roadEdge: '#584f41',
  },
  river: {
    sky: ['#b6d8e2', '#eae6cc'],
    far: '#7fa06a',
    wall: ['#cdbf9c', '#bcae8c', '#dacdaa'],
    roof: ['#7a6a4a', '#8f7a52', '#67583c'],
    road: '#a8a37c',
    roadEdge: '#8b8664',
  },
  night: {
    sky: ['#2c3d5e', '#5a5f7c'],
    far: '#3f4a63',
    wall: ['#4a4a5e', '#404052', '#55556a'],
    roof: ['#2e2e3d', '#383848', '#262633'],
    road: '#3a3648',
    roadEdge: '#2b2839',
  },
};

/** 建物の並び（幅・高さ・色番号）。道すじが単調にならないようずらしてある。 */
const BUILDINGS = [
  [70, 150, 0],
  [58, 120, 1],
  [82, 176, 2],
  [64, 134, 1],
  [76, 162, 0],
  [56, 112, 2],
  [88, 184, 1],
  [66, 142, 0],
  [72, 156, 2],
  [60, 126, 1],
  [80, 170, 0],
  [62, 130, 2],
] as const;

interface Props {
  bg: BackgroundId;
  /** 0（左はし）〜 1（右はし）で表したカメラ位置 */
  cameraT: number;
  /** ドラッグで見わたすための handler をまとめて受けとる */
  surface?: HTMLAttributes<HTMLDivElement>;
  /**
   * 3 層のかわりに敷く一枚の画像。
   * 手前の層と同じ幅・同じ速さで動くので、置いたものの座標はそのまま通じる。
   */
  image?: SceneImage;
  /** 建物より手前、人物より奥に挟むもの（エフェクトの差し込み口） */
  back?: ReactNode;
  /** 道の上に置くもの（人・ナゾ・キラキラ・出口） */
  children: ReactNode;
}

/**
 * street シーンの背景。
 * 奥・中・手前の 3 層をちがう速さで動かして、道を進んでいる感じを出す。
 * 手前の層は横幅 300%、その中の座標がそのまま「道の 0〜1」になる。
 *
 * `image` を渡すと、3 層のかわりに横長の画像を一枚敷く。
 * 動く速さは手前の層と同じにしてあるので、人やナゾの立ち位置はずれない。
 */
export function StreetBackdrop({ bg, cameraT, surface, image, back, children }: Props) {
  const pal = PALETTES[bg];
  const t = Math.min(Math.max(cameraT, 0), 1);
  /** 画像を読めなかったか。読めなければ描いた 3 層に戻す。 */
  const [imageFailed, setImageFailed] = useState(false);
  const usingImage = image != null && !imageFailed;

  /**
   * translateX の % は「その要素じたいの幅」に対する割合。
   * 幅 L%（画面に対する割合）の層がすみからすみまで動く量は (L-100)/L。
   * 手前 300% → 66.7%、中 200% → 50%、奥 140% → 28.6%。
   * この比がそのまま層ごとの動く速さのちがいになる。
   */
  const shiftNear = t * (200 / 3);
  const shiftMid = t * 50;
  const shiftFar = t * (40 / 1.4);

  return (
    <div className="street__world" {...surface}>
      {/* 背景を画像に差しかえたシーン。3 層のかわりに一枚だけ敷く。 */}
      {usingImage && (
        <div
          className="street__layer street__layer--photo"
          style={{ transform: `translateX(${-shiftNear}%)` }}
        >
          <SceneImageArt
            image={image}
            className="street__photo"
            onFail={() => setImageFailed(true)}
          />
        </div>
      )}

      {/* 空 */}
      {!usingImage && (
        <div
          className="street__sky"
          style={{
            background: `linear-gradient(${pal.sky[0]}, ${pal.sky[1]})`,
          }}
        />
      )}

      {/* 奥の層と中の層。画像を敷いたシーンでは描かない。 */}
      {!usingImage && (
        <>
        <div
          className="street__layer street__layer--far"
          style={{ transform: `translateX(${-shiftFar}%)` }}
        >
          <svg viewBox="0 0 560 400" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0 210 Q70 168 140 200 Q210 232 280 196 Q350 162 420 198 Q490 230 560 200 L560 400 L0 400 Z"
              fill={pal.far}
            />
            <path
              d="M0 246 Q100 220 200 248 Q300 276 400 246 Q480 222 560 244 L560 400 L0 400 Z"
              fill={pal.far}
              opacity="0.75"
            />
          </svg>
        </div>

        {/* 中の層：建物の列 */}
        <div
          className="street__layer street__layer--mid"
          style={{ transform: `translateX(${-shiftMid}%)` }}
        >
          <svg viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true">
            {/* 街道と川ぞいは町の外なので、建物ではなく並木を並べる */}
            {(bg === 'highway' || bg === 'river') &&
              Array.from({ length: 10 }, (_, i) => {
                const x = 40 + i * 78;
                const h = 96 + (i % 3) * 26;
                return (
                  <g key={`t-${i}`}>
                    <rect x={x - 5} y={300 - h * 0.42} width="10" height={h * 0.42} fill="#7a5b3e" />
                    <ellipse cx={x} cy={300 - h * 0.52} rx={34} ry={h * 0.34} fill={pal.roof[i % 3]} />
                    <ellipse
                      cx={x - 8}
                      cy={300 - h * 0.62}
                      rx={22}
                      ry={h * 0.24}
                      fill={pal.wall[i % 3]}
                      opacity="0.75"
                    />
                  </g>
                );
              })}
            {bg !== 'highway' &&
              bg !== 'river' &&
              BUILDINGS.map(([w, h, c], i) => {
              const x = i * 66;
              const top = 300 - h;
              return (
                <g key={i}>
                  <rect x={x} y={top} width={w} height={h} fill={pal.wall[c]} />
                  <path
                    d={`M${x - 6} ${top} L${x + w + 6} ${top} L${x + w / 2} ${top - 26} Z`}
                    fill={pal.roof[c]}
                  />
                  <rect
                    x={x + w * 0.2}
                    y={top + 26}
                    width={w * 0.24}
                    height={h * 0.18}
                    fill={pal.roof[c]}
                    opacity="0.45"
                  />
                  <rect
                    x={x + w * 0.56}
                    y={top + 26}
                    width={w * 0.24}
                    height={h * 0.18}
                    fill={pal.roof[c]}
                    opacity="0.45"
                  />
                </g>
              );
            })}

            {/* 場所ごとの目じるし */}
            {bg === 'highway' && (
              <g transform="translate(392 196)">
                <rect x="-5" y="0" width="10" height="104" fill="#8a6f45" />
                <path d="M-58 6 L46 6 L58 22 L46 38 L-58 38 Z" fill="#d8bf90" />
                <text x="-6" y="30" textAnchor="middle" fontSize="19" fontWeight="800" fill="#6b5230">
                  メープル町 →
                </text>
              </g>
            )}
            {bg === 'clocktower' && (
              <g transform="translate(360 40)">
                <path d="M-34 260 L-24 0 L24 0 L34 260 Z" fill={pal.wall[1]} />
                <path d="M-30 0 L0 -40 L30 0 Z" fill={pal.roof[2]} />
                <circle cx="0" cy="54" r="26" fill="#f6ecd6" stroke="#6f5a41" strokeWidth="5" />
                <path d="M0 54 L0 36" stroke="#4c3d2c" strokeWidth="4" strokeLinecap="round" />
                <path d="M0 54 L15 62" stroke="#4c3d2c" strokeWidth="4" strokeLinecap="round" />
              </g>
            )}
            {bg === 'gate' && (
              <g>
                <rect x="150" y="130" width="26" height="170" fill="#8c6a4a" />
                <rect x="330" y="130" width="26" height="170" fill="#8c6a4a" />
                <rect x="140" y="118" width="226" height="18" fill="#7a5b3e" />
                <text
                  x="253"
                  y="112"
                  textAnchor="middle"
                  fill="#6b4d33"
                  fontSize="26"
                  fontWeight="700"
                >
                  MAPLE
                </text>
              </g>
            )}
            {bg === 'river' && (
              <g transform="translate(300 150)">
                {/* 水車小屋。大きな水輪が川に浸かっている。 */}
                <rect x="-70" y="20" width="130" height="130" fill={pal.wall[0]} />
                <path d="M-80 22 L70 22 L-5 -34 Z" fill={pal.roof[0]} />
                <rect x="-30" y="70" width="34" height="46" fill={pal.roof[2]} opacity="0.6" />
                <circle cx="86" cy="98" r="46" fill="none" stroke="#6b5942" strokeWidth="7" />
                <circle cx="86" cy="98" r="7" fill="#6b5942" />
                {[0, 45, 90, 135].map((a) => (
                  <rect
                    key={a}
                    x="40"
                    y="95"
                    width="92"
                    height="6"
                    fill="#6b5942"
                    transform={`rotate(${a} 86 98)`}
                  />
                ))}
                <path
                  d="M-160 140 Q0 128 200 142 L200 160 L-160 160 Z"
                  fill="#7fa8b4"
                  opacity="0.8"
                />
              </g>
            )}
            {bg === 'plaza' && (
              <g transform="translate(400 210)">
                <circle cx="0" cy="60" r="52" fill="#c9b48c" />
                <circle cx="0" cy="60" r="36" fill="#a8d3d8" />
                <rect x="-8" y="6" width="16" height="56" fill="#9a8a6c" />
                <circle cx="0" cy="0" r="18" fill="#c9b48c" />
              </g>
            )}
            {bg === 'inn' && (
              <g transform="translate(380 150)">
                <circle cx="0" cy="0" r="34" fill="#f0c86a" opacity="0.9" />
                <circle cx="0" cy="0" r="58" fill="#f0c86a" opacity="0.25" />
                <rect x="-70" y="46" width="140" height="16" rx="4" fill="#4a3120" />
                <text x="0" y="58" textAnchor="middle" fill="#f2dcae" fontSize="11" fontWeight="700">
                  まんげつ亭
                </text>
              </g>
            )}
          </svg>
        </div>
        </>
      )}

      {/* 奥のエフェクト（建物の上、人より奥） */}
      {back}

      {/* 手前の層：道と、その上に立つ人 */}
      <div
        className="street__layer street__layer--near"
        style={{ transform: `translateX(${-shiftNear}%)` }}
      >
        {!usingImage && (
          <svg
            className="street__road"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect x="0" y="296" width="1200" height="8" fill={pal.roadEdge} />
            <rect x="0" y="304" width="1200" height="96" fill={pal.road} />
            {/* 敷石 */}
            {Array.from({ length: 40 }, (_, i) => (
              <rect
                key={i}
                x={i * 30 + (i % 2 ? 8 : 0)}
                y="318"
                width="22"
                height="10"
                rx="3"
                fill={pal.roadEdge}
                opacity="0.42"
              />
            ))}
            {Array.from({ length: 26 }, (_, i) => (
              <rect
                key={`b-${i}`}
                x={i * 46 + 14}
                y="352"
                width="34"
                height="12"
                rx="4"
                fill={pal.roadEdge}
                opacity="0.28"
              />
            ))}
          </svg>
        )}

        {children}
      </div>
    </div>
  );
}
