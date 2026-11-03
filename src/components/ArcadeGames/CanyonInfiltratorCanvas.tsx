import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface CanyonInfiltratorCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

export const CanyonInfiltratorCanvas: React.FC<CanyonInfiltratorCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [machSpeed, setMachSpeed] = useState('1.2');
  const [shields, setShields] = useState(100);
  const [missileCount, setMissileCount] = useState(12);
  const [sonicBoomNotice, setSonicBoomNotice] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const stateRef = useRef({
    jet: {
      x: 350,
      y: 420,
      speed: 8.5,
      maxSpeed: 14.5,
      accel: 0.25,
      friction: 0.99,
      bankAngle: 0,
      isAfterburning: false,
    },
    canyonOffset: 0,
    targetsDestroyed: 0,
    missiles: [] as { x: number; y: number; vy: number }[],
    turrets: [] as { x: number; y: number; active: boolean; hp: number }[],
    lasers: [] as { x: number; y: number; vy: number }[],
    mines: [] as { x: number; y: number; radius: number; pulse: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[],
    sonicRings: [] as { x: number; y: number; radius: number; alpha: number }[],
    coins: [] as { x: number; y: number; collected: boolean; radius: number }[],
    score: 0,
    shields: 100,
    missilesLeft: 12,
    coinsEarned: 0,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      afterburner: false,
      fire: false,
    },
    running: true,
  });

  const fireMissile = () => {
    const s = stateRef.current;
    if (s.missilesLeft <= 0) return;
    s.missilesLeft -= 1;
    setMissileCount(s.missilesLeft);
    s.missiles.push({
      x: s.jet.x - 14,
      y: s.jet.y - 20,
      vy: -18,
    });
    s.missiles.push({
      x: s.jet.x + 14,
      y: s.jet.y - 20,
      vy: -18,
    });
    arcadeAudio.playLaser();
  };

  const triggerSonicBoom = () => {
    setSonicBoomNotice('MACH 2.5 SONIC BOOM! 💥');
    arcadeAudio.playSonicBoom();
    stateRef.current.sonicRings.push({
      x: stateRef.current.jet.x,
      y: stateRef.current.jet.y,
      radius: 10,
      alpha: 1.0,
    });
    setTimeout(() => {
      setSonicBoomNotice(null);
    }, 1200);
  };

  const initGame = useCallback((w: number, h: number) => {
    const s = stateRef.current;
    s.jet.x = w / 2;
    s.jet.y = h - 130;
    s.jet.speed = 8.5;
    s.jet.bankAngle = 0;
    s.canyonOffset = 0;
    s.score = 0;
    s.shields = 100;
    s.missilesLeft = 12;
    s.targetsDestroyed = 0;
    s.coinsEarned = 0;
    s.running = true;
    s.missiles = [];
    s.lasers = [];
    s.particles = [];
    s.sonicRings = [];

    // Seed canyon defense turrets and energy mines
    s.turrets = [];
    s.mines = [];
    s.coins = [];
    for (let i = 0; i < 16; i++) {
      const y = -i * 190 - 200;
      const x = Math.random() * (w - 240) + 120;
      s.turrets.push({
        x,
        y,
        active: true,
        hp: 2,
      });

      if (Math.random() > 0.5) {
        s.mines.push({
          x: x + (Math.random() * 80 - 40),
          y: y + 90,
          radius: 18,
          pulse: 0,
        });
      }

      if (Math.random() > 0.3) {
        s.coins.push({
          x: x + (Math.random() * 60 - 30),
          y: y - 50,
          collected: false,
          radius: 12,
        });
      }
    }

    setScore(0);
    setShields(100);
    setMissileCount(12);
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
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') s.keys.afterburner = true;
      if (e.code === 'Space') {
        fireMissile();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') s.keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') s.keys.down = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') s.keys.afterburner = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;
      const j = s.jet;
      const w = canvas.width;
      const h = canvas.height;

      if (s.running) {
        // Flight Banking
        if (s.keys.left) {
          j.bankAngle = Math.max(j.bankAngle - 0.08, -0.45);
          j.x -= (j.speed * 0.7 + 3.5);
        } else if (s.keys.right) {
          j.bankAngle = Math.min(j.bankAngle + 0.08, 0.45);
          j.x += (j.speed * 0.7 + 3.5);
        } else {
          j.bankAngle *= 0.82;
        }

        // Throttle & Afterburner
        if (s.keys.afterburner) {
          j.speed = Math.min(j.speed + j.accel * 2.2, j.maxSpeed);
          if (j.speed > 13.5 && Math.random() < 0.06) {
            triggerSonicBoom();
          }
        } else if (s.keys.up) {
          j.speed = Math.min(j.speed + j.accel, j.maxSpeed * 0.85);
        } else if (s.keys.down) {
          j.speed = Math.max(5.5, j.speed - j.accel * 1.5);
        }

        // Keep within canyon rock walls
        const canyonMargin = 85;
        if (j.x < canyonMargin || j.x > w - canyonMargin) {
          s.shields -= 20 * dt;
          arcadeAudio.playCrash();
          j.x = Math.max(canyonMargin, Math.min(w - canyonMargin, j.x));
          if (s.shields <= 0) {
            s.running = false;
            setIsGameOver(true);
            onGameOver?.(s.score, s.coinsEarned);
          }
        }

        const travel = j.speed * 60 * dt;
        s.canyonOffset = (s.canyonOffset + travel) % 120;
        s.score += Math.round(travel * 0.4);

        // Move Missiles
        for (let i = s.missiles.length - 1; i >= 0; i--) {
          const m = s.missiles[i];
          m.y += m.vy;

          // Check hit against turrets
          for (const tur of s.turrets) {
            if (tur.active && Math.abs(m.x - tur.x) < 30 && Math.abs(m.y - tur.y) < 30) {
              tur.active = false;
              s.score += 800;
              s.targetsDestroyed += 1;
              arcadeAudio.playCrash();
              for (let k = 0; k < 15; k++) {
                s.particles.push({
                  x: tur.x,
                  y: tur.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  life: 0.5,
                  color: '#ef4444',
                  size: Math.random() * 6 + 2,
                });
              }
              break;
            }
          }

          if (m.y < -50) s.missiles.splice(i, 1);
        }

        // Move Turrets
        for (const tur of s.turrets) {
          tur.y += travel;
          if (tur.active && Math.random() < 0.015 && tur.y > 0 && tur.y < h - 100) {
            // Turret fires laser towards player
            s.lasers.push({ x: tur.x, y: tur.y, vy: 10 });
          }
          if (tur.y > h + 100) {
            tur.y = -Math.random() * 200 - 150;
            tur.x = Math.random() * (w - 240) + 120;
            tur.active = true;
          }
        }

        // Move Lasers
        for (let i = s.lasers.length - 1; i >= 0; i--) {
          const l = s.lasers[i];
          l.y += l.vy;

          // Hit player
          if (Math.abs(l.x - j.x) < 25 && Math.abs(l.y - j.y) < 28) {
            s.shields -= 18;
            arcadeAudio.playCrash();
            s.lasers.splice(i, 1);
            if (s.shields <= 0) {
              s.running = false;
              setIsGameOver(true);
              onGameOver?.(s.score, s.coinsEarned);
            }
            continue;
          }

          if (l.y > h + 50) s.lasers.splice(i, 1);
        }

        // Move Mines
        for (const mine of s.mines) {
          mine.y += travel;
          mine.pulse += dt * 5;
          if (Math.abs(mine.x - j.x) < 32 && Math.abs(mine.y - j.y) < 32) {
            s.shields -= 25;
            arcadeAudio.playCrash();
            mine.y = -200; // recycle
            if (s.shields <= 0) {
              s.running = false;
              setIsGameOver(true);
              onGameOver?.(s.score, s.coinsEarned);
            }
          }
          if (mine.y > h + 100) {
            mine.y = -Math.random() * 250 - 150;
            mine.x = Math.random() * (w - 240) + 120;
          }
        }

        // Coins
        for (const coin of s.coins) {
          coin.y += travel;
          if (!coin.collected && Math.abs(coin.x - j.x) < 32 && Math.abs(coin.y - j.y) < 34) {
            coin.collected = true;
            s.coinsEarned += 1;
            s.score += 300;
            s.missilesLeft = Math.min(20, s.missilesLeft + 2);
            arcadeAudio.playCoin();
            onEarnCoins(1);
          }
          if (coin.y > h + 100) {
            coin.y = -Math.random() * 250 - 150;
            coin.x = Math.random() * (w - 240) + 120;
            coin.collected = false;
          }
        }

        // Update Sonic Rings
        for (let i = s.sonicRings.length - 1; i >= 0; i--) {
          const ring = s.sonicRings[i];
          ring.radius += dt * 180;
          ring.alpha -= dt * 1.8;
          if (ring.alpha <= 0) s.sonicRings.splice(i, 1);
        }

        // Update particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= dt;
          if (p.life <= 0) s.particles.splice(i, 1);
        }

        setScore(s.score);
        setMachSpeed((j.speed / 6.0).toFixed(1));
        setShields(Math.max(0, Math.round(s.shields)));
        setMissileCount(s.missilesLeft);
      }

      // RENDER
      // 1. Canyon at Twilight (Deep crimson, dark violet sky)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#1c0a1f');
      skyGrad.addColorStop(0.5, '#4a1525');
      skyGrad.addColorStop(1, '#1f0910');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Glowing Canyon Rock Cliffs (Left and Right)
      ctx.fillStyle = '#6b1d28';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(75, 0);
      for (let y = 0; y <= h; y += 40) {
        const cx = 70 + Math.sin((y + s.canyonOffset) * 0.04) * 16;
        ctx.lineTo(cx, y);
      }
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(w - 75, 0);
      for (let y = 0; y <= h; y += 40) {
        const cx = w - 70 - Math.cos((y + s.canyonOffset) * 0.04) * 16;
        ctx.lineTo(cx, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Canyon edge warning neon laser wire
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(75, 0);
      ctx.lineTo(75, h);
      ctx.moveTo(w - 75, 0);
      ctx.lineTo(w - 75, h);
      ctx.stroke();

      // 2. Render Sonic Rings
      for (const r of s.sonicRings) {
        ctx.save();
        ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Render Turrets
      for (const tur of s.turrets) {
        if (!tur.active || tur.y < -40 || tur.y > h + 40) continue;
        ctx.save();
        ctx.translate(tur.x, tur.y);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(-3, 8, 6, 12); // laser barrel
        ctx.restore();
      }

      // 4. Render Enemy Lasers
      ctx.fillStyle = '#ff0055';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 10;
      for (const l of s.lasers) {
        ctx.fillRect(l.x - 2, l.y, 4, 16);
      }
      ctx.shadowBlur = 0;

      // 5. Render Mines
      for (const mine of s.mines) {
        if (mine.y < -30 || mine.y > h + 30) continue;
        ctx.save();
        ctx.translate(mine.x, mine.y);
        ctx.fillStyle = '#8b5cf6';
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, mine.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Render Missiles
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      for (const m of s.missiles) {
        ctx.fillRect(m.x - 2, m.y, 4, 14);
      }
      ctx.shadowBlur = 0;

      // 7. Render Particles
      for (const p of s.particles) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 8. Render Coins
      for (const coin of s.coins) {
        if (coin.collected || coin.y < -30 || coin.y > h + 30) continue;
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 9. Render Supersonic Jet Fighter
      ctx.save();
      ctx.translate(j.x, j.y);
      ctx.rotate(j.bankAngle);

      // Jet Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 20, 24, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stealth Fighter Wing Body (F-22 / SU-57 style)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, -38); // Nose cone
      ctx.lineTo(8, -10);
      ctx.lineTo(34, 18); // Right wing tip
      ctx.lineTo(16, 26);
      ctx.lineTo(12, 34);
      ctx.lineTo(0, 28);
      ctx.lineTo(-12, 34);
      ctx.lineTo(-16, 26);
      ctx.lineTo(-34, 18); // Left wing tip
      ctx.lineTo(-8, -10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Canopy Glass (Gold iridium tint)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(0, -8, 5, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Twin Afterburner Exhaust Jets
      ctx.fillStyle = s.keys.afterburner ? '#38bdf8' : '#f97316';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(-8, 32);
      ctx.lineTo(-5, 48 + Math.random() * 8);
      ctx.lineTo(-2, 32);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(2, 32);
      ctx.lineTo(5, 48 + Math.random() * 8);
      ctx.lineTo(8, 32);
      ctx.closePath();
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

  const handleTouch = (action: 'left' | 'right' | 'afterburner' | 'fire', active: boolean) => {
    const s = stateRef.current;
    if (action === 'left') s.keys.left = active;
    if (action === 'right') s.keys.right = active;
    if (action === 'afterburner') s.keys.afterburner = active;
    if (action === 'fire' && active) fireMissile();
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

          {/* Mach Speed */}
          <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-300 shadow-xl font-game font-black text-xs sm:text-sm">
            MACH {machSpeed} ⚡
          </div>
        </div>

        {/* Right: Shield & Missiles */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-rose-500/40 text-white shadow-xl flex items-center gap-1.5">
            <span className="text-rose-400 font-black">🚀</span>
            <span className="font-mono font-black text-sm text-rose-300">{missileCount}</span>
          </div>

          <div className="w-24 sm:w-32 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-emerald-500/40">
            <div className="flex justify-between text-[9px] font-bold text-emerald-300 mb-0.5">
              <span>SHIELD</span>
              <span>{shields}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-75" style={{ width: `${shields}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Sonic Boom Banner */}
      {sonicBoomNotice && (
        <div className="absolute top-20 z-20 px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-game font-black text-sm sm:text-lg shadow-2xl animate-bounce">
          {sonicBoomNotice}
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
            onTouchStart={() => handleTouch('fire', true)}
            className="px-4 h-12 rounded-xl bg-rose-600 text-white font-black text-xs active:bg-rose-500 flex items-center justify-center"
          >
            FIRE 🚀
          </button>
          <button
            onTouchStart={() => handleTouch('afterburner', true)}
            onTouchEnd={() => handleTouch('afterburner', false)}
            className="px-4 h-12 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs active:bg-cyan-400 flex items-center justify-center"
          >
            AFTERBURNER 🔥
          </button>
        </div>
      </div>
    </div>
  );
};
