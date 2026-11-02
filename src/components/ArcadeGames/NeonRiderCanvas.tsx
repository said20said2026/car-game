import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface NeonRiderCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

export const NeonRiderCanvas: React.FC<NeonRiderCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(120);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [shieldActive, setShieldActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const stateRef = useRef({
    lane: 2, // 0 to 4 (5 lanes)
    targetLane: 2,
    playerX: 0,
    playerY: 0,
    isJumping: false,
    jumpY: 0,
    jumpVel: 0,
    speed: 12,
    score: 0,
    coins: 0,
    shield: true,
    gameOver: false,
    distance: 0,
    obstacles: [] as { x: number; y: number; lane: number; type: 'barrier' | 'laser' | 'coin' | 'boost'; passed: boolean }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    gridOffset: 0,
  });

  const changeLane = (dir: -1 | 1) => {
    const s = stateRef.current;
    if (s.gameOver) return;
    const next = Math.max(0, Math.min(4, s.lane + dir));
    if (next !== s.lane) {
      s.lane = next;
      arcadeAudio.playEngineTone(320 + next * 40, 0.08);
    }
  };

  const jump = () => {
    const s = stateRef.current;
    if (s.gameOver || s.isJumping) return;
    s.isJumping = true;
    s.jumpVel = 14;
    arcadeAudio.playPulse();
  };

  const activateShield = () => {
    const s = stateRef.current;
    s.shield = true;
    setShieldActive(true);
    arcadeAudio.playPulse();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { changeLane(-1); e.preventDefault(); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { changeLane(1); e.preventDefault(); }
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) { jump(); e.preventDefault(); }
      if (['ShiftLeft', 'ShiftRight'].includes(e.code)) { activateShield(); e.preventDefault(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let spawnTimer = 0;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(320, rect.width || 800);
      canvas.height = Math.max(300, rect.height || 500);
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;

      const w = canvas.width;
      const h = canvas.height;
      const horizonY = h * 0.35;
      const roadBottomW = w * 0.88;
      const roadTopW = w * 0.22;
      const roadLeft = (w - roadBottomW) / 2;
      const roadRight = roadLeft + roadBottomW;

      if (!s.gameOver) {
        s.distance += s.speed * dt * 8;
        s.score += Math.floor(s.speed * dt * 15);
        s.gridOffset = (s.gridOffset + s.speed * dt * 25) % 40;

        // Player lane lerp
        const laneW = roadBottomW / 5;
        const targetX = roadLeft + (s.lane + 0.5) * laneW;
        s.playerX += (targetX - s.playerX) * 0.22;
        s.playerY = h - 75;

        // Jump physics
        if (s.isJumping) {
          s.jumpY += s.jumpVel;
          s.jumpVel -= 35 * dt;
          if (s.jumpY <= 0) {
            s.jumpY = 0;
            s.isJumping = false;
          }
        }

        // Spawn obstacles & items
        spawnTimer += dt;
        if (spawnTimer > Math.max(0.65, 1.4 - s.distance * 0.00008)) {
          spawnTimer = 0;
          const spawnLane = Math.floor(Math.random() * 5);
          const rand = Math.random();
          let type: 'barrier' | 'laser' | 'coin' | 'boost' = 'barrier';
          if (rand < 0.45) type = 'barrier';
          else if (rand < 0.70) type = 'coin';
          else if (rand < 0.88) type = 'laser';
          else type = 'boost';

          s.obstacles.push({
            x: 0,
            y: horizonY,
            lane: spawnLane,
            type,
            passed: false,
          });
        }

        // Update obstacles
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.y += s.speed * dt * 48;

          // Check collision near player Y
          const pLaneDist = Math.abs(obs.lane - s.lane);
          if (obs.y > h - 110 && obs.y < h - 40 && !obs.passed && pLaneDist < 0.6) {
            if (obs.type === 'coin') {
              obs.passed = true;
              s.coins += 2;
              s.score += 300;
              arcadeAudio.playCoin();
              onEarnCoins(2);
            } else if (obs.type === 'boost') {
              obs.passed = true;
              s.speed = Math.min(32, s.speed + 6);
              s.score += 600;
              arcadeAudio.playNitro();
            } else if (obs.type === 'barrier' || obs.type === 'laser') {
              // Can jump over barriers if high enough!
              if (s.jumpY > 25 && obs.type === 'barrier') {
                s.score += 250; // Jump bonus!
              } else if (s.shield) {
                // Shield saves player once
                s.shield = false;
                obs.passed = true;
                setShieldActive(false);
                arcadeAudio.playCrash();
              } else {
                // Game Over!
                s.gameOver = true;
                setIsGameOver(true);
                arcadeAudio.playCrash();
                if (onGameOver) onGameOver(s.score, s.coins);
              }
            }
          }

          if (obs.y > h + 50) {
            s.obstacles.splice(i, 1);
          }
        }

        // Increase speed slightly with distance
        s.speed = Math.min(28, 12 + s.distance * 0.003);

        setScore(Math.floor(s.score));
        setSpeed(Math.floor(s.speed * 15));
        setCoinsCollected(s.coins);
        setShieldActive(s.shield);
      }

      // RENDER
      ctx.fillStyle = '#050212';
      ctx.fillRect(0, 0, w, h);

      // Neon Synthwave Sunset / Sun
      const sunY = horizonY - 15;
      const sunR = Math.min(w * 0.16, 70);
      const sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
      sunGrad.addColorStop(0, '#ffff00');
      sunGrad.addColorStop(0.5, '#ff007f');
      sunGrad.addColorStop(1, '#7900ff');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w / 2, sunY, sunR, Math.PI, 0, false);
      ctx.fill();

      // Sun scanline slats
      ctx.fillStyle = '#050212';
      for (let sl = sunY - sunR; sl < sunY; sl += 9) {
        ctx.fillRect(w / 2 - sunR, sl, sunR * 2, 2.5);
      }

      // Digital wireframe road
      ctx.save();
      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      roadGrad.addColorStop(0, '#0a0022');
      roadGrad.addColorStop(1, '#1b0042');
      ctx.fillStyle = roadGrad;

      ctx.beginPath();
      ctx.moveTo(w / 2 - roadTopW / 2, horizonY);
      ctx.lineTo(w / 2 + roadTopW / 2, horizonY);
      ctx.lineTo(roadRight, h);
      ctx.lineTo(roadLeft, h);
      ctx.closePath();
      ctx.fill();

      // Neon grid lines on road
      ctx.strokeStyle = 'rgba(255, 0, 180, 0.5)';
      ctx.lineWidth = 1.5;
      for (let l = 0; l <= 5; l++) {
        const topX = (w / 2 - roadTopW / 2) + (roadTopW / 5) * l;
        const botX = roadLeft + (roadBottomW / 5) * l;
        ctx.beginPath();
        ctx.moveTo(topX, horizonY);
        ctx.lineTo(botX, h);
        ctx.stroke();
      }

      // Horizontal moving grid lines
      for (let z = horizonY; z < h; z += 24) {
        const prog = (z - horizonY) / (h - horizonY);
        const yLine = horizonY + Math.pow(prog, 1.8) * (h - horizonY) + s.gridOffset * prog;
        if (yLine < h) {
          ctx.strokeStyle = `rgba(0, 240, 255, ${prog * 0.6})`;
          ctx.lineWidth = 1 + prog * 1.5;
          const leftX = (w / 2 - roadTopW / 2) * (1 - prog) + roadLeft * prog;
          const rightX = (w / 2 + roadTopW / 2) * (1 - prog) + roadRight * prog;
          ctx.beginPath();
          ctx.moveTo(leftX, yLine);
          ctx.lineTo(rightX, yLine);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Render Obstacles
      s.obstacles.forEach((obs) => {
        const prog = (obs.y - horizonY) / (h - horizonY);
        if (prog <= 0) return;

        const currentTopW = roadTopW * (1 - prog) + roadBottomW * prog;
        const currentLeft = (w - currentTopW) / 2;
        const laneW = currentTopW / 5;
        const obsX = currentLeft + (obs.lane + 0.5) * laneW;
        const size = Math.max(12, 42 * prog);

        ctx.save();
        if (obs.type === 'coin') {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffcc00';
          ctx.fillStyle = '#ffcc00';
          ctx.beginPath();
          ctx.arc(obsX, obs.y, size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'boost') {
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#00ffcc';
          ctx.fillStyle = '#00ffcc';
          ctx.beginPath();
          ctx.moveTo(obsX, obs.y - size * 0.6);
          ctx.lineTo(obsX + size * 0.5, obs.y + size * 0.5);
          ctx.lineTo(obsX - size * 0.5, obs.y + size * 0.5);
          ctx.fill();
        } else if (obs.type === 'barrier') {
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#ff0055';
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(obsX - size * 0.6, obs.y - size * 0.4, size * 1.2, size * 0.7);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(obsX - size * 0.4, obs.y - size * 0.2, size * 0.8, size * 0.3);
        } else if (obs.type === 'laser') {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#00f0ff';
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = Math.max(3, 8 * prog);
          ctx.beginPath();
          ctx.moveTo(obsX - size * 0.7, obs.y);
          ctx.lineTo(obsX + size * 0.7, obs.y);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Render Player Light Bike
      const py = s.playerY - s.jumpY;
      ctx.save();

      // Shadow projection
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(s.playerX, s.playerY + 8, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shield sphere
      if (s.shield) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f0ff';
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.playerX, py - 12, 32, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Bike body
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ff00ff';
      ctx.fillStyle = '#ff00ff';

      // Rear light trail
      ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
      ctx.fillRect(s.playerX - 6, py + 12, 12, 28);

      // Bike chassis
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(s.playerX - 12, py - 24, 24, 38, 6);
      ctx.fill();
      ctx.stroke();

      // Rider helmet
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(s.playerX, py - 10, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [onEarnCoins, onGameOver]);

  const handleRestart = () => {
    const s = stateRef.current;
    s.score = 0;
    s.distance = 0;
    s.coins = 0;
    s.speed = 12;
    s.shield = true;
    s.obstacles = [];
    s.gameOver = false;
    setIsGameOver(false);
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] rounded-2xl overflow-hidden bg-slate-950 border border-fuchsia-500/30 select-none shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" onClick={jump} />

      {/* Top HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs sm:text-sm font-mono font-black">
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-fuchsia-500/40 text-fuchsia-300">
          <span>SCORE: <strong className="text-white text-base">{score.toLocaleString()}</strong></span>
          <span className="text-cyan-400">SPEED: {speed} KM/H</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-300">
            🪙 {coinsCollected} COINS
          </div>
          <div className={`px-3 py-1.5 rounded-xl border font-bold ${shieldActive ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300' : 'bg-slate-900/80 border-slate-700 text-slate-500'}`}>
            {shieldActive ? 'SHIELD: ACTIVE 🛡️' : 'SHIELD: DEPLETED'}
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center p-6 z-20">
          <h3 className="text-3xl sm:text-4xl font-black font-game text-fuchsia-500 tracking-wider">
            CRASHED! GAME OVER
          </h3>
          <p className="text-slate-300 text-sm">
            Final Score: <strong className="text-amber-400 text-lg">{score.toLocaleString()}</strong> • Coins Earned: <strong className="text-amber-400 text-lg">{coinsCollected}</strong>
          </p>
          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white font-black text-sm uppercase tracking-wider hover:opacity-95 shadow-lg shadow-fuchsia-500/30 cursor-pointer active:scale-95 transition-all"
          >
            ↻ Play Again
          </button>
        </div>
      )}

      {/* Mobile Touch Controls */}
      <div className="lg:hidden absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeLane(-1)}
            className="w-14 h-13 rounded-2xl bg-slate-900/90 border border-fuchsia-500 text-fuchsia-400 active:bg-fuchsia-500 active:text-white font-black text-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => changeLane(1)}
            className="w-14 h-13 rounded-2xl bg-slate-900/90 border border-fuchsia-500 text-fuchsia-400 active:bg-fuchsia-500 active:text-white font-black text-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            ▶
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={activateShield}
            className="w-14 h-13 rounded-2xl bg-cyan-950/80 border border-cyan-400 text-cyan-300 active:bg-cyan-400 active:text-slate-950 font-bold text-xs flex items-center justify-center shadow-lg active:scale-95"
          >
            SHIELD
          </button>
          <button
            type="button"
            onClick={jump}
            className="w-16 h-13 rounded-2xl bg-amber-500 border border-amber-400 text-slate-950 active:bg-amber-400 font-black text-sm flex items-center justify-center shadow-lg active:scale-95"
          >
            JUMP ⬆
          </button>
        </div>
      </div>

      {/* Desktop Controls Legend */}
      <div className="hidden lg:flex absolute bottom-3 left-4 text-[11px] text-slate-400 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-slate-800 gap-3">
        <span><strong className="text-fuchsia-400">A / D</strong> Change Lane</span>
        <span><strong className="text-amber-400">W / SPACE</strong> Jump Over Barriers</span>
        <span><strong className="text-cyan-400">SHIFT</strong> Shield Barrier</span>
        <button onClick={handleRestart} className="text-fuchsia-400 hover:underline ml-2">↻ Restart</button>
      </div>
    </div>
  );
};
