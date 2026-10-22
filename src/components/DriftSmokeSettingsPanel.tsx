import React, { useState, useEffect, useRef } from 'react';
import { Wind, Flame, Sparkles, RotateCcw, Palette, Check, Zap, Eye } from 'lucide-react';
import { CarConfig, DriftSmokeConfig, DriftSmokeMode, PlayerStats } from '../types/game';
import {
  CAR_SIGNATURE_THEMES,
  getCarDriftSmokeColors,
  getDefaultDriftSmokeConfig,
  generateSmokePalette,
} from '../utils/driftSmoke';
import { soundManager } from '../utils/audio';

interface DriftSmokeSettingsPanelProps {
  car: CarConfig;
  stats: PlayerStats;
  onUpdateConfig: (carId: string, config: DriftSmokeConfig) => void;
}

const CURATED_CUSTOM_COLORS = [
  { name: 'Cyber Cyan', hex: '#06b6d4' },
  { name: 'Laser Pink', hex: '#ec4899' },
  { name: 'Hyper Violet', hex: '#a855f7' },
  { name: 'Toxic Emerald', hex: '#10b981' },
  { name: 'Solar Amber', hex: '#f59e0b' },
  { name: 'Blaze Red', hex: '#ef4444' },
  { name: 'Pure White Vapor', hex: '#f8fafc' },
  { name: 'Stealth Onyx', hex: '#18181b' },
];

