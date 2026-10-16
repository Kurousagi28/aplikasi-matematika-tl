import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import KTeX from './KTeX';
import CoordinateCanvas, { CanvasConfig, toSX, toSY } from './CoordinateCanvas';
import { sound } from '../utils/audio';

/* =============================================================
   MODUL TURUNAN — Visualisasi Interaktif Lanjutan
   - Garis sekan → garis singgung (h → 0)
   - Garis normal (tegak lurus dengan mn = -1/m)
   - Persamaan Garis Singgung & Garis Normal Lengkap (KaTeX)
   - Overlay Grafik Kurva Turunan f'(x)
   - Uji Turunan Kedua f''(x) & Analisis Kecekungan Kurva
   - Fungsi polinomial bergelombang (maksimum, minimum, belok)
   - Interaksi klik kanvas langsung untuk memindahkan titik
   - Animasi osilasi titik kontak
   ============================================================= */

type DerivFunc = {
  id: string;
  label: string;
  latex: string;
  latexDeriv: string;
  latexDeriv2: string;
  f: (x: number) => number;
  df: (x: number) => number;
  d2f: (x: number) => number;
  defaultX: number;
  xRange: [number, number];
};

export const DERIV_FUNCTIONS: DerivFunc[] = [
  {
    id: 'cubic_wave',
    label: 'f(x) = x³ − 3x (Puncak & Lembah)',
    latex: 'f(x) = x^3 - 3x',
    latexDeriv: "f'(x) = 3x^2 - 3",
    latexDeriv2: "f''(x) = 6x",
    f: (x) => x * x * x - 3 * x,
    df: (x) => 3 * x * x - 3,
    d2f: (x) => 6 * x,
    defaultX: -1.0,
    xRange: [-2.4, 2.4],
  },
  {
    id: 'x2',
    label: 'f(x) = x²',
    latex: 'f(x) = x^2',
    latexDeriv: "f'(x) = 2x",
    latexDeriv2: "f''(x) = 2",
    f: (x) => x * x,
    df: (x) => 2 * x,
    d2f: () => 2,
    defaultX: 1.2,
    xRange: [-2.6, 2.6],
  },
  {
    id: 'neg_x2',
    label: 'f(x) = −x² + 4x (Parabola Maksimum)',
    latex: 'f(x) = -x^2 + 4x',
    latexDeriv: "f'(x) = -2x + 4",
    latexDeriv2: "f''(x) = -2",
    f: (x) => -x * x + 4 * x,
    df: (x) => -2 * x + 4,
    d2f: () => -2,
    defaultX: 2.0,
    xRange: [-0.5, 4.5],
  },
  {
    id: 'x3',
    label: 'f(x) = x³',
    latex: 'f(x) = x^3',
    latexDeriv: "f'(x) = 3x^2",
    latexDeriv2: "f''(x) = 6x",
    f: (x) => x * x * x,
    df: (x) => 3 * x * x,
    d2f: (x) => 6 * x,
    defaultX: 0.8,
    xRange: [-2.2, 2.2],
  },
  {
    id: 'sinx',
    label: 'f(x) = sin(x)',
    latex: 'f(x) = \\sin(x)',
    latexDeriv: "f'(x) = \\cos(x)",
    latexDeriv2: "f''(x) = -\\sin(x)",
    f: (x) => Math.sin(x),
    df: (x) => Math.cos(x),
    d2f: (x) => -Math.sin(x),
    defaultX: 1.0,
    xRange: [-3.5, 3.5],
  },
  {
    id: 'cosx',
    label: 'f(x) = cos(x)',
    latex: 'f(x) = \\cos(x)',
    latexDeriv: "f'(x) = -\\sin(x)",
    latexDeriv2: "f''(x) = -\\cos(x)",
    f: (x) => Math.cos(x),
    df: (x) => -Math.sin(x),
    d2f: (x) => -Math.cos(x),
    defaultX: 1.5,
    xRange: [-3.5, 3.5],
  },
  {
    id: 'sqrt',
    label: 'f(x) = √x',
    latex: 'f(x) = \\sqrt{x}',
    latexDeriv: "f'(x) = \\frac{1}{2\\sqrt{x}}",
    latexDeriv2: "f''(x) = -\\frac{1}{4x^{3/2}}",
    f: (x) => (x >= 0 ? Math.sqrt(x) : NaN),
    df: (x) => (x > 0 ? 1 / (2 * Math.sqrt(x)) : NaN),
    d2f: (x) => (x > 0 ? -1 / (4 * Math.pow(x, 1.5)) : NaN),
    defaultX: 2.0,
    xRange: [0.1, 5.0],
  },
];

