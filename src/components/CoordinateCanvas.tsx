import React, { useId } from 'react';

/* =============================================================
   Reusable SVG Coordinate Canvas
   Renders Cartesian axes, grid, and tick labels.
   All child content is rendered in math-space coordinates
   via the provided transform functions.
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
}

/** Convert math x → SVG px */
export const toSX = (x: number, c: CanvasConfig) =>
  ((x - c.xMin) / (c.xMax - c.xMin)) * c.width;

/** Convert math y → SVG px (flipped) */
export const toSY = (y: number, c: CanvasConfig) =>
  c.height - ((y - c.yMin) / (c.yMax - c.yMin)) * c.height;

export const CoordinateCanvas: React.FC<CoordinateCanvasProps> = ({
  config: c,
  children,
  className = '',
}) => {
  // Unique ID per instance so multiple canvases don't share defs
  const uid = useId().replace(/:/g, '');
  const gridId = `canvas-grid-${uid}`;

  const axisY = toSY(0, c);
  const axisX = toSX(0, c);

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
    </svg>
  );
};

export default CoordinateCanvas;
