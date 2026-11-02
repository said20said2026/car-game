import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface RetroGrandPrixCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

interface AICar {
  x: number;
  y: number;
  angle: number;
  speed: number;
  waypointIndex: number;
  color: string;
}

export const RetroGrandPrixCanvas: React.FC<RetroGrandPrixCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lap, setLap] = useState(1);
  const [position, setPosition] = useState(8);
  const [lapTime, setLapTime] = useState('00:00.00');
  const [bestLap, setBestLap] = useState('--:--.--');
  const [slipstreamCharge, setSlipstreamCharge] = useState(0);
  const [isRaceFinished, setIsRaceFinished] = useState(false);

  const stateRef = useRef({
    player: {
      x: 320,
      y: 450,
      angle: -Math.PI / 2,
      speed: 0,
      maxSpeed: 7.2,
      accel: 0.18,
      brake: 0.28,
      turnSpeed: 0.048,
      lap: 1,
      totalLaps: 3,
      slipstream: 0,
      boosting: false,
    },
    keys: { up: false, down: false, left: false, right: false, boost: false },
    aiCars: [] as AICar[],
    waypoints: [] as { x: number; y: number }[],
    lapStartTime: 0,
    bestLapTime: Infinity,
    coinsEarned: 0,
    raceFinished: false,
  });

  // Circuit waypoints for AI & track geometry
  const initCircuit = useCallback((w: number, h: number) => {
    const margin = 80;
    stateRef.current.waypoints = [
      { x: w * 0.22, y: h - margin },
      { x: w * 0.78, y: h - margin },
      { x: w - margin, y: h * 0.7 },
      { x: w - margin, y: h * 0.3 },
      { x: w * 0.75, y: margin },
      { x: w * 0.5, y: h * 0.4 },
      { x: w * 0.35, y: margin },
      { x: margin, y: h * 0.4 },
      { x: margin, y: h * 0.7 },
    ];

    // AI Grid
    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#14b8a6'];
    stateRef.current.aiCars = colors.map((col, idx) => ({
      x: w * 0.22 + (idx + 1) * 28,
      y: h - margin + (idx % 2 === 0 ? -15 : 15),
      angle: 0,
      speed: 4.8 + Math.random() * 1.5,
      waypointIndex: 1,
      color: col,
    }));
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (['ArrowUp', 'KeyW'].includes(e.code)) { k.up = true; e.preventDefault(); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { k.down = true; e.preventDefault(); }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { k.left = true; e.preventDefault(); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { k.right = true; e.preventDefault(); }
      if (['Space'].includes(e.code)) { k.boost = true; e.preventDefault(); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (['ArrowUp', 'KeyW'].includes(e.code)) k.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) k.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) k.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) k.right = false;
      if (['Space'].includes(e.code)) k.boost = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    stateRef.current.lapStartTime = performance.now();

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(320, rect.width || 800);
      canvas.height = Math.max(300, rect.height || 500);
      initCircuit(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;
      const p = s.player;
      const k = s.keys;
      const w = canvas.width;
      const h = canvas.height;

      if (!s.raceFinished) {
        // Player Steering
        if (k.left) p.angle -= p.turnSpeed * (Math.abs(p.speed) / p.maxSpeed);
        if (k.right) p.angle += p.turnSpeed * (Math.abs(p.speed) / p.maxSpeed);

        // Slipstream boost
        if (k.boost && p.slipstream > 0.25) {
          p.boosting = true;
          p.speed = Math.min(p.speed + 0.35, p.maxSpeed * 1.35);
          p.slipstream = Math.max(0, p.slipstream - dt * 1.5);
          arcadeAudio.playNitro();
        } else {
          p.boosting = false;
        }

        // Acceleration
        if (k.up) {
          p.speed = Math.min(p.speed + p.accel, p.maxSpeed);
          arcadeAudio.playEngineTone(150 + p.speed * 28, 0.04);
        } else if (k.down) {
          p.speed = Math.max(p.speed - p.brake, -p.maxSpeed * 0.3);
        } else {
          p.speed *= 0.98;
        }

        // Move player
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        // Wall collisions
        const margin = 25;
        if (p.x < margin || p.x > w - margin || p.y < margin || p.y > h - margin) {
          p.speed *= -0.5;
          arcadeAudio.playCrash();
        }

        // AI update
        s.aiCars.forEach((ai) => {
          const target = s.waypoints[ai.waypointIndex];
          if (target) {
            const dx = target.x - ai.x;
            const dy = target.y - ai.y;
            const targetAngle = Math.atan2(dy, dx);
            let diff = targetAngle - ai.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            ai.angle += Math.sign(diff) * Math.min(Math.abs(diff), 0.05);

            ai.x += Math.cos(ai.angle) * ai.speed;
            ai.y += Math.sin(ai.angle) * ai.speed;

            if (Math.hypot(dx, dy) < 45) {
              ai.waypointIndex = (ai.waypointIndex + 1) % s.waypoints.length;
            }

            // Check if player is drafting behind AI
            const distToAI = Math.hypot(p.x - ai.x, p.y - ai.y);
            if (distToAI < 90 && Math.abs(p.angle - ai.angle) < 0.6) {
              p.slipstream = Math.min(1.0, p.slipstream + dt * 0.8);
            }
          }
        });

        // Lap Timing
        const currentLapElapsed = (now - s.lapStartTime) / 1000;
        const mins = Math.floor(currentLapElapsed / 60);
        const secs = (currentLapElapsed % 60).toFixed(2);
        setLapTime(`${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`);

        // Finish line crossing check (y = h - 80, x = w * 0.22)
        const finishX = w * 0.22;
        const finishY = h - 80;
        if (Math.hypot(p.x - finishX, p.y - finishY) < 30 && currentLapElapsed > 6) {
          if (currentLapElapsed < s.bestLapTime) {
            s.bestLapTime = currentLapElapsed;
            setBestLap(`${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`);
          }
          if (p.lap < p.totalLaps) {
            p.lap++;
            setLap(p.lap);
            s.lapStartTime = now;
            s.coinsEarned += 5;
            onEarnCoins(5);
            arcadeAudio.playShiftChime();
          } else {
            s.raceFinished = true;
            setIsRaceFinished(true);
            s.coinsEarned += 20;
            onEarnCoins(20);
            arcadeAudio.playShiftChime();
          }
        }

        // Position calculation
        let aheadCount = 0;
        s.aiCars.forEach((ai) => {
          if (ai.waypointIndex > 1) aheadCount++;
        });
        setPosition(Math.max(1, 8 - aheadCount));
        setSlipstreamCharge(Math.floor(p.slipstream * 100));
      }

      // RENDER
      ctx.fillStyle = '#1e3a1e'; // Grass infield
      ctx.fillRect(0, 0, w, h);

      // Track ribbon
      if (s.waypoints.length > 2) {
        ctx.save();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 64;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(s.waypoints[0].x, s.waypoints[0].y);
        for (let i = 1; i < s.waypoints.length; i++) {
          ctx.lineTo(s.waypoints[i].x, s.waypoints[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        // Asphalt Center
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 56;
        ctx.stroke();

        // Red & White Curbs
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.setLineDash([12, 12]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Start/Finish Line
      const finishX = w * 0.22;
      const finishY = h - 80;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(finishX - 15 + i * 8, finishY - 26, 6, 52);
      }

      // Draw AI Cars
      s.aiCars.forEach((ai) => {
        ctx.save();
        ctx.translate(ai.x, ai.y);
        ctx.rotate(ai.angle);
        ctx.fillStyle = ai.color;
        ctx.beginPath();
        ctx.roundRect(-14, -8, 28, 16, 3);
        ctx.fill();
        ctx.fillStyle = '#020617';
        ctx.fillRect(-2, -5, 8, 10);
        ctx.restore();
      });

      // Draw Player Car
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      // Boost aura
      if (p.boosting) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f0ff';
      }

      // Single seater body
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.roundRect(-16, -9, 32, 18, 4);
      ctx.fill();

      // Front & Rear wing
      ctx.fillStyle = '#020617';
      ctx.fillRect(-18, -12, 5, 24);
      ctx.fillRect(13, -11, 4, 22);

      // Driver helmet
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [initCircuit, onEarnCoins]);

  const handleRestart = () => {
    const s = stateRef.current;
    s.player.lap = 1;
    s.player.speed = 0;
    s.player.x = 320;
    s.player.y = 450;
    s.player.angle = -Math.PI / 2;
    s.player.slipstream = 0;
    s.raceFinished = false;
    setLap(1);
    setIsRaceFinished(false);
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30 select-none shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs sm:text-sm font-mono font-black">
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-300">
          <span>LAP: <strong className="text-white text-base">{lap} / 3</strong></span>
          <span className="text-cyan-400">POS: P{position}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200">
            TIME: {lapTime}
          </div>
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-300">
            SLIPSTREAM: {slipstreamCharge}%
          </div>
        </div>
      </div>

      {/* Race Finished Screen */}
      {isRaceFinished && (
        <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-center p-6 z-20">
          <h3 className="text-3xl sm:text-4xl font-black font-game text-amber-400 tracking-wider">
            🏁 CHEQUERED FLAG! FINISHED P{position}
          </h3>
          <p className="text-slate-300 text-sm">
            Best Lap: <strong className="text-cyan-400">{bestLap}</strong> • Championship Reward: <strong className="text-amber-400">+25 Coins</strong>
          </p>
          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-95 shadow-lg shadow-amber-500/30 cursor-pointer active:scale-95"
          >
            ↻ Race Again
          </button>
        </div>
      )}

      {/* Mobile Touch Controls */}
      <div className="lg:hidden absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onTouchStart={() => { stateRef.current.keys.left = true; }}
            onTouchEnd={() => { stateRef.current.keys.left = false; }}
            className="w-13 h-13 rounded-2xl bg-slate-900/90 border border-amber-500 text-amber-400 font-black text-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            ◀
          </button>
          <button
            type="button"
            onTouchStart={() => { stateRef.current.keys.right = true; }}
            onTouchEnd={() => { stateRef.current.keys.right = false; }}
            className="w-13 h-13 rounded-2xl bg-slate-900/90 border border-amber-500 text-amber-400 font-black text-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            ▶
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onTouchStart={() => { stateRef.current.keys.boost = true; }}
            onTouchEnd={() => { stateRef.current.keys.boost = false; }}
            className="w-16 h-13 rounded-2xl bg-cyan-500 border border-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg active:scale-95"
          >
            TURBO
          </button>
          <button
            type="button"
            onTouchStart={() => { stateRef.current.keys.up = true; }}
            onTouchEnd={() => { stateRef.current.keys.up = false; }}
            className="w-15 h-13 rounded-2xl bg-amber-500 border border-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            ▲
          </button>
        </div>
      </div>

      {/* Desktop Controls Legend */}
      <div className="hidden lg:flex absolute bottom-3 left-4 text-[11px] text-slate-400 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-slate-800 gap-3">
        <span><strong className="text-amber-400">W / ▲</strong> Throttle</span>
        <span><strong className="text-amber-400">A / D</strong> Steer Apex</span>
        <span><strong className="text-cyan-400">SPACE</strong> Slipstream Turbo</span>
        <button onClick={handleRestart} className="text-amber-400 hover:underline ml-2">↻ Restart</button>
      </div>
    </div>
  );
};
