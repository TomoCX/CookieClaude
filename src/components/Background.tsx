import type { BackgroundId } from '../types';

/** 背景ごとの空・地面の色 */
const PALETTE: Record<BackgroundId, { sky: [string, string]; ground: string }> =
  {
    highway: { sky: ['#c7e2ee', '#f6ecd6'], ground: '#c9b183' },
    gate: { sky: ['#cfe4ef', '#f3e5cd'], ground: '#b39a6f' },
    plaza: { sky: ['#bcdcea', '#f6ead1'], ground: '#c0a878' },
    clocktower: { sky: ['#9fbdd2', '#e3d6be'], ground: '#8f8069' },
    inn: { sky: ['#e8c9a0', '#f6dfba'], ground: '#8a6644' },
    alley: { sky: ['#8ca3bb', '#c9c2ae'], ground: '#6f6553' },
    river: { sky: ['#b6d8e2', '#eae6cc'], ground: '#a8a37c' },
    night: { sky: ['#2c3d5e', '#5a5f7c'], ground: '#3a3648' },
  };

interface Props {
  id: BackgroundId;
}

/** 会話画面の背景。SVG のシルエットで町並みを描く。 */
export function Background({ id }: Props) {
  const pal = PALETTE[id];
  const gradId = `sky-${id}`;

  return (
    <svg className="bg" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.sky[0]} />
          <stop offset="100%" stopColor={pal.sky[1]} />
        </linearGradient>
      </defs>

      <rect width="800" height="450" fill={`url(#${gradId})`} />

      {/* 遠景の町並み（共通） */}
      <g opacity="0.35" fill="#5c6f80">
        <path d="M0 300 L0 240 L50 240 L50 210 L90 210 L90 250 L140 250 L140 300 Z" />
        <path d="M170 300 L170 200 L210 170 L250 200 L250 300 Z" />
        <path d="M300 300 L300 230 L340 230 L340 190 L380 190 L380 300 Z" />
        <path d="M560 300 L560 215 L600 185 L640 215 L640 300 Z" />
        <path d="M690 300 L690 245 L730 245 L730 205 L780 205 L780 300 Z" />
      </g>

      {/* 場所ごとの前景 */}
      {id === 'highway' && (
        <g>
          <path d="M0 300 Q200 250 400 292 Q600 330 800 286 L800 300 Z" fill="#8fae74" />
          {[90, 210, 590, 720].map((x, i) => (
            <g key={x}>
              <rect x={x - 6} y={228} width="12" height="72" fill="#7a5b3e" />
              <ellipse cx={x} cy={214} rx={44} ry={54} fill={i % 2 ? '#7f9a68' : '#6e8a59'} />
            </g>
          ))}
          <g transform="translate(400 176)">
            <rect x="-5" y="0" width="10" height="124" fill="#8a6f45" />
            <path d="M-64 8 L52 8 L66 26 L52 44 L-64 44 Z" fill="#d8bf90" />
            <text x="-6" y="36" textAnchor="middle" fontSize="21" fontWeight="800" fill="#6b5230">
              メープル町 →
            </text>
          </g>
        </g>
      )}

      {id === 'gate' && (
        <g>
          <path d="M120 300 L120 150 L160 150 L160 300 Z" fill="#8c6a4a" />
          <path d="M640 300 L640 150 L680 150 L680 300 Z" fill="#8c6a4a" />
          <path d="M100 160 L700 160 L700 130 L400 100 L100 130 Z" fill="#a3785222" />
          <path d="M100 160 L700 160 L700 140 L100 140 Z" fill="#7a5b3e" />
          <text x="400" y="132" textAnchor="middle" fill="#5c422c" fontSize="26" fontWeight="700">
            MAPLE
          </text>
        </g>
      )}

      {id === 'plaza' && (
        <g>
          <circle cx="400" cy="250" r="52" fill="#c9b48c" />
          <circle cx="400" cy="250" r="36" fill="#a8d3d8" />
          <path d="M392 250 L392 200 L408 200 L408 250 Z" fill="#9a8a6c" />
          <circle cx="400" cy="196" r="16" fill="#c9b48c" />
          <g fill="#b3543f">
            <path d="M150 300 L150 250 L250 250 L250 300 Z" />
            <path d="M140 252 L260 252 L200 224 Z" />
            <path d="M560 300 L560 250 L660 250 L660 300 Z" />
            <path d="M550 252 L670 252 L610 224 Z" />
          </g>
        </g>
      )}

      {id === 'clocktower' && (
        <g>
          <path d="M330 300 L350 90 L450 90 L470 300 Z" fill="#9c8768" />
          <path d="M340 92 L400 30 L460 92 Z" fill="#7c5d45" />
          <circle cx="400" cy="150" r="46" fill="#f2e6cd" stroke="#6f5a41" strokeWidth="6" />
          <path d="M400 150 L400 118" stroke="#4c3d2c" strokeWidth="5" strokeLinecap="round" />
          <path d="M400 150 L426 162" stroke="#4c3d2c" strokeWidth="5" strokeLinecap="round" />
          <circle cx="400" cy="150" r="4" fill="#4c3d2c" />
          <g fill="#7c6a4e" opacity="0.7">
            <circle cx="250" cy="220" r="34" />
            <circle cx="560" cy="235" r="26" />
          </g>
        </g>
      )}

      {id === 'inn' && (
        <g>
          <rect x="60" y="120" width="680" height="180" fill="#7a5637" />
          <rect x="60" y="120" width="680" height="18" fill="#5c3f27" />
          <g fill="#3f2a1a" opacity="0.55">
            <rect x="110" y="160" width="120" height="90" rx="6" />
            <rect x="570" y="160" width="120" height="90" rx="6" />
          </g>
          <circle cx="400" cy="196" r="46" fill="#f0c86a" opacity="0.85" />
          <circle cx="400" cy="196" r="70" fill="#f0c86a" opacity="0.28" />
          <rect x="350" y="248" width="100" height="52" fill="#4a3120" />
        </g>
      )}

      {id === 'alley' && (
        <g>
          <rect x="0" y="60" width="230" height="240" fill="#5f5548" />
          <rect x="570" y="40" width="230" height="260" fill="#544b40" />
          <g fill="#3d362d" opacity="0.6">
            <rect x="40" y="110" width="60" height="70" rx="4" />
            <rect x="140" y="150" width="60" height="70" rx="4" />
            <rect x="620" y="90" width="60" height="70" rx="4" />
            <rect x="710" y="150" width="60" height="70" rx="4" />
          </g>
          <path d="M230 300 L230 40 L570 40 L570 300 Z" fill="#8b93a0" opacity="0.35" />
        </g>
      )}

      {id === 'river' && (
        <g>
          <path d="M0 300 Q200 262 400 296 Q600 328 800 292 L800 300 Z" fill="#8fae74" />
          <path d="M0 258 Q220 236 420 258 Q620 280 800 256 L800 300 L0 300 Z" fill="#7fa8b4" opacity="0.75" />
          <g transform="translate(520 176)">
            <rect x="-70" y="24" width="140" height="100" fill="#cdbf9c" />
            <path d="M-82 26 L82 26 L0 -26 Z" fill="#7a6a4a" />
            <rect x="-24" y="66" width="34" height="58" fill="#67583c" opacity="0.6" />
            <circle cx="98" cy="88" r="42" fill="none" stroke="#6b5942" strokeWidth="7" />
            {[0, 45, 90, 135].map((a) => (
              <rect
                key={a}
                x="54"
                y="85"
                width="88"
                height="6"
                fill="#6b5942"
                transform={`rotate(${a} 98 88)`}
              />
            ))}
          </g>
          {[110, 230].map((x, i) => (
            <g key={x}>
              <rect x={x - 5} y={236} width="10" height="64" fill="#7a5b3e" />
              <ellipse cx={x} cy={222} rx={40} ry={48} fill={i % 2 ? '#7f9a68' : '#6e8a59'} />
            </g>
          ))}
        </g>
      )}

      {/* 地面 */}
      <rect x="0" y="300" width="800" height="150" fill={pal.ground} />
      <rect x="0" y="300" width="800" height="10" fill="#00000022" />
    </svg>
  );
}
