import type { FigureId } from '../types';

/** 文字ばんだけの時計を描く（針の角度は度で指定） */
function ClockFace({
  cx,
  cy,
  r,
  hour,
  minute,
  dim,
}: {
  cx: number;
  cy: number;
  r: number;
  hour: number;
  minute: number;
  dim?: boolean;
}) {
  const hourAngle = (hour % 12) * 30 + minute * 0.5 - 90;
  const minAngle = minute * 6 - 90;
  const rad = (d: number) => (d * Math.PI) / 180;
  const face = dim ? '#e3d7bf' : '#f8efdb';
  const ink = dim ? '#8a7a63' : '#4c3d2c';

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={face} stroke="#6f5a41" strokeWidth={r * 0.09} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = rad(i * 30 - 90);
        return (
          <circle
            key={i}
            cx={cx + Math.cos(a) * r * 0.78}
            cy={cy + Math.sin(a) * r * 0.78}
            r={r * 0.05}
            fill={ink}
          />
        );
      })}
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(rad(hourAngle)) * r * 0.46}
        y2={cy + Math.sin(rad(hourAngle)) * r * 0.46}
        stroke={ink}
        strokeWidth={r * 0.11}
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(rad(minAngle)) * r * 0.68}
        y2={cy + Math.sin(rad(minAngle)) * r * 0.68}
        stroke={ink}
        strokeWidth={r * 0.08}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r * 0.07} fill={ink} />
    </g>
  );
}

