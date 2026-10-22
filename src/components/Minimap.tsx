import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Compass, Navigation, EyeOff, ZoomIn, ZoomOut, ArrowLeftRight } from 'lucide-react';
import { TrackEnvironment } from '../types/game';

export interface MinimapTrafficItem {
  id: number;
  x: number; // lane offset: -1 (left) to 1 (right)
  z: number; // distance ahead in meters
  type?: string;
  color?: string;
  damaged?: boolean;
}

export interface MinimapCollectibleItem {
  id: number;
  x: number;
  z: number;
  type: 'coin' | 'nitro' | 'star';
  collected?: boolean;
}

export interface MinimapObstacleItem {
  id: number;
  x: number;
  z: number;
  type: string;
  hit?: boolean;
}

export interface MinimapProps {
  playerX: number; // -1.15 to 1.15
  playerSpeed: number; // km/h
  distance: number; // meters driven
  roadCurve: number; // -1.5 to 1.5
  carColor?: string;
  accentColor?: string;
  trackEnvironment?: TrackEnvironment;
  traffic?: MinimapTrafficItem[];
  collectibles?: MinimapCollectibleItem[];
  obstacles?: MinimapObstacleItem[];
  ghostZ?: number | null; // distance ahead or behind player in meters
  ghostX?: number | null;
  isNitroActive?: boolean;
  corner?: 'top-right' | 'top-left';
  onToggleCorner?: () => void;
  className?: string;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerX,
  playerSpeed,
  distance,
  roadCurve,
  carColor = '#ef4444',
  accentColor = '#38bdf8',
  trackEnvironment = 'day',
  traffic = [],
  collectibles = [],
  obstacles = [],
  ghostZ = null,
  ghostX = null,
  isNitroActive = false,
  corner = 'top-right',
  onToggleCorner,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'normal' | 'wide'>('normal');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Radar sweep animation angle
  const sweepAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Maximum forward radar view distance based on zoom level
  const radarRange = zoomLevel === 'normal' ? 240 : 420;

  // Sector / Lap loop calculation (track repeats circuit milestone every 2,000m)
  const circuitLength = 2000;
  const loopProgress = (distance % circuitLength) / circuitLength;
  const currentSector = Math.floor(distance / circuitLength) + 1;

  // Turn advisory
  const turnDirection = useMemo(() => {
    if (roadCurve > 0.45) return 'RIGHT';
    if (roadCurve < -0.45) return 'LEFT';
    return 'STRAIGHT';
  }, [roadCurve]);

  // Track environment colors
  const envTheme = useMemo(() => {
    switch (trackEnvironment) {
      case 'night':
        return {
          glow: 'rgba(56, 189, 248, 0.45)',
          border: 'border-cyan-500/60',
          asphalt: '#0f172a',
          grid: 'rgba(56, 189, 248, 0.16)',
          accent: '#38bdf8',
        };
      case 'sunset':
        return {
          glow: 'rgba(249, 115, 22, 0.45)',
          border: 'border-amber-500/60',
          asphalt: '#1c1917',
          grid: 'rgba(249, 115, 22, 0.16)',
          accent: '#f97316',
        };
      case 'rain':
        return {
          glow: 'rgba(99, 102, 241, 0.45)',
          border: 'border-indigo-500/60',
          asphalt: '#0b1120',
          grid: 'rgba(99, 102, 241, 0.18)',
          accent: '#818cf8',
        };
      case 'day':
      default:
        return {
          glow: 'rgba(16, 185, 129, 0.45)',
          border: 'border-emerald-500/60',
          asphalt: '#1e293b',
          grid: 'rgba(16, 185, 129, 0.16)',
          accent: '#10b981',
        };
    }
  }, [trackEnvironment]);

  // Render loop for the circular minimap canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMinimized) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = width / 2 - 4; // leave margin for bezel

      // Advance radar sweep angle (spins faster during high speed or nitro)
      const sweepSpeed = 0.03 + (playerSpeed / 240) * 0.05 + (isNitroActive ? 0.06 : 0);
      sweepAngleRef.current = (sweepAngleRef.current + sweepSpeed) % (Math.PI * 2);

      ctx.clearRect(0, 0, width, height);

