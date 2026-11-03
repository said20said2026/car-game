import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface DesertRallyCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

export const DesertRallyCanvas: React.FC<DesertRallyCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [checkpointTimer, setCheckpointTimer] = useState(30);
  const [checkpointCount, setCheckpointCount] = useState(0);
  const [boost, setBoost] = useState(100);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [isAirborne, setIsAirborne] = useState(false);
  const [airtimeText, setAirtimeText] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const stateRef = useRef({
    buggy: {
      x: 350,
      y: 400,
      width: 44,
      height: 70,
      speed: 0,
      maxSpeed: 11,
      accel: 0.24,
      friction: 0.982,
      steer: 0,
      steerAngle: 0,
      z: 0, // elevation for jumping off dunes
      vz: 0,
      isJumping: false,
      airtimeDuration: 0,
    },
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      boost: false,
      jump: false,
    },
    trackOffset: 0,
    distanceMeters: 0,
    nextCheckpointDistance: 500,
    checkpointTimeRemaining: 30,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }[],
    obstacles: [] as { x: number; y: number; type: 'rock' | 'cactus' | 'dune_ramp'; width: number; height: number; hit?: boolean }[],
    coins: [] as { x: number; y: number; collected: boolean; radius: number; pulse: number }[],
    dunes: [] as { y: number; height: number; curve: number; color: string }[],
    score: 0,
    coinsEarned: 0,
    boost: 100,
    running: true,
  });

  const initGame = useCallback((w: number, h: number) => {
    const s = stateRef.current;
    s.buggy.x = w / 2;
    s.buggy.y = h - 130;
    s.buggy.speed = 0;
    s.buggy.z = 0;
    s.buggy.vz = 0;
    s.buggy.isJumping = false;
    s.trackOffset = 0;
    s.distanceMeters = 0;
    s.nextCheckpointDistance = 500;
    s.checkpointTimeRemaining = 30;
    s.score = 0;
    s.coinsEarned = 0;
    s.boost = 100;
    s.particles = [];
    s.obstacles = [];
    s.coins = [];
    s.running = true;

    // Seed initial obstacles and dune ramps ahead
    for (let i = 0; i < 18; i++) {
      const y = -i * 180 - 200;
      const laneX = Math.random() * (w - 180) + 90;
      const typeRand = Math.random();
      const type: 'rock' | 'cactus' | 'dune_ramp' = typeRand < 0.35 ? 'dune_ramp' : typeRand < 0.7 ? 'rock' : 'cactus';
      s.obstacles.push({
        x: laneX,
        y,
        type,
        width: type === 'dune_ramp' ? 68 : type === 'rock' ? 44 : 32,
        height: type === 'dune_ramp' ? 36 : type === 'rock' ? 40 : 48,
      });

      // Bonus gold coins near ramps
      if (Math.random() > 0.4) {
        s.coins.push({
          x: laneX + (Math.random() * 60 - 30),
          y: y - 50,
          collected: false,
          radius: 12,
          pulse: 0,
        });
      }
    }

    setScore(0);
    setCoinsCollected(0);
    setCheckpointTimer(30);
    setCheckpointCount(0);
    setBoost(100);
    setIsGameOver(false);
  }, []);

  const triggerAirtimeEffect = (meters: number) => {
    setIsAirborne(true);
    setAirtimeText(`DUNE LAUNCH! +${meters}m AIRTIME`);
    arcadeAudio.playWhoosh();
    setTimeout(() => {
      setAirtimeText(null);
    }, 1200);
  };

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
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') s.keys.boost = true;
      if (e.code === 'Space') s.keys.jump = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') s.keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') s.keys.down = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') s.keys.boost = false;
      if (e.code === 'Space') s.keys.jump = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Main game loop
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;
      const b = s.buggy;
      const w = canvas.width;
      const h = canvas.height;

      if (s.running) {
        // Countdown timer for checkpoint
        s.checkpointTimeRemaining -= dt;
        if (s.checkpointTimeRemaining <= 0) {
          s.checkpointTimeRemaining = 0;
          s.running = false;
          setIsGameOver(true);
          arcadeAudio.playCrash();
          onGameOver?.(s.score, s.coinsEarned);
        }

        // Steer input with suspension tilt
        if (s.keys.left) {
          b.steer = Math.max(b.steer - 0.08, -1);
          b.steerAngle = Math.max(b.steerAngle - 0.05, -0.35);
        } else if (s.keys.right) {
          b.steer = Math.min(b.steer + 0.08, 1);
          b.steerAngle = Math.min(b.steerAngle + 0.05, 0.35);
        } else {
          b.steer *= 0.85;
          b.steerAngle *= 0.82;
        }

        // Throttle & Nitro
        const isBoosting = s.keys.boost && s.boost > 0;
        if (isBoosting) {
          s.boost = Math.max(0, s.boost - dt * 25);
          b.speed = Math.min(b.speed + b.accel * 1.8, b.maxSpeed * 1.4);
          if (Math.random() > 0.4) arcadeAudio.playNitro();
        } else if (s.keys.up) {
          b.speed = Math.min(b.speed + b.accel, b.maxSpeed);
          if (Math.random() < 0.15) arcadeAudio.playEngineTone(110 + b.speed * 12, 0.08);
        } else if (s.keys.down) {
          b.speed = Math.max(b.speed - b.accel * 1.5, 0);
        } else {
          b.speed *= b.friction;
        }

        // Lateral movement
        b.x += b.steer * (b.speed * 0.7 + 2);
        b.x = Math.max(60, Math.min(w - 60, b.x));

        // Jump physics (elevation Z)
        if (b.isJumping) {
          b.z += b.vz * dt;
          b.vz -= 38 * dt; // gravity
          b.airtimeDuration += dt;
          if (b.z <= 0) {
            b.z = 0;
            b.vz = 0;
            b.isJumping = false;
            setIsAirborne(false);
            // Landing dust burst
            arcadeAudio.playTireSkid();
            for (let i = 0; i < 22; i++) {
              s.particles.push({
                x: b.x + (Math.random() * 40 - 20),
                y: b.y + 35,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 4,
                life: 0.6,
                maxLife: 0.6,
                color: '#e69d45',
                size: Math.random() * 7 + 3,
              });
            }
          }
        }

        // Advance distance and score
        const travel = b.speed * 60 * dt;
        s.distanceMeters += travel * 0.1;
        s.trackOffset += travel;
        s.score += Math.round(travel * 0.25 * (b.isJumping ? 2 : 1));

        // Checkpoint checking
        if (s.distanceMeters >= s.nextCheckpointDistance) {
          s.nextCheckpointDistance += 600;
          s.checkpointTimeRemaining += 20;
          s.score += 1500;
          s.boost = Math.min(100, s.boost + 35);
          setCheckpointCount((prev) => prev + 1);
          arcadeAudio.playCheckpoint();
        }

        // Spawn sand roost particles when driving on ground
        if (!b.isJumping && b.speed > 2) {
          for (let i = 0; i < 2; i++) {
            s.particles.push({
              x: b.x + (i === 0 ? -16 : 16) + (Math.random() * 6 - 3),
              y: b.y + 35,
              vx: (Math.random() - 0.5) * 3,
              vy: Math.random() * 3 + 2,
              life: 0.45,
              maxLife: 0.45,
              color: Math.random() > 0.5 ? '#d99036' : '#f5be6b',
              size: Math.random() * 5 + 2,
            });
          }
        }

        // Move obstacles down
        for (let i = 0; i < s.obstacles.length; i++) {
          const obs = s.obstacles[i];
          obs.y += travel;

          // Collision detection if buggy is low to ground
          if (!obs.hit && b.z < 20) {
            const dx = Math.abs(b.x - obs.x);
            const dy = Math.abs(b.y - obs.y);
            if (dx < (b.width + obs.width) * 0.38 && dy < (b.height + obs.height) * 0.35) {
              if (obs.type === 'dune_ramp') {
                // Launch into the air!
                b.isJumping = true;
                b.vz = 24 + b.speed * 1.2;
                b.z = 5;
                obs.hit = true;
                triggerAirtimeEffect(Math.round(b.speed * 4 + 15));
                s.score += 500;
              } else {
                // Rock or Cactus crash
                obs.hit = true;
                b.speed = Math.max(1, b.speed * 0.3);
                arcadeAudio.playCrash();
                for (let k = 0; k < 15; k++) {
                  s.particles.push({
                    x: obs.x,
                    y: obs.y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    life: 0.5,
                    maxLife: 0.5,
                    color: obs.type === 'rock' ? '#8c7662' : '#3d8248',
                    size: Math.random() * 6 + 3,
                  });
                }
              }
            }
          }

          // Recycle obstacles that fell behind
          if (obs.y > h + 100) {
            obs.y = -Math.random() * 200 - 100;
            obs.x = Math.random() * (w - 180) + 90;
            obs.hit = false;
            const r = Math.random();
            obs.type = r < 0.35 ? 'dune_ramp' : r < 0.7 ? 'rock' : 'cactus';
            obs.width = obs.type === 'dune_ramp' ? 68 : obs.type === 'rock' ? 44 : 32;
            obs.height = obs.type === 'dune_ramp' ? 36 : obs.type === 'rock' ? 40 : 48;
          }
        }

        // Move coins
        for (let i = 0; i < s.coins.length; i++) {
          const coin = s.coins[i];
          coin.y += travel;
          coin.pulse += dt * 5;

          if (!coin.collected) {
            const dx = Math.abs(b.x - coin.x);
            const dy = Math.abs(b.y - coin.y);
            if (dx < 32 && dy < 38) {
              coin.collected = true;
              s.coinsEarned += 1;
              s.score += 250;
              s.boost = Math.min(100, s.boost + 8);
              arcadeAudio.playCoin();
              onEarnCoins(1);
            }
          }

          if (coin.y > h + 100) {
            coin.y = -Math.random() * 250 - 150;
            coin.x = Math.random() * (w - 180) + 90;
            coin.collected = false;
          }
        }

        // Update particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= dt;
          if (p.life <= 0) s.particles.splice(i, 1);
        }

        // Sync React HUD state
        setScore(s.score);
        setSpeedKmh(Math.round(b.speed * 22));
        setCheckpointTimer(Math.max(0, Math.ceil(s.checkpointTimeRemaining)));
        setBoost(Math.round(s.boost));
        setCoinsCollected(s.coinsEarned);
      }

      // RENDER CANVAS
      // 1. Sky & Desert Sunset Horizon
      const skyGradient = ctx.createLinearGradient(0, 0, 0, h * 0.4);
      skyGradient.addColorStop(0, '#3b1d11');
      skyGradient.addColorStop(0.5, '#9e4719');
      skyGradient.addColorStop(1, '#e3822b');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, w, h * 0.4);

      // Distant desert mountains
      ctx.fillStyle = '#6e2b13';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.4);
      for (let x = 0; x <= w; x += 40) {
        const my = h * 0.38 - Math.sin((x + s.trackOffset * 0.05) * 0.015) * 25 - Math.cos(x * 0.03) * 15;
        ctx.lineTo(x, my);
      }
      ctx.lineTo(w, h * 0.4);
      ctx.closePath();
      ctx.fill();

      // Desert Floor
      const groundGrad = ctx.createLinearGradient(0, h * 0.4, 0, h);
      groundGrad.addColorStop(0, '#c77826');
      groundGrad.addColorStop(0.3, '#d98b34');
      groundGrad.addColorStop(1, '#a85e1b');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, h * 0.4, w, h * 0.6);

      // Dune ripple lines scrolling down
      ctx.strokeStyle = '#e09848';
      ctx.lineWidth = 2;
      for (let dy = 0; dy < 10; dy++) {
        const yPos = (s.trackOffset * 0.8 + dy * 70) % (h * 0.6) + h * 0.4;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.bezierCurveTo(w * 0.3, yPos + 15, w * 0.7, yPos - 15, w, yPos + 8);
        ctx.stroke();
      }

      // Track borders (sand banks)
      ctx.fillStyle = '#8f4f16';
      ctx.fillRect(0, h * 0.4, 50, h * 0.6);
      ctx.fillRect(w - 50, h * 0.4, 50, h * 0.6);

      // Render Obstacles (Rocks, Cacti, Dune Ramps)
      for (const obs of s.obstacles) {
        if (obs.y < h * 0.38 || obs.y > h + 50) continue;
        if (obs.type === 'dune_ramp') {
          // Yellow-Orange Sand Crest Jump Ramp
          ctx.save();
          ctx.translate(obs.x, obs.y);
          ctx.fillStyle = '#f5b042';
          ctx.beginPath();
          ctx.moveTo(-obs.width / 2, obs.height / 2);
          ctx.lineTo(obs.width / 2, obs.height / 2);
          ctx.lineTo(obs.width * 0.35, -obs.height / 2);
          ctx.lineTo(-obs.width * 0.35, -obs.height / 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffe27a';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Ramp chevrons
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('▲ JUMP ▲', 0, 4);
          ctx.restore();
        } else if (obs.type === 'rock') {
          // Desert Boulder
          ctx.save();
          ctx.translate(obs.x, obs.y);
          ctx.fillStyle = '#695545';
          ctx.beginPath();
          ctx.ellipse(0, 0, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#423326';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Shadow
          ctx.fillStyle = '#8c735d';
          ctx.beginPath();
          ctx.arc(-4, -4, obs.width * 0.28, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // Saguaro Cactus
          ctx.save();
          ctx.translate(obs.x, obs.y);
          ctx.fillStyle = '#2f6e37';
          ctx.fillRect(-6, -obs.height / 2, 12, obs.height);
          // Left arm
          ctx.fillRect(-18, -4, 14, 8);
          ctx.fillRect(-18, -18, 8, 16);
          // Right arm
          ctx.fillRect(4, 4, 14, 8);
          ctx.fillRect(10, -8, 8, 14);
          ctx.restore();
        }
      }

      // Render Coins
      for (const coin of s.coins) {
        if (coin.collected || coin.y < h * 0.38 || coin.y > h + 40) continue;
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffe600';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#9e7300';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        ctx.restore();
      }

      // Render Sand Particles
      for (const p of s.particles) {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Dune Buggy Player
      ctx.save();
      const shadowY = b.y + 40;
      // Buggy ground shadow (scales with elevation)
      const shadowScale = Math.max(0.4, 1 - b.z / 120);
      ctx.fillStyle = 'rgba(40, 20, 5, 0.45)';
      ctx.beginPath();
      ctx.ellipse(b.x, shadowY, 26 * shadowScale, 12 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Buggy elevation offset
      ctx.translate(b.x, b.y - b.z);
      ctx.rotate(b.steerAngle);

      // Wheels (4 off-road knobby tires)
      ctx.fillStyle = '#1a1918';
      // Front wheels
      ctx.fillRect(-24, -28, 8, 16);
      ctx.fillRect(16, -28, 8, 16);
      // Rear wheels
      ctx.fillRect(-25, 12, 10, 20);
      ctx.fillRect(15, 12, 10, 20);

      // Roll cage frame & Body
      ctx.fillStyle = '#e65c00'; // High-vis orange Dakar livery
      ctx.beginPath();
      ctx.roundRect(-16, -24, 32, 50, 6);
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Roof & Cockpit
      ctx.fillStyle = '#141414';
      ctx.fillRect(-11, -12, 22, 24);

      // Twin Spare Tires mounted on rear
      ctx.fillStyle = '#262422';
      ctx.fillRect(-10, 18, 20, 10);

      // High-mounted Dakar LED light bar
      ctx.fillStyle = '#fffbcf';
      ctx.shadowColor = '#fffbcf';
      ctx.shadowBlur = b.speed > 3 ? 12 : 4;
      ctx.fillRect(-12, -26, 24, 4);

      // Tail exhaust flame when boosting
      if (s.keys.boost && s.boost > 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-6, 28);
        ctx.lineTo(0, 44 + Math.random() * 8);
        ctx.lineTo(6, 28);
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
      {/* Top HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          {/* Score */}
          <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30 text-white shadow-lg">
            <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Score</span>
            <span className="font-mono font-black text-sm sm:text-base text-amber-300">{score.toLocaleString()}</span>
          </div>

          {/* Speed */}
          <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Speed</span>
            <span className="font-mono font-black text-sm sm:text-base text-cyan-400">{speedKmh} <span className="text-[10px] text-slate-400">km/h</span></span>
          </div>

          {/* Checkpoints passed */}
          <div className="hidden sm:flex flex-col bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gates</span>
            <span className="font-mono font-black text-sm text-emerald-400">CP {checkpointCount}</span>
          </div>
        </div>

        {/* Center: Checkpoint Countdown Timer */}
        <div className={`px-4 py-1.5 rounded-xl border font-game font-black text-sm sm:text-lg tracking-wider backdrop-blur-md shadow-xl ${
          checkpointTimer <= 5
            ? 'bg-rose-600/90 border-rose-400 text-white animate-pulse'
            : 'bg-slate-950/85 border-amber-500/40 text-amber-400'
        }`}>
          ⏱️ {checkpointTimer}s
        </div>

        {/* Right: Nitro Boost & Coins */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30 text-white shadow-lg flex items-center gap-1.5">
            <span className="text-amber-400 font-black">🪙</span>
            <span className="font-mono font-black text-sm sm:text-base text-amber-300">{coinsCollected}</span>
          </div>

          <div className="w-24 sm:w-32 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/40">
            <div className="flex justify-between text-[9px] font-bold text-cyan-300 mb-0.5">
              <span>NITRO</span>
              <span>{boost}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-75" style={{ width: `${boost}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Airborne Airtime Banner */}
      {airtimeText && (
        <div className="absolute top-20 z-20 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-game font-black text-base sm:text-xl shadow-2xl animate-bounce">
          {airtimeText}
        </div>
      )}

      {/* Main Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="w-full h-auto block rounded-xl cursor-crosshair shadow-inner"
        style={{ touchAction: 'none' }}
      />

      {/* Game Over Modal Screen */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-3">
            🏜️
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-game text-[#ffcc00] tracking-wide mb-1">
            DESERT RAID COMPLETE
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-4">
            You crossed {checkpointCount} Dakar gates through the storm!
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-5">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Score</span>
              <span className="font-mono font-black text-lg text-amber-400">{score.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Coins Stashed</span>
              <span className="font-mono font-black text-lg text-yellow-300">+{coinsCollected} 🪙</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (canvasRef.current) initGame(canvasRef.current.width, canvasRef.current.height);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-400/20 cursor-pointer active:scale-95 transition-all"
          >
            🏁 RACE AGAIN (SPACE)
          </button>
        </div>
      )}

      {/* Responsive Mobile On-Screen Controller Bar */}
      <div className="w-full flex items-center justify-between p-3 bg-slate-900/90 border-t border-slate-800 gap-3 md:hidden">
        <div className="flex gap-2">
          <button
            onTouchStart={() => handleTouchDir('left', true)}
            onTouchEnd={() => handleTouchDir('left', false)}
            onMouseDown={() => handleTouchDir('left', true)}
            onMouseUp={() => handleTouchDir('left', false)}
            className="w-14 h-12 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg active:bg-amber-400 active:text-slate-950 flex items-center justify-center"
          >
            ◀
          </button>
          <button
            onTouchStart={() => handleTouchDir('right', true)}
            onTouchEnd={() => handleTouchDir('right', false)}
            onMouseDown={() => handleTouchDir('right', true)}
            onMouseUp={() => handleTouchDir('right', false)}
            className="w-14 h-12 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg active:bg-amber-400 active:text-slate-950 flex items-center justify-center"
          >
            ▶
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onTouchStart={() => handleTouchDir('up', true)}
            onTouchEnd={() => handleTouchDir('up', false)}
            onMouseDown={() => handleTouchDir('up', true)}
            onMouseUp={() => handleTouchDir('up', false)}
            className="px-5 h-12 rounded-xl bg-amber-400 text-slate-950 font-black text-sm active:bg-amber-300 flex items-center justify-center"
          >
            GAS ▲
          </button>
          <button
            onTouchStart={() => handleTouchDir('boost', true)}
            onTouchEnd={() => handleTouchDir('boost', false)}
            onMouseDown={() => handleTouchDir('boost', true)}
            onMouseUp={() => handleTouchDir('boost', false)}
            className="px-4 h-12 rounded-xl bg-cyan-500 text-slate-950 font-black text-sm active:bg-cyan-400 flex items-center justify-center"
          >
            NITRO 🔥
          </button>
        </div>
      </div>
    </div>
  );
};
