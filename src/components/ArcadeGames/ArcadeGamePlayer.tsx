import React, { useState } from 'react';
import { X, Volume2, VolumeX, Maximize2, RotateCcw, ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { ARCADE_GAMES, ArcadeGameInfo } from '../../types/arcade';
import { arcadeAudio } from '../../utils/arcadeAudio';
import { CyberDriftCanvas } from './CyberDriftCanvas';
import { NeonRiderCanvas } from './NeonRiderCanvas';
import { HyperDragCanvas } from './HyperDragCanvas';
import { RetroGrandPrixCanvas } from './RetroGrandPrixCanvas';
import { HighwayPursuitCanvas } from './HighwayPursuitCanvas';
import { DesertRallyCanvas } from './DesertRallyCanvas';
import { NeonKartCanvas } from './NeonKartCanvas';
import { MidnightTougeCanvas } from './MidnightTougeCanvas';
import { SpeedboatRushCanvas } from './SpeedboatRushCanvas';
import { MonsterTruckCanvas } from './MonsterTruckCanvas';
import { CanyonInfiltratorCanvas } from './CanyonInfiltratorCanvas';
import { SkylineBlitzCanvas } from './SkylineBlitzCanvas';

interface ArcadeGamePlayerProps {
  gameId: string;
  onBackToMain: () => void;
  onEarnCoins: (amount: number) => void;
  currentLang?: string;
  theme?: 'dark' | 'light';
}

export const ArcadeGamePlayer: React.FC<ArcadeGamePlayerProps> = ({
  gameId,
  onBackToMain,
  onEarnCoins,
  currentLang = 'en',
  theme = 'dark',
}) => {
  const [isMuted, setIsMuted] = useState(() => arcadeAudio.isMuted());
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLang);

  const game = ARCADE_GAMES.find((g) => g.id === gameId) || ARCADE_GAMES[0];

  const toggleMute = () => {
    const next = arcadeAudio.toggleMute();
    setIsMuted(next);
  };

  const handleFullscreen = () => {
    try {
      const container = document.getElementById('arcade-player-container');
      if (container) {
        if (!document.fullscreenElement) {
          container.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      }
    } catch {}
  };

  const renderGameCanvas = () => {
    switch (game.id) {
      case 'cyber-drift':
        return <CyberDriftCanvas onEarnCoins={onEarnCoins} />;
      case 'neon-rider':
        return <NeonRiderCanvas onEarnCoins={onEarnCoins} />;
      case 'hyper-drag':
        return <HyperDragCanvas onEarnCoins={onEarnCoins} />;
      case 'retro-grand-prix':
        return <RetroGrandPrixCanvas onEarnCoins={onEarnCoins} />;
      case 'highway-pursuit':
        return <HighwayPursuitCanvas onEarnCoins={onEarnCoins} />;
      case 'desert-rally':
        return <DesertRallyCanvas onEarnCoins={onEarnCoins} />;
      case 'neon-kart':
        return <NeonKartCanvas onEarnCoins={onEarnCoins} />;
      case 'midnight-touge':
        return <MidnightTougeCanvas onEarnCoins={onEarnCoins} />;
      case 'speedboat-rush':
        return <SpeedboatRushCanvas onEarnCoins={onEarnCoins} />;
      case 'monster-truck':
        return <MonsterTruckCanvas onEarnCoins={onEarnCoins} />;
      case 'canyon-infiltrator':
        return <CanyonInfiltratorCanvas onEarnCoins={onEarnCoins} />;
      case 'skyline-blitz':
        return <SkylineBlitzCanvas onEarnCoins={onEarnCoins} />;
      default:
        return <CyberDriftCanvas onEarnCoins={onEarnCoins} />;
    }
  };

  return (
    <div
      id="arcade-player-container"
      className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col transition-all"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Player Header Bar */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMain}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
            title="Return to Apex Pulse 3D"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{isRTL ? 'العودة للسباق الرئيسي' : 'Apex Pulse 3D'}</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-game font-black text-sm sm:text-base text-white tracking-wide">
                {isRTL ? game.titleAr : game.title}
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isRTL ? game.badgeAr : game.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              {isRTL ? game.subtitleAr : game.subtitle}
            </p>
          </div>
        </div>

        {/* Player Controls: Audio & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-center ${
              isMuted
                ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all cursor-pointer hidden sm:flex items-center justify-center"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Frame */}
      <div className="w-full relative">
        {renderGameCanvas()}
      </div>

      {/* Quick Controls & Strategy Footer */}
      <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-300">
            {isRTL ? '🎮 مفاتيح التحكم:' : '🎮 Controls:'}
          </span>
          {(isRTL ? game.controlsAr : game.controlsEn).map((ctrl, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md text-[11px]">
              <strong className="text-amber-400">{ctrl.key}:</strong>
              <span>{ctrl.action}</span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isRTL ? 'العملات المكتسبة تضاف مباشرة لمرآبك!' : 'Earned coins sync directly to your Garage!'}</span>
        </div>
      </div>
    </div>
  );
};