      // 1. CIRCULAR CLIPPING REGION
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // 2. RADAR SCOPE BACKGROUND
      const bgGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
      bgGrad.addColorStop(0, '#090e1a');
      bgGrad.addColorStop(0.7, '#050912');
      bgGrad.addColorStop(1, '#020408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. TACTICAL RADAR RANGE RINGS & CROSSHAIRS
      ctx.lineWidth = 1;
      ctx.strokeStyle = envTheme.grid;

      // Range circles (50m, 100m, 180m equivalents)
      [0.32, 0.62, 0.92].forEach((ratio) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * ratio, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Axis crosshairs
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();

      // 4. ROTATING RADAR SWEEP CONE
      const sweepGrad = ctx.createConicGradient(
        sweepAngleRef.current,
        cx,
        cy
      );
      sweepGrad.addColorStop(0, isNitroActive ? 'rgba(56, 189, 248, 0.32)' : 'rgba(56, 189, 248, 0.18)');
      sweepGrad.addColorStop(0.12, 'rgba(56, 189, 248, 0)');
      sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 5. PROJECTED DYNAMIC RACE TRACK ROAD
      // The road begins at the bottom of the radar and projects forward through upcoming curves
      const playerRadarY = cy + radius * 0.48; // Player y on radar
      const roadAheadY = cy - radius * 0.85;  // Horizon y on radar
      const roadSpanY = playerRadarY - roadAheadY;

      // Road width at bottom and top
      const roadWBottom = radius * 0.68;
      const roadWTop = radius * 0.42;

      // Road center line points curving dynamically with roadCurve
      const curveStrength = roadCurve * radius * 0.45;
      const steps = 24;
      const leftEdges: Array<{ x: number; y: number }> = [];
      const rightEdges: Array<{ x: number; y: number }> = [];
      const centerPoints: Array<{ x: number; y: number; w: number }> = [];

      for (let i = 0; i <= steps; i++) {
        const t = i / steps; // 0 at player (bottom), 1 at horizon (top)
        const y = playerRadarY - t * roadSpanY;
        const w = roadWBottom + (roadWTop - roadWBottom) * t;

        // Curve bending upward: quadratic shift
        const curveOffset = Math.pow(t, 1.45) * curveStrength;
        const x = cx + curveOffset;

        centerPoints.push({ x, y, w });
        leftEdges.push({ x: x - w / 2, y });
        rightEdges.push({ x: x + w / 2, y });
      }

      // Draw asphalt road ribbon
      ctx.beginPath();
      ctx.moveTo(leftEdges[0].x, leftEdges[0].y);
      for (let i = 1; i < leftEdges.length; i++) {
        ctx.lineTo(leftEdges[i].x, leftEdges[i].y);
      }
      for (let i = rightEdges.length - 1; i >= 0; i--) {
        ctx.lineTo(rightEdges[i].x, rightEdges[i].y);
      }
      ctx.closePath();

      const roadGrad = ctx.createLinearGradient(0, playerRadarY, 0, roadAheadY);
      roadGrad.addColorStop(0, '#1e293b');
      roadGrad.addColorStop(0.5, envTheme.asphalt);
      roadGrad.addColorStop(1, '#0b0f19');
      ctx.fillStyle = roadGrad;
      ctx.fill();

      // Road border edges (rumble strips / curbs)
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#f8fafc';
      ctx.beginPath();
      for (let i = 0; i < leftEdges.length; i++) {
        if (i === 0) ctx.moveTo(leftEdges[i].x, leftEdges[i].y);
        else ctx.lineTo(leftEdges[i].x, leftEdges[i].y);
      }
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i < rightEdges.length; i++) {
        if (i === 0) ctx.moveTo(rightEdges[i].x, rightEdges[i].y);
        else ctx.lineTo(rightEdges[i].x, rightEdges[i].y);
      }
      ctx.stroke();

      // Dashed lane divider lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.4)';
      ctx.setLineDash([3, 4]);

      [-0.33, 0.33].forEach((laneMult) => {
        ctx.beginPath();
        for (let i = 0; i < centerPoints.length; i++) {
          const pt = centerPoints[i];
          const lx = pt.x + (pt.w / 2) * laneMult;
          if (i === 0) ctx.moveTo(lx, pt.y);
          else ctx.lineTo(lx, pt.y);
        }
        ctx.stroke();
      });
      ctx.setLineDash([]); // reset dash

      // Helper to compute (x, y) coordinates on the minimap for any world (wx, wz)
      const projectToMinimap = (wx: number, wz: number) => {
        const normZ = Math.max(0, Math.min(1, wz / radarRange));
        const y = playerRadarY - normZ * roadSpanY;
        const w = roadWBottom + (roadWTop - roadWBottom) * normZ;
        const curveOffset = Math.pow(normZ, 1.45) * curveStrength;
        const midX = cx + curveOffset;
        const x = midX + (wx * (w * 0.44));
        return { x, y, normZ };
      };

      // 6. COLLECTIBLES & OBSTACLES BLIPS
      collectibles.forEach((c) => {
        if (c.collected || c.z <= 0 || c.z > radarRange) return;
        const pt = projectToMinimap(c.x, c.z);

        if (c.type === 'coin') {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (c.type === 'nitro') {
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      obstacles.forEach((o) => {
        if (o.hit || o.z <= 0 || o.z > radarRange) return;
        const pt = projectToMinimap(o.x, o.z);

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y - 3);
        ctx.lineTo(pt.x + 2.5, pt.y + 2.5);
        ctx.lineTo(pt.x - 2.5, pt.y + 2.5);
        ctx.closePath();
        ctx.fill();
      });

      // 7. GHOST CAR BLIP (Translucent Cyan Diamond)
      if (ghostZ !== null && ghostZ >= -20 && ghostZ <= radarRange) {
        const ghostPt = projectToMinimap(ghostX ?? 0, Math.max(0, ghostZ));
        ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(ghostPt.x, ghostPt.y - 4);
        ctx.lineTo(ghostPt.x + 3.5, ghostPt.y);
        ctx.lineTo(ghostPt.x, ghostPt.y + 4);
        ctx.lineTo(ghostPt.x - 3.5, ghostPt.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 8. TRAFFIC VEHICLES BLIPS
      traffic.forEach((tCar) => {
        if (tCar.z < -10 || tCar.z > radarRange) return;
        const pt = projectToMinimap(tCar.x, tCar.z);

        // Traffic vehicle indicator
        ctx.save();
        ctx.translate(pt.x, pt.y);

        // Vehicle dot / chevron
        const vColor = tCar.damaged ? '#94a3b8' : (tCar.color || '#f43f5e');
        ctx.fillStyle = vColor;
        ctx.shadowColor = tCar.damaged ? '#64748b' : '#ef4444';
        ctx.shadowBlur = 5;

        // Draw small rounded rectangular car representation
        ctx.beginPath();
        ctx.roundRect(-2.8, -4, 5.6, 8, 1.5);
        ctx.fill();

        // Forward headlights dots
        ctx.fillStyle = '#fef08a';
        ctx.shadowBlur = 0;
        ctx.fillRect(-2.2, -4.2, 1.4, 1);
        ctx.fillRect(0.8, -4.2, 1.4, 1);

        ctx.restore();
      });

      // 9. PLAYER VEHICLE MARKER
      const playerPos = projectToMinimap(playerX, 0);

      ctx.save();
      ctx.translate(playerPos.x, playerPos.y);

      // Player forward headlight illumination cone on minimap
      const coneGrad = ctx.createRadialGradient(0, -2, 2, 0, -18, 22);
      coneGrad.addColorStop(0, isNitroActive ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.35)');
      coneGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(-12, -28);
      ctx.lineTo(12, -28);
      ctx.closePath();
      ctx.fill();

      // Player car halo / glow
      ctx.shadowColor = isNitroActive ? '#38bdf8' : accentColor;
      ctx.shadowBlur = isNitroActive ? 12 : 8;

      // Aerodynamic player triangle/arrow
      ctx.fillStyle = isNitroActive ? '#38bdf8' : (carColor || '#ef4444');
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      ctx.moveTo(0, -6.5);     // nose
      ctx.lineTo(4.8, 4.5);    // right wing
      ctx.lineTo(0, 2.5);      // inner tail
      ctx.lineTo(-4.8, 4.5);   // left wing
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center cockpit beacon
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -1, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 10. NORTH CARDINAL COMPASS TICK INSIDE RADAR
      ctx.restore(); // Exit circular clip

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    playerX,
    playerSpeed,
    roadCurve,
    radarRange,
    isNitroActive,
    carColor,
    accentColor,
    trackEnvironment,
    traffic,
    collectibles,
    obstacles,
    ghostZ,
    ghostX,
    isMinimized,
    envTheme,
  ]);

  return (
    <div
      className={`relative select-none pointer-events-auto transition-all duration-200 ${className}`}
      aria-label="Track Minimap and Radar"
    >
      {/* MINIMAP CONTAINER */}
      <div
        className={`relative rounded-full p-1 bg-slate-950/85 backdrop-blur-md border ${
          isNitroActive ? 'border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.6)]' : 'border-slate-700/80 shadow-2xl'
        } transition-all duration-300 flex items-center justify-center`}
      >
        {/* CIRCULAR TRACK PROGRESS RING (SVG OVERLAY) */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 136 136"
        >
          {/* Subtle outer tick ring */}
          <circle
            cx="68"
            cy="68"
            r="64"
            className="stroke-slate-800/80"
            strokeWidth="2"
            fill="none"
          />

          {/* Circuit Lap / Distance Progress Arc */}
          <circle
            cx="68"
            cy="68"
            r="64"
            stroke={isNitroActive ? '#38bdf8' : envTheme.accent}
            strokeWidth="3.2"
            strokeDasharray={2 * Math.PI * 64}
            strokeDashoffset={(2 * Math.PI * 64) * (1 - loopProgress)}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-150 ease-out"
            style={{
              filter: `drop-shadow(0 0 4px ${isNitroActive ? '#38bdf8' : envTheme.accent})`,
            }}
          />

          {/* Cardinal Ticks at 0, 90, 180, 270 */}
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 68 + Math.cos(rad) * 62;
            const y1 = 68 + Math.sin(rad) * 62;
            const x2 = 68 + Math.cos(rad) * 66;
            const y2 = 68 + Math.sin(rad) * 66;
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={deg === 0 ? '#fbbf24' : '#64748b'}
                strokeWidth={deg === 0 ? '2' : '1.2'}
              />
            );
          })}
        </svg>

        {/* NORTH BADGE AT TOP */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 px-1 py-0.2 rounded bg-slate-900 border border-slate-700/80 text-[8px] font-mono font-black text-amber-400 leading-none shadow-sm flex items-center gap-0.5">
          <Navigation className="w-2 h-2 fill-amber-400 rotate-180" />
          <span>N</span>
        </div>

        {/* RADAR CANVAS */}
        {!isMinimized ? (
          <canvas
            ref={canvasRef}
            width={124}
            height={124}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full block cursor-pointer"
            onClick={() => setZoomLevel((z) => (z === 'normal' ? 'wide' : 'normal'))}
            title="Click to toggle radar zoom (Normal / Wide)"
          />
        ) : (
          <div
            onClick={() => setIsMinimized(false)}
            className="w-12 h-12 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900 transition-colors"
            title="Expand Minimap"
          >
            <Compass className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="text-[8px] font-mono text-slate-300 font-bold">MAP</span>
          </div>
        )}

        {/* QUICK CONTROL ICONS (Zoom & Collapse) */}
        {!isMinimized && (
          <div className="absolute -bottom-1 flex items-center gap-1 z-10">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => (z === 'normal' ? 'wide' : 'normal'))}
              className="px-1.5 py-0.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-[8px] font-mono font-bold text-slate-300 border border-slate-700/80 shadow-md flex items-center gap-0.5 cursor-pointer transition-all active:scale-95"
              title={`Zoom: ${zoomLevel.toUpperCase()} (Click to change)`}
              aria-label="Toggle Minimap Zoom"
            >
              {zoomLevel === 'normal' ? <ZoomIn className="w-2 h-2 text-cyan-400" /> : <ZoomOut className="w-2 h-2 text-cyan-400" />}
              <span>{zoomLevel === 'normal' ? '1X' : '2X'}</span>
            </button>

            {onToggleCorner && (
              <button
                type="button"
                onClick={onToggleCorner}
                className="p-1 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-700/80 shadow-md cursor-pointer transition-all active:scale-95"
                title={`Switch Corner (Currently ${corner === 'top-right' ? 'Right' : 'Left'})`}
                aria-label="Switch Minimap Corner"
              >
                <ArrowLeftRight className="w-2 h-2" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 shadow-md cursor-pointer transition-all active:scale-95"
              title="Minimize Minimap"
              aria-label="Minimize Minimap"
            >
              <EyeOff className="w-2 h-2" />
            </button>
          </div>
        )}
      </div>

      {/* COMPACT DISTANCE & TURN ADVISORY FOOTER */}
      {!isMinimized && (
        <div className="mt-1 flex flex-col items-center gap-0.5 pointer-events-none">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-950/80 border border-slate-800/80 text-[9px] font-mono font-bold text-slate-300 backdrop-blur-xs shadow-md">
            <span className="text-slate-500">SEC {currentSector}</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-300 tabular-nums">
              {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(2)}km`}
            </span>
          </div>

          {turnDirection !== 'STRAIGHT' && (
            <div
              className={`px-1.5 py-0.2 rounded text-[8px] font-game font-bold tracking-wider animate-pulse flex items-center gap-0.5 ${
                turnDirection === 'LEFT'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              <span>{turnDirection === 'LEFT' ? '◄ TURN LEFT' : 'TURN RIGHT ►'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
