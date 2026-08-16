import type { Settings } from '../../types';
import { SCREEN_SIZES } from '../../state/settings';

interface Props {
  settings: Settings;
  onChange: (next: Settings) => void;
}

/** メインメニューの「設定」。画面の大きさ・BGM・効果音を調整する。 */
export function SettingsPanel({ settings, onChange }: Props) {
  const patch = (part: Partial<Settings>) => onChange({ ...settings, ...part });

  return (
    <div className="panel__body">
      <h2 className="panel__title">設定</h2>

      <h3 className="panel__sub">画面の大きさ</h3>
      <div className="sizepick">
        {SCREEN_SIZES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`sizepick__btn${settings.screenSize === s.id ? ' sizepick__btn--on' : ''}`}
            onClick={() => patch({ screenSize: s.id })}
          >
            <span className="sizepick__label">{s.label}</span>
            <span className="sizepick__note">{s.note}</span>
          </button>
        ))}
      </div>

      <h3 className="panel__sub">音声</h3>

      <SoundRow
        name="BGM"
        on={settings.bgmOn}
        volume={settings.bgmVolume}
        onToggle={(v) => patch({ bgmOn: v })}
        onVolume={(v) => patch({ bgmVolume: v })}
      />
      <SoundRow
        name="効果音（SE）"
        on={settings.seOn}
        volume={settings.seVolume}
        onToggle={(v) => patch({ seOn: v })}
        onVolume={(v) => patch({ seVolume: v })}
      />

      <h3 className="panel__sub">画面のエフェクト</h3>

      <div className={`soundrow${settings.effectsOn ? '' : ' soundrow--off'}`}>
        <div className="soundrow__head">
          <span className="soundrow__name">エフェクト</span>
          <button
            type="button"
            className={`toggle${settings.effectsOn ? ' toggle--on' : ''}`}
            onClick={() => patch({ effectsOn: !settings.effectsOn })}
            aria-pressed={settings.effectsOn}
          >
            <span className="toggle__knob" />
            <span className="toggle__text">{settings.effectsOn ? 'オン' : 'オフ'}</span>
          </button>
        </div>
        <label className="soundrow__slider">
          <span className="soundrow__srlabel">強さ</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={settings.effectStrength}
            disabled={!settings.effectsOn}
            onChange={(e) => patch({ effectStrength: Number(e.target.value) })}
          />
          <output>{settings.effectStrength}</output>
        </label>
      </div>

      <p className="panel__note">
        音声ファイルは使用せず、ブラウザ上で合成している。
        エフェクトも画像を使わず、その場で描いている。
        設定はこの端末に保存され、セーブデータとは別に残る。
      </p>
    </div>
  );
}

interface RowProps {
  name: string;
  on: boolean;
  volume: number;
  onToggle: (v: boolean) => void;
  onVolume: (v: number) => void;
}

function SoundRow({ name, on, volume, onToggle, onVolume }: RowProps) {
  return (
    <div className={`soundrow${on ? '' : ' soundrow--off'}`}>
      <div className="soundrow__head">
        <span className="soundrow__name">{name}</span>
        <button
          type="button"
          className={`toggle${on ? ' toggle--on' : ''}`}
          onClick={() => onToggle(!on)}
          aria-pressed={on}
        >
          <span className="toggle__knob" />
          <span className="toggle__text">{on ? 'オン' : 'オフ'}</span>
        </button>
      </div>
      <label className="soundrow__slider">
        <span className="soundrow__srlabel">音量</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={volume}
          disabled={!on}
          onChange={(e) => onVolume(Number(e.target.value))}
        />
        <output>{volume}</output>
      </label>
    </div>
  );
}
