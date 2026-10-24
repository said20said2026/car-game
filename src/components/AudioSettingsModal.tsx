import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Volume2,
  VolumeX,
  Music,
  Music2,
  Flame,
  Activity,
  Zap,
  RotateCcw,
  Volume1,
  Sparkles,
  Bell,
  Smartphone,
  Gauge,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { loadPlayerStats, savePlayerStats } from '../utils/storage';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSpeed?: number;
  hapticsSupported?: boolean;
  hapticsEnabled?: boolean;
  onToggleHaptics?: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSpeed = 0,
  hapticsSupported = false,
  hapticsEnabled = false,
  onToggleHaptics,
}) => {
  // Volume Channel States
  const [engineVolume, setEngineVolumeState] = useState<number>(0.8);
  const [engineEnabled, setEngineEnabledState] = useState<boolean>(true);

  const [hornVolume, setHornVolumeState] = useState<number>(0.75);
  const [hornEnabled, setHornEnabledState] = useState<boolean>(true);
  const [hornTone, setHornTone] = useState<'car' | 'truck' | 'sport'>('car');

  const [musicVolume, setMusicVolumeState] = useState<number>(0.35);
  const [musicEnabled, setMusicEnabledState] = useState<boolean>(true);
  const [speedPitchEnabled, setSpeedPitchEnabledState] = useState<boolean>(true);

  // Live Telemetry
  const [liveMusicBpm, setLiveMusicBpm] = useState<number>(126);
  const [livePitchShift, setLivePitchShift] = useState<number>(0);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  // Sync state from storage on open
  useEffect(() => {
    if (!isOpen) return;

    const stats = loadPlayerStats();
    const engVol = stats.engineVolume ?? 0.8;
    const hrnVol = stats.hornVolume ?? 0.75;
    const musVol = stats.musicVolume ?? 0.35;
    const engOn = stats.engineEnabled ?? true;
    const hrnOn = stats.hornEnabled ?? true;
    const musOn = stats.musicEnabled ?? true;
    const pitchOn = stats.speedPitchEnabled ?? true;

    setEngineVolumeState(engVol);
    setEngineEnabledState(engOn);
    setHornVolumeState(hrnVol);
    setHornEnabledState(hrnOn);
    setMusicVolumeState(musVol);
    setMusicEnabledState(musOn);
    setSpeedPitchEnabledState(pitchOn);

    soundManager.setEngineVolume(engVol);
    soundManager.setEngineEnabled(engOn);
    soundManager.setHornVolume(hrnVol);
    soundManager.setHornEnabled(hrnOn);
    soundManager.setMusicVolume(musVol);
    soundManager.setMusicEnabled(musOn);
    soundManager.setInteractivePitchEnabled(pitchOn);

    const status = soundManager.getMusicStatus();
    setLiveMusicBpm(status.bpm);
    setLivePitchShift(status.pitchSemitones);
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Handlers ---
  const handleEngineVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setEngineVolumeState(clamped);
    soundManager.setEngineVolume(clamped);
    if (!engineEnabled && clamped > 0) {
      setEngineEnabledState(true);
      soundManager.setEngineEnabled(true);
    }
    const stats = loadPlayerStats();
    stats.engineVolume = clamped;
    stats.engineEnabled = clamped > 0 ? true : engineEnabled;
    savePlayerStats(stats);
  };

  const toggleEngine = () => {
    const next = !engineEnabled;
    setEngineEnabledState(next);
    soundManager.setEngineEnabled(next);
    const stats = loadPlayerStats();
    stats.engineEnabled = next;
    savePlayerStats(stats);
  };

  const handleTestEngineRoar = () => {
    soundManager.testEngineRev();
    setTestNotification('🏎️ Engine revving at ' + Math.round(engineVolume * 100) + '% volume!');
    setTimeout(() => setTestNotification(null), 2000);
  };

  const handleHornVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setHornVolumeState(clamped);
    soundManager.setHornVolume(clamped);
    if (!hornEnabled && clamped > 0) {
      setHornEnabledState(true);
      soundManager.setHornEnabled(true);
    }
    const stats = loadPlayerStats();
    stats.hornVolume = clamped;
    stats.hornEnabled = clamped > 0 ? true : hornEnabled;
    savePlayerStats(stats);
  };

  const toggleHorn = () => {
    const next = !hornEnabled;
    setHornEnabledState(next);
    soundManager.setHornEnabled(next);
    const stats = loadPlayerStats();
    stats.hornEnabled = next;
    savePlayerStats(stats);
  };

  const handleTestTrafficHorn = (type: 'car' | 'truck' | 'sport' = hornTone) => {
    soundManager.playTrafficHorn(type, 0.3);
    setTestNotification(`📯 ${type.toUpperCase()} horn sounded at ${Math.round(hornVolume * 100)}% volume!`);
    setTimeout(() => setTestNotification(null), 2000);
  };

  const handleMusicVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setMusicVolumeState(clamped);
    soundManager.setMusicVolume(clamped);
    if (!musicEnabled && clamped > 0) {
      setMusicEnabledState(true);
      soundManager.setMusicEnabled(true);
    }
    const stats = loadPlayerStats();
    stats.musicVolume = clamped;
    stats.musicEnabled = clamped > 0 ? true : musicEnabled;
    savePlayerStats(stats);
  };

  const toggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabledState(next);
    soundManager.setMusicEnabled(next);
    const stats = loadPlayerStats();
    stats.musicEnabled = next;
    savePlayerStats(stats);
    if (next) {
      soundManager.startMusic();
    } else {
      soundManager.stopMusic();
    }
  };

  const handleSpeedPitchToggle = () => {
    const next = !speedPitchEnabled;
    setSpeedPitchEnabledState(next);
    soundManager.setInteractivePitchEnabled(next);
    const stats = loadPlayerStats();
    stats.speedPitchEnabled = next;
    savePlayerStats(stats);
  };

  // Quick Preset Handlers
  const applyPreset = (eng: number, hrn: number, mus: number) => {
    handleEngineVolume(eng);
    handleHornVolume(hrn);
    handleMusicVolume(mus);
    setEngineEnabledState(eng > 0);
    setHornEnabledState(hrn > 0);
    setMusicEnabledState(mus > 0);
    soundManager.setEngineEnabled(eng > 0);
    soundManager.setHornEnabled(hrn > 0);
    soundManager.setMusicEnabled(mus > 0);
    if (mus > 0) soundManager.startMusic();
    else soundManager.stopMusic();

    soundManager.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl shadow-amber-500/10 space-y-4 text-left">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-game text-white flex items-center gap-2">
                <span>Audio & Acoustics Management</span>
              </h2>
              <p className="text-xs text-slate-400">
                Independently tune engine roar, traffic horns, and background music
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close Audio Settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NOTIFICATION FEEDBACK */}
        {testNotification && (
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold text-center animate-in fade-in duration-150 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{testNotification}</span>
          </div>
        )}

        {/* =========================================================================
            CHANNEL 1: ENGINE ROAR VOLUME
        ========================================================================= */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Engine Roar & Exhaust</span>
                <span className="text-[10px] text-slate-400">Combustion pulses, turbo spool & gear shifts</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleEngine}
                className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 cursor-pointer ${
                  engineEnabled && engineVolume > 0
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title={engineEnabled ? 'Mute Engine' : 'Unmute Engine'}
              >
                {engineEnabled && engineVolume > 0 ? (
                  <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{engineEnabled && engineVolume > 0 ? 'Active' : 'Muted'}</span>
              </button>
              <span className="font-mono text-xs font-bold text-orange-400 min-w-[36px] text-right">
                {engineEnabled ? `${Math.round(engineVolume * 100)}%` : '0%'}
              </span>
            </div>
          </div>

          {/* Slider & Level Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={engineEnabled ? engineVolume : 0}
              onChange={(e) => handleEngineVolume(parseFloat(e.target.value))}
              className="w-full accent-orange-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            {/* Visual audio level meter segments */}
            <div className="flex items-center gap-0.5 h-1.5 w-full bg-slate-900 rounded overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => {
                const filled = engineEnabled && engineVolume >= (i + 1) / 20;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-xs transition-colors ${
                      filled
                        ? i > 15
                          ? 'bg-rose-500'
                          : i > 11
                          ? 'bg-amber-400'
                          : 'bg-orange-500'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-slate-400">Preview acoustic engine combustion:</span>
            <button
              type="button"
              onClick={handleTestEngineRoar}
              className="px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-300 font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Test Rev 🏎️</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            CHANNEL 2: TRAFFIC HORNS VOLUME
        ========================================================================= */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Traffic Horns & Honks</span>
                <span className="text-[10px] text-slate-400">Highway passing alerts, near-misses & key [H]</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleHorn}
                className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 cursor-pointer ${
                  hornEnabled && hornVolume > 0
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title={hornEnabled ? 'Mute Horns' : 'Unmute Horns'}
              >
                {hornEnabled && hornVolume > 0 ? (
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{hornEnabled && hornVolume > 0 ? 'Active' : 'Muted'}</span>
              </button>
              <span className="font-mono text-xs font-bold text-sky-400 min-w-[36px] text-right">
                {hornEnabled ? `${Math.round(hornVolume * 100)}%` : '0%'}
              </span>
            </div>
          </div>

          {/* Slider & Level Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={hornEnabled ? hornVolume : 0}
              onChange={(e) => handleHornVolume(parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            {/* Visual audio level meter segments */}
            <div className="flex items-center gap-0.5 h-1.5 w-full bg-slate-900 rounded overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => {
                const filled = hornEnabled && hornVolume >= (i + 1) / 20;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-xs transition-colors ${
                      filled
                        ? i > 15
                          ? 'bg-indigo-400'
                          : i > 11
                          ? 'bg-cyan-400'
                          : 'bg-sky-400'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Horn Tone Selector & Honk Button */}
          <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 mr-1">Tone:</span>
              <button
                type="button"
                onClick={() => {
                  setHornTone('car');
                  handleTestTrafficHorn('car');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  hornTone === 'car'
                    ? 'bg-sky-500/25 text-sky-300 border-sky-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Sedan
              </button>
              <button
                type="button"
                onClick={() => {
                  setHornTone('truck');
                  handleTestTrafficHorn('truck');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  hornTone === 'truck'
                    ? 'bg-sky-500/25 text-sky-300 border-sky-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Air Horn
              </button>
              <button
                type="button"
                onClick={() => {
                  setHornTone('sport');
                  handleTestTrafficHorn('sport');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  hornTone === 'sport'
                    ? 'bg-sky-500/25 text-sky-300 border-sky-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Sport
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleTestTrafficHorn(hornTone)}
              className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Honk Horn 📯</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            CHANNEL 3: BACKGROUND MUSIC VOLUME & DYNAMIC SPEED-PITCH
        ========================================================================= */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Background Race Music</span>
                <span className="text-[10px] text-slate-400">High-octane procedural driving soundtrack</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMusic}
                className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 cursor-pointer ${
                  musicEnabled && musicVolume > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title={musicEnabled ? 'Stop Music' : 'Play Music'}
              >
                {musicEnabled && musicVolume > 0 ? (
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Music2 className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{musicEnabled && musicVolume > 0 ? 'Playing' : 'Muted'}</span>
              </button>
              <span className="font-mono text-xs font-bold text-amber-400 min-w-[36px] text-right">
                {musicEnabled ? `${Math.round(musicVolume * 100)}%` : '0%'}
              </span>
            </div>
          </div>

          {/* Slider & Level Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicEnabled ? musicVolume : 0}
              onChange={(e) => handleMusicVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            {/* Visual audio level meter segments */}
            <div className="flex items-center gap-0.5 h-1.5 w-full bg-slate-900 rounded overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => {
                const filled = musicEnabled && musicVolume >= (i + 1) / 20;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-xs transition-colors ${
                      filled
                        ? i > 15
                          ? 'bg-pink-500'
                          : i > 11
                          ? 'bg-yellow-400'
                          : 'bg-amber-400'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Dynamic Speed-Pitch Reaction Toggle & Live Telemetry */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-300 flex items-center gap-1 font-medium">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Speed-Linked Music Pitch</span>
              </span>
              <button
                type="button"
                onClick={handleSpeedPitchToggle}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  speedPitchEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    speedPitchEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="p-1 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Tempo</span>
                <span className="font-mono font-bold text-amber-400">
                  {musicEnabled ? `${liveMusicBpm} BPM` : 'Off'}
                </span>
              </div>
              <div className="p-1 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Pitch Shift</span>
                <span className="font-mono font-bold text-amber-400">
                  {livePitchShift >= 0 ? `+${livePitchShift}` : livePitchShift} st
                </span>
              </div>
              <div className="p-1 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Live Speed</span>
                <span className="font-mono font-bold text-emerald-400">
                  {Math.round(currentSpeed)} km/h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            HAPTIC VIBRATION (FOR TOUCH / MOBILE)
        ========================================================================= */}
        {hapticsSupported && onToggleHaptics && (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-bold text-white block">Haptic Vibration Rumbles</span>
                <span className="text-[10px] text-slate-400">Tactile rumble for nitro bursts & crashes</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleHaptics}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  hapticsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* =========================================================================
            PRESETS & QUICK BUTTONS
        ========================================================================= */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Audio Mixing Presets
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => applyPreset(0, 0, 0)}
              className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-center cursor-pointer font-medium"
            >
              Mute All 🔇
            </button>
            <button
              type="button"
              onClick={() => applyPreset(1.0, 0.5, 0)}
              className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-center cursor-pointer font-medium"
            >
              Purist Roar 🏎️
            </button>
            <button
              type="button"
              onClick={() => applyPreset(0.8, 0.75, 0.35)}
              className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-center cursor-pointer font-medium"
            >
              Balanced 🔊
            </button>
            <button
              type="button"
              onClick={() => applyPreset(1.0, 1.0, 0.9)}
              className="py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors text-center cursor-pointer font-bold"
            >
              Max Hype ⚡
            </button>
          </div>
        </div>

        {/* KEYBINDING DRIVER'S TIP */}
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>💡 Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-amber-300">H</kbd> while driving to honk your car horn at traffic!</span>
        </div>

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
        >
          Save & Return to Race
        </button>
      </div>
    </div>
  );
};
