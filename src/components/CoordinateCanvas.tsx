import React, { useId, useState, useCallback } from 'react';

/* =============================================================
   Reusable SVG Coordinate Canvas — Enhanced
   Renders Cartesian axes, grid, and tick labels.
   All child content is rendered in math-space coordinates
   via the provided transform functions.
   
   ENHANCEMENTS:
   - Hover crosshair showing (x, y) coordinates
   - Smooth mouse tracking
   - Interactive cursor indicator
   ============================================================= */

export interface CanvasConfig {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width: number;
  height: number;
}

interface CoordinateCanvasProps {
  config: CanvasConfig;
  children: React.ReactNode;
  className?: string;
  /** Optional function to evaluate y = f(x) for hover coordinate display */
  evalFn?: (x: number) => number;
  /** Disable hover crosshair */
  noHover?: boolean;
}

/** Convert math x → SVG px */
export const toSX = (x: number, c: CanvasConfig) =>
  ((x - c.xMin) / (c.xMax - c.xMin)) * c.width;

/** Convert math y → SVG px (flipped) */
export const toSY = (y: number, c: CanvasConfig) =>
  c.height - ((y - c.yMin) / (c.yMax - c.yMin)) * c.height;

/** Convert SVG px → math x */
export const fromSX = (sx: number, c: CanvasConfig) =>
  c.xMin + (sx / c.width) * (c.xMax - c.xMin);

/** Convert SVG px → math y */
export const fromSY = (sy: number, c: CanvasConfig) =>
  c.yMax - (sy / c.height) * (c.yMax - c.yMin);

