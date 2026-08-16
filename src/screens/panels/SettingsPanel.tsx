import { useEffect, useState } from 'react';
import type { Language, Settings } from '../../types';
import { SCREEN_SIZES } from '../../state/settings';
import { MAX_BGM_BYTES, clearTrack, getTrack, putTrack } from '../../audio/bgmFile';
import { setBgmTrack } from '../../audio/audio';
import { useText } from '../../i18n/text';
import { UI } from '../../i18n/ui';

interface Props {
  settings: Settings;
  onChange: (next: Settings) => void;
}

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'ja', label: '日本語' },
  { id: 'en', label: 'English' },
];

/** メインメニューの「設定」。ことば・画面の大きさ・音・エフェクトを決める。 */
export function SettingsPanel({ settings, onChange }: Props) {
  const t = useText();
  const patch = (part: Partial<Settings>) => onChange({ ...settings, ...part });

  /** いま鳴らしている曲のファイル名（合成音のときは null） */
  const [trackName, setTrackName] = useState<string | null>(null);
  const [bgmMsg, setBgmMsg] = useState('');

  useEffect(() => {
    void getTrack().then((found) => setTrackName(found?.name ?? null));
  }, []);

  /** 手元のファイルを選んだ */
  const chooseTrack = async (file: File) => {
    setBgmMsg('');
    if (file.size > MAX_BGM_BYTES) {
      setBgmMsg(t(UI.bgmTooBig));
      return;
    }
    try {
      await putTrack(file);
      setBgmTrack(file);
      setTrackName(file.name);
    } catch {
      setBgmMsg(t(UI.bgmBadFile));
    }
  };

  return (
    <div className="panel__body">
      <h2 className="panel__title">{t(UI.settings)}</h2>

      <h3 className="panel__sub">{t(UI.settingLanguage)}</h3>
      <div className="sizepick">
        {LANGUAGES.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`sizepick__btn${settings.language === l.id ? ' sizepick__btn--on' : ''}`}
            onClick={() => patch({ language: l.id })}
          >
            <span className="sizepick__label">{l.label}</span>
          </button>
        ))}
      </div>

      <h3 className="panel__sub">{t(UI.settingScreen)}</h3>
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

      <h3 className="panel__sub">{t(UI.settingSound)}</h3>

      <SoundRow
        name={t(UI.bgm)}
        on={settings.bgmOn}
        volume={settings.bgmVolume}
        onToggle={(v) => patch({ bgmOn: v })}
        onVolume={(v) => patch({ bgmVolume: v })}
      />
      <SoundRow
        name={t(UI.se)}
        on={settings.seOn}
        volume={settings.seVolume}
        onToggle={(v) => patch({ seOn: v })}
        onVolume={(v) => patch({ seVolume: v })}
      />

      <h4 className="panel__sub panel__sub--small">{t(UI.bgmFile)}</h4>
      <p className="panel__note">{t(UI.bgmFileLead)}</p>
      <div className="bgmfile">
        <span className="bgmfile__now">
          {t(UI.bgmPlaying)}：<strong>{trackName ?? t(UI.bgmSynth)}</strong>
        </span>
        <div className="bgmfile__row">
          <label className="bgmfile__pick">
            {t(UI.bgmChoose)}
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void chooseTrack(file);
                e.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            className="bgmfile__clear"
            disabled={!trackName}
            onClick={() => {
              void clearTrack();
              setBgmTrack(null);
              setTrackName(null);
              setBgmMsg('');
            }}
          >
            {t(UI.bgmClear)}
          </button>
        </div>
        {bgmMsg && <p className="bgmfile__msg">{bgmMsg}</p>}
      </div>

      <h3 className="panel__sub">{t(UI.settingEffects)}</h3>

      <div className={`soundrow${settings.effectsOn ? '' : ' soundrow--off'}`}>
        <div className="soundrow__head">
          <span className="soundrow__name">{t(UI.effects)}</span>
          <button
            type="button"
            className={`toggle${settings.effectsOn ? ' toggle--on' : ''}`}
            onClick={() => patch({ effectsOn: !settings.effectsOn })}
            aria-pressed={settings.effectsOn}
          >
            <span className="toggle__knob" />
            <span className="toggle__text">{settings.effectsOn ? t(UI.on) : t(UI.off)}</span>
          </button>
        </div>
        <label className="soundrow__slider">
          <span className="soundrow__srlabel">{t(UI.strength)}</span>
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

      <p className="panel__note">{t(UI.settingsNote)}</p>
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
  const t = useText();
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
          <span className="toggle__text">{on ? t(UI.on) : t(UI.off)}</span>
        </button>
      </div>
      <label className="soundrow__slider">
        <span className="soundrow__srlabel">{t(UI.volume)}</span>
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
