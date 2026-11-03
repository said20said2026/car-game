import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface MonsterTruckCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

export const MonsterTruckCanvas: React.FC<MonsterTruckCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [carsCrushed, setCarsCrushed] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [stuntText, setStuntText] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const stateRef = useRef({
    truck: {
      x: 350,
      y: 410,
      width: 58,
      height: 84,
      speed: 0,
      maxSpeed: 11.0,
      accel: 0.22,
      friction: 0.982,
      steer: 0,
      steerAngle: 0,
      z: 0, // jump elevation
      vz: 0,
      tiltAngle: 0,
      isAirborne: false,
      rotationAccum: 0,
    },
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      nitro: false,
    },
    arenaOffset: 0,
    scrapCars: [] as { x: number; y: number; crushed: boolean; color: string; width: number; height: number }[],
    ramps: [] as { x: number; y: number; width: number; height: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[],
    coins: [] as { x: number; y: number; collected: boolean; radius: number }[],
    score: 0,
    crushedCount: 0,
    nitro: 100,
    coinsEarned: 0,
    running: true,
  });

  const showStunt = (msg: string) => {
    setStuntText(msg);
    arcadeAudio.playWhoosh();
    setTimeout(() => {
      setStuntText(null);
    }, 1200);
  };

  const initGame = useCallback((w: number, h: number) => {
    const s = stateRef.current;
    s.truck.x = w / 2;
    s.truck.y = h - 140;
    s.truck.speed = 0;
    s.truck.z = 0;
    s.truck.vz = 0;
    s.truck.tiltAngle = 0;
    s.truck.isAirborne = false;
    s.truck.rotationAccum = 0;
    s.arenaOffset = 0;
    s.score = 0;
    s.crushedCount = 0;
    s.nitro = 100;
    s.coinsEarned = 0;
    s.running = true;
    s.particles = [];

    // Seed stadium scrap cars and dirt ramps
    s.scrapCars = [];
    s.ramps = [];
    s.coins = [];

    for (let i = 0; i < 18; i++) {
      const y = -i * 170 - 200;
      const x = Math.random() * (w - 200) + 100;
      const isRamp = i % 4 === 0;

      if (isRamp) {
        s.ramps.push({ x, y, width: 72, height: 40 });
      } else {
        const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea'];
        s.scrapCars.push({
          x,
          y,
          crushed: false,
          color: colors[Math.floor(Math.random() * colors.length)],
          width: 44,
          height: 64,
        });
      }

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
    setCarsCrushed(0);
    setNitro(100);
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
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') s.keys.nitro = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') s.keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') s.keys.down = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') s.keys.nitro = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;
      const t = s.truck;
      const w = canvas.width;
      const h = canvas.height;

      if (s.running) {
        // Steering
        if (s.keys.left) {
          t.steer = Math.max(t.steer - 0.08, -1);
          t.steerAngle = Math.max(t.steerAngle - 0.05, -0.32);
          if (t.isAirborne) t.rotationAccum -= dt * 5;
        } else if (s.keys.right) {
          t.steer = Math.min(t.steer + 0.08, 1);
          t.steerAngle = Math.min(t.steerAngle + 0.05, 0.32);
          if (t.isAirborne) t.rotationAccum += dt * 5;
        } else {
          t.steer *= 0.85;
          t.steerAngle *= 0.82;
        }

        // Throttle & Supercharger Nitro
        const isBoosting = s.keys.nitro && s.nitro > 0;
        if (isBoosting) {
          s.nitro = Math.max(0, s.nitro - dt * 25);
          t.speed = Math.min(t.speed + t.accel * 1.8, t.maxSpeed * 1.4);
          if (Math.random() < 0.25) arcadeAudio.playNitro();
        } else if (s.keys.up) {
          t.speed = Math.min(t.speed + t.accel, t.maxSpeed);
          if (Math.random() < 0.15) arcadeAudio.playEngineTone(110 + t.speed * 12, 0.09);
        } else if (s.keys.down) {
          t.speed = Math.max(0, t.speed - t.accel * 1.5);
        } else {
          t.speed *= t.friction;
        }

        t.x += t.steer * (t.speed * 0.7 + 2);
        t.x = Math.max(70, Math.min(w - 70, t.x));

        // Jump & Mid-Air Elevation
        if (t.isAirborne) {
          t.z += t.vz * dt;
          t.vz -= 36 * dt; // gravity
          if (t.z <= 0) {
            t.z = 0;
            t.vz = 0;
            t.isAirborne = false;
            // Check if full barrel/backflip completed
            if (Math.abs(t.rotationAccum) > 4) {
              s.score += 1500;
              showStunt('AIR STUNT FLIP LANDED! +1500 PTS');
            }
            t.rotationAccum = 0;
            arcadeAudio.playCrash(); // heavy landing thud
            // Mud particles on landing
            for (let i = 0; i < 20; i++) {
              s.particles.push({
                x: t.x + (Math.random() * 40 - 20),
                y: t.y + 35,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 6,
                life: 0.5,
                color: '#78350f',
                size: Math.random() * 7 + 3,
              });
            }
          }
        }

        const travel = t.speed * 60 * dt;
        s.arenaOffset = (s.arenaOffset + travel) % 80;
        s.score += Math.round(travel * 0.25);

        // Check Stadium Ramps
        for (const ramp of s.ramps) {
          ramp.y += travel;
          if (t.z < 15 && Math.abs(t.x - ramp.x) < (t.width + ramp.width) * 0.4 && Math.abs(t.y - ramp.y) < 32) {
            t.isAirborne = true;
            t.vz = 26 + t.speed * 1.2;
            t.z = 6;
            s.score += 600;
            showStunt('MEGA RAMP LAUNCH! +600 PTS');
          }
          if (ramp.y > h + 100) {
            ramp.y = -Math.random() * 200 - 150;
            ramp.x = Math.random() * (w - 200) + 100;
          }
        }

        // Check Scrap Cars to CRUSH!
        for (const car of s.scrapCars) {
          car.y += travel;
          if (!car.crushed && Math.abs(t.x - car.x) < 45 && Math.abs(t.y - car.y) < 50) {
            car.crushed = true;
            s.crushedCount += 1;
            s.score += 850;
            s.nitro = Math.min(100, s.nitro + 12);
            arcadeAudio.playMetalCrunch();
            showStunt(`SCRAP CAR CRUSHED! #${s.crushedCount}`);

            // Metal sparks and debris
            for (let k = 0; k < 18; k++) {
              s.particles.push({
                x: car.x,
                y: car.y,
                vx: (Math.random() - 0.5) * 9,
                vy: (Math.random() - 0.5) * 9,
                life: 0.5,
                color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
                size: Math.random() * 6 + 2,
              });
            }
          }
          if (car.y > h + 100) {
            car.y = -Math.random() * 220 - 120;
            car.x = Math.random() * (w - 200) + 100;
            car.crushed = false;
          }
        }

        // Coins
        for (const coin of s.coins) {
          coin.y += travel;
          if (!coin.collected && Math.abs(t.x - coin.x) < 32 && Math.abs(t.y - coin.y) < 36) {
            coin.collected = true;
            s.coinsEarned += 1;
            s.score += 250;
            arcadeAudio.playCoin();
            onEarnCoins(1);
          }
          if (coin.y > h + 100) {
            coin.y = -Math.random() * 240 - 150;
            coin.x = Math.random() * (w - 200) + 100;
            coin.collected = false;
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
        setSpeedKmh(Math.round(t.speed * 18));
        setCarsCrushed(s.crushedCount);
        setNitro(Math.round(s.nitro));
      }

      // RENDER
      // 1. Stadium Night Arena with Floodlights
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#110c1f');
      bgGrad.addColorStop(0.4, '#24143a');
      bgGrad.addColorStop(1, '#3b1d16'); // Mud dirt arena floor
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Stadium Arena Dirt Floor
      ctx.fillStyle = '#452615';
      ctx.fillRect(50, 0, w - 100, h);

      // Tire tread marks in dirt
      ctx.strokeStyle = 'rgba(30, 15, 8, 0.45)';
      ctx.lineWidth = 14;
      for (let x = 90; x < w - 80; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Arena Concrete Safety Barriers
      ctx.fillStyle = '#d97706';
      for (let y = 0; y < h; y += 40) {
        ctx.fillRect(40, y, 10, 20);
        ctx.fillRect(w - 50, y, 10, 20);
      }

      // 2. Render Stadium Ramps
      for (const ramp of s.ramps) {
        if (ramp.y < -50 || ramp.y > h + 50) continue;
        ctx.save();
        ctx.translate(ramp.x, ramp.y);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(-ramp.width / 2, ramp.height / 2);
        ctx.lineTo(ramp.width / 2, ramp.height / 2);
        ctx.lineTo(ramp.width * 0.4, -ramp.height / 2);
        ctx.lineTo(-ramp.width * 0.4, -ramp.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MEGA RAMP', 0, 4);
        ctx.restore();
      }

      // 3. Render Scrap Cars
      for (const car of s.scrapCars) {
        if (car.y < -50 || car.y > h + 50) continue;
        ctx.save();
        ctx.translate(car.x, car.y);
        if (car.crushed) {
          // Crushed flat wreck
          ctx.fillStyle = '#262626';
          ctx.fillRect(-car.width / 2, -car.height / 4, car.width, car.height / 2);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(-car.width / 2, -car.height / 4, car.width, car.height / 2);
        } else {
          // Intact scrap car waiting to be crushed
          ctx.fillStyle = car.color;
          ctx.beginPath();
          ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 6);
          ctx.fill();
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Windshield
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-car.width * 0.35, -car.height * 0.15, car.width * 0.7, car.height * 0.3);
        }
        ctx.restore();
      }

      // 4. Render Coins
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
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        ctx.restore();
      }

      // 5. Render Metal & Spark Particles
      for (const p of s.particles) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Render Mega Monster Truck
      ctx.save();
      const shadowY = t.y + 45;
      const shadowScale = Math.max(0.4, 1 - t.z / 140);
      ctx.fillStyle = 'rgba(20, 10, 5, 0.55)';
      ctx.beginPath();
      ctx.ellipse(t.x, shadowY, 32 * shadowScale, 18 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Truck elevation
      ctx.translate(t.x, t.y - t.z);
      ctx.rotate(t.steerAngle + t.rotationAccum);

      // Four Giant Monster Truck Tires (Deep-Tread Knobby Rubber)
      ctx.fillStyle = '#1c1917';
      // Front Tires
      ctx.fillRect(-32, -36, 15, 26);
      ctx.fillRect(17, -36, 15, 26);
      // Rear Tires
      ctx.fillRect(-32, 14, 15, 26);
      ctx.fillRect(17, 14, 15, 26);

      // Chrome Beadlock Rims
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(-27, -26, 5, 6);
      ctx.fillRect(22, -26, 5, 6);
      ctx.fillRect(-27, 24, 5, 6);
      ctx.fillRect(22, 24, 5, 6);

      // Heavy Tubular Roll Cage Chassis
      ctx.fillStyle = '#f59e0b'; // Neon Amber / Gold Body
      ctx.beginPath();
      ctx.roundRect(-18, -30, 36, 62, 8);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Monster Truck Cockpit
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-12, -15, 24, 28);

      // Roof Mounted High-Power Stadium LEDs
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 14;
      ctx.fillRect(-14, -32, 28, 5);

      // Supercharger Blower Scoop on Hood
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-8, -26, 16, 9);

      // Nitro Flames from Quad Exhaust Headers
      if (s.keys.nitro && s.nitro > 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-16, 32);
        ctx.lineTo(-12, 48 + Math.random() * 8);
        ctx.lineTo(-8, 32);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(8, 32);
        ctx.lineTo(12, 48 + Math.random() * 8);
        ctx.lineTo(16, 32);
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

  const handleTouchDir = (dir: 'left' | 'right' | 'up' | 'nitro', active: boolean) => {
    const s = stateRef.current;
    if (dir === 'left') s.keys.left = active;
    if (dir === 'right') s.keys.right = active;
    if (dir === 'up') s.keys.up = active;
    if (dir === 'nitro') s.keys.nitro = active;
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

          {/* Cars Crushed Counter */}
          <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-rose-500/40 text-white shadow-xl flex items-center gap-1.5">
            <span className="text-rose-400 font-black">💥 CRUSHED</span>
            <span className="font-mono font-black text-sm text-rose-300">{carsCrushed}</span>
          </div>
        </div>

        {/* Right: Nitro */}
        <div className="w-24 sm:w-32 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/40">
          <div className="flex justify-between text-[9px] font-bold text-cyan-300 mb-0.5">
            <span>NITRO</span>
            <span>{nitro}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-75" style={{ width: `${nitro}%` }} />
          </div>
        </div>
      </div>

      {/* Stunt Announcement */}
      {stuntText && (
        <div className="absolute top-20 z-20 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-game font-black text-sm sm:text-lg shadow-2xl animate-bounce">
          {stuntText}
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
            className="px-5 h-12 rounded-xl bg-amber-400 text-slate-950 font-black text-xs active:bg-amber-300 flex items-center justify-center"
          >
            CRUSH GAS ▲
          </button>
          <button
            onTouchStart={() => handleTouchDir('nitro', true)}
            onTouchEnd={() => handleTouchDir('nitro', false)}
            className="px-4 h-12 rounded-xl bg-rose-600 text-white font-black text-xs active:bg-rose-500 flex items-center justify-center"
          >
            NITRO 🔥
          </button>
        </div>
      </div>
    </div>
  );
};
