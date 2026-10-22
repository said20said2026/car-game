import React, { useMemo } from 'react';
import { Gauge, Flame, ChevronUp, Zap, Heart } from 'lucide-react';

interface SpeedometerProps {
  speed: number;
  topSpeed: number;
  nitroAmount: number;
  isNitroActive: boolean;
  carHealth: number;
}

// 6-Speed Transmission Gear Bands (aligned with simulated engine acoustics)
const GEARS = [
  { gear: 1, min: 0.00, max: 0.18, label: '1' },
  { gear: 2, min: 0.18, max: 0.38, label: '2' },
  { gear: 3, min: 0.38, max: 0.58, label: '3' },
  { gear: 4, min: 0.58, max: 0.78, label: '4' },
  { gear: 5, min: 0.78, max: 0.98, label: '5' },
  { gear: 6, min: 0.98, max: 1.35, label: '6' },
];

export const Speedometer: React.FC<SpeedometerProps> = ({
  speed,
  topSpeed,
  nitroAmount,
  isNitroActive,
  carHealth,
}) => {
  const safeTopSpeed = Math.max(160, topSpeed || 240);
  const normalizedSpeed = Math.max(0, speed / safeTopSpeed);

  // Transmission and rev calculations
  const {
    gearNumber,
    gearProgress,
    isShiftRecommended,
    isNitroRecommended,
    gaugeColor,
    gaugeGlow,
    revStress,
    needleAngle,
    speedRatio,
  } = useMemo(() => {
    let gIdx = 0;
    for (let i = 0; i < GEARS.length; i++) {
      if (normalizedSpeed >= GEARS[i].min && normalizedSpeed <= GEARS[i].max) {
        gIdx = i;
        break;
      }
      if (i === GEARS.length - 1 && normalizedSpeed > GEARS[i].max) {
        gIdx = i;
      }
    }
    const currentGear = GEARS[gIdx];
    const gearSpan = currentGear.max - currentGear.min || 0.15;
    const progress = Math.max(0, Math.min(1, (normalizedSpeed - currentGear.min) / gearSpan));

    // Shift recommendation: near the redline limit of current gear (unless in top gear)
    const shiftRec = gIdx < 5 && progress >= 0.78 && speed > 28;

    // Nitro recommendation: high cruising gear (Gear 4+) or high speed with nitro reserve
    const nitroRec = (gIdx >= 3 || normalizedSpeed >= 0.55) && nitroAmount >= 25 && !isNitroActive;

    // Stress factor (0 = idle green, 1 = full redline)
    const stress = shiftRec
      ? Math.max(0.88, progress)
      : nitroRec
      ? Math.max(0.82, progress * 0.9)
      : Math.max(progress * 0.75, normalizedSpeed * 0.7);

    const clampedStress = Math.max(0, Math.min(1, stress));

    // Dynamic color transition: Green (145°) -> Lime (85°) -> Amber (45°) -> Red (0°)
    const hue = Math.max(0, Math.min(145, Math.round(145 - clampedStress * 145)));
    const color = `hsl(${hue}, 94%, ${hue < 25 ? '56%' : '48%'})`;
    const glow = `hsla(${hue}, 96%, 52%, ${clampedStress > 0.75 ? 0.6 : 0.22})`;

    // Speedometer dial sweep: 0 to 280+ km/h
    const maxDial = Math.max(260, Math.ceil((safeTopSpeed * 1.15) / 20) * 20);
    const sRatio = Math.max(0, Math.min(1.05, speed / maxDial));
    const nAngle = -120 + Math.min(1, sRatio) * 240;

    return {
      gearNumber: currentGear.label,
      gearProgress: progress,
      isShiftRecommended: shiftRec,
      isNitroRecommended: nitroRec,
      gaugeColor: color,
      gaugeGlow: glow,
      revStress: clampedStress,
      needleAngle: nAngle,
      speedRatio: sRatio,
    };
  }, [normalizedSpeed, speed, safeTopSpeed, nitroAmount, isNitroActive]);

  // 10-Segment RPM rev bar
  const totalSegments = 10;
  const activeSegments = Math.round(gearProgress * totalSegments);

  return (
    <div className="flex flex-row items-stretch gap-2 sm:gap-2.5 pointer-events-none select-none">
      {/* =========================================================================
          1. DYNAMIC CSS SPEEDOMETER & TACHOMETER INSTRUMENT CLUSTER
      ========================================================================= */}
      <div
        className="flex items-center gap-2.5 sm:gap-3 px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-slate-950/90 backdrop-blur-md rounded-2xl border transition-all duration-200 shadow-xl"
        style={{
          borderColor: revStress > 0.8 ? gaugeColor : 'rgba(51, 65, 85, 0.75)',
          boxShadow: revStress > 0.8 ? `0 0 22px ${gaugeGlow}` : '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Dynamic Analog Dial Gauge with CSS Needle */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            {/* Background Track Arc (240-degree sweep) */}
            <circle
              cx="32"
              cy="32"
              r="26"
              className="stroke-slate-800/90"
              strokeWidth="4.5"
              strokeDasharray="108.9 163.36"
              strokeDashoffset="0"
              strokeLinecap="round"
              fill="none"
            />
            {/* Redline Threshold Mark (last 20% of dial) */}
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="#ef4444"
              strokeWidth="4.5"
              strokeDasharray="21.78 163.36"
              strokeDashoffset="-87.12"
              strokeLinecap="round"
              fill="none"
              opacity="0.45"
            />
            {/* Active Colored Speed Arc with Real-time CSS Color Transition */}
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke={gaugeColor}
              strokeWidth="4.5"
              strokeDasharray="108.9 163.36"
              strokeDashoffset={108.9 - 108.9 * Math.min(1, speedRatio)}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-150 ease-out"
              style={{
                filter: revStress > 0.75 ? `drop-shadow(0 0 4px ${gaugeColor})` : 'none',
              }}
            />
          </svg>

          {/* Dynamic Needle Layer (CSS Rotation) */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transition: 'transform 0.14s cubic-bezier(0.12, 0.88, 0.24, 1.15)',
            }}
          >
            {/* Needle pointer */}
            <div
              className="w-0.75 sm:w-1 h-5 sm:h-6 rounded-full -translate-y-2.5 sm:-translate-y-3 transition-colors duration-200"
              style={{
                backgroundColor: gaugeColor,
                boxShadow: `0 0 6px ${gaugeColor}`,
              }}
            />
          </div>

          {/* Center Hub with Gear Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-inner">
              <span
                className="text-[9px] sm:text-[10px] font-black font-mono transition-colors duration-200"
                style={{ color: gaugeColor }}
              >
                G{gearNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Digital Readout & Dynamic Recommendation HUD */}
        <div className="flex flex-col justify-center min-w-[76px] sm:min-w-[88px]">
          {/* Real-time Speed Number with CSS Transition */}
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl sm:text-3xl font-black font-game tabular-nums leading-none tracking-tight transition-colors duration-200"
              style={{
                color: gaugeColor,
                textShadow: revStress > 0.75 ? `0 0 14px ${gaugeGlow}` : 'none',
              }}
            >
              {speed}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              KM/H
            </span>
          </div>

          {/* 10-Segment Tachometer Rev-Strip */}
          <div className="flex items-center gap-0.5 mt-1 sm:mt-1.5 h-1.5 sm:h-2">
            {Array.from({ length: totalSegments }).map((_, idx) => {
              const isLit = idx < activeSegments;
              let segColor = '#10b981'; // Green
              if (idx >= 8) {
                segColor = '#ef4444'; // Redline Red
              } else if (idx >= 6) {
                segColor = '#f59e0b'; // Amber / Yellow
              }

              return (
                <div
                  key={idx}
                  className={`flex-1 h-full rounded-[1px] transition-all duration-100 ${
                    isLit ? 'opacity-100 scale-y-105' : 'opacity-20 bg-slate-800'
                  } ${isLit && idx >= 8 && revStress > 0.8 ? 'animate-pulse' : ''}`}
                  style={{
                    backgroundColor: isLit ? segColor : undefined,
                    boxShadow: isLit && idx >= 7 ? `0 0 4px ${segColor}` : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* Dynamic Shift / Nitro Recommendation Banner */}
          <div className="mt-1 h-4 flex items-center">
            {isNitroActive ? (
              <span className="animate-bounce flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-sm">
                <Flame className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400" />
                <span>BOOSTING ⚡</span>
              </span>
            ) : isShiftRecommended ? (
              <span className="animate-pulse flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black bg-red-500/25 text-red-300 border border-red-500/70 shadow-sm">
                <ChevronUp className="w-2.5 h-2.5 text-red-400 stroke-[3]" />
                <span>SHIFT UP ▲</span>
              </span>
            ) : isNitroRecommended ? (
              <span className="animate-pulse flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black bg-amber-500/25 text-amber-300 border border-amber-500/70 shadow-sm">
                <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                <span>NITRO READY 🔥</span>
              </span>
            ) : (
              <div className="flex items-center gap-1.5 w-full">
                {/* Embedded Vehicle Health Bar */}
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      carHealth > 50 ? 'bg-emerald-500' : carHealth > 25 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${carHealth}%` }}
                  />
                </div>
                <span className="text-[8px] text-slate-400 font-mono font-bold">
                  {carHealth}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. DYNAMIC NITRO VISUAL GAUGE (Circular radial canister meter)
      ========================================================================= */}
      <div
        className={`flex items-center gap-2 sm:gap-2.5 px-2.5 py-2 sm:px-3 sm:py-2.5 bg-slate-950/90 backdrop-blur-md rounded-2xl border transition-all duration-200 shadow-xl ${
          isNitroActive
            ? 'border-amber-500/70 shadow-amber-500/25'
            : nitroAmount >= 25
            ? 'border-cyan-500/50 shadow-cyan-500/15'
            : 'border-slate-800/80'
        }`}
      >
        {/* Radial Canister Meter */}
        <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="19"
              className="stroke-slate-800/90"
              strokeWidth="4"
              fill="none"
            />
            {/* 25% Threshold Marker */}
            <circle
              cx="24"
              cy="24"
              r="19"
              className="stroke-slate-700"
              strokeWidth="4"
              strokeDasharray="2 117"
              strokeDashoffset={-(119.38 * 0.25)}
              fill="none"
            />
            {/* Active Nitro Arc */}
            <circle
              cx="24"
              cy="24"
              r="19"
              stroke={isNitroActive ? '#f59e0b' : nitroAmount >= 25 ? '#06b6d4' : '#64748b'}
              strokeWidth="4"
              strokeDasharray={119.38}
              strokeDashoffset={119.38 - 119.38 * (nitroAmount / 100)}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-150 ease-out"
            />
          </svg>

          {/* Inner Flame Icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Flame
              className={`w-4 h-4 transition-all ${
                isNitroActive
                  ? 'text-amber-400 animate-pulse scale-110'
                  : nitroAmount >= 25
                  ? 'text-cyan-400'
                  : 'text-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Nitro Text & Status */}
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-0.5">
            <span
              className={`text-base sm:text-lg font-black font-game tabular-nums leading-none ${
                isNitroActive ? 'text-amber-400' : nitroAmount >= 25 ? 'text-cyan-300' : 'text-slate-400'
              }`}
            >
              {nitroAmount}
            </span>
            <span className="text-[9px] font-bold text-slate-400">%</span>
          </div>

          <div className="mt-0.5">
            {isNitroActive ? (
              <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-black bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                BOOST 🔥
              </span>
            ) : nitroAmount >= 25 ? (
              <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                READY ⚡
              </span>
            ) : (
              <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold bg-slate-800/90 text-slate-400 border border-slate-700/60 flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse inline-block" />
                CHARGE
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