type ViewMode = 'tangent' | 'secant';

interface DerivativeModuleProps {
  onNavigateNext?: () => void;
}

export const DerivativeModule: React.FC<DerivativeModuleProps> = ({ onNavigateNext }) => {
  const [selectedFnId, setSelectedFnId] = useState('cubic_wave');
  const [x0, setX0] = useState(-1.0);
  const [h, setH] = useState(1.0);
  const [viewMode, setViewMode] = useState<ViewMode>('tangent');
  const [showNormalLine, setShowNormalLine] = useState(false);
  const [showDerivCurve, setShowDerivCurve] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number | null>(null);

  const fn = DERIV_FUNCTIONS.find((f) => f.id === selectedFnId)!;

  // Switch function resets x0
  const handleFunctionChange = useCallback((id: string) => {
    sound.playPop(480);
    setSelectedFnId(id);
    const newFn = DERIV_FUNCTIONS.find((f) => f.id === id)!;
    setX0(newFn.defaultX);
    setH(1.0);
    if (isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Canvas configuration
  const config: CanvasConfig = useMemo(() => {
    if (fn.id === 'cubic_wave') {
      return { xMin: -3, xMax: 3, yMin: -4, yMax: 4, width: 600, height: 450 };
    }
    if (fn.id === 'neg_x2') {
      return { xMin: -1, xMax: 5, yMin: -2, yMax: 6, width: 600, height: 450 };
    }
    if (fn.id === 'sqrt') {
      return { xMin: -1, xMax: 6, yMin: -1, yMax: 4, width: 600, height: 450 };
    }
    if (fn.id === 'x3') {
      return { xMin: -3, xMax: 3, yMin: -8, yMax: 8, width: 600, height: 450 };
    }
    if (fn.id === 'sinx' || fn.id === 'cosx') {
      return { xMin: -4, xMax: 4, yMin: -2, yMax: 2, width: 600, height: 450 };
    }
    return { xMin: -3, xMax: 3, yMin: -1, yMax: 9, width: 600, height: 450 };
  }, [fn.id]);

  const y0 = fn.f(x0);
  const slope = fn.df(x0);
  const secondDeriv = fn.d2f(x0);
  const slopeAngle = Math.atan(slope) * (180 / Math.PI);

  // Secant line Q point
  const xQ = x0 + h;
  const yQ = fn.f(xQ);
  const secantSlope = h !== 0 ? (yQ - y0) / h : slope;

  // Tangent line equation: y - y0 = m(x - x0) => y = mx + (y0 - m*x0)
  const tangentIntercept = y0 - slope * x0;
  // Normal line equation: slope_n = -1/m => y - y0 = m_n(x - x0) => y = m_n*x + (y0 - m_n*x0)
  const normalSlope = Math.abs(slope) > 0.0001 ? -1 / slope : null;
  const normalIntercept = normalSlope !== null ? y0 - normalSlope * x0 : null;

  // Generate curve path for f(x)
  const curvePath = useMemo(() => {
    const segments: string[] = [];
    const steps = 300;
    const dx = (config.xMax - config.xMin) / steps;
    let inPath = false;

    for (let i = 0; i <= steps; i++) {
      const x = config.xMin + i * dx;
      const y = fn.f(x);
      if (!isFinite(y) || Math.abs(y) > 60) {
        inPath = false;
        continue;
      }
      const sx = toSX(x, config);
      const sy = toSY(y, config);
      if (!inPath) {
        segments.push(`M ${sx.toFixed(1)} ${sy.toFixed(1)}`);
        inPath = true;
      } else {
        segments.push(`L ${sx.toFixed(1)} ${sy.toFixed(1)}`);
      }
    }
    return segments.join(' ');
  }, [fn, config]);

  // Generate curve path for derivative companion curve f'(x)
  const derivCurvePath = useMemo(() => {
    if (!showDerivCurve) return '';
    const segments: string[] = [];
    const steps = 300;
    const dx = (config.xMax - config.xMin) / steps;
    let inPath = false;

    for (let i = 0; i <= steps; i++) {
      const x = config.xMin + i * dx;
      const y = fn.df(x);
      if (!isFinite(y) || Math.abs(y) > 60) {
        inPath = false;
        continue;
      }
      const sx = toSX(x, config);
      const sy = toSY(y, config);
      if (!inPath) {
        segments.push(`M ${sx.toFixed(1)} ${sy.toFixed(1)}`);
        inPath = true;
      } else {
        segments.push(`L ${sx.toFixed(1)} ${sy.toFixed(1)}`);
      }
    }
    return segments.join(' ');
  }, [fn, config, showDerivCurve]);

  // Tangent line SVG endpoints
  const tangentLine = useMemo(() => {
    const span = 3.5;
    const m = viewMode === 'tangent' ? slope : secantSlope;
    const xA = x0 - span;
    const yA = m * (xA - x0) + y0;
    const xB = x0 + span;
    const yB = m * (xB - x0) + y0;
    return {
      x1: toSX(xA, config), y1: toSY(yA, config),
      x2: toSX(xB, config), y2: toSY(yB, config),
    };
  }, [x0, y0, slope, secantSlope, viewMode, config]);

  // Normal line SVG endpoints
  const normalLine = useMemo(() => {
    if (!showNormalLine || normalSlope === null) return null;
    const span = 2.5;
    const xA = x0 - span;
    const yA = normalSlope * (xA - x0) + y0;
    const xB = x0 + span;
    const yB = normalSlope * (xB - x0) + y0;
    return {
      x1: toSX(xA, config), y1: toSY(yA, config),
      x2: toSX(xB, config), y2: toSY(yB, config),
    };
  }, [x0, y0, normalSlope, showNormalLine, config]);

  // Oscillation animation
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      sound.playPop(520);
      let t = 0;
      const [minX, maxX] = fn.xRange;
      const center = (minX + maxX) / 2;
      const amp = (maxX - minX) / 2;

      const step = () => {
        t += 0.018;
        setX0(center + Math.sin(t) * amp);
        animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    }
  }, [isPlaying, fn.xRange]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Concavity and nature of point analysis
  const concavityStatus = useMemo(() => {
    const isStationary = Math.abs(slope) < 0.05;
    if (isStationary) {
      if (secondDeriv < -0.05) return { text: '🔝 Titik Maksimum Lokal (f\'=0, f\'\'<0)', color: '#fb7185' };
      if (secondDeriv > 0.05) return { text: '🔻 Titik Minimum Lokal (f\'=0, f\'\'>0)', color: '#34d399' };
      return { text: '🌀 Titik Belok Horizontal (f\'=0, f\'\'=0)', color: '#fbbf24' };
    }
    if (Math.abs(secondDeriv) < 0.05) return { text: '〰️ Titik Belok (Kecekungan Berubah, f\'\'=0)', color: '#a78bfa' };
    if (secondDeriv > 0.05) return { text: '∪ Cekung ke Atas (f\'\' > 0)', color: '#34d399' };
    return { text: '∩ Cekung ke Bawah (f\'\' < 0)', color: '#fb7185' };
  }, [slope, secondDeriv]);

  // Click handler on canvas to set x0
  const handleCanvasClick = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const mathX = config.xMin + (clickX / rect.width) * (config.xMax - config.xMin);
    const clampedX = Math.max(fn.xRange[0], Math.min(fn.xRange[1], mathX));
    sound.playPop(600);
    setX0(parseFloat(clampedX.toFixed(2)));
  };

  return (
    <div className="lesson-layout">
      {/* ── LEFT: Content Panel ── */}
      <div className="content-panel animate-slide-in-left">
        {/* Function Selector */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon cyan">𝑓'</div>
            <div>
              <div className="card-title">Pilih Fungsi Kurva</div>
              <div className="card-subtitle">Polinomial, Trigonometri, Bentuk Akar</div>
            </div>
          </div>
          <select
            className="custom-select"
            style={{ width: '100%' }}
            value={selectedFnId}
            onChange={(e) => handleFunctionChange(e.target.value)}
          >
            <optgroup label="Polinomial & Aljabar">
              {DERIV_FUNCTIONS.filter((f) => !['sinx', 'cosx'].includes(f.id)).map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </optgroup>
            <optgroup label="Trigonometri">
              {DERIV_FUNCTIONS.filter((f) => ['sinx', 'cosx'].includes(f.id)).map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Formula Display with 1st and 2nd Derivatives */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon violet">📐</div>
            <div className="card-title">Rumus Turunan Pertama & Kedua</div>
          </div>
          <div className="formula-display" style={{ textAlign: 'center', padding: '12px' }}>
            <KTeX math={fn.latex} display />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
            <div className="formula-highlight" style={{ textAlign: 'center' }}>
              <KTeX math={fn.latexDeriv} display />
            </div>
            <div className="formula-highlight" style={{ textAlign: 'center', borderColor: 'var(--accent-violet)' }}>
              <KTeX math={fn.latexDeriv2} display />
            </div>
          </div>
        </div>

        {/* View Mode & Overlay Toggles */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon emerald">👁</div>
            <div className="card-title">Instrumen Visualisasi</div>
          </div>
          <div className="tab-nav" style={{ width: '100%', marginBottom: '12px' }}>
            <button
              className={`tab-btn ${viewMode === 'tangent' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => {
                sound.playPop(480);
                setViewMode('tangent');
              }}
            >
              Garis Singgung (Tangen)
            </button>
            <button
              className={`tab-btn ${viewMode === 'secant' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => {
                sound.playPop(520);
                setViewMode('secant');
              }}
            >
              Garis Sekan (h → 0)
            </button>
          </div>

          {/* Toggle Garis Normal and Toggle Kurva Turunan f'(x) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: 'var(--text-xs)' }}>
              <input
                type="checkbox"
                checked={showNormalLine}
                onChange={(e) => {
                  sound.playPop(450);
                  setShowNormalLine(e.target.checked);
                }}
              />
              <span style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>Tampilkan Garis Normal (mₙ = −1/m)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: 'var(--text-xs)' }}>
              <input
                type="checkbox"
                checked={showDerivCurve}
                onChange={(e) => {
                  sound.playPop(450);
                  setShowDerivCurve(e.target.checked);
                }}
              />
              <span style={{ fontWeight: 600, color: 'var(--accent-violet)' }}>Tampilkan Grafik Turunan f'(x)</span>
            </label>
          </div>

          {viewMode === 'secant' && (
            <div className="slider-group" style={{ marginTop: '14px' }}>
              <div className="slider-label">
                <span>Jarak Interval Sekan (h)</span>
                <span className="slider-label-value">{h.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min={0.001}
                max={2}
                step={0.001}
                value={h}
                className="slider-violet"
                onChange={(e) => setH(parseFloat(e.target.value))}
              />
              <div className="steps-row" style={{ marginTop: '8px' }}>
                {[2, 1, 0.5, 0.1, 0.01, 0.001].map((v) => (
                  <button
                    key={v}
                    className={`step-chip ${Math.abs(h - v) < 0.0005 ? 'active' : ''}`}
                    onClick={() => {
                      sound.playPop(520);
                      setH(v);
                    }}
                  >
                    h={v}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Position Slider & Canvas Click Prompt */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon amber">🎯</div>
            <div className="card-title">Posisi Titik Kontak P(x₀, y₀)</div>
          </div>
          <div className="slider-group">
            <div className="slider-label">
              <span>Nilai Absis x₀ (atau klik langsung di kanvas)</span>
              <span className="slider-label-value">{x0.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={fn.xRange[0]}
              max={fn.xRange[1]}
              step={0.01}
              value={x0}
              className="slider-amber"
              onChange={(e) => setX0(parseFloat(e.target.value))}
            />
          </div>
          <div className="btn-group" style={{ marginTop: '12px' }}>
            <button
              onClick={togglePlay}
              className={`btn ${isPlaying ? 'btn-danger' : 'btn-primary'}`}
              style={{ flex: 1 }}
            >
              {isPlaying ? '⏸ Jeda' : '▶ Osilasi Otomatis'}
            </button>
            <button
              onClick={() => {
                sound.playPop(350);
                setX0(fn.defaultX);
                setH(1.0);
              }}
              className="btn btn-secondary"
            >
              Reset Posisi
            </button>
          </div>
        </div>

        {/* Live Equations (Tangent & Normal) */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon cyan">📊</div>
            <div className="card-title">Persamaan Garis Real-time</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'rgba(251, 191, 36, 0.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-amber)', fontWeight: 700, marginBottom: '2px' }}>
                Persamaan Garis Singgung:
              </div>
              <KTeX
                math={`y - (${y0.toFixed(2)}) = ${slope.toFixed(2)}(x - (${x0.toFixed(2)})) \\implies y = ${slope.toFixed(2)}x ${tangentIntercept >= 0 ? '+ ' + tangentIntercept.toFixed(2) : '- ' + Math.abs(tangentIntercept).toFixed(2)}`}
                display
              />
            </div>

            {showNormalLine && normalSlope !== null && normalIntercept !== null && (
              <div style={{ background: 'rgba(251, 113, 133, 0.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(251, 113, 133, 0.2)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-rose)', fontWeight: 700, marginBottom: '2px' }}>
                  Persamaan Garis Normal:
                </div>
                <KTeX
                  math={`y - (${y0.toFixed(2)}) = ${normalSlope.toFixed(2)}(x - (${x0.toFixed(2)})) \\implies y = ${normalSlope.toFixed(2)}x ${normalIntercept >= 0 ? '+ ' + normalIntercept.toFixed(2) : '- ' + Math.abs(normalIntercept).toFixed(2)}`}
                  display
                />
              </div>
            )}
          </div>

          <div className="info-grid" style={{ marginTop: '12px' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Gradien m = f'(x₀)</div>
              <div className="value-box cyan lg" style={{ width: '100%', justifyContent: 'center' }}>
                {isFinite(slope) ? slope.toFixed(4) : 'undef'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Turunan Kedua f''(x₀)</div>
              <div className="value-box violet lg" style={{ width: '100%', justifyContent: 'center' }}>
                {isFinite(secondDeriv) ? secondDeriv.toFixed(4) : 'undef'}
              </div>
            </div>
          </div>

          {/* Concavity status banner */}
          <div style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '6px', textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, color: concavityStatus.color, border: `1px solid ${concavityStatus.color}40` }}>
            {concavityStatus.text}
          </div>
        </div>

        {/* Mission Card */}
        <div className="mission-card">
          <div className="mission-tag">🧪 Misi Eksplorasi</div>
          <p className="mission-text">
            Geser absis x₀ menuju puncak kurva atau lembah di mana gradien <strong>m = 0</strong>.
            Perhatikan bagaimana <strong>Garis Singgung mendatar sempurna</strong>.
            Jika mengaktifkan <em>Grafik Turunan f'(x)</em>, kurva turunan tepat memotong sumbu-x di titik ini!
          </p>
        </div>

        {/* Module Navigation CTA */}
        {onNavigateNext && (
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: 'var(--text-sm)', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
              onClick={onNavigateNext}
            >
              Lanjut ke Modul Integral (Akumulasi Luas) →
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: Canvas Panel ── */}
      <div className="canvas-panel animate-slide-in-right">
        {/* HUD */}
        <div className="canvas-hud">
          <div className="canvas-hud-row">
            <span className="canvas-hud-label">Titik P:</span>
            <span className="canvas-hud-value amber">
              ({x0.toFixed(2)}, {isFinite(y0) ? y0.toFixed(2) : '—'})
            </span>
          </div>
          <div className="canvas-hud-row">
            <span className="canvas-hud-label">Gradien m:</span>
            <span className="canvas-hud-value cyan">{isFinite(slope) ? slope.toFixed(3) : '—'}</span>
          </div>
          <div className="canvas-hud-row">
            <span className="canvas-hud-label">Sudut θ:</span>
            <span className="canvas-hud-value violet">{isFinite(slopeAngle) ? slopeAngle.toFixed(1) : '—'}°</span>
          </div>
          {showNormalLine && normalSlope !== null && (
            <div className="canvas-hud-row">
              <span className="canvas-hud-label">Gradien Normal:</span>
              <span className="canvas-hud-value rose">{normalSlope.toFixed(3)}</span>
            </div>
          )}
          {viewMode === 'secant' && (
            <div className="canvas-hud-row">
              <span className="canvas-hud-label">m_sekan:</span>
              <span className="canvas-hud-value emerald">{secantSlope.toFixed(3)}</span>
            </div>
          )}
        </div>

        <CoordinateCanvas config={config}>
          {/* Invisible click overlay */}
          <rect
            x={0}
            y={0}
            width={config.width}
            height={config.height}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onClick={handleCanvasClick}
          />

          {/* Derivative Companion Curve f'(x) if toggled */}
          {showDerivCurve && derivCurvePath && (
            <g>
              <path
                d={derivCurvePath}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="2"
                strokeDasharray="5 4"
                opacity="0.85"
              />
              <text
                x={config.width - 14}
                y={toSY(fn.df(config.xMax - 0.2), config) - 8}
                fill="#a78bfa"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="700"
                textAnchor="end"
              >
                f'(x)
              </text>
            </g>
          )}

          {/* Main Curve f(x) */}
          <path d={curvePath} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />

          {/* Projection lines to axes */}
          {isFinite(y0) && (
            <>
              <line
                x1={toSX(x0, config)} y1={toSY(0, config)}
                x2={toSX(x0, config)} y2={toSY(y0, config)}
                stroke="#fbbf24" strokeDasharray="4 4" strokeWidth="1" opacity="0.4"
              />
              <line
                x1={toSX(0, config)} y1={toSY(y0, config)}
                x2={toSX(x0, config)} y2={toSY(y0, config)}
                stroke="#fbbf24" strokeDasharray="4 4" strokeWidth="1" opacity="0.4"
              />
            </>
          )}

          {/* Tangent Line */}
          <line
            x1={tangentLine.x1} y1={tangentLine.y1}
            x2={tangentLine.x2} y2={tangentLine.y2}
            stroke={viewMode === 'tangent' ? '#fbbf24' : '#a78bfa'}
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Normal Line if toggled */}
          {showNormalLine && normalLine && (
            <line
              x1={normalLine.x1} y1={normalLine.y1}
              x2={normalLine.x2} y2={normalLine.y2}
              stroke="#fb7185"
              strokeWidth="2.2"
              strokeDasharray="6 3"
              strokeLinecap="round"
            />
          )}

          {/* Secant mode: show Q point and triangle delta x, delta y */}
          {viewMode === 'secant' && isFinite(yQ) && (
            <>
              <line
                x1={toSX(x0, config)} y1={toSY(y0, config)}
                x2={toSX(xQ, config)} y2={toSY(y0, config)}
                stroke="#34d399" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6"
              />
              <line
                x1={toSX(xQ, config)} y1={toSY(y0, config)}
                x2={toSX(xQ, config)} y2={toSY(yQ, config)}
                stroke="#fb7185" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6"
              />
              <text
                x={(toSX(x0, config) + toSX(xQ, config)) / 2}
                y={toSY(y0, config) + 16}
                textAnchor="middle" fill="#34d399" fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
              >
                Δx = h = {h.toFixed(3)}
              </text>
              <circle cx={toSX(xQ, config)} cy={toSY(yQ, config)} r="6" fill="#a78bfa" />
              <text
                x={toSX(xQ, config)} y={toSY(yQ, config) - 12}
                textAnchor="middle" fill="#a78bfa" fontSize="10"
                fontWeight="600" fontFamily="'JetBrains Mono', monospace"
              >
                Q({xQ.toFixed(2)}, {yQ.toFixed(2)})
              </text>
            </>
          )}

          {/* Point P (Tangent Point) */}
          {isFinite(y0) && (
            <g>
              <circle
                cx={toSX(x0, config)} cy={toSY(y0, config)}
                r="7.5" fill="#fbbf24"
                style={{ filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.8))' }}
              />
              <circle
                cx={toSX(x0, config)} cy={toSY(y0, config)}
                r="13" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.3"
              />
              <text
                x={toSX(x0, config)} y={toSY(y0, config) - 16}
                textAnchor="middle" fill="#fbbf24" fontSize="10"
                fontWeight="700" fontFamily="'JetBrains Mono', monospace"
              >
                P({x0.toFixed(2)}, {y0.toFixed(2)})
              </text>
            </g>
          )}
        </CoordinateCanvas>
      </div>
    </div>
  );
};

export default DerivativeModule;