export const CoordinateCanvas: React.FC<CoordinateCanvasProps> = ({
  config: c,
  children,
  className = '',
  evalFn,
  noHover = false,
}) => {
  // Unique ID per instance so multiple canvases don't share defs
  const uid = useId().replace(/:/g, '');
  const gridId = `canvas-grid-${uid}`;

  const axisY = toSY(0, c);
  const axisX = toSX(0, c);

  // Hover state for crosshair
  const [hover, setHover] = useState<{ sx: number; sy: number; mx: number; my: number; fy: number | null } | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (noHover) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratioX = c.width / rect.width;
      const ratioY = c.height / rect.height;
      const sx = (e.clientX - rect.left) * ratioX;
      const sy = (e.clientY - rect.top) * ratioY;
      const mx = fromSX(sx, c);
      const my = fromSY(sy, c);
      let fy: number | null = null;
      if (evalFn) {
        const val = evalFn(mx);
        if (isFinite(val)) fy = val;
      }
      setHover({ sx, sy, mx, my, fy });
    },
    [c, evalFn, noHover]
  );

  const handleMouseLeave = useCallback(() => {
    setHover(null);
  }, []);

  // Generate integer tick marks
  const xTicks: number[] = [];
  for (let i = Math.ceil(c.xMin); i <= Math.floor(c.xMax); i++) {
    if (i !== 0) xTicks.push(i);
  }
  const yTicks: number[] = [];
  for (let i = Math.ceil(c.yMin); i <= Math.floor(c.yMax); i++) {
    if (i !== 0) yTicks.push(i);
  }

  return (
    <svg
      viewBox={`0 0 ${c.width} ${c.height}`}
      className={`svg-canvas ${className}`}
      preserveAspectRatio="xMidYMid meet"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: noHover ? undefined : 'crosshair' }}
    >
      {/* Grid pattern — unique ID prevents conflicts between multiple instances */}
      <defs>
        <pattern
          id={gridId}
          width={c.width / (c.xMax - c.xMin)}
          height={c.height / (c.yMax - c.yMin)}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${c.width / (c.xMax - c.xMin)} 0 L 0 0 0 ${c.height / (c.yMax - c.yMin)}`}
            fill="none"
            stroke="rgba(99,130,202,0.07)"
            strokeWidth="0.8"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${gridId})`} />

      {/* Axes */}
      <line x1={0} y1={axisY} x2={c.width} y2={axisY} stroke="#334155" strokeWidth="1.2" />
      <line x1={axisX} y1={0} x2={axisX} y2={c.height} stroke="#334155" strokeWidth="1.2" />

      {/* X-axis ticks & labels */}
      {xTicks.map((t) => (
        <g key={`xt-${t}`}>
          <line
            x1={toSX(t, c)} y1={axisY - 4}
            x2={toSX(t, c)} y2={axisY + 4}
            stroke="#475569" strokeWidth="1"
          />
          <text
            x={toSX(t, c)} y={axisY + 16}
            textAnchor="middle" fill="#5a6d96"
            fontSize="10" fontFamily="'Inter', sans-serif"
          >
            {t}
          </text>
        </g>
      ))}

      {/* Y-axis ticks & labels */}
      {yTicks.map((t) => (
        <g key={`yt-${t}`}>
          <line
            x1={axisX - 4} y1={toSY(t, c)}
            x2={axisX + 4} y2={toSY(t, c)}
            stroke="#475569" strokeWidth="1"
          />
          <text
            x={axisX - 10} y={toSY(t, c) + 4}
            textAnchor="end" fill="#5a6d96"
            fontSize="10" fontFamily="'Inter', sans-serif"
          >
            {t}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={c.width - 14} y={axisY - 8} fill="#5a6d96" fontSize="12" fontStyle="italic" fontFamily="'Inter', sans-serif">x</text>
      <text x={axisX + 8} y={14} fill="#5a6d96" fontSize="12" fontStyle="italic" fontFamily="'Inter', sans-serif">y</text>

      {/* Children (curves, points, lines, etc.) */}
      {children}

      {/* ── Hover Crosshair & Tooltip ── */}
      {hover && !noHover && (
        <g className="canvas-hover-group" pointerEvents="none">
          {/* Vertical crosshair line */}
          <line
            x1={hover.sx} y1={0}
            x2={hover.sx} y2={c.height}
            stroke="rgba(226, 232, 240, 0.15)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          {/* Horizontal crosshair line */}
          <line
            x1={0} y1={hover.sy}
            x2={c.width} y2={hover.sy}
            stroke="rgba(226, 232, 240, 0.15)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* If evalFn is provided, show point on curve */}
          {hover.fy !== null && (
            <>
              {/* Vertical line from x-axis to curve point */}
              <line
                x1={hover.sx} y1={toSY(0, c)}
                x2={hover.sx} y2={toSY(hover.fy, c)}
                stroke="rgba(251, 191, 36, 0.3)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Point on curve */}
              <circle
                cx={hover.sx}
                cy={toSY(hover.fy, c)}
                r="4"
                fill="#fbbf24"
                opacity="0.8"
              />
              <circle
                cx={hover.sx}
                cy={toSY(hover.fy, c)}
                r="8"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1"
                opacity="0.3"
              />
            </>
          )}

          {/* Coordinate tooltip background */}
          <rect
            x={Math.min(hover.sx + 10, c.width - 135)}
            y={Math.max(hover.sy - 44, 4)}
            width={hover.fy !== null ? 130 : 105}
            height={hover.fy !== null ? 38 : 24}
            rx="6"
            fill="rgba(13, 23, 48, 0.92)"
            stroke="rgba(99, 130, 202, 0.25)"
            strokeWidth="1"
          />
          {/* Coordinate text */}
          <text
            x={Math.min(hover.sx + 16, c.width - 129)}
            y={Math.max(hover.sy - 28, 18)}
            fill="#e8ecf4"
            fontSize="10"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="500"
          >
            x = {hover.mx.toFixed(2)}, y = {hover.my.toFixed(2)}
          </text>
          {/* f(x) value if available */}
          {hover.fy !== null && (
            <text
              x={Math.min(hover.sx + 16, c.width - 129)}
              y={Math.max(hover.sy - 14, 32)}
              fill="#fbbf24"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="600"
            >
              f(x) = {hover.fy.toFixed(4)}
            </text>
          )}
        </g>
      )}
    </svg>
  );
};

export default CoordinateCanvas;
