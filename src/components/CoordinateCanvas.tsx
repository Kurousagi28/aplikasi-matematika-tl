import React, { useId, useState, useCallback } from 'react';

/* =============================================================
   Reusable SVG Coordinate Canvas — Modern & Interactive
   
   FITUR & DESAIN PREMIUM:
   - Dual Grid System: Major grid + Minor sub-grid dengan kontras rapi
   - Glowing Cartesian Axes dengan panah arah sumbu (X & Y)
   - Origin Marker (0,0) yang jelas dan estetik
   - Interactive Toolbar: Zoom In (+), Zoom Out (-), Reset (⟲), 
     Toggle Kerapatan Grid (🌐), Toggle Crosshair (🎯)
   - Real-time Cursor Crosshair dengan proyeksi nilai pada sumbu
   - Floating Math Inspector Badge dengan styling monospace modern
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
  /** Optional title for the canvas header bar */
  title?: string;
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
  title = 'Bidang Koordinat Kartesius',
}) => {
  // Unique ID per instance so multiple canvases don't share defs
  const uid = useId().replace(/:/g, '');

  // Interactive controls state
  const [zoom, setZoom] = useState(1);
  const [showCrosshair, setShowCrosshair] = useState(!noHover);
  const [denseGrid, setDenseGrid] = useState(true);

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(2.2, parseFloat((z + 0.2).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, parseFloat((z - 0.2).toFixed(2))));
  const handleResetZoom = () => setZoom(1);

  // Dynamic ViewBox based on zoom level
  const viewBoxW = c.width / zoom;
  const viewBoxH = c.height / zoom;
  const viewBoxX = (c.width - viewBoxW) / 2;
  const viewBoxY = (c.height - viewBoxH) / 2;

  const axisY = toSY(0, c);
  const axisX = toSX(0, c);

  // Hover state for crosshair
  const [hover, setHover] = useState<{
    sx: number;
    sy: number;
    mx: number;
    my: number;
    fy: number | null;
  } | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (noHover || !showCrosshair) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width;
      const normY = (e.clientY - rect.top) / rect.height;

      // Transform through active viewBox
      const sx = viewBoxX + normX * viewBoxW;
      const sy = viewBoxY + normY * viewBoxH;
      const mx = fromSX(sx, c);
      const my = fromSY(sy, c);

      let fy: number | null = null;
      if (evalFn) {
        try {
          const val = evalFn(mx);
          if (isFinite(val)) fy = val;
        } catch {
          fy = null;
        }
      }
      setHover({ sx, sy, mx, my, fy });
    },
    [c, evalFn, noHover, showCrosshair, viewBoxX, viewBoxY, viewBoxW, viewBoxH]
  );

  const handleMouseLeave = useCallback(() => {
    setHover(null);
  }, []);

  // Grid step calculations
  const spanX = c.xMax - c.xMin;
  const spanY = c.yMax - c.yMin;
  const majorGridW = c.width / spanX;
  const majorGridH = c.height / spanY;

  // Generate integer tick marks
  const xTicks: number[] = [];
  for (let i = Math.ceil(c.xMin); i <= Math.floor(c.xMax); i++) {
    if (Math.abs(i) > 0.001) xTicks.push(i);
  }
  const yTicks: number[] = [];
  for (let i = Math.ceil(c.yMin); i <= Math.floor(c.yMax); i++) {
    if (Math.abs(i) > 0.001) yTicks.push(i);
  }

  // Tooltip positioning helper
  const tooltipW = hover?.fy !== null ? 140 : 116;
  const tooltipH = hover?.fy !== null ? 42 : 26;
  const tooltipX = hover ? Math.min(hover.sx + 14, c.width - tooltipW - 8) : 0;
  const tooltipY = hover ? (hover.sy - tooltipH - 10 < 8 ? hover.sy + 16 : hover.sy - tooltipH - 10) : 0;

  return (
    <div className={`canvas-container-root ${className}`}>
      {/* ── Top Control Bar ── */}
      <div className="canvas-header-bar">
        <div className="canvas-header-title">
          <span className="canvas-header-icon">📐</span>
          <span>{title}</span>
        </div>
        <div className="canvas-controls-group">
          <button
            type="button"
            className={`canvas-ctrl-btn ${showCrosshair ? 'active' : ''}`}
            onClick={() => setShowCrosshair(!showCrosshair)}
            title={showCrosshair ? 'Sembunyikan Crosshair' : 'Tampilkan Crosshair'}
          >
            🎯
          </button>
          <button
            type="button"
            className={`canvas-ctrl-btn ${denseGrid ? 'active' : ''}`}
            onClick={() => setDenseGrid(!denseGrid)}
            title={denseGrid ? 'Grid Renggang' : 'Grid Rapat'}
          >
            🌐
          </button>
          <button
            type="button"
            className="canvas-ctrl-btn"
            onClick={handleZoomIn}
            title="Perbesar Tampilan (+)"
            disabled={zoom >= 2.2}
          >
            +
          </button>
          <button
            type="button"
            className="canvas-ctrl-btn"
            onClick={handleZoomOut}
            title="Perkecil Tampilan (−)"
            disabled={zoom <= 0.6}
          >
            −
          </button>
          {zoom !== 1 && (
            <button
              type="button"
              className="canvas-ctrl-btn canvas-ctrl-reset"
              onClick={handleResetZoom}
              title="Reset Skala Tampilan"
            >
              ⟲ {Math.round(zoom * 100)}%
            </button>
          )}
        </div>
      </div>

      {/* ── SVG Canvas ── */}
      <svg
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`}
        className="svg-canvas"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: noHover || !showCrosshair ? undefined : 'crosshair' }}
      >
        <defs>
          {/* Radial space glow gradient for canvas background */}
          <radialGradient id={`canvas-bg-${uid}`} cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0b1531" />
            <stop offset="60%" stopColor="#070e23" />
            <stop offset="100%" stopColor="#040815" />
          </radialGradient>

          {/* Minor Grid Pattern */}
          <pattern
            id={`canvas-minor-grid-${uid}`}
            width={majorGridW / 2}
            height={majorGridH / 2}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${majorGridW / 2} 0 L 0 0 0 ${majorGridH / 2}`}
              fill="none"
              stroke="rgba(99, 130, 202, 0.05)"
              strokeWidth="0.6"
              strokeDasharray="2 2"
            />
          </pattern>

          {/* Major Grid Pattern */}
          <pattern
            id={`canvas-major-grid-${uid}`}
            width={majorGridW}
            height={majorGridH}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${majorGridW} 0 L 0 0 0 ${majorGridH}`}
              fill="none"
              stroke="rgba(99, 130, 202, 0.14)"
              strokeWidth="0.8"
            />
          </pattern>

          {/* Directional Arrowheads for axes */}
          <marker
            id={`arrow-x-${uid}`}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <polygon points="0 1.5, 7 4, 0 6.5" fill="#38bdf8" fillOpacity="0.85" />
          </marker>
          <marker
            id={`arrow-y-${uid}`}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <polygon points="0 1.5, 7 4, 0 6.5" fill="#38bdf8" fillOpacity="0.85" />
          </marker>
        </defs>

        {/* 1. Deep Space Radial Background */}
        <rect width="100%" height="100%" fill={`url(#canvas-bg-${uid})`} />

        {/* 2. Minor Sub-grid */}
        {denseGrid && (
          <rect width="100%" height="100%" fill={`url(#canvas-minor-grid-${uid})`} />
        )}

        {/* 3. Major Grid */}
        <rect width="100%" height="100%" fill={`url(#canvas-major-grid-${uid})`} />

        {/* 4. Cartesian Axes with arrows */}
        {/* Sumbu Y */}
        <line
          x1={axisX}
          y1={c.height}
          x2={axisX}
          y2={12}
          stroke="#38bdf8"
          strokeWidth="1.3"
          strokeOpacity="0.7"
          markerEnd={`url(#arrow-y-${uid})`}
        />
        {/* Sumbu X */}
        <line
          x1={0}
          y1={axisY}
          x2={c.width - 12}
          y2={axisY}
          stroke="#38bdf8"
          strokeWidth="1.3"
          strokeOpacity="0.7"
          markerEnd={`url(#arrow-x-${uid})`}
        />

        {/* 5. Origin Point (0,0) */}
        <circle cx={axisX} cy={axisY} r="5" fill="#38bdf8" fillOpacity="0.2" />
        <circle cx={axisX} cy={axisY} r="2.2" fill="#38bdf8" />
        <text
          x={axisX - 8}
          y={axisY + 14}
          textAnchor="end"
          fill="#64748b"
          fontSize="10"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="600"
        >
          0
        </text>

        {/* 6. X-axis Ticks & Number Labels */}
        {xTicks.map((t) => {
          const sx = toSX(t, c);
          return (
            <g key={`xt-${t}`}>
              <line
                x1={sx}
                y1={axisY - 4}
                x2={sx}
                y2={axisY + 4}
                stroke="#64748b"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <text
                x={sx}
                y={axisY + 15}
                textAnchor="middle"
                fill="#8b9cc7"
                fontSize="9.5"
                fontFamily="'JetBrains Mono', 'Inter', monospace"
                fontWeight="500"
              >
                {t}
              </text>
            </g>
          );
        })}

        {/* 7. Y-axis Ticks & Number Labels */}
        {yTicks.map((t) => {
          const sy = toSY(t, c);
          return (
            <g key={`yt-${t}`}>
              <line
                x1={axisX - 4}
                y1={sy}
                x2={axisX + 4}
                y2={sy}
                stroke="#64748b"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <text
                x={axisX - 8}
                y={sy + 3.5}
                textAnchor="end"
                fill="#8b9cc7"
                fontSize="9.5"
                fontFamily="'JetBrains Mono', 'Inter', monospace"
                fontWeight="500"
              >
                {t}
              </text>
            </g>
          );
        })}

        {/* 8. Axis Variable Badges */}
        {/* Y-axis Label Badge */}
        <g transform={`translate(${Math.max(6, Math.min(axisX + 8, c.width - 24))}, 6)`}>
          <rect
            width="16"
            height="16"
            rx="4"
            fill="rgba(14, 165, 233, 0.15)"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="0.8"
          />
          <text
            x="8"
            y="12"
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="10"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="700"
          >
            y
          </text>
        </g>

        {/* X-axis Label Badge */}
        <g transform={`translate(${c.width - 24}, ${Math.max(6, Math.min(axisY - 20, c.height - 24))})`}>
          <rect
            width="16"
            height="16"
            rx="4"
            fill="rgba(14, 165, 233, 0.15)"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="0.8"
          />
          <text
            x="8"
            y="12"
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="10"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="700"
          >
            x
          </text>
        </g>

        {/* 9. Children (Module Curves, Lines, Riemann Rects, Probes) */}
        {children}

        {/* 10. Interactive Crosshair & Tooltip Overlay */}
        {hover && showCrosshair && !noHover && (
          <g className="canvas-hover-group" pointerEvents="none">
            {/* Crosshair Lines */}
            <line
              x1={hover.sx}
              y1={0}
              x2={hover.sx}
              y2={c.height}
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1={0}
              y1={hover.sy}
              x2={c.width}
              y2={hover.sy}
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Projection indicator on X Axis */}
            <g transform={`translate(${hover.sx}, ${Math.max(14, Math.min(axisY, c.height - 18))})`}>
              <rect
                x="-24"
                y="-9"
                width="48"
                height="18"
                rx="4"
                fill="rgba(11, 23, 52, 0.95)"
                stroke="rgba(56, 189, 248, 0.45)"
                strokeWidth="0.8"
              />
              <text
                y="3.5"
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="9"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="600"
              >
                x={hover.mx.toFixed(2)}
              </text>
            </g>

            {/* Projection indicator on Y Axis */}
            <g transform={`translate(${Math.max(28, Math.min(axisX, c.width - 28))}, ${hover.sy})`}>
              <rect
                x="-26"
                y="-9"
                width="52"
                height="18"
                rx="4"
                fill="rgba(11, 23, 52, 0.95)"
                stroke="rgba(167, 139, 250, 0.45)"
                strokeWidth="0.8"
              />
              <text
                y="3.5"
                textAnchor="middle"
                fill="#a78bfa"
                fontSize="9"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="600"
              >
                y={hover.my.toFixed(2)}
              </text>
            </g>

            {/* If evalFn is available, show targeted point on curve */}
            {hover.fy !== null && (
              <>
                <line
                  x1={hover.sx}
                  y1={toSY(0, c)}
                  x2={hover.sx}
                  y2={toSY(hover.fy, c)}
                  stroke="rgba(251, 191, 36, 0.4)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={hover.sx}
                  cy={toSY(hover.fy, c)}
                  r="8"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                />
                <circle
                  cx={hover.sx}
                  cy={toSY(hover.fy, c)}
                  r="3.5"
                  fill="#fbbf24"
                  stroke="#050a18"
                  strokeWidth="1.2"
                />
              </>
            )}

            {/* Modern Floating Coordinate Tooltip Card */}
            <rect
              x={tooltipX}
              y={tooltipY}
              width={tooltipW}
              height={tooltipH}
              rx="8"
              fill="rgba(8, 15, 34, 0.95)"
              stroke="rgba(56, 189, 248, 0.4)"
              strokeWidth="1"
            />
            <text
              x={tooltipX + 10}
              y={tooltipY + 16}
              fill="#e2e8f0"
              fontSize="9.5"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="500"
            >
              x:<tspan fill="#38bdf8" fontWeight="700"> {hover.mx.toFixed(2)}</tspan>{' '}
              y:<tspan fill="#a78bfa" fontWeight="700"> {hover.my.toFixed(2)}</tspan>
            </text>
            {hover.fy !== null && (
              <text
                x={tooltipX + 10}
                y={tooltipY + 32}
                fill="#fbbf24"
                fontSize="9.5"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="600"
              >
                f(x) = {hover.fy.toFixed(4)}
              </text>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

export default CoordinateCanvas;
