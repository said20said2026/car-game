import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface MidnightTougeCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

export const MidnightTougeCanvas: React.FC<MidnightTougeCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [leadMeters, setLeadMeters] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [driftScore, setDriftScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [gutterNotice, setGutterNotice] = useState<string | null>(null);

  const stateRef = useRef({
    car: {
      x: 350,
      y: 430,
      width: 40,
      height: 72,
      speed: 0,
      maxSpeed: 10.8,
      accel: 0.25,
      friction: 0.982,
      angle: 0,
      slipAngle: 0,
      isDrifting: false,
    },
    rival: {
      lead: 5, // meters relative to player (+ means player ahead, - means rival ahead)
      baseSpeed: 9.2,
      lateralOffset: 0,
    },
    roadCurves: [] as { y: number; curvature: number }[],
    roadOffset: 0,
    curveAngle: 0,
    petals: [] as { x: number; y: number; vx: number; vy: number; rot: number; rotSpeed: number; size: number }[],
    taillightTrails: [] as { x1: number; y1: number; x2: number; y2: number; alpha: number }[],
    skids: [] as { x: number; y: number; alpha: number }[],
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      handbrake: false,
    },
    distanceDownhill: 0,
    score: 0,
    coinsEarned: 0,
    running: true,
  });

  const triggerGutterRun = () => {
    setGutterNotice('GUTTER HOOK! +25% APEX GRIP ⚡');
    arcadeAudio.playTireSkid();
    setTimeout(() => {
      setGutterNotice(null);
    }, 1000);
  };

  const initGame = useCallback((w: number, h: number) => {
    const s = stateRef.current;
    s.car.x = w / 2;
    s.car.y = h - 130;
    s.car.speed = 0;
    s.car.angle = 0;
    s.car.slipAngle = 0;
    s.car.isDrifting = false;
    s.rival.lead = 0;
    s.distanceDownhill = 0;
    s.roadOffset = 0;
    s.curveAngle = 0;
    s.score = 0;
    s.coinsEarned = 0;
    s.running = true;
    s.taillightTrails = [];
    s.skids = [];

    // Falling cherry blossom petals
    s.petals = [];
    for (let i = 0; i < 35; i++) {
      s.petals.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.random() * 2 + 1,
        vy: Math.random() * 1.5 + 1.2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        size: Math.random() * 4 + 3,
      });
    }

    setScore(0);
    setLeadMeters(0);
    setDriftScore(0);
    setIsGameOver(false);
    setIsVictory(false);
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
      if (e.code === 'Space' || e.code === 'ShiftLeft') s.keys.handbrake = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') s.keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') s.keys.down = false;
      if (e.code === 'Space' || e.code === 'ShiftLeft') s.keys.handbrake = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;
      const c = s.car;
      const w = canvas.width;
      const h = canvas.height;

      if (s.running) {
        // Road curve generator (sinusoidal downhill touge hairpins)
        s.curveAngle = Math.sin(s.distanceDownhill * 0.003) * 0.75 + Math.sin(s.distanceDownhill * 0.008) * 0.45;

        // Throttle & Braking
        if (s.keys.up) {
          c.speed = Math.min(c.speed + c.accel, c.maxSpeed);
          if (Math.random() < 0.15) arcadeAudio.playEngineTone(160 + c.speed * 18, 0.08);
        } else if (s.keys.down) {
          c.speed = Math.max(0, c.speed - c.accel * 1.8);
        } else {
          c.speed *= c.friction;
        }

        // Handbrake Hairpin Drift Initiation
        const isHandbraking = s.keys.handbrake && c.speed > 3;
        c.isDrifting = isHandbraking || (Math.abs(s.curveAngle) > 0.6 && c.speed > 6);

        if (c.isDrifting) {
          c.slipAngle = (s.keys.left ? -0.45 : s.keys.right ? 0.45 : -Math.sign(s.curveAngle) * 0.35);
          s.score += Math.round(c.speed * 15 * dt);
          if (Math.random() < 0.25) arcadeAudio.playTireSkid();

          // Add skid marks
          s.skids.push({ x: c.x, y: c.y + 25, alpha: 0.6 });
        } else {
          c.slipAngle *= 0.8;
        }

        // Lateral steering
        let steerRate = 0;
        if (s.keys.left) steerRate -= 1;
        if (s.keys.right) steerRate += 1;

        c.x += (steerRate * (c.speed * 0.8 + 2.5) - s.curveAngle * c.speed * 0.95);
        c.angle = steerRate * 0.15 + c.slipAngle;

        // Road bounds & Gutter Hook detection
        const roadCenter = w / 2;
        const roadHalfWidth = Math.min(w * 0.38, 220);
        const roadLeft = roadCenter - roadHalfWidth;
        const roadRight = roadCenter + roadHalfWidth;

        // Gutter run: clipping the extreme inside curb without hitting guardrail
        if (Math.abs(c.x - roadLeft) < 18 || Math.abs(c.x - roadRight) < 18) {
          if (c.speed > 5 && Math.random() < 0.08) {
            triggerGutterRun();
            s.score += 300;
            c.speed = Math.min(c.maxSpeed * 1.15, c.speed + 0.5);
          }
        }

        // Guardrail collision
        if (c.x < roadLeft - 10 || c.x > roadRight + 10) {
          c.speed = Math.max(1, c.speed * 0.5);
          arcadeAudio.playCrash();
          c.x = Math.max(roadLeft, Math.min(roadRight, c.x));
        }

        // Downhill progression
        const travel = c.speed * 50 * dt;
        s.distanceDownhill += travel;
        s.roadOffset = (s.roadOffset + travel) % 40;

        // Rival cat-and-mouse gauge calculations
        // Rival drives at variable pace based on downhill hairpins
        const rivalSpeed = s.rival.baseSpeed + Math.sin(s.distanceDownhill * 0.005) * 1.2;
        const deltaSpeed = c.speed - rivalSpeed;
        s.rival.lead += deltaSpeed * dt * 3.5;

        // Sudden death victory or defeat conditions
        if (s.rival.lead >= 50) {
          // Pulled 50 meters ahead! Victory!
          s.running = false;
          setIsGameOver(true);
          setIsVictory(true);
          arcadeAudio.playVictory();
          s.coinsEarned += 10;
          onEarnCoins(10);
          onGameOver?.(s.score, s.coinsEarned);
        } else if (s.rival.lead <= -50) {
          // Rival pulled 50 meters ahead! Defeat!
          s.running = false;
          setIsGameOver(true);
          setIsVictory(false);
          arcadeAudio.playCrash();
          onGameOver?.(s.score, s.coinsEarned);
        }

        // Update taillight glowing ribbon trails
        s.taillightTrails.push({
          x1: c.x - 12,
          y1: c.y + 28,
          x2: c.x + 12,
          y2: c.y + 28,
          alpha: 1.0,
        });

        for (let i = s.taillightTrails.length - 1; i >= 0; i--) {
          s.taillightTrails[i].y1 += travel * 0.35;
          s.taillightTrails[i].y2 += travel * 0.35;
          s.taillightTrails[i].alpha -= dt * 2.5;
          if (s.taillightTrails[i].alpha <= 0) s.taillightTrails.splice(i, 1);
        }

        // Update skids
        for (let i = s.skids.length - 1; i >= 0; i--) {
          s.skids[i].y += travel * 0.4;
          s.skids[i].alpha -= dt * 0.6;
          if (s.skids[i].alpha <= 0) s.skids.splice(i, 1);
        }

        // Update petals
        for (const p of s.petals) {
          p.x += p.vx + s.curveAngle * 3;
          p.y += p.vy;
          p.rot += p.rotSpeed;
          if (p.y > h) {
            p.y = -10;
            p.x = Math.random() * w;
          }
        }

        setScore(s.score);
        setSpeedKmh(Math.round(c.speed * 20));
        setLeadMeters(Math.round(s.rival.lead));
        setDriftScore(Math.round(c.slipAngle * 100));
      }

      // RENDER CANVAS
      // 1. Dark Misty Mountain Pass
      const nightGrad = ctx.createLinearGradient(0, 0, 0, h);
      nightGrad.addColorStop(0, '#040914');
      nightGrad.addColorStop(0.4, '#091322');
      nightGrad.addColorStop(1, '#060a12');
      ctx.fillStyle = nightGrad;
      ctx.fillRect(0, 0, w, h);

      // Distant foggy pine trees
      ctx.fillStyle = 'rgba(10, 25, 30, 0.6)';
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, h * 0.3);
        ctx.lineTo(x + 15, h * 0.15);
        ctx.lineTo(x + 30, h * 0.3);
        ctx.closePath();
        ctx.fill();
      }

      // 2. Touge Road Surface
      const roadCenter = w / 2;
      const roadHalfWidth = Math.min(w * 0.38, 220);
      const roadLeft = roadCenter - roadHalfWidth;
      const roadRight = roadCenter + roadHalfWidth;

      // Asphalt
      ctx.fillStyle = '#1c2128';
      ctx.fillRect(roadLeft, 0, roadHalfWidth * 2, h);

      // Road Skids
      for (const skid of s.skids) {
        ctx.fillStyle = `rgba(10, 10, 10, ${skid.alpha})`;
        ctx.fillRect(skid.x - 14, skid.y, 28, 4);
      }

      // Road center dashed line
      ctx.strokeStyle = '#e6b800';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -s.roadOffset;
      ctx.beginPath();
      ctx.moveTo(roadCenter, 0);
      ctx.lineTo(roadCenter, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Guardrails (Left and Right)
      ctx.strokeStyle = '#8fa0b5';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(roadLeft, 0);
      ctx.lineTo(roadLeft, h);
      ctx.moveTo(roadRight, 0);
      ctx.lineTo(roadRight, h);
      ctx.stroke();

      // Guardrail posts with red reflectors
      for (let y = (s.roadOffset % 50); y < h; y += 50) {
        ctx.fillStyle = '#ff2200';
        ctx.fillRect(roadLeft - 4, y, 4, 8);
        ctx.fillRect(roadRight, y, 4, 8);
      }

      // 3. Render Taillight Light Trails
      for (const t of s.taillightTrails) {
        ctx.strokeStyle = `rgba(255, 30, 0, ${t.alpha * 0.65})`;
        ctx.shadowColor = '#ff2200';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(t.x1, t.y1);
        ctx.lineTo(t.x2, t.y2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // 4. Render Rival Ghost Car
      // Position depends on lead (+ ahead means rival behind player, - means rival ahead of player)
      const rivalY = c.y - s.rival.lead * 5;
      if (rivalY > -60 && rivalY < h + 60) {
        ctx.save();
        ctx.translate(roadCenter + Math.sin(s.distanceDownhill * 0.01) * 40, rivalY);
        // Rival chassis (Panda Trueno style: White & Black)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(-16, -26, 32, 52, 4);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-16, 12, 32, 10); // black trim
        // Rival red taillights
        ctx.fillStyle = '#ff1100';
        ctx.shadowColor = '#ff1100';
        ctx.shadowBlur = 8;
        ctx.fillRect(-14, 23, 8, 4);
        ctx.fillRect(6, 23, 8, 4);
        ctx.restore();
      }

      // 5. Render Player Sports Car (RX-7 / Supra style)
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);

      // Car shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 6, 22, 32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Midnight Black / Gunmetal Metallic body
      ctx.fillStyle = '#222933';
      ctx.beginPath();
      ctx.roundRect(-17, -28, 34, 56, 5);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tinted Cockpit
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(-11, -12, 22, 22);

      // GT Rear Wing Spoiler
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-16, 20, 32, 6);

      // High-intensity Red LED Taillights
      ctx.fillStyle = '#ff0033';
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 16;
      ctx.fillRect(-14, 25, 9, 3);
      ctx.fillRect(5, 25, 9, 3);

      // Twin Exhaust Sparks if drifting
      if (c.isDrifting) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-8, 32 + Math.random() * 4, 3, 0, Math.PI * 2);
        ctx.arc(8, 32 + Math.random() * 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 6. Cherry Blossom Petals
      ctx.fillStyle = 'rgba(255, 182, 193, 0.85)';
      for (const p of s.petals) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

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

  const handleTouchDir = (dir: 'left' | 'right' | 'up' | 'handbrake', active: boolean) => {
    const s = stateRef.current;
    if (dir === 'left') s.keys.left = active;
    if (dir === 'right') s.keys.right = active;
    if (dir === 'up') s.keys.up = active;
    if (dir === 'handbrake') s.keys.handbrake = active;
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none bg-slate-950">
      {/* Top HUD: Lead Gauge */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          {/* Score */}
          <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-white shadow-xl">
            <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Score</span>
            <span className="font-mono font-black text-sm sm:text-base text-amber-300">{score.toLocaleString()}</span>
          </div>

          {/* Speed */}
          <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-white shadow-xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Speed</span>
            <span className="font-mono font-black text-sm text-cyan-400">{speedKmh} km/h</span>
          </div>
        </div>

        {/* Center: Cat-and-Mouse Duel Lead Bar */}
        <div className={`px-4 py-1.5 rounded-xl border font-game font-black text-xs sm:text-sm tracking-wider backdrop-blur-md shadow-xl flex items-center gap-1.5 ${
          leadMeters > 0
            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
            : leadMeters < 0
            ? 'bg-rose-500/20 border-rose-400 text-rose-300'
            : 'bg-slate-900 border-slate-700 text-slate-300'
        }`}>
          <span>⚔️</span>
          <span>
            {leadMeters > 0 ? `+${leadMeters}m LEADING` : leadMeters < 0 ? `${leadMeters}m BEHIND` : 'TIED 0m'}
          </span>
        </div>

        {/* Right: Drift Angle Rating */}
        <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-500/30 text-white shadow-xl flex items-center gap-1.5">
          <span className="text-cyan-400 font-bold">🌸 DRIFT</span>
          <span className="font-mono font-black text-sm text-cyan-300">{driftScore}°</span>
        </div>
      </div>

      {/* Gutter Run Apex Notification */}
      {gutterNotice && (
        <div className="absolute top-20 z-20 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-game font-black text-xs sm:text-sm shadow-2xl animate-bounce">
          {gutterNotice}
        </div>
      )}

      {/* Main Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="w-full h-auto block rounded-xl cursor-crosshair shadow-inner"
        style={{ touchAction: 'none' }}
      />

      {/* Duel Complete Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-3">
            {isVictory ? '👑' : '🏁'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-game text-[#ffcc00] tracking-wide mb-1">
            {isVictory ? 'TOUGE KING: SUDDEN DEATH VICTORY!' : 'DUEL FINISHED'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-4">
            {isVictory ? 'You gapped the rival by over 50 meters downhill!' : 'The rival snatched the lead on the hairpins! Try again!'}
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-5">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Score</span>
              <span className="font-mono font-black text-lg text-amber-400">{score.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Lead</span>
              <span className="font-mono font-black text-lg text-emerald-400">{leadMeters}m</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (canvasRef.current) initGame(canvasRef.current.width, canvasRef.current.height);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-400/20 cursor-pointer active:scale-95 transition-all"
          >
            🏁 REMATCH DUEL (SPACE)
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
            onTouchStart={() => handleTouchDir('handbrake', true)}
            onTouchEnd={() => handleTouchDir('handbrake', false)}
            className="px-4 h-12 rounded-xl bg-rose-600 text-white font-black text-xs active:bg-rose-500 flex items-center justify-center"
          >
            DRIFT 💥
          </button>
          <button
            onTouchStart={() => handleTouchDir('up', true)}
            onTouchEnd={() => handleTouchDir('up', false)}
            className="px-5 h-12 rounded-xl bg-amber-400 text-slate-950 font-black text-xs active:bg-amber-300 flex items-center justify-center"
          >
            GAS ▲
          </button>
        </div>
      </div>
    </div>
  );
};