export const DriftSmokeSettingsPanel: React.FC<DriftSmokeSettingsPanelProps> = ({
  car,
  stats,
  onUpdateConfig,
}) => {
  const currentConfig: DriftSmokeConfig =
    stats.driftSmokeSettings?.[car.id] || getDefaultDriftSmokeConfig();

  const [activeMode, setActiveMode] = useState<DriftSmokeMode>(currentConfig.mode);
  const [customColor, setCustomColor] = useState<string>(
    currentConfig.customColor || car.color || '#38bdf8'
  );
  const [intensity, setIntensity] = useState<'subtle' | 'standard' | 'dense'>(
    currentConfig.intensity || 'standard'
  );
  const [sparkEnabled, setSparkEnabled] = useState<boolean>(
    currentConfig.sparkEnabled !== false
  );
  const [isBurnoutTesting, setIsBurnoutTesting] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync state whenever selected car or external stats change
  useEffect(() => {
    const config = stats.driftSmokeSettings?.[car.id] || getDefaultDriftSmokeConfig();
    setActiveMode(config.mode);
    setCustomColor(config.customColor || car.color || '#38bdf8');
    setIntensity(config.intensity || 'standard');
    setSparkEnabled(config.sparkEnabled !== false);
  }, [car.id, stats.driftSmokeSettings, car.color]);

  const resolved = getCarDriftSmokeColors(car, {
    mode: activeMode,
    customColor,
    intensity,
    sparkEnabled,
  });

  const signature = CAR_SIGNATURE_THEMES[car.id];

  const handleModeChange = (mode: DriftSmokeMode) => {
    setActiveMode(mode);
    soundManager.playClick();
    const newConfig: DriftSmokeConfig = {
      mode,
      customColor,
      intensity,
      sparkEnabled,
    };
    onUpdateConfig(car.id, newConfig);
  };

  const handleCustomColorSelect = (hex: string) => {
    setCustomColor(hex);
    setActiveMode('custom');
    soundManager.playClick();
    const newConfig: DriftSmokeConfig = {
      mode: 'custom',
      customColor: hex,
      intensity,
      sparkEnabled,
    };
    onUpdateConfig(car.id, newConfig);
  };

  const handleIntensityChange = (lvl: 'subtle' | 'standard' | 'dense') => {
    setIntensity(lvl);
    soundManager.playClick();
    const newConfig: DriftSmokeConfig = {
      mode: activeMode,
      customColor,
      intensity: lvl,
      sparkEnabled,
    };
    onUpdateConfig(car.id, newConfig);
  };

  const handleSparkToggle = () => {
    const next = !sparkEnabled;
    setSparkEnabled(next);
    soundManager.playClick();
    const newConfig: DriftSmokeConfig = {
      mode: activeMode,
      customColor,
      intensity,
      sparkEnabled: next,
    };
    onUpdateConfig(car.id, newConfig);
  };

  const handleResetToTheme = () => {
    setActiveMode('car_theme');
    setIntensity('standard');
    setSparkEnabled(true);
    soundManager.playDrift();
    const newConfig: DriftSmokeConfig = {
      mode: 'car_theme',
      intensity: 'standard',
      sparkEnabled: true,
    };
    onUpdateConfig(car.id, newConfig);
  };

  const triggerBurnoutTest = () => {
    setIsBurnoutTesting(true);
    soundManager.playDrift();
    setTimeout(() => {
      setIsBurnoutTesting(false);
    }, 1500);
  };

  // Mini Live Drift & Burnout Smoke Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    interface PreviewParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      maxLife: number;
      life: number;
      color: string;
      growth: number;
      isSpark?: boolean;
    }

    const particles: PreviewParticle[] = [];
    let lastTime = performance.now();
    let spawnAccumulator = 0;

    const render = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;

      // Draw dark garage dyno asphalt floor
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Asphalt grid texture
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Asphalt skid marks behind tire
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(w * 0.28, h * 0.48, w * 0.44, 26);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(w * 0.22, h * 0.44, w * 0.56, 34);

      // Spawn smoke puffs
      spawnAccumulator += dt;
      const spawnInterval = isBurnoutTesting ? 0.03 : 0.07;

      if (spawnAccumulator >= spawnInterval) {
        spawnAccumulator = 0;

        const smokeColors = resolved.smokeColors;
        const sparkColors = resolved.sparkColors;
        const puffsToSpawn = isBurnoutTesting ? 3 : 1;

        for (let i = 0; i < puffsToSpawn; i++) {
          const color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
          const life = 0.65 + Math.random() * 0.45;
          particles.push({
            x: w * 0.5 + (Math.random() - 0.5) * 16,
            y: h * 0.58 + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * (isBurnoutTesting ? 70 : 35),
            vy: -(25 + Math.random() * (isBurnoutTesting ? 55 : 30)),
            size: 8 + Math.random() * 6,
            growth: 28 + Math.random() * 24,
            maxLife: life,
            life,
            color,
          });

          // Sparks
          if (sparkEnabled && Math.random() < (isBurnoutTesting ? 0.6 : 0.3)) {
            const spkColor = sparkColors[Math.floor(Math.random() * sparkColors.length)];
            particles.push({
              x: w * 0.5 + (Math.random() - 0.5) * 12,
              y: h * 0.58,
              vx: (Math.random() - 0.5) * 80,
              vy: -(30 + Math.random() * 60),
              size: 2,
              growth: 0,
              maxLife: 0.25 + Math.random() * 0.2,
              life: 0.25 + Math.random() * 0.2,
              color: spkColor,
              isSpark: true,
            });
          }
        }
      }

      // Update and render particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.size += p.growth * dt;

        const lifeRatio = p.life / p.maxLife;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, lifeRatio * (isBurnoutTesting ? 0.95 : 0.8)));

        if (p.isSpark) {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Radial gradient volumetric smoke puff
          const grad = ctx.createRadialGradient(
            p.x - p.size * 0.15,
            p.y - p.size * 0.15,
            0,
            p.x,
            p.y,
            Math.max(1, p.size)
          );
          grad.addColorStop(0, p.color);
          grad.addColorStop(0.65, p.color);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw stylized high-performance racing tire & brake rotor
      const tireCenterX = w * 0.5;
      const tireCenterY = h * 0.60;

      // Tire Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(tireCenterX, tireCenterY + 12, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tire Rubber Body
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(tireCenterX - 22, tireCenterY - 14, 44, 28, 6);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tread Grooves (Animated if burnout testing)
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.lineWidth = 2.5;
      const offset = (now * (isBurnoutTesting ? 0.15 : 0.03)) % 10;
      for (let tx = -16; tx <= 16; tx += 6) {
        ctx.beginPath();
        ctx.moveTo(tireCenterX + tx, tireCenterY - 12);
        ctx.lineTo(tireCenterX + tx, tireCenterY + 12);
        ctx.stroke();
      }

      // Alloy Rim Hub (colored with car accent)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(tireCenterX, tireCenterY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = car.accentColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Heat glow under hard burnout
      if (isBurnoutTesting) {
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(tireCenterX, tireCenterY, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [resolved, isBurnoutTesting, sparkEnabled, car.accentColor]);

  return (
    <div className="space-y-4">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Wind className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-game">
              <span>Drift Smoke Particle Customizer</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-sans font-semibold">
                {car.name}
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Change the color and density of tire smoke billowing from {car.name}&apos;s wheels during drifts
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToTheme}
          className="self-start sm:self-center px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700/80 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Reset to Car's Signature Theme"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Car Theme</span>
        </button>
      </div>

      {/* Live Drift Simulator & Burnout Canvas Box */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={140}
          className="w-full h-32 object-cover block"
        />

        {/* Live Status Overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/70 text-[10px] font-bold text-slate-200 backdrop-blur-sm">
          <span
            className="w-2.5 h-2.5 rounded-full shadow-xs"
            style={{ backgroundColor: resolved.activeHex }}
          />
          <span>{resolved.label}</span>
          <span className="text-amber-400 ml-1">{resolved.badge}</span>
        </div>

        {/* Burnout Test Button on Canvas */}
        <div className="absolute bottom-2 right-2">
          <button
            type="button"
            onClick={triggerBurnoutTest}
            disabled={isBurnoutTesting}
            className={`px-3 py-1 rounded-lg text-xs font-bold font-game flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isBurnoutTesting
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{isBurnoutTesting ? 'Burnout Revving! 🔥' : 'Test Burnout'}</span>
          </button>
        </div>
      </div>

      {/* Section 1: Themes Tailored to Current Car */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Theme Presets for {car.name}</span>
          <span className="text-[10px] text-slate-400">Click to apply instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Preset 1: Car Theme Signature Blend */}
          <button
            type="button"
            onClick={() => handleModeChange('car_theme')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeMode === 'car_theme'
                ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                  style={{
                    background: `linear-gradient(135deg, ${car.color} 50%, ${car.accentColor} 50%)`,
                  }}
                />
                <span className="text-xs font-bold text-white">Car Theme Signature</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
              {signature ? signature.description : `Dynamic dual-blend of ${car.color} & ${car.accentColor}.`}
            </p>
          </button>

          {/* Preset 2: Car Body Primary */}
          <button
            type="button"
            onClick={() => handleModeChange('car_primary')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeMode === 'car_primary'
                ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                  style={{ backgroundColor: car.color }}
                />
                <span className="text-xs font-bold text-white">Car Body Color</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{car.color}</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
              Pure monochrome drift vapor matching {car.name}&apos;s exterior body paint.
            </p>
          </button>

          {/* Preset 3: Car Aero Accent */}
          <button
            type="button"
            onClick={() => handleModeChange('car_accent')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeMode === 'car_accent'
                ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                  style={{ backgroundColor: car.accentColor }}
                />
                <span className="text-xs font-bold text-white">Aero Accent & Underglow</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{car.accentColor}</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
              High-intensity glowing plumes matched to the aero trim and underglow lights.
            </p>
          </button>

          {/* Preset 4: Classic Asphalt Black */}
          <button
            type="button"
            onClick={() => handleModeChange('classic_black')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeMode === 'classic_black'
                ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-zinc-950 border border-zinc-700 shadow-xs" />
                <span className="text-xs font-bold text-white">Classic Burnt Rubber</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">🏁 Asphalt Black</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
              Traditional pitch-black burning rubber clouds and charcoal street friction.
            </p>
          </button>
        </div>
      </div>

      {/* Section 2: Custom Tuner Palette Swatches */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>Custom Tuner Smoke Color</span>
          </span>
          {activeMode === 'custom' && (
            <span className="text-[10px] text-purple-300 font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
              Active Custom Tint
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {CURATED_CUSTOM_COLORS.map((col) => {
            const isSelected = activeMode === 'custom' && customColor.toLowerCase() === col.hex.toLowerCase();
            return (
              <button
                key={col.hex}
                type="button"
                onClick={() => handleCustomColorSelect(col.hex)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-purple-400 text-white shadow-xs'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
                title={col.name}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: col.hex }}
                />
                <span className="text-[11px]">{col.name}</span>
                {isSelected && <Check className="w-3 h-3 text-purple-400 ml-0.5" />}
              </button>
            );
          })}

          {/* HTML5 Native Color Picker for Any Custom Hex */}
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-slate-950/60 hover:bg-slate-800/60 border-slate-700/80 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleCustomColorSelect(e.target.value)}
              className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
            <span className="text-[11px] font-mono">{customColor.toUpperCase()}</span>
          </label>
        </div>
      </div>

      {/* Section 3: Fine Tuning (Density & Friction Sparks) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Particle Volume / Density */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            <span>Particle Cloud Volume</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['subtle', 'standard', 'dense'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleIntensityChange(lvl)}
                className={`py-1.5 px-2 rounded-lg text-center text-xs font-semibold capitalize border transition-all cursor-pointer ${
                  intensity === lvl
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* High Friction Sparks Toggle */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tire Friction Sparks</span>
            </div>
            <p className="text-[10px] text-slate-400">
              High-heat sparks flying from burning rubber
            </p>
          </div>

          <button
            type="button"
            onClick={handleSparkToggle}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              sparkEnabled ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                sparkEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
