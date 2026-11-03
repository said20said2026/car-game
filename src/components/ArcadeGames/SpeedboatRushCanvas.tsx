import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface SpeedboatRushCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

export const SpeedboatRushCanvas: React.FC<SpeedboatRushCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [speedKnots, setSpeedKnots] = useState(0);
  const [hydroBoost, setHydroBoost] = useState(100);
  const [tokensCollected, setTokensCollected] = useState(0);
  const [distanceKm, setDistanceKm] = useState('0.0');
  const [stuntMessage, setStuntMessage] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const stateRef = useRef({
    boat: {
      x: 350,
      y: 420,
      width: 44,
      height: 74,
      speed: 0,
      maxSpeed: 11.5,
      accel: 0.22,
      friction: 0.985,
      steer: 0,
      steerAngle: 0,
      z: 0, // wave elevation / airborne jump
      vz: 0,
      isAirborne: false,
      stuntRoll: 0,
    },
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      boost: false,
    },
    oceanOffset: 0,
    distanceTravelled: 0,
    hazards: [] as { x: number; y: number; type: 'buoy' | 'wave_ramp' | 'whirlpool'; radius: number; hit?: boolean }[],
    coins: [] as { x: number; y: number; collected: boolean; radius: number }[],
    wakeParticles: [] as { x: number; y: number; vx: number; vy: number; life: number; size: number }[],
    score: 0,
    tokens: 0,
    boost: 100,
    health: 100,
    running: true,
  });

  const triggerStunt = (stuntName: string, bonusPts: number) => {
    setStuntMessage(`${stuntName}! +${bonusPts} PTS 🌊`);
    arcadeAudio.playWhoosh();
    setTimeout(() => {
      setStuntMessage(null);
    }, 1200);
  };

  const initGame = useCallback((w: number, h: number) => {
    const s = stateRef.current;
    s.boat.x = w / 2;
    s.boat.y = h - 130;
    s.boat.speed = 0;
    s.boat.z = 0;
    s.boat.vz = 0;
    s.boat.isAirborne = false;
    s.boat.stuntRoll = 0;
    s.oceanOffset = 0;
    s.distanceTravelled = 0;
    s.score = 0;
    s.tokens = 0;
    s.boost = 100;
    s.health = 100;
    s.running = true;
    s.wakeParticles = [];

    // Seed ocean hazards
    s.hazards = [];
    s.coins = [];
    for (let i = 0; i < 20; i++) {
      const y = -i * 170 - 200;
      const x = Math.random() * (w - 180) + 90;
      const r = Math.random();
      const type: 'buoy' | 'wave_ramp' | 'whirlpool' = r < 0.4 ? 'wave_ramp' : r < 0.75 ? 'buoy' : 'whirlpool';
      s.hazards.push({
        x,
        y,
        type,
        radius: type === 'wave_ramp' ? 36 : type === 'whirlpool' ? 30 : 16,
      });

      if (Math.random() > 0.4) {
        s.coins.push({
          x: x + (Math.random() * 60 - 30),
          y: y - 50,
          collected: false,
          radius: 12,
        });
      }
    }

    setScore(0);
    setTokensCollected(0);
    setHydroBoost(100);
    setDistanceKm('0.0');
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = Math.min(parent.clientWidth, 960);
      const height = Math.min(Math.max(window.innerHeight * 0.62, 520), 640);
      canvas.width = width;
      canvas.height = height;
      initGame(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running && (e.code === 'Space' || e.code === 'KeyR')) {
        initGame(canvas.width, canvas.height);
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') s.keys.up = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') s.keys.down = true;
      if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') s.keys.boost = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') s.keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') s.keys.down = false;
      if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') s.keys.boost = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;
      const b = s.boat;
      const w = canvas.width;
      const h = canvas.height;

      if (s.running) {
        // Steering
        if (s.keys.left) {
          b.steer = Math.max(b.steer - 0.08, -1);
          b.steerAngle = Math.max(b.steerAngle - 0.06, -0.38);
        } else if (s.keys.right) {
          b.steer = Math.min(b.steer + 0.08, 1);
          b.steerAngle = Math.min(b.steerAngle + 0.06, 0.38);
        } else {
          b.steer *= 0.84;
          b.steerAngle *= 0.82;
        }

        // Throttle & Hydro-Boost
        const isBoosting = s.keys.boost && s.boost > 0;
        if (isBoosting) {
          s.boost = Math.max(0, s.boost - dt * 25);
          b.speed = Math.min(b.speed + b.accel * 2.0, b.maxSpeed * 1.45);
          if (Math.random() < 0.25) arcadeAudio.playNitro();
        } else if (s.keys.up) {
          b.speed = Math.min(b.speed + b.accel, b.maxSpeed);
          if (Math.random() < 0.14) arcadeAudio.playEngineTone(130 + b.speed * 14, 0.09);
        } else if (s.keys.down) {
          b.speed = Math.max(0, b.speed - b.accel * 1.6);
        } else {
          b.speed *= b.friction;
        }

        b.x += b.steer * (b.speed * 0.7 + 2);
        b.x = Math.max(50, Math.min(w - 50, b.x));

        // Wave jumping elevation (Z)
        if (b.isAirborne) {
          b.z += b.vz * dt;
          b.vz -= 36 * dt; // gravity
          b.stuntRoll += dt * 6; // airborne barrel-roll spin
          if (b.z <= 0) {
            b.z = 0;
            b.vz = 0;
            b.isAirborne = false;
            b.stuntRoll = 0;
            arcadeAudio.playCrash(); // splash down sound
            // Big wave splash particles on landing
            for (let i = 0; i < 25; i++) {
              s.wakeParticles.push({
                x: b.x + (Math.random() * 50 - 25),
                y: b.y + 30,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 6,
                life: 0.55,
                size: Math.random() * 8 + 4,
              });
            }
          }
        }

        // Progress distance
        const travel = b.speed * 60 * dt;
        s.distanceTravelled += travel;
        s.oceanOffset = (s.oceanOffset + travel) % 80;
        s.score += Math.round(travel * 0.3 * (b.isAirborne ? 2.5 : 1));

        // Spawn white-water wake particles from twin outboard propellers
        if (b.speed > 2 && !b.isAirborne) {
          for (let i = 0; i < 3; i++) {
            s.wakeParticles.push({
              x: b.x + (i === 0 ? -12 : i === 1 ? 0 : 12) + (Math.random() * 4 - 2),
              y: b.y + 36,
              vx: (Math.random() - 0.5) * 4,
              vy: Math.random() * 4 + 3,
              life: 0.5,
              size: Math.random() * 7 + 3,
            });
          }
        }

        // Move ocean hazards
        for (let i = 0; i < s.hazards.length; i++) {
          const hzd = s.hazards[i];
          hzd.y += travel;

          if (!hzd.hit && b.z < 15) {
            const dx = Math.abs(b.x - hzd.x);
            const dy = Math.abs(b.y - hzd.y);
            if (dx < hzd.radius + 18 && dy < hzd.radius + 24) {
              if (hzd.type === 'wave_ramp') {
                // Wave ramp jump launch!
                b.isAirborne = true;
                b.vz = 26 + b.speed * 1.1;
                b.z = 4;
                hzd.hit = true;
                s.score += 750;
                triggerStunt('HYDRO 360 AIR-LAUNCH', 750);
              } else if (hzd.type === 'whirlpool') {
                // Sucked into whirlpool spin
                b.speed = Math.max(1, b.speed * 0.4);
                b.steerAngle += 0.8;
                hzd.hit = true;
                arcadeAudio.playTireSkid();
              } else {
                // Buoy collision
                b.speed = Math.max(1, b.speed * 0.3);
                hzd.hit = true;
                arcadeAudio.playCrash();
                s.health = Math.max(0, s.health - 25);
                if (s.health <= 0) {
                  s.running = false;
                  setIsGameOver(true);
                  onGameOver?.(s.score, s.tokens);
                }
              }
            }
          }

          if (hzd.y > h + 100) {
            hzd.y = -Math.random() * 220 - 100;
            hzd.x = Math.random() * (w - 180) + 90;
            hzd.hit = false;
            const r = Math.random();
            hzd.type = r < 0.4 ? 'wave_ramp' : r < 0.75 ? 'buoy' : 'whirlpool';
            hzd.radius = hzd.type === 'wave_ramp' ? 36 : hzd.type === 'whirlpool' ? 30 : 16;
          }
        }

        // Move tokens
        for (let i = 0; i < s.coins.length; i++) {
          const token = s.coins[i];
          token.y += travel;

          if (!token.collected) {
            const dx = Math.abs(b.x - token.x);
            const dy = Math.abs(b.y - token.y);
            if (dx < 30 && dy < 35) {
              token.collected = true;
              s.tokens += 1;
              s.score += 300;
              s.boost = Math.min(100, s.boost + 10);
              arcadeAudio.playCoin();
              onEarnCoins(1);
            }
          }

          if (token.y > h + 100) {
            token.y = -Math.random() * 250 - 150;
            token.x = Math.random() * (w - 180) + 90;
            token.collected = false;
          }
        }

        // Update wake particles
        for (let i = s.wakeParticles.length - 1; i >= 0; i--) {
          const p = s.wakeParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= dt;
          if (p.life <= 0) s.wakeParticles.splice(i, 1);
        }

        setScore(s.score);
        setSpeedKnots(Math.round(b.speed * 8.5));
        setHydroBoost(Math.round(s.boost));
        setTokensCollected(s.tokens);
        setDistanceKm((s.distanceTravelled * 0.001).toFixed(1));
      }

      // RENDER CANVAS
      // 1. Tropical Sunset Sky Horizon
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.38);
      skyGrad.addColorStop(0, '#2d0c45');
      skyGrad.addColorStop(0.5, '#bd2d6b');
      skyGrad.addColorStop(1, '#ff8a3d');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.38);

      // Tropical island silhouettes
      ctx.fillStyle = '#1c0a28';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.38);
      for (let x = 0; x <= w; x += 60) {
        const iy = h * 0.36 - Math.sin(x * 0.02) * 20;
        ctx.lineTo(x, iy);
      }
      ctx.lineTo(w, h * 0.38);
      ctx.closePath();
      ctx.fill();

      // 2. Neon Turquoise Ocean Surface
      const oceanGrad = ctx.createLinearGradient(0, h * 0.38, 0, h);
      oceanGrad.addColorStop(0, '#006e82');
      oceanGrad.addColorStop(0.4, '#00a3ad');
      oceanGrad.addColorStop(1, '#003a45');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, h * 0.38, w, h * 0.62);

      // Wave swells scrolling downward
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2.5;
      for (let dy = 0; dy < 12; dy++) {
        const yPos = (s.oceanOffset + dy * 55) % (h * 0.62) + h * 0.38;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        for (let x = 0; x <= w; x += 40) {
          const wy = yPos + Math.sin((x + s.distanceTravelled * 0.1) * 0.04) * 6;
          ctx.lineTo(x, wy);
        }
        ctx.stroke();
      }

      // 3. Render Ocean Hazards
      for (const hzd of s.hazards) {
        if (hzd.y < h * 0.38 || hzd.y > h + 50) continue;
        if (hzd.type === 'wave_ramp') {
          // Foam-crested Wave Jump Ramp
          ctx.save();
          ctx.translate(hzd.x, hzd.y);
          ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(0, 0, hzd.radius, hzd.radius * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('▲ SURF JUMP ▲', 0, 4);
          ctx.restore();
        } else if (hzd.type === 'whirlpool') {
          // Swirling blue whirlpool vortex
          ctx.save();
          ctx.translate(hzd.x, hzd.y);
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, hzd.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else {
          // Marine Shipping Warning Buoy (Red & White)
          ctx.save();
          ctx.translate(hzd.x, hzd.y);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, hzd.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-3, -hzd.radius - 8, 6, 8);
          // Blinking light
          ctx.fillStyle = '#fef08a';
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, -hzd.radius - 10, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 4. Render Tokens
      for (const coin of s.coins) {
        if (coin.collected || coin.y < h * 0.38 || coin.y > h + 40) continue;
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚓', 0, 0);
        ctx.restore();
      }

      // 5. Render Foam Wake Particles
      for (const p of s.wakeParticles) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 1.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Render Offshore Racing Speedboat
      ctx.save();
      const shadowY = b.y + 40;
      const shadowScale = Math.max(0.4, 1 - b.z / 120);
      ctx.fillStyle = 'rgba(0, 40, 50, 0.45)';
      ctx.beginPath();
      ctx.ellipse(b.x, shadowY, 24 * shadowScale, 14 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Boat position with jump elevation
      ctx.translate(b.x, b.y - b.z);
      ctx.rotate(b.steerAngle + (b.isAirborne ? b.stuntRoll : 0));

      // Catamaran Double-Hull (Cyan & Hot Magenta)
      ctx.fillStyle = '#06b6d4'; // Cyan hull
      ctx.beginPath();
      // Pointed aerodynamic bow
      ctx.moveTo(0, -38);
      ctx.lineTo(18, -12);
      ctx.lineTo(19, 32);
      ctx.lineTo(12, 34);
      ctx.lineTo(8, 20);
      ctx.lineTo(-8, 20);
      ctx.lineTo(-12, 34);
      ctx.lineTo(-19, 32);
      ctx.lineTo(-18, -12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ec4899'; // Hot Magenta racing stripe
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Cockpit Windshield (Tinted UV Purple)
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.roundRect(-9, -16, 18, 18, 4);
      ctx.fill();

      // Twin Mercury Racing Outboards
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-16, 26, 7, 12);
      ctx.fillRect(9, 26, 7, 12);

      // Jet Hydro-Thrust Flame when boosting
      if (s.keys.boost && s.boost > 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-16, 38);
        ctx.lineTo(-13, 52 + Math.random() * 8);
        ctx.lineTo(-9, 38);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(9, 38);
        ctx.lineTo(12, 52 + Math.random() * 8);
        ctx.lineTo(16, 38);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [initGame, onEarnCoins, onGameOver]);

  const handleTouchDir = (dir: 'left' | 'right' | 'up' | 'boost', active: boolean) => {
    const s = stateRef.current;
    if (dir === 'left') s.keys.left = active;
    if (dir === 'right') s.keys.right = active;
    if (dir === 'up') s.keys.up = active;
    if (dir === 'boost') s.keys.boost = active;
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none bg-slate-950">
      {/* Top HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          {/* Score */}
          <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-white shadow-xl">
            <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Score</span>
            <span className="font-mono font-black text-sm sm:text-base text-amber-300">{score.toLocaleString()}</span>
          </div>

          {/* Speed in Knots */}
          <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-white shadow-xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Velocity</span>
            <span className="font-mono font-black text-sm text-cyan-400">{speedKnots} <span className="text-[10px] text-slate-400">knots</span></span>
          </div>

          {/* Distance */}
          <div className="hidden sm:flex flex-col bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-white shadow-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Distance</span>
            <span className="font-mono font-black text-sm text-emerald-400">{distanceKm} km</span>
          </div>
        </div>

        {/* Right: Hydro-Boost & Tokens */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30 text-white shadow-xl flex items-center gap-1.5">
            <span className="text-amber-400 font-black">⚓</span>
            <span className="font-mono font-black text-sm sm:text-base text-amber-300">{tokensCollected}</span>
          </div>

          <div className="w-24 sm:w-32 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/40">
            <div className="flex justify-between text-[9px] font-bold text-cyan-300 mb-0.5">
              <span>HYDRO-BOOST</span>
              <span>{hydroBoost}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 transition-all duration-75" style={{ width: `${hydroBoost}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Airborne Hydro Stunt Banner */}
      {stuntMessage && (
        <div className="absolute top-20 z-20 px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-pink-500 text-slate-950 font-game font-black text-sm sm:text-lg shadow-2xl animate-bounce">
          {stuntMessage}
        </div>
      )}

      {/* Main Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="w-full h-auto block rounded-xl cursor-crosshair shadow-inner"
        style={{ touchAction: 'none' }}
      />

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-3xl mb-3">
            🚤
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-game text-[#ffcc00] tracking-wide mb-1">
            OCEAN SPRINT COMPLETE
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-4">
            You completed {distanceKm} km across high-seas swell!
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-5">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Score</span>
              <span className="font-mono font-black text-lg text-amber-400">{score.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Anchors Stashed</span>
              <span className="font-mono font-black text-lg text-cyan-300">+{tokensCollected} ⚓</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (canvasRef.current) initGame(canvasRef.current.width, canvasRef.current.height);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-cyan-400/20 cursor-pointer active:scale-95 transition-all"
          >
            🏁 RIDE WAVES AGAIN (SPACE)
          </button>
        </div>
      )}

      {/* Mobile Controllers */}
      <div className="w-full flex items-center justify-between p-3 bg-slate-900/90 border-t border-slate-800 gap-3 md:hidden">
        <div className="flex gap-2">
          <button
            onTouchStart={() => handleTouchDir('left', true)}
            onTouchEnd={() => handleTouchDir('left', false)}
            className="w-14 h-12 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg active:bg-amber-400 active:text-slate-950 flex items-center justify-center"
          >
            ◀
          </button>
          <button
            onTouchStart={() => handleTouchDir('right', true)}
            onTouchEnd={() => handleTouchDir('right', false)}
            className="w-14 h-12 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg active:bg-amber-400 active:text-slate-950 flex items-center justify-center"
          >
            ▶
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onTouchStart={() => handleTouchDir('up', true)}
            onTouchEnd={() => handleTouchDir('up', false)}
            className="px-5 h-12 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs active:bg-cyan-300 flex items-center justify-center"
          >
            THROTTLE ▲
          </button>
          <button
            onTouchStart={() => handleTouchDir('boost', true)}
            onTouchEnd={() => handleTouchDir('boost', false)}
            className="px-4 h-12 rounded-xl bg-pink-500 text-white font-black text-xs active:bg-pink-400 flex items-center justify-center"
          >
            HYDRO-BOOST 🌊
          </button>
        </div>
      </div>
    </div>
  );
};
