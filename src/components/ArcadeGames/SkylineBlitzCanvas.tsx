import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface SkylineBlitzCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

export const SkylineBlitzCanvas: React.FC<SkylineBlitzCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [trickCombo, setTrickCombo] = useState(1);
  const [energy, setEnergy] = useState(100);
  const [trickBanner, setTrickBanner] = useState<string | null>(null);
  const [isGrinding, setIsGrinding] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const stateRef = useRef({
    board: {
      x: 350,
      y: 420,
      speed: 0,
      maxSpeed: 11.2,
      accel: 0.24,
      friction: 0.988,
      steer: 0,
      steerAngle: 0,
      z: 0, // jump elevation
      vz: 0,
      isAirborne: false,
      isGrinding: false,
      spinAngle: 0,
    },
    cityOffset: 0,
    rails: [] as { x: number; y: number; length: number }[],
    ramps: [] as { x: number; y: number; width: number }[],
    prisms: [] as { x: number; y: number; collected: boolean; radius: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[],
    score: 0,
    multiplier: 1,
    energy: 100,
    coinsEarned: 0,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      glide: false,
    },
    running: true,
  });

  const showTrick = (name: string, bonus: number) => {
    setTrickBanner(`${name}! +${bonus} PTS ✨`);
    arcadeAudio.playWhoosh();
    setTimeout(() => {
      setTrickBanner(null);
    }, 1100);
  };

  const initGame = useCallback((w: number, h: number) => {
    const s = stateRef.current;
    s.board.x = w / 2;
    s.board.y = h - 130;
    s.board.speed = 0;
    s.board.z = 0;
    s.board.vz = 0;
    s.board.isAirborne = false;
    s.board.isGrinding = false;
    s.board.spinAngle = 0;
    s.cityOffset = 0;
    s.score = 0;
    s.multiplier = 1;
    s.energy = 100;
    s.coinsEarned = 0;
    s.running = true;
    s.particles = [];

    // Seed neon grind rails and rooftop jump ramps
    s.rails = [];
    s.ramps = [];
    s.prisms = [];
    for (let i = 0; i < 18; i++) {
      const y = -i * 180 - 200;
      const x = Math.random() * (w - 220) + 110;
      if (i % 3 === 0) {
        s.rails.push({ x, y, length: 140 });
      } else {
        s.ramps.push({ x, y, width: 68 });
      }

      if (Math.random() > 0.35) {
        s.prisms.push({
          x: x + (Math.random() * 60 - 30),
          y: y - 50,
          collected: false,
          radius: 12,
        });
      }
    }

    setScore(0);
    setTrickCombo(1);
    setEnergy(100);
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
      if (e.code === 'Space') {
        if (!s.board.isAirborne) {
          s.board.isAirborne = true;
          s.board.vz = 22;
          arcadeAudio.playWhoosh();
        }
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') s.keys.glide = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') s.keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') s.keys.down = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') s.keys.glide = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;
      const b = s.board;
      const w = canvas.width;
      const h = canvas.height;

      if (s.running) {
        // Lateral Hover Steering
        if (s.keys.left) {
          b.steer = Math.max(b.steer - 0.08, -1);
          b.steerAngle = Math.max(b.steerAngle - 0.06, -0.36);
          if (b.isAirborne) b.spinAngle -= dt * 6;
        } else if (s.keys.right) {
          b.steer = Math.min(b.steer + 0.08, 1);
          b.steerAngle = Math.min(b.steerAngle + 0.05, 0.36);
          if (b.isAirborne) b.spinAngle += dt * 6;
        } else {
          b.steer *= 0.85;
          b.steerAngle *= 0.82;
        }

        // Throttle & Hyper-Glide
        const isGliding = s.keys.glide && s.energy > 0;
        if (isGliding) {
          s.energy = Math.max(0, s.energy - dt * 25);
          b.speed = Math.min(b.speed + b.accel * 2.0, b.maxSpeed * 1.45);
          if (Math.random() < 0.25) arcadeAudio.playNitro();
        } else if (s.keys.up) {
          b.speed = Math.min(b.speed + b.accel, b.maxSpeed);
          if (Math.random() < 0.12) arcadeAudio.playEngineTone(200 + b.speed * 16, 0.08);
        } else if (s.keys.down) {
          b.speed = Math.max(0, b.speed - b.accel * 1.5);
        } else {
          b.speed *= b.friction;
        }

        b.x += b.steer * (b.speed * 0.75 + 2.5);
        b.x = Math.max(70, Math.min(w - 70, b.x));

        // Jump physics
        if (b.isAirborne) {
          b.z += b.vz * dt;
          b.vz -= 34 * dt; // gravity
          if (b.z <= 0) {
            b.z = 0;
            b.vz = 0;
            b.isAirborne = false;
            if (Math.abs(b.spinAngle) > 4) {
              s.score += 1200;
              s.multiplier = Math.min(5, s.multiplier + 1);
              showTrick('540 NOSE-GRAB FLIP', 1200);
            }
            b.spinAngle = 0;
            arcadeAudio.playTireSkid();
          }
        }

        const travel = b.speed * 60 * dt;
        s.cityOffset = (s.cityOffset + travel) % 80;
        s.score += Math.round(travel * 0.3 * s.multiplier);

        // Check Neon Grind Rails
        let onRail = false;
        for (const rail of s.rails) {
          rail.y += travel;
          if (Math.abs(b.x - rail.x) < 22 && b.y >= rail.y && b.y <= rail.y + rail.length) {
            onRail = true;
            b.isGrinding = true;
            s.score += 25;
            s.multiplier = Math.min(5, s.multiplier + dt * 0.5);
            arcadeAudio.playRailGrind();

            // Sizzling rail grind sparks
            for (let i = 0; i < 2; i++) {
              s.particles.push({
                x: rail.x,
                y: b.y + 20,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 0.35,
                color: '#c084fc',
                size: Math.random() * 5 + 2,
              });
            }
          }
          if (rail.y > h + 100) {
            rail.y = -Math.random() * 200 - 150;
            rail.x = Math.random() * (w - 220) + 110;
          }
        }
        setIsGrinding(onRail);
        if (!onRail) b.isGrinding = false;

        // Check Rooftop Jump Ramps
        for (const ramp of s.ramps) {
          ramp.y += travel;
          if (b.z < 15 && Math.abs(b.x - ramp.x) < 36 && Math.abs(b.y - ramp.y) < 30) {
            b.isAirborne = true;
            b.vz = 26 + b.speed * 1.1;
            b.z = 5;
            s.score += 700;
            showTrick('ROOFTOP MEGA AIR', 700);
          }
          if (ramp.y > h + 100) {
            ramp.y = -Math.random() * 220 - 150;
            ramp.x = Math.random() * (w - 220) + 110;
          }
        }

        // Energy Prisms
        for (const prism of s.prisms) {
          prism.y += travel;
          if (!prism.collected && Math.abs(b.x - prism.x) < 32 && Math.abs(b.y - prism.y) < 35) {
            prism.collected = true;
            s.coinsEarned += 1;
            s.score += 250;
            s.energy = Math.min(100, s.energy + 15);
            arcadeAudio.playCoin();
            onEarnCoins(1);
          }
          if (prism.y > h + 100) {
            prism.y = -Math.random() * 240 - 150;
            prism.x = Math.random() * (w - 220) + 110;
            prism.collected = false;
          }
        }

        // Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= dt;
          if (p.life <= 0) s.particles.splice(i, 1);
        }

        setScore(s.score);
        setSpeedKmh(Math.round(b.speed * 19));
        setTrickCombo(Math.round(s.multiplier));
        setEnergy(Math.round(s.energy));
      }

      // RENDER
      // 1. Cyber Sky City Backdrop (Glowing Skyscrapers & Holograms)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#070414');
      bgGrad.addColorStop(0.5, '#160b2b');
      bgGrad.addColorStop(1, '#0c0717');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Skyscraper outlines
      ctx.fillStyle = '#1e1136';
      for (let x = 30; x < w; x += 90) {
        ctx.fillRect(x, 0, 65, h);
        // Windows
        ctx.fillStyle = 'rgba(255, 230, 0, 0.2)';
        for (let wy = 40; wy < h; wy += 45) {
          ctx.fillRect(x + 10, wy, 12, 18);
          ctx.fillRect(x + 35, wy, 12, 18);
        }
        ctx.fillStyle = '#1e1136';
      }

      // Rooftop sky highway platform
      ctx.fillStyle = '#120d24';
      ctx.fillRect(60, 0, w - 120, h);

      // Neon road edges
      ctx.strokeStyle = '#c084fc';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(60, 0);
      ctx.lineTo(60, h);
      ctx.moveTo(w - 60, 0);
      ctx.lineTo(w - 60, h);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 2. Render Neon Grind Rails
      for (const rail of s.rails) {
        if (rail.y < -rail.length || rail.y > h + 50) continue;
        ctx.save();
        ctx.strokeStyle = '#a855f7';
        ctx.shadowColor = '#d8b4fe';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(rail.x, rail.y);
        ctx.lineTo(rail.x, rail.y + rail.length);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.fillRect(rail.x - 2, rail.y, 4, rail.length);
        ctx.restore();
      }

      // 3. Render Rooftop Ramps
      for (const ramp of s.ramps) {
        if (ramp.y < -40 || ramp.y > h + 40) continue;
        ctx.save();
        ctx.translate(ramp.x, ramp.y);
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.roundRect(-ramp.width / 2, -15, ramp.width, 30, 6);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ AIR LAUNCH ⚡', 0, 4);
        ctx.restore();
      }

      // 4. Render Energy Prisms
      for (const prism of s.prisms) {
        if (prism.collected || prism.y < -30 || prism.y > h + 30) continue;
        ctx.save();
        ctx.translate(prism.x, prism.y);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(0, -prism.radius);
        ctx.lineTo(prism.radius, 0);
        ctx.lineTo(0, prism.radius);
        ctx.lineTo(-prism.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 5. Render Rail Grind Sparks
      for (const p of s.particles) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Render Anti-Gravity Hoverboard & Rider
      ctx.save();
      const shadowY = b.y + 35;
      const shadowScale = Math.max(0.4, 1 - b.z / 130);
      ctx.fillStyle = 'rgba(10, 5, 20, 0.5)';
      ctx.beginPath();
      ctx.ellipse(b.x, shadowY, 20 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Elevation
      ctx.translate(b.x, b.y - b.z);
      ctx.rotate(b.steerAngle + b.spinAngle);

      // Maglev Hover Glow Deck (Electric Violet & Cyan)
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.roundRect(-12, -28, 24, 56, 8);
      ctx.fill();

      // Hoverboard Grip Tape & Neon Core
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-8, -24, 16, 48, 6);
      ctx.fill();

      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-2, -20, 4, 40);

      // Rider Boots & Silhouette
      ctx.fillStyle = '#fff';
      ctx.fillRect(-6, -10, 5, 8);
      ctx.fillRect(2, 6, 5, 8);

      // Maglev jet glow at bottom
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(0, 26, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

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

  const handleTouch = (action: 'left' | 'right' | 'jump' | 'glide', active: boolean) => {
    const s = stateRef.current;
    if (action === 'left') s.keys.left = active;
    if (action === 'right') s.keys.right = active;
    if (action === 'glide') s.keys.glide = active;
    if (action === 'jump' && active && !s.board.isAirborne) {
      s.board.isAirborne = true;
      s.board.vz = 22;
      arcadeAudio.playWhoosh();
    }
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

          {/* Trick Multiplier */}
          <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/40 text-purple-300 shadow-xl font-game font-black text-xs sm:text-sm">
            COMBO x{trickCombo} ✨
          </div>
        </div>

        {/* Right: Energy */}
        <div className="w-24 sm:w-32 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/40">
          <div className="flex justify-between text-[9px] font-bold text-cyan-300 mb-0.5">
            <span>MAGLEV GLIDE</span>
            <span>{energy}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-75" style={{ width: `${energy}%` }} />
          </div>
        </div>
      </div>

      {/* Trick Banner */}
      {trickBanner && (
        <div className="absolute top-20 z-20 px-5 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-game font-black text-sm sm:text-lg shadow-2xl animate-bounce">
          {trickBanner}
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-auto block rounded-xl cursor-crosshair shadow-inner"
        style={{ touchAction: 'none' }}
      />

      {/* Mobile Controllers */}
      <div className="w-full flex items-center justify-between p-3 bg-slate-900/90 border-t border-slate-800 gap-3 md:hidden">
        <div className="flex gap-2">
          <button
            onTouchStart={() => handleTouch('left', true)}
            onTouchEnd={() => handleTouch('left', false)}
            className="w-14 h-12 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg active:bg-amber-400 active:text-slate-950 flex items-center justify-center"
          >
            ◀
          </button>
          <button
            onTouchStart={() => handleTouch('right', true)}
            onTouchEnd={() => handleTouch('right', false)}
            className="w-14 h-12 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg active:bg-amber-400 active:text-slate-950 flex items-center justify-center"
          >
            ▶
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onTouchStart={() => handleTouch('jump', true)}
            className="px-4 h-12 rounded-xl bg-purple-600 text-white font-black text-xs active:bg-purple-500 flex items-center justify-center"
          >
            OLLIE JUMP ⬆
          </button>
          <button
            onTouchStart={() => handleTouch('glide', true)}
            onTouchEnd={() => handleTouch('glide', false)}
            className="px-4 h-12 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs active:bg-cyan-300 flex items-center justify-center"
          >
            GLIDE ⚡
          </button>
        </div>
      </div>
    </div>
  );
};
