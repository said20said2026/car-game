import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  Check,
  Zap,
  Coins,
  Gauge,
  Eye,
  Trophy,
  Play,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Sparkles,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { TrackEnvironment, TrackData } from '../types/game';
import { TRACKS_DATA, getTrackData, isTrackUnlocked, unlockTrack } from '../utils/tracks';
import { loadPlayerStats } from '../utils/storage';
import { loadGhostRun, GhostRunData } from '../utils/ghostCar';
import { soundManager } from '../utils/audio';

interface TrackSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrack: TrackEnvironment;
  onSelectTrack: (trackId: TrackEnvironment) => void;
  onStartRace?: () => void;
  playerCoins: number;
  onCoinsChange?: (newCoins: number) => void;
}

export function TrackSelectionModal({
  isOpen,
  onClose,
  selectedTrack,
  onSelectTrack,
  onStartRace,
  playerCoins,
  onCoinsChange,
}: TrackSelectionModalProps) {
  const [unlockedTracks, setUnlockedTracks] = useState<TrackEnvironment[]>(() => {
    const stats = loadPlayerStats();
    return stats.unlockedTracks || ['day'];
  });
  const [hoveredTrack, setHoveredTrack] = useState<TrackEnvironment | null>(null);
  const [ghostRecords, setGhostRecords] = useState<Record<TrackEnvironment, GhostRunData | null>>({
    day: null,
    sunset: null,
    night: null,
    rain: null,
  });
  const [unlockMessage, setUnlockMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [unlockingTrackId, setUnlockingTrackId] = useState<TrackEnvironment | null>(null);

  // Sync unlocked tracks and ghost records
  useEffect(() => {
    if (!isOpen) return;
    const stats = loadPlayerStats();
    setUnlockedTracks(stats.unlockedTracks || ['day']);

    // Load Ghost Records for all 4 tracks
    setGhostRecords({
      day: loadGhostRun('day'),
      sunset: loadGhostRun('sunset'),
      night: loadGhostRun('night'),
      rain: loadGhostRun('rain'),
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPreviewTrack = hoveredTrack || selectedTrack;
  const activeTrackData = getTrackData(currentPreviewTrack);

  const handleUnlock = (track: TrackData) => {
    if (playerCoins < track.unlockCost) {
      soundManager.playClick();
      setUnlockMessage({
        text: `Insufficient coins! You need ${track.unlockCost - playerCoins} more coins to unlock ${track.name}.`,
        type: 'error',
      });
      setTimeout(() => setUnlockMessage(null), 3500);
      return;
    }

    setUnlockingTrackId(track.id);
    const result = unlockTrack(track.id);

    if (result.success) {
      soundManager.playRewardFanfare();
      setUnlockedTracks((prev) => (prev.includes(track.id) ? prev : [...prev, track.id]));
      onSelectTrack(track.id);
      if (onCoinsChange && typeof result.newCoins === 'number') {
        onCoinsChange(result.newCoins);
      }
      setUnlockMessage({
        text: `🎉 ${track.name} Unlocked Successfully! Selected for your next race.`,
        type: 'success',
      });
      setTimeout(() => {
        setUnlockMessage(null);
        setUnlockingTrackId(null);
      }, 3500);
    } else {
      soundManager.playClick();
      setUnlockMessage({
        text: result.error || 'Failed to unlock track.',
        type: 'error',
      });
      setTimeout(() => {
        setUnlockMessage(null);
        setUnlockingTrackId(null);
      }, 3500);
    }
  };

  const handleSelect = (trackId: TrackEnvironment) => {
    soundManager.playClick();
    onSelectTrack(trackId);
  };

  const renderTrackIcon = (iconName: TrackData['iconName'], className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'sun':
        return <Sun className={className} />;
      case 'sunset':
        return <Sunset className={className} />;
      case 'moon':
        return <Moon className={className} />;
      case 'cloud-rain':
        return <CloudRain className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-game text-white tracking-wide flex items-center gap-2">
                <span>Track & Environment Selection</span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose or unlock racing circuits with distinct road traction, visibility, and reward multipliers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Player Coins Wallet Display */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{playerCoins.toLocaleString()}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Track Selection"
              aria-label="Close Track Selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {unlockMessage && (
          <div
            className={`px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 border-b animate-in slide-in-from-top-2 duration-200 ${
              unlockMessage.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-200 border-rose-500/40'
            }`}
          >
            {unlockMessage.type === 'success' ? (
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{unlockMessage.text}</span>
          </div>
        )}

        {/* TRACKS LIST & PREVIEW GRID */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {TRACKS_DATA.map((track) => {
              const isUnlocked = isTrackUnlocked(track.id, {
                ...loadPlayerStats(),
                unlockedTracks,
              });
              const isSelected = selectedTrack === track.id;
              const ghost = ghostRecords[track.id];
              const canAfford = playerCoins >= track.unlockCost;

              return (
                <div
                  key={track.id}
                  onMouseEnter={() => setHoveredTrack(track.id)}
                  onMouseLeave={() => setHoveredTrack(null)}
                  className={`group relative rounded-xl border transition-all duration-200 overflow-hidden flex flex-col text-left ${
                    isSelected
                      ? 'bg-slate-900/95 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                      : isUnlocked
                      ? 'bg-slate-950/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* TRACK PREVIEW BANNER */}
                  <div
                    className="relative h-28 sm:h-32 w-full overflow-hidden flex items-end p-3.5"
                    style={{
                      background:
                        track.id === 'day'
                          ? 'linear-gradient(180deg, #38bdf8 0%, #7dd3fc 45%, #e0f2fe 80%, #334155 100%)'
                          : track.id === 'sunset'
                          ? 'linear-gradient(180deg, #4c1d95 0%, #c026d3 35%, #ea580c 70%, #fde047 92%, #1e293b 100%)'
                          : track.id === 'night'
                          ? 'linear-gradient(180deg, #030712 0%, #0f172a 40%, #1e1b4b 80%, #090d16 100%)'
                          : 'linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #334155 75%, #0f172a 100%)',
                    }}
                  >
                    {/* Simulated horizon celestial body */}
                    {track.id === 'day' && (
                      <div className="absolute top-3 left-6 w-10 h-10 rounded-full bg-yellow-300 shadow-[0_0_20px_#fde047]" />
                    )}
                    {track.id === 'sunset' && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-amber-300/90 shadow-[0_0_30px_#f97316]" />
                    )}
                    {track.id === 'night' && (
                      <>
                        <div className="absolute top-3 right-6 w-8 h-8 rounded-full bg-cyan-200/90 shadow-[0_0_25px_#38bdf8]" />
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                      </>
                    )}
                    {track.id === 'rain' && (
                      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/40 to-slate-950/80 backdrop-blur-[0.5px]">
                        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(56,189,248,0.25)_45%,transparent_50%)] [background-size:20px_20px] animate-pulse" />
                      </div>
                    )}

                    {/* Dark gradient fade for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                    {/* Top status indicator tag */}
                    <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-white text-xs font-bold">
                        {renderTrackIcon(track.iconName, 'w-3.5 h-3.5 text-amber-400')}
                        <span>{track.name}</span>
                      </div>

                      {isSelected ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md shadow-emerald-500/30">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Active Circuit
                        </span>
                      ) : isUnlocked ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/80 text-slate-300 text-[11px] font-bold border border-slate-700">
                          <Unlock className="w-3 h-3 text-emerald-400" />
                          Ready
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/80 text-amber-300 text-[11px] font-bold border border-amber-500/40">
                          <Lock className="w-3 h-3 text-amber-400" />
                          {track.unlockCost} Coins
                        </span>
                      )}
                    </div>

                    {/* Subtitle & Tagline */}
                    <div className="relative z-10">
                      <div className="text-[11px] text-amber-400 font-mono uppercase tracking-wider font-semibold">
                        {track.subtitle}
                      </div>
                      <div className="text-xs text-slate-300 font-medium line-clamp-1">
                        {track.weatherHazard}
                      </div>
                    </div>
                  </div>

                  {/* TRACK TELEMETRY & SPECS */}
                  <div className="p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                      {track.description}
                    </p>

                    {/* Environmental Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px]">
                      {/* Road Grip */}
                      <div className="space-y-0.5">
                        <div className="text-slate-400 flex items-center gap-1 font-medium">
                          <Gauge className="w-3 h-3 text-amber-400" />
                          <span>Traction Grip</span>
                        </div>
                        <div
                          className={`font-mono font-bold ${
                            track.gripFactor >= 1.0
                              ? 'text-emerald-400'
                              : track.gripFactor >= 0.9
                              ? 'text-amber-300'
                              : 'text-rose-400'
                          }`}
                        >
                          {Math.round(track.gripFactor * 100)}% {track.gripFactor < 0.9 ? '(Slick)' : '(Normal)'}
                        </div>
                      </div>

                      {/* Reward Multipliers */}
                      <div className="space-y-0.5">
                        <div className="text-slate-400 flex items-center gap-1 font-medium">
                          <Coins className="w-3 h-3 text-amber-400" />
                          <span>Coin Bonus</span>
                        </div>
                        <div className="font-mono font-bold text-amber-400">
                          {track.coinBonusMultiplier > 1.0
                            ? `+${Math.round((track.coinBonusMultiplier - 1.0) * 100)}%`
                            : 'Standard 1.0x'}
                        </div>
                      </div>

                      {/* Nitro Flow */}
                      <div className="space-y-0.5 col-span-2 sm:col-span-1">
                        <div className="text-slate-400 flex items-center gap-1 font-medium">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <span>Nitro Charge</span>
                        </div>
                        <div className="font-mono font-bold text-cyan-400">
                          {track.nitroRechargeRate > 1.0
                            ? `+${Math.round((track.nitroRechargeRate - 1.0) * 100)}% Boost`
                            : '1.0x Flow'}
                        </div>
                      </div>
                    </div>

                    {/* Ghost Record on this Track */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Trophy className="w-3 h-3 text-sky-400" />
                        <span>Best Track Run:</span>
                      </span>
                      <span className="font-mono font-bold text-sky-300">
                        {ghost ? `${ghost.totalDistance.toLocaleString()} m · ${ghost.carName}` : 'No record yet'}
                      </span>
                    </div>

                    {/* CARD FOOTER ACTION BUTTON */}
                    <div className="pt-1">
                      {isSelected ? (
                        <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Selected For Next Race</span>
                        </div>
                      ) : isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => handleSelect(track.id)}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 hover:border-slate-600"
                        >
                          <span>Select Track</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUnlock(track)}
                          disabled={unlockingTrackId === track.id}
                          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-98'
                              : 'bg-slate-800 text-slate-400 border border-slate-700/80 cursor-not-allowed opacity-80'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          {canAfford ? (
                            <span>Unlock for {track.unlockCost.toLocaleString()} Coins</span>
                          ) : (
                            <span>Need {(track.unlockCost - playerCoins).toLocaleString()} More Coins</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL BOTTOM BAR */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2 text-center sm:text-left">
            <span>Active Circuit:</span>
            <span className="font-bold text-white flex items-center gap-1">
              {renderTrackIcon(activeTrackData.iconName, 'w-3.5 h-3.5 text-amber-400')}
              {activeTrackData.name}
            </span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline text-slate-400">
              {activeTrackData.coinBonusMultiplier > 1.0 ? `🪙 ${activeTrackData.coinBonusMultiplier}x Coins` : 'Standard'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>

            {onStartRace && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartRace();
                }}
                className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Race On This Track</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
