import type { Place } from '../types';

interface Props {
  places: Place[];
  openPlaces: string[];
  clearedScenarios: string[];
  currentPlaceId: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/** メイン画面のマップ。町の俯瞰図と、その上に並ぶ行き先ピン。 */
export function TownMap({
  places,
  openPlaces,
  clearedScenarios,
  currentPlaceId,
  selectedId,
  onSelect,
}: Props) {
  return (
    <div className="map" onClick={() => onSelect(null)} role="presentation">
      <svg
        className="map__art"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="map-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b9d7e4" />
            <stop offset="55%" stopColor="#e6dcc0" />
            <stop offset="100%" stopColor="#c2a878" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#map-sky)" />

        {/* 遠くの丘 */}
        <path d="M0 96 Q80 62 160 92 Q240 118 320 88 Q368 72 400 88 L400 300 L0 300 Z" fill="#9db785" />
        <path d="M0 128 Q100 104 200 130 Q300 156 400 126 L400 300 L0 300 Z" fill="#8caa76" />

        {/* 町の地面 */}
        <path d="M0 160 Q200 138 400 162 L400 300 L0 300 Z" fill="#d8c49a" />

        {/* 大通り */}
        <path
          d="M60 292 Q120 236 180 214 Q260 184 340 132"
          stroke="#efe0bf"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M60 292 Q120 236 180 214 Q260 184 340 132"
          stroke="#c9b088"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="4 14"
        />

        {/* 家並み */}
        <g>
          {[
            [40, 210, '#c56b52'],
            [96, 178, '#d2a05c'],
            [148, 250, '#b3654e'],
            [212, 236, '#c89a58'],
            [268, 200, '#bd6a4f'],
            [318, 232, '#cfa262'],
            [356, 186, '#b8654d'],
            [128, 152, '#cf9d5d'],
            [232, 148, '#c06b51'],
          ].map(([x, y, color], i) => (
            <g key={i} transform={`translate(${x as number} ${y as number})`}>
              <rect x="-16" y="-2" width="32" height="26" fill="#e8d6b4" />
              <path d="M-21 -2 L21 -2 L0 -22 Z" fill={color as string} />
              <rect x="-6" y="8" width="12" height="16" fill="#7a5b3e" />
            </g>
          ))}
        </g>

        {/* 時計塔 */}
        <g transform="translate(300 74)">
          <path d="M-13 60 L-9 0 L9 0 L13 60 Z" fill="#a68f6c" />
          <path d="M-11 0 L0 -18 L11 0 Z" fill="#7c5d45" />
          <circle cx="0" cy="18" r="9" fill="#f6ecd6" stroke="#6f5a41" strokeWidth="2.5" />
          <path d="M0 18 L0 12" stroke="#4c3d2c" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M0 18 L5 21" stroke="#4c3d2c" strokeWidth="1.6" strokeLinecap="round" />
        </g>

        {/* 木 */}
        <g fill="#6f9459">
          <circle cx="70" cy="168" r="10" />
          <circle cx="186" cy="186" r="8" />
          <circle cx="352" cy="258" r="11" />
          <circle cx="248" cy="272" r="9" />
        </g>
      </svg>

      {/* 行き先ピン */}
      {places.map((p) => {
        const open = openPlaces.includes(p.id);
        const cleared = clearedScenarios.includes(p.scenarioId);
        const isHere = p.id === currentPlaceId;
        const isSelected = p.id === selectedId;
        const cls = [
          'pin',
          open ? 'pin--open' : 'pin--locked',
          cleared ? 'pin--cleared' : '',
          isHere ? 'pin--here' : '',
          isSelected ? 'pin--selected' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={p.id}
            type="button"
            className={cls}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            disabled={!open}
            aria-label={open ? p.name : 'まだ行けない場所'}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(isSelected ? null : p.id);
            }}
          >
            <span className="pin__marker" aria-hidden="true">
              <i className="pin__glyph">{open ? (cleared ? '✓' : '!') : '?'}</i>
            </span>
            <span className="pin__name">{open ? p.name : '？？？'}</span>
          </button>
        );
      })}
    </div>
  );
}