/** 歯車ひとつ */
function Gear({
  cx,
  cy,
  r,
  teeth,
  fill,
}: {
  cx: number;
  cy: number;
  r: number;
  teeth: number;
  fill: string;
}) {
  return (
    <g>
      {Array.from({ length: teeth }, (_, i) => {
        const a = ((i * 360) / teeth) * (Math.PI / 180);
        return (
          <rect
            key={i}
            x={cx - r * 0.13}
            y={cy - r - r * 0.22}
            width={r * 0.26}
            height={r * 0.28}
            rx={r * 0.06}
            fill={fill}
            transform={`rotate(${(a * 180) / Math.PI} ${cx} ${cy})`}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx} cy={cy} r={r * 0.3} fill="#f6ecd4" />
    </g>
  );
}

interface Props {
  id: FigureId;
}

/** ナゾに添える図。すべて SVG で描いている。 */
export function PuzzleFigure({ id }: Props) {
  return (
    <div className="figure">
      <svg viewBox="0 0 320 130" className="figure__svg" aria-hidden="true">
        {id === 'strike' && (
          <g>
            <ClockFace cx={58} cy={65} r={44} hour={3} minute={0} />
            {[130, 170, 210, 250].map((x, i) => (
              <g key={x}>
                <path
                  d={`M${x} 52 C${x} 34 ${x + 22} 34 ${x + 22} 52 L${x + 26} 62 L${x - 4} 62 Z`}
                  fill="#c9a04a"
                />
                <circle cx={x + 11} cy={68} r={4} fill="#a37f34" />
                <text
                  x={x + 11}
                  y={92}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="#8a6f45"
                >
                  {i === 3 ? '…' : `${i + 1}`}
                </text>
              </g>
            ))}
          </g>
        )}

        {id === 'bell' && (
          <g>
            <path
              d="M132 74 C132 40 158 26 158 26 C158 26 184 40 184 74 L192 88 L124 88 Z"
              fill="#c9a04a"
            />
            <circle cx="158" cy="96" r="7" fill="#a37f34" />
            <rect x="150" y="18" width="16" height="10" rx="4" fill="#8a6f45" />
            {[1, 2, 3].map((i) => (
              <g key={i} opacity={1 - i * 0.22}>
                <path
                  d={`M${196 + i * 16} ${44 + i * 4} Q${206 + i * 16} 62 ${196 + i * 16} ${80 - i * 4}`}
                  stroke="#b08a3c"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d={`M${124 - i * 16} ${44 + i * 4} Q${114 - i * 16} 62 ${124 - i * 16} ${80 - i * 4}`}
                  stroke="#b08a3c"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        )}

        {id === 'mirror' && (
          <g>
            <ClockFace cx={82} cy={65} r={46} hour={4} minute={20} />
            <text x="82" y="126" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6f45">
              鏡に映った時計
            </text>
            <rect x="152" y="10" width="6" height="110" rx="3" fill="#9fc0cc" opacity="0.8" />
            <ClockFace cx={228} cy={65} r={46} hour={7} minute={40} dim />
            <text x="228" y="126" textAnchor="middle" fontSize="14" fontWeight="800" fill="#c2551e">
              ？
            </text>
          </g>
        )}

        {id === 'gears' && (
          <g>
            <Gear cx={48} cy={66} r={32} teeth={10} fill="#b9863f" />
            <Gear cx={122} cy={66} r={32} teeth={10} fill="#a5763a" />
            <Gear cx={196} cy={66} r={32} teeth={10} fill="#b9863f" />
            <Gear cx={270} cy={66} r={32} teeth={10} fill="#a5763a" />
            <path
              d="M34 22 A 22 22 0 0 1 66 24"
              stroke="#c2551e"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M66 24 L58 14 L72 16 Z" fill="#c2551e" />
            <text x="270" y="122" textAnchor="middle" fontSize="14" fontWeight="800" fill="#c2551e">
              ？
            </text>
          </g>
        )}

        {id === 'hands' && (
          <g>
            <ClockFace cx={80} cy={65} r={46} hour={12} minute={0} />
            <text x="80" y="126" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6f45">
              12時に重なる
            </text>
            <path
              d="M144 65 L184 65"
              stroke="#8a6f45"
              strokeWidth="3"
              strokeDasharray="6 5"
              strokeLinecap="round"
            />
            <path d="M184 65 L174 59 L174 71 Z" fill="#8a6f45" />
            <ClockFace cx={240} cy={65} r={46} hour={1} minute={5} dim />
            <text x="240" y="126" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6f45">
              次はいつ？
            </text>
          </g>
        )}

        {id === 'clocks3' && (
          <g>
            <ClockFace cx={58} cy={60} r={40} hour={10} minute={11} />
            <text x="58" y="120" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6f45">
              1分進む
            </text>
            <ClockFace cx={160} cy={60} r={40} hour={10} minute={9} />
            <text x="160" y="120" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6f45">
              1分遅れる
            </text>
            <ClockFace cx={262} cy={60} r={40} hour={10} minute={10} dim />
            <text x="262" y="120" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6f45">
              止まっている
            </text>
          </g>
        )}

        {id === 'riddle' && (
          <g>
            {/* 街道の道しるべ */}
            <rect x="150" y="46" width="12" height="76" fill="#8a6f45" />
            <path d="M52 34 L150 34 L150 60 L52 60 L40 47 Z" fill="#d8bf90" />
            <path d="M162 66 L262 66 L274 79 L262 92 L162 92 Z" fill="#c9ab7b" />
            <text x="100" y="53" textAnchor="middle" fontSize="13" fontWeight="800" fill="#6b5230">
              朝 → 昼 → 夜
            </text>
            <text x="214" y="85" textAnchor="middle" fontSize="13" fontWeight="800" fill="#6b5230">
              4 → 2 → 3 本
            </text>
            <text x="52" y="112" textAnchor="middle" fontSize="22" fontWeight="800" fill="#c2551e">
              ？
            </text>
          </g>
        )}

        {id === 'flower' && (
          <g>
            {/* 門と、その向こうの丘に咲く花 */}
            <rect x="96" y="30" width="12" height="86" fill="#8c6a4a" />
            <rect x="152" y="30" width="12" height="86" fill="#8c6a4a" />
            <rect x="88" y="22" width="84" height="12" fill="#7a5b3e" />
            <path d="M0 116 L320 116" stroke="#a98d5f" strokeWidth="5" />
            <path d="M198 116 Q248 66 298 116 Z" fill="#9db785" />
            {[228, 252, 274].map((x, i) => (
              <g key={x}>
                <path d={`M${x} 116 L${x} ${98 - i * 4}`} stroke="#5f8a4a" strokeWidth="2.5" />
                <circle cx={x} cy={94 - i * 4} r="6" fill="#d98fae" />
                <circle cx={x} cy={94 - i * 4} r="2.4" fill="#f4e2c6" />
              </g>
            ))}
            <text x="126" y="112" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6b5230">
              門（通った者なし）
            </text>
          </g>
        )}

        {id === 'lamps' && (
          <g>
            {/* 4 階 4 列の窓 */}
            <rect x="96" y="12" width="128" height="106" rx="4" fill="#c3ab84" />
            {Array.from({ length: 16 }, (_, n) => {
              const r = Math.floor(n / 4);
              const c = n % 4;
              const lit = r === c;
              return (
                <rect
                  key={n}
                  x={106 + c * 30}
                  y={20 + r * 25}
                  width="20"
                  height="17"
                  rx="2"
                  fill={lit ? '#f0c86a' : '#6f5a41'}
                  stroke="#5c422c"
                  strokeWidth="1.5"
                />
              );
            })}
            <text x="46" y="70" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6f45">
              各階に一つ
            </text>
            <text x="278" y="70" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6f45">
              各列に一つ
            </text>
          </g>
        )}

        {id === 'timeline' && (
          <g>
            {/* 夜の出来事の帯 */}
            <path d="M22 66 L298 66" stroke="#b79a6f" strokeWidth="4" strokeLinecap="round" />
            <path d="M298 66 L286 60 L286 72 Z" fill="#b79a6f" />
            {[
              [46, '9時'],
              [110, '10時'],
              [174, '？'],
              [238, '10時半'],
              [286, '11時'],
            ].map(([x, label], i) => (
              <g key={i}>
                <circle
                  cx={x as number}
                  cy={66}
                  r={label === '？' ? 9 : 7}
                  fill={label === '？' ? '#c2551e' : '#c9a04a'}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={x as number}
                  y={46}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="#8a6f45"
                >
                  {label as string}
                </text>
              </g>
            ))}
            <text x="160" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6f45">
              早い順に並べかえる
            </text>
          </g>
        )}
        {id === 'water' && (
          <g>
            {/* 水を受けて回る水輪。腕（スポーク）と歯が見えるように描く。 */}
            <g transform="translate(112 62)">
              <circle r="48" fill="none" stroke="#8a6f45" strokeWidth="6" />
              <circle r="9" fill="#8a6f45" />
              {[0, 45, 90, 135].map((a) => (
                <rect
                  key={a}
                  x="-50"
                  y="-3"
                  width="100"
                  height="6"
                  rx="3"
                  fill="#a3854f"
                  transform={`rotate(${a})`}
                />
              ))}
              {Array.from({ length: 12 }, (_, i) => (
                <rect
                  key={`p-${i}`}
                  x="-5"
                  y="-58"
                  width="10"
                  height="14"
                  rx="2"
                  fill="#c9a04a"
                  transform={`rotate(${i * 30})`}
                />
              ))}
            </g>
            <path
              d="M186 46 Q214 44 240 52 Q266 60 296 56"
              stroke="#7fa8b4"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M176 118 Q220 108 268 118 Q292 122 312 116"
              stroke="#7fa8b4"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
            />
            <text x="244" y="92" textAnchor="middle" fontSize="12" fontWeight="700" fill="#8a6f45">
              歯と、腕と、水
            </text>
          </g>
        )}
        {id === 'sacks' && (
          <g>
            {/* 口を縛った袋を四つ。中身は伏せてある。 */}
            {[
              [56, 1.0],
              [122, 0.86],
              [188, 0.72],
              [254, 0.6],
            ].map(([x, k]) => {
              const w = 44 * (k as number);
              const h = 68 * (k as number);
              return (
                <g key={x as number} transform={`translate(${x} ${112 - h})`}>
                  <path
                    d={`M${-w / 2} ${h} Q${-w / 2 - 4} 12 0 6 Q${w / 2 + 4} 12 ${w / 2} ${h} Z`}
                    fill="#cbb68d"
                  />
                  <ellipse cx="0" cy="8" rx={w * 0.3} ry="5" fill="#a8906a" />
                  <path
                    d={`M${-w / 2 + 6} ${h * 0.42} Q0 ${h * 0.34} ${w / 2 - 6} ${h * 0.42}`}
                    stroke="#a8906a"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <text
                    x="0"
                    y={h + 14}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="800"
                    fill="#8a6f45"
                  >
                    ？
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}
