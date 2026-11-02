import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface HyperDragCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

type DragState = 'STAGING' | 'COUNTDOWN' | 'RACING' | 'FINISHED' | 'FALSE_START';

export const HyperDragCanvas: React.FC<HyperDragCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dragState, setDragState] = useState<DragState>('STAGING');
  const [gear, setGear] = useState(1);
  const [rpm, setRpm] = useState(1000);
  const [speed, setSpeed] = useState(0);
  const [nitroAvailable, setNitroAvailable] = useState(true);
  const [feedback, setFeedback] = useState<string>('READY TO STAGE');
  const [results, setResults] = useState<{
    playerET: number;
    playerSpeed: number;
    reactionTime: number;
    won: boolean;
    coinsAwarded: number;
  } | null>(null);

  const stateRef = useRef({
    state: 'STAGING' as DragState,
    player: {
      x: 0,
      y: 0,
      distance: 0,
      speed: 0,
      maxSpeed: 320,
      rpm: 1000,
      maxRpm: 9000,
      gear: 1,
      nos: false,
      nosRemaining: 2.5,
    },
    rival: {
      distance: 0,
      speed: 0,
      targetET: 9.6 + Math.random() * 0.8,
    },
    tree: {
      amber1: false,
      amber2: false,
      amber3: false,
      green: false,
      red: false,
      timer: 0,
      launchTime: 0,
    },
    startTime: 0,
    elapsedTime: 0,
    reactionTime: 0,
    throttle: false,
  });

  const gearRatios = [0, 42, 75, 120, 185, 255, 330];

  const stageCar = () => {
    const s = stateRef.current;
    if (s.state !== 'STAGING') return;
    s.state = 'COUNTDOWN';
    s.tree.timer = 0;
    setDragState('COUNTDOWN');
    setFeedback('WATCH THE LIGHTS...');
    arcadeAudio.playBeep(false);
  };

  const shiftUp = () => {
    const s = stateRef.current;
    if (s.state !== 'RACING') return;
    if (s.player.gear < 6) {
      const currentRpm = s.player.rpm;
      s.player.gear++;

      // Evaluate shift quality
      if (currentRpm >= 6800 && currentRpm <= 7600) {
        setFeedback('PERFECT SHIFT! ★★★');
        s.player.speed += 8;
        arcadeAudio.playShiftChime();
      } else if (currentRpm > 7600) {
        setFeedback('OVER-REVVED!');
      } else {
        setFeedback('EARLY SHIFT');
      }

      s.player.rpm = Math.max(2500, currentRpm * 0.68);
      setGear(s.player.gear);
    }
  };

  const activateNos = () => {
    const s = stateRef.current;
    if (s.state !== 'RACING' || !s.player.nosRemaining) return;
    s.player.nos = true;
    setNitroAvailable(false);
    arcadeAudio.playNitro();
    setFeedback('NITROUS ACTIVE! 🚀');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'Enter' || e.code === 'KeyW' || e.code === 'Space') {
        if (s.state === 'STAGING') {
          stageCar();
          e.preventDefault();
        } else if (s.state === 'COUNTDOWN') {
          // False start!
          if (!s.tree.green) {
            s.state = 'FALSE_START';
            s.tree.red = true;
            setDragState('FALSE_START');
            setFeedback('FALSE START! RED LIGHT DISQUALIFIED');
            arcadeAudio.playCrash();
          }
        } else if (s.state === 'RACING') {
          shiftUp();
          e.preventDefault();
        }
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyN') {
        activateNos();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;

      const w = canvas.width = canvas.parentElement?.clientWidth || 800;
      const h = canvas.height = canvas.parentElement?.clientHeight || 500;

      // Tree Sequence
      if (s.state === 'COUNTDOWN') {
        s.tree.timer += dt;
        if (s.tree.timer > 0.6 && !s.tree.amber1) {
          s.tree.amber1 = true;
          arcadeAudio.playBeep(false);
        }
        if (s.tree.timer > 1.2 && !s.tree.amber2) {
          s.tree.amber2 = true;
          arcadeAudio.playBeep(false);
        }
        if (s.tree.timer > 1.8 && !s.tree.amber3) {
          s.tree.amber3 = true;
          arcadeAudio.playBeep(false);
        }
        if (s.tree.timer > 2.3 && !s.tree.green) {
          s.tree.green = true;
          s.tree.launchTime = now;
          s.state = 'RACING';
          s.startTime = now;
          setDragState('RACING');
          setFeedback('GREEN! GO GO GO!');
          arcadeAudio.playBeep(true);
        }
      }

      // Racing Physics
      if (s.state === 'RACING') {
        s.elapsedTime = (now - s.startTime) / 1000;
        if (s.reactionTime === 0) {
          s.reactionTime = (now - s.tree.launchTime) / 1000;
        }

        const p = s.player;
        const targetSpeedForGear = gearRatios[p.gear];

        // Acceleration
        let accel = 18 - p.gear * 2.2;
        if (p.nos && p.nosRemaining > 0) {
          accel += 16;
          p.nosRemaining -= dt;
          if (p.nosRemaining <= 0) p.nos = false;
        }

        if (p.speed < targetSpeedForGear) {
          p.speed += accel * dt;
        }

        // RPM calculation
        p.rpm = Math.min(8900, 1800 + (p.speed / targetSpeedForGear) * 6500);
        arcadeAudio.playEngineTone(140 + (p.rpm / 9000) * 320, 0.05);

        // Distance in meters (quarter mile = 402m)
        p.distance += (p.speed * (1000 / 3600)) * dt;

        // Rival AI progression
        const rivalTargetSpeed = 290;
        s.rival.speed = Math.min(rivalTargetSpeed, s.rival.speed + 14 * dt);
        s.rival.distance += (s.rival.speed * (1000 / 3600)) * dt;

        // Finish Line Check
        if (p.distance >= 402) {
          s.state = 'FINISHED';
          const won = p.distance >= s.rival.distance;
          const coins = won ? 15 : 5;
          setDragState('FINISHED');
          setResults({
            playerET: parseFloat(s.elapsedTime.toFixed(3)),
            playerSpeed: Math.floor(p.speed),
            reactionTime: parseFloat(s.reactionTime.toFixed(3)),
            won,
            coinsAwarded: coins,
          });
          onEarnCoins(coins);
          arcadeAudio.playShiftChime();
        }

        setRpm(Math.floor(p.rpm));
        setSpeed(Math.floor(p.speed));
      }

      // RENDER
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Drag strip ground & lanes
      const laneH = h * 0.28;
      const trackY1 = h * 0.25;
      const trackY2 = trackY1 + laneH;

      // Asphalt
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, trackY1, w, laneH * 2);

      // Lane separator
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(0, trackY2);
      ctx.lineTo(w, trackY2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Starting line
      ctx.fillStyle = '#ffffff';
      for (let y = trackY1; y < trackY1 + laneH * 2; y += 16) {
        ctx.fillRect(80, y, 10, 8);
      }

      // Christmas Tree render
      const treeX = 60;
      const treeY = 40;
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(treeX, treeY, 18, 90);

      // Bulbs (Pre-stage, Amber 1, Amber 2, Amber 3, Green, Red)
      const drawBulb = (x: number, y: number, color: string, on: boolean) => {
        ctx.save();
        ctx.fillStyle = on ? color : '#374151';
        if (on) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = color;
        }
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawBulb(treeX + 9, treeY + 12, '#f59e0b', s.tree.amber1);
      drawBulb(treeX + 9, treeY + 30, '#f59e0b', s.tree.amber2);
      drawBulb(treeX + 9, treeY + 48, '#f59e0b', s.tree.amber3);
      drawBulb(treeX + 9, treeY + 66, '#10b981', s.tree.green);
      drawBulb(treeX + 9, treeY + 82, '#ef4444', s.tree.red);

      // Cars rendering (Side view drag racing)
      const playerScreenX = 90 + (s.player.distance / 402) * (w - 220);
      const rivalScreenX = 90 + (s.rival.distance / 402) * (w - 220);

      // Player Car (Lane 2 - Bottom)
      const pCarY = trackY2 + laneH * 0.45;
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f0ff';
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(playerScreenX, pCarY, 75, 26, 4);
      ctx.fill();
      ctx.stroke();

      // Cockpit & wheels
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(playerScreenX + 22, pCarY - 8, 30, 9);
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(playerScreenX + 16, pCarY + 26, 8, 0, Math.PI * 2);
      ctx.arc(playerScreenX + 62, pCarY + 26, 8, 0, Math.PI * 2);
      ctx.fill();

      // NOS flame
      if (s.player.nos) {
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(playerScreenX, pCarY + 12);
        ctx.lineTo(playerScreenX - 35 - Math.random() * 15, pCarY + 13);
        ctx.lineTo(playerScreenX, pCarY + 18);
        ctx.fill();
      }
      ctx.restore();

      // Rival Car (Lane 1 - Top)
      const rCarY = trackY1 + laneH * 0.45;
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ef4444';
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(rivalScreenX, rCarY, 75, 26, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(rivalScreenX + 22, rCarY - 8, 30, 9);
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(rivalScreenX + 16, rCarY + 26, 8, 0, Math.PI * 2);
      ctx.arc(rivalScreenX + 62, rCarY + 26, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Finish Line Marker (402m)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w - 70, trackY1, 10, laneH * 2);

      // Analog Tachometer Overlay at Bottom Right
      const tachX = w - 90;
      const tachY = h - 85;
      const tachR = 55;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(tachX, tachY, tachR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Green sweet spot arc (6800 to 7600 rpm)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(tachX, tachY, tachR - 6, Math.PI * 0.75, Math.PI * 1.05);
      ctx.stroke();

      // Redline arc (7600 to 9000 rpm)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(tachX, tachY, tachR - 6, Math.PI * 1.05, Math.PI * 1.4);
      ctx.stroke();

      // Needle
      const rpmAngle = Math.PI * 0.2 + (s.player.rpm / 9000) * Math.PI * 1.2;
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tachX, tachY);
      ctx.lineTo(tachX + Math.cos(rpmAngle) * (tachR - 10), tachY + Math.sin(rpmAngle) * (tachR - 10));
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${gear} GEAR`, tachX, tachY + 24);
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gearRatios, onEarnCoins]);

  const handleReset = () => {
    const s = stateRef.current;
    s.state = 'STAGING';
    s.player.distance = 0;
    s.player.speed = 0;
    s.player.rpm = 1000;
    s.player.gear = 1;
    s.player.nos = false;
    s.player.nosRemaining = 2.5;
    s.rival.distance = 0;
    s.rival.speed = 0;
    s.tree = { amber1: false, amber2: false, amber3: false, green: false, red: false, timer: 0, launchTime: 0 };
    s.elapsedTime = 0;
    s.reactionTime = 0;
    setDragState('STAGING');
    setGear(1);
    setSpeed(0);
    setNitroAvailable(true);
    setFeedback('READY TO STAGE');
    setResults(null);
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30 select-none shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs sm:text-sm font-mono font-black">
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-300">
          <span>SPEED: <strong className="text-white text-base">{speed} KM/H</strong></span>
          <span className="text-cyan-400">RPM: {rpm}</span>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-200">
          {feedback}
        </div>
      </div>

      {/* Finished Summary Results Screen */}
      {results && (
        <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-center p-6 z-20">
          <h3 className={`text-3xl sm:text-4xl font-black font-game tracking-wider ${results.won ? 'text-amber-400' : 'text-slate-400'}`}>
            {results.won ? 'VICTORY! YOU WON!' : 'RUN COMPLETED'}
          </h3>
          <div className="grid grid-cols-3 gap-4 max-w-md w-full bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 block">ELAPSED TIME</span>
              <strong className="text-white text-lg">{results.playerET}s</strong>
            </div>
            <div>
              <span className="text-slate-400 block">TOP SPEED</span>
              <strong className="text-cyan-400 text-lg">{results.playerSpeed} km/h</strong>
            </div>
            <div>
              <span className="text-slate-400 block">REACTION TIME</span>
              <strong className="text-amber-400 text-lg">{results.reactionTime}s</strong>
            </div>
          </div>
          <p className="text-amber-300 font-bold text-sm">
            🪙 +{results.coinsAwarded} Coins Earned for Garage!
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-95 shadow-lg shadow-amber-500/30 cursor-pointer active:scale-95 transition-all"
          >
            ↻ Race Again
          </button>
        </div>
      )}

      {/* False Start Reset Banner */}
      {dragState === 'FALSE_START' && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 z-20">
          <h3 className="text-3xl font-black font-game text-red-500">FALSE START!</h3>
          <p className="text-slate-300 text-sm">You launched before the green light turned on.</p>
          <button onClick={handleReset} className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Mobile Touch Action Controls */}
      <div className="lg:hidden absolute bottom-4 left-3 right-3 flex items-center justify-between pointer-events-auto">
        {dragState === 'STAGING' ? (
          <button
            type="button"
            onClick={stageCar}
            className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-black text-base shadow-xl active:scale-95"
          >
            STAGE CAR AT START LINE ▶
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={activateNos}
              disabled={!nitroAvailable}
              className={`w-28 py-3 rounded-xl font-bold text-sm shadow-xl active:scale-95 ${nitroAvailable ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}
            >
              NOS BLAST 🚀
            </button>
            <button
              type="button"
              onClick={shiftUp}
              className="flex-1 ml-3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-base shadow-xl active:scale-95"
            >
              SHIFT UP ⬆ ({gear} / 6)
            </button>
          </>
        )}
      </div>

      {/* Desktop Controls Legend */}
      <div className="hidden lg:flex absolute bottom-3 left-4 text-[11px] text-slate-400 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-slate-800 gap-3">
        {dragState === 'STAGING' ? (
          <button onClick={stageCar} className="text-amber-400 font-bold hover:underline">
            Click or Press SPACE / ENTER to Stage Car
          </button>
        ) : (
          <>
            <span><strong className="text-emerald-400">SPACE / W / ▲</strong> Shift Gear (In Green Zone)</span>
            <span><strong className="text-cyan-400">SHIFT / N</strong> Nitrous</span>
            <button onClick={handleReset} className="text-amber-400 hover:underline ml-2">↻ Reset</button>
          </>
        )}
      </div>
    </div>
  );
};
