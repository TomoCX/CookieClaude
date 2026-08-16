import type { ItemIcon as IconId } from '../types';

interface Props {
  icon: IconId;
  className?: string;
}

/** 収集アイテムの絵。外部画像は使わず SVG で描く。 */
export function ItemArt({ icon, className }: Props) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {icon === 'ticket' && (
        <g>
          <path d="M6 15 H42 V22 A3 3 0 0 0 42 28 V35 H6 V28 A3 3 0 0 0 6 22 Z" fill="#e8d5aa" />
          <path d="M26 15 V35" stroke="#b9a072" strokeWidth="2" strokeDasharray="3 3" />
          <rect x="10" y="20" width="12" height="2.4" rx="1" fill="#8a6f45" />
          <rect x="10" y="25" width="9" height="2.4" rx="1" fill="#a8905f" />
          <rect x="30" y="22" width="9" height="6" rx="1.5" fill="#c2551e" opacity="0.7" />
        </g>
      )}
      {icon === 'berry' && (
        <g>
          <path d="M24 16 C20 10 14 10 13 14" stroke="#5f8a4a" strokeWidth="2.5" fill="none" />
          <path d="M24 17 L18 12 L26 12 Z" fill="#5f8a4a" />
          <circle cx="19" cy="28" r="8" fill="#c2404a" />
          <circle cx="29" cy="26" r="7" fill="#a83440" />
          <circle cx="24" cy="34" r="6.5" fill="#d4525c" />
          <circle cx="17" cy="26" r="1.6" fill="#f2b7bd" opacity="0.8" />
        </g>
      )}
      {icon === 'stone' && (
        <g>
          <path d="M8 30 Q10 18 24 17 Q39 18 40 29 Q38 36 24 37 Q10 36 8 30 Z" fill="#9c9384" />
          <path d="M8 30 Q10 18 24 17 Q30 17 34 20 Q18 22 12 33 Z" fill="#b3aa9a" />
          <path d="M16 27 L18 31 L20 27 M23 26 L23 32 M27 26 L27 32 L31 32" stroke="#5d574c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      )}
      {icon === 'key' && (
        <g>
          <circle cx="15" cy="20" r="8" fill="none" stroke="#9a7a44" strokeWidth="4.5" />
          <path d="M19 25 L36 39" stroke="#9a7a44" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M31 30 L36 26 M35 34 L39 30" stroke="#9a7a44" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="15" cy="20" r="3" fill="#6f5a41" />
        </g>
      )}
      {icon === 'flower' && (
        <g>
          <path d="M24 26 L24 40" stroke="#5f8a4a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 33 Q17 31 15 36 Q22 38 24 33 Z" fill="#6f9459" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="24"
              cy="16"
              rx="5"
              ry="8"
              fill="#d98fae"
              transform={`rotate(${a} 24 22)`}
              opacity="0.92"
            />
          ))}
          <circle cx="24" cy="22" r="4" fill="#f0c86a" />
        </g>
      )}
      {icon === 'tile' && (
        <g>
          <path d="M9 14 L39 12 L37 36 L11 34 Z" fill="#a8c6cc" />
          <path d="M9 14 L39 12 L38 20 L10 21 Z" fill="#c2dbdf" />
          <path d="M30 30 L39 36 L33 37 Z" fill="#7f9ba1" />
          <text x="23" y="30" textAnchor="middle" fontSize="9" fontWeight="800" fill="#4d6a70">
            1863
          </text>
        </g>
      )}
      {icon === 'paper' && (
        <g>
          <path d="M12 8 H34 L36 40 L14 41 Z" fill="#f4ead2" />
          <path d="M14 41 L36 40 L34 8 L30 14 L26 8 L22 14 L18 8 Z" fill="#f4ead2" />
          <path d="M12 8 H34" stroke="#c9b088" strokeWidth="1.4" />
          {[17, 23, 29, 35].map((y) => (
            <rect key={y} x="17" y={y} width={y === 23 ? 8 : 14} height="2" rx="1" fill="#b8a37f" />
          ))}
        </g>
      )}
      {icon === 'coaster' && (
        <g>
          <circle cx="24" cy="24" r="16" fill="#c8a978" />
          <circle cx="24" cy="24" r="13" fill="#dcc094" />
          <circle cx="24" cy="24" r="8" fill="none" stroke="#a8845a" strokeWidth="1.6" />
          <circle cx="24" cy="24" r="5.5" fill="#f2e2b8" />
          <path d="M12 18 A 14 14 0 0 0 12 30" stroke="#a8845a" strokeWidth="1.2" fill="none" opacity="0.7" />
        </g>
      )}
      {icon === 'screw' && (
        <g>
          <rect x="20" y="8" width="8" height="26" rx="1.5" fill="#c9a04a" />
          <path d="M24 34 L20 30 L28 30 Z" fill="#a8843a" />
          <ellipse cx="24" cy="10" rx="9" ry="4" fill="#dcb862" />
          <path d="M18 10 H30" stroke="#8a6f2f" strokeWidth="2" />
          {[16, 21, 26].map((y) => (
            <path key={y} d={`M20 ${y} L28 ${y + 2.5}`} stroke="#a8843a" strokeWidth="1.4" />
          ))}
        </g>
      )}
      {icon === 'shard' && (
        <g>
          <path d="M10 30 Q16 12 30 10 L38 18 Q26 22 22 36 Z" fill="#c9a04a" />
          <path d="M10 30 Q16 12 30 10 L32 14 Q19 19 16 31 Z" fill="#dcb862" />
          <path d="M22 36 L26 40 L30 34" stroke="#a8843a" strokeWidth="2" fill="none" />
        </g>
      )}
      {icon === 'glove' && (
        <g>
          <path
            d="M14 40 L13 24 Q13 18 17 18 Q20 18 20 23 L20 15 Q20 10 24 10 Q28 10 28 15 L28 20 Q28 15 32 16 Q35 17 34 22 L33 40 Z"
            fill="#8d7f6b"
          />
          <path d="M14 32 H33" stroke="#6d6155" strokeWidth="1.6" strokeDasharray="3 2" />
          <path d="M14 40 L33 40 L33 43 L14 43 Z" fill="#6d6155" />
          <path d="M20 22 Q26 20 30 23" stroke="#5a4f43" strokeWidth="1.4" fill="none" />
        </g>
      )}
      {icon === 'letter' && (
        <g>
          <rect x="8" y="12" width="32" height="26" rx="2" fill="#f2e8d0" />
          <path d="M8 14 L24 26 L40 14" stroke="#c9b088" strokeWidth="2" fill="none" />
          <ellipse cx="16" cy="30" rx="5" ry="3.5" fill="#9fb4c4" opacity="0.55" />
          <ellipse cx="31" cy="33" rx="4" ry="2.8" fill="#9fb4c4" opacity="0.45" />
          <rect x="20" y="30" width="12" height="2" rx="1" fill="#8a7a5e" />
        </g>
      )}
      {icon === 'chain' && (
        <g>
          {/* 斜めに垂れた鎖。端の一輪だけ ねじ切れて 開いている。 */}
          {[0, 1, 2, 3].map((i) => (
            <ellipse
              key={i}
              cx={13 + i * 7}
              cy={16 + i * 6}
              rx="4.6"
              ry="3.2"
              transform={`rotate(-40 ${13 + i * 7} ${16 + i * 6})`}
              fill="none"
              stroke={i % 2 ? '#8d8574' : '#a9a091'}
              strokeWidth="2.6"
            />
          ))}
          <path
            d="M38 40 A4.6 3.2 0 1 1 42 34"
            transform="rotate(-40 40 37)"
            fill="none"
            stroke="#8d8574"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path d="M10 34 Q16 38 22 36" stroke="#6f8898" strokeWidth="1.6" fill="none" opacity="0.6" />
        </g>
      )}
      {icon === 'pin' && (
        <g>
          {/* 横から見た画鋲。刺さっていた深さぶん、針が長く出ている。 */}
          <ellipse cx="24" cy="16" rx="11" ry="4" fill="#b8623a" />
          <path d="M13 16 Q24 22 35 16 L35 18 Q24 24 13 18 Z" fill="#8f4525" />
          <path d="M23 20 L25 20 L24.4 40 L23.6 40 Z" fill="#9a9284" />
          <path d="M23.6 40 L24.4 40 L24 44 Z" fill="#6d6558" />
          <path d="M17 14 Q22 11 27 13" stroke="#d99b78" strokeWidth="1.8" fill="none" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}
