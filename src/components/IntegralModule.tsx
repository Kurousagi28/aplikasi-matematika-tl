import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import KTeX from './KTeX';
import CoordinateCanvas, { CanvasConfig, toSX, toSY } from './CoordinateCanvas';
import { InfoTooltip } from './Tooltip';
import { sound } from '../utils/audio';

/* =============================================================
   MODUL INTEGRAL — Visualisasi Interaktif Lanjutan
   - Mode 1: Jumlah Riemann & Teorema Dasar Kalkulus (TDK)
   - Mode 2: Luas Daerah Antara Dua Kurva (f(x) − g(x))
   - Analisis Luas Netto (Signed Area) vs Luas Geometris Total
   - Animasi Konvergensi Riemann Otomatis (n → 100)
   - Breakdown Antiturunan Langkah Demi Langkah (KaTeX)
   ============================================================= */

type IntegralMode = 'riemann' | 'between_curves';
type SumType = 'left' | 'right' | 'midpoint' | 'trapezoid';

type SingleIntegralFunc = {
  id: string;
  label: string;
  latex: string;
  latexIntegral: string;
  antiderivativeLatex: string;
  f: (x: number) => number;
  F: (x: number) => number;
  defaultBounds: [number, number];
  boundsRange: [number, number];
};

type TwoCurvesPreset = {
  id: string;
  label: string;
  fLatex: string;
  gLatex: string;
  f: (x: number) => number;
  g: (x: number) => number;
  intersectionBounds: [number, number];
  exactArea: number;
  stepLatex: string[];
};

export const SINGLE_FUNCTIONS: SingleIntegralFunc[] = [
  {
    id: 'x2',
    label: 'f(x) = x²',
    latex: 'f(x) = x^2',
    latexIntegral: '\\int_a^b x^2 \\, dx = \\left[ \\frac{x^3}{3} \\right]_a^b = \\frac{b^3 - a^3}{3}',
    antiderivativeLatex: 'F(x) = \\frac{x^3}{3}',
    f: (x) => x * x,
    F: (x) => (x ** 3) / 3,
    defaultBounds: [0, 3],
    boundsRange: [-1, 4],
  },
  {
    id: '2x_plus_1',
    label: 'f(x) = 2x + 1',
    latex: 'f(x) = 2x + 1',
    latexIntegral: '\\int_a^b (2x + 1) \\, dx = \\left[ x^2 + x \\right]_a^b',
    antiderivativeLatex: 'F(x) = x^2 + x',
    f: (x) => 2 * x + 1,
    F: (x) => x * x + x,
    defaultBounds: [0, 3],
    boundsRange: [-1, 4],
  },
  {
    id: 'sinx',
    label: 'f(x) = sin(x) [Luas Netto vs Positif]',
    latex: 'f(x) = \\sin(x)',
    latexIntegral: '\\int_a^b \\sin(x) \\, dx = \\left[ -\\cos(x) \\right]_a^b = -\\cos(b) + \\cos(a)',
    antiderivativeLatex: 'F(x) = -\\cos(x)',
    f: (x) => Math.sin(x),
    F: (x) => -Math.cos(x),
    defaultBounds: [0, Math.PI * 2],
    boundsRange: [0, Math.PI * 2 + 0.5],
  },
  {
    id: 'x3',
    label: 'f(x) = x³ (Kurva Simetris Ganjil)',
    latex: 'f(x) = x^3',
    latexIntegral: '\\int_a^b x^3 \\, dx = \\left[ \\frac{x^4}{4} \\right]_a^b',
    antiderivativeLatex: 'F(x) = \\frac{x^4}{4}',
    f: (x) => x * x * x,
    F: (x) => (x ** 4) / 4,
    defaultBounds: [-2, 2],
    boundsRange: [-2.5, 2.5],
  },
  {
    id: 'sqrt_x',
    label: 'f(x) = √x',
    latex: 'f(x) = \\sqrt{x}',
    latexIntegral: '\\int_a^b \\sqrt{x} \\, dx = \\left[ \\frac{2}{3}x^{3/2} \\right]_a^b',
    antiderivativeLatex: 'F(x) = \\frac{2}{3}x^{3/2}',
    f: (x) => (x >= 0 ? Math.sqrt(x) : 0),
    F: (x) => (x >= 0 ? (2 / 3) * Math.pow(x, 1.5) : 0),
    defaultBounds: [0, 4],
    boundsRange: [0, 5],
  },
];

export const TWO_CURVES_PRESETS: TwoCurvesPreset[] = [
  {
    id: 'parabola_line',
    label: 'Parabola y = 4 − x² & Garis y = x + 2',
    fLatex: 'f(x) = 4 - x^2',
    gLatex: 'g(x) = x + 2',
    f: (x) => 4 - x * x,
    g: (x) => x + 2,
    intersectionBounds: [-2, 1],
    exactArea: 4.5, // 9/2
    stepLatex: [
      '\\text{Cari titik potong: } 4 - x^2 = x + 2 \\implies x^2 + x - 2 = 0',
      '\\text{Faktorkan: } (x + 2)(x - 1) = 0 \\implies a = -2, \\; b = 1',
      '\\text{Fungsi atas: } f(x) = 4 - x^2, \\quad \\text{Fungsi bawah: } g(x) = x + 2',
      'L = \\int_{-2}^1 [(4 - x^2) - (x + 2)] \\, dx = \\int_{-2}^1 (2 - x - x^2) \\, dx',
      '= \\left[ 2x - \\frac{x^2}{2} - \\frac{x^3}{3} \\right]_{-2}^1 = \\left(2 - \\frac{1}{2} - \\frac{1}{3}\\right) - \\left(-4 - 2 + \\frac{8}{3}\\right) = \\frac{9}{2} = 4.5',
    ],
  },
  {
    id: 'two_parabolas',
    label: 'Parabola y = 2 − x² & Parabola y = x²',
    fLatex: 'f(x) = 2 - x^2',
    gLatex: 'g(x) = x^2',
    f: (x) => 2 - x * x,
    g: (x) => x * x,
    intersectionBounds: [-1, 1],
    exactArea: 8 / 3, // 2.6667
    stepLatex: [
      '\\text{Cari titik potong: } 2 - x^2 = x^2 \\implies 2x^2 = 2 \\implies x = \\pm 1',
      'L = \\int_{-1}^1 [(2 - x^2) - x^2] \\, dx = \\int_{-1}^1 (2 - 2x^2) \\, dx',
      '= \\left[ 2x - \\frac{2x^3}{3} \\right]_{-1}^1 = \\left(2 - \\frac{2}{3}\\right) - \\left(-2 + \\frac{2}{3}\\right) = \\frac{8}{3} \\approx 2.67',
    ],
  },
];

interface IntegralModuleProps {
  onNavigateNext?: () => void;
}

export const IntegralModule: React.FC<IntegralModuleProps> = ({ onNavigateNext }) => {
  const [mode, setMode] = useState<IntegralMode>('riemann');

  // Single Curve / Riemann State
  const [selectedFnId, setSelectedFnId] = useState('x2');
  const [n, setN] = useState(6);
  const [sumType, setSumType] = useState<SumType>('left');
  const [boundsA, setBoundsA] = useState(0);
  const [boundsB, setBoundsB] = useState(3);
  const [isConvergencePlaying, setIsConvergencePlaying] = useState(false);
  const animRef = useRef<number | null>(null);

  // Two Curves State
  const [selectedTwoCurvesId, setSelectedTwoCurvesId] = useState('parabola_line');

  const fn = SINGLE_FUNCTIONS.find((f) => f.id === selectedFnId)!;
  const twoPreset = TWO_CURVES_PRESETS.find((p) => p.id === selectedTwoCurvesId)!;

  const handleSingleFnChange = (id: string) => {
    sound.playPop(480);
    setSelectedFnId(id);
    const newFn = SINGLE_FUNCTIONS.find((f) => f.id === id)!;
    setBoundsA(newFn.defaultBounds[0]);
    setBoundsB(newFn.defaultBounds[1]);
    setN(6);
  };

  const a = Math.min(boundsA, boundsB);
  const b = Math.max(boundsA, boundsB);
  const dx = (b - a) / Math.max(n, 1);

  // Calculate Riemann sum
  const riemannSum = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      let xSample: number;
      switch (sumType) {
        case 'left':
          xSample = a + i * dx;
          sum += fn.f(xSample) * dx;
          break;
        case 'right':
          xSample = a + (i + 1) * dx;
          sum += fn.f(xSample) * dx;
          break;
        case 'midpoint':
          xSample = a + (i + 0.5) * dx;
          sum += fn.f(xSample) * dx;
          break;
        case 'trapezoid': {
          const x1 = a + i * dx;
          const x2 = a + (i + 1) * dx;
          sum += ((fn.f(x1) + fn.f(x2)) / 2) * dx;
          break;
        }
      }
    }
    return sum;
  }, [fn, n, a, b, dx, sumType]);

  // Exact integral via Fundamental Theorem of Calculus (TDK)
  const exactValue = fn.F(b) - fn.F(a);
  const error = Math.abs(riemannSum - exactValue);
  const errorPercent = Math.abs(exactValue) > 0.0001 ? (error / Math.abs(exactValue)) * 100 : 0;

  // Signed vs Geometric Area breakdown (samples high resolution)
  const areaBreakdown = useMemo(() => {
    const steps = 400;
    const stepDx = (b - a) / steps;
    let posArea = 0;
    let negArea = 0;
    for (let i = 0; i < steps; i++) {
      const xm = a + (i + 0.5) * stepDx;
      const y = fn.f(xm);
      if (y >= 0) posArea += y * stepDx;
      else negArea += Math.abs(y) * stepDx;
    }
    return {
      posArea,
      negArea,
      totalGeometric: posArea + negArea,
      netAlgebraic: posArea - negArea,
    };
  }, [fn, a, b]);

  // Auto-convergence animation
  const toggleConvergence = useCallback(() => {
    if (isConvergencePlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setIsConvergencePlaying(false);
    } else {
      setIsConvergencePlaying(true);
      sound.playPop(520);
      let curN = 2;
      setN(curN);

      const step = () => {
        curN += 0.35;
        if (curN > 80) {
          setN(80);
          setIsConvergencePlaying(false);
          sound.playSuccess();
          return;
        }
        setN(Math.floor(curN));
        animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    }
  }, [isConvergencePlaying]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Canvas Config for Single Curve
  const configSingle: CanvasConfig = useMemo(() => {
    let yMax = 0;
    let yMin = 0;
    const steps = 100;
    const stepDx = (b - a) / steps;
    for (let i = 0; i <= steps; i++) {
      const x = a + i * stepDx;
      const y = fn.f(x);
      if (isFinite(y)) {
        if (y > yMax) yMax = y;
        if (y < yMin) yMin = y;
      }
    }
    const finalYMax = Math.max(yMax * 1.25, 2.5);
    const finalYMin = Math.min(yMin * 1.25, -1.0);
    return {
      xMin: a - 1.2,
      xMax: b + 1.2,
      yMin: finalYMin,
      yMax: finalYMax,
      width: 600,
      height: 450,
    };
  }, [fn, a, b]);

  // Canvas Config for Two Curves
  const configTwoCurves: CanvasConfig = useMemo(() => {
    return { xMin: -3.5, xMax: 3.5, yMin: -3.5, yMax: 5.5, width: 600, height: 450 };
  }, []);

  // Curve Path for Single Function
  const curvePath = useMemo(() => {
    const points: string[] = [];
    const steps = 250;
    const stepDx = (configSingle.xMax - configSingle.xMin) / steps;
    for (let i = 0; i <= steps; i++) {
      const x = configSingle.xMin + i * stepDx;
      const y = fn.f(x);
      if (!isFinite(y) || Math.abs(y) > 50) continue;
      const sx = toSX(x, configSingle);
      const sy = toSY(y, configSingle);
      points.push(`${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }
    return points.join(' ');
  }, [fn, configSingle]);

  // Riemann Rectangles paths
  const rects = useMemo(() => {
    if (mode !== 'riemann') return [];
    const result: Array<{ path: string; fill: string; stroke: string }> = [];

    for (let i = 0; i < n; i++) {
      const x1 = a + i * dx;
      const x2 = a + (i + 1) * dx;
      let path = '';

      const sx1 = toSX(x1, configSingle);
      const sx2 = toSX(x2, configSingle);
      const sy0 = toSY(0, configSingle);

      switch (sumType) {
        case 'left': {
          const yS = fn.f(x1);
          const syH = toSY(yS, configSingle);
          path = `M ${sx1} ${sy0} L ${sx1} ${syH} L ${sx2} ${syH} L ${sx2} ${sy0} Z`;
          break;
        }
        case 'right': {
          const yS = fn.f(x2);
          const syH = toSY(yS, configSingle);
          path = `M ${sx1} ${sy0} L ${sx1} ${syH} L ${sx2} ${syH} L ${sx2} ${sy0} Z`;
          break;
        }
        case 'midpoint': {
          const yS = fn.f(x1 + dx / 2);
          const syH = toSY(yS, configSingle);
          path = `M ${sx1} ${sy0} L ${sx1} ${syH} L ${sx2} ${syH} L ${sx2} ${sy0} Z`;
          break;
        }
        case 'trapezoid': {
          const syL = toSY(fn.f(x1), configSingle);
          const syR = toSY(fn.f(x2), configSingle);
          path = `M ${sx1} ${sy0} L ${sx1} ${syL} L ${sx2} ${syR} L ${sx2} ${sy0} Z`;
          break;
        }
      }

      const hue = 175 + (i / n) * 90;
      result.push({
        path,
        fill: `hsla(${hue}, 85%, 60%, 0.22)`,
        stroke: `hsla(${hue}, 85%, 60%, 0.7)`,
      });
    }
    return result;
  }, [fn, n, a, b, dx, sumType, mode, configSingle]);

  // Two Curves: generate shaded region between curves
  const twoCurvesShadedArea = useMemo(() => {
    if (mode !== 'between_curves') return '';
    const [c1, c2] = twoPreset.intersectionBounds;
    const steps = 150;
    const stepDx = (c2 - c1) / steps;

    // Top curve forward
    const topPts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = c1 + i * stepDx;
      const y = twoPreset.f(x);
      const sx = toSX(x, configTwoCurves);
      const sy = toSY(y, configTwoCurves);
      topPts.push(`${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }

    // Bottom curve backward
    const btmPts: string[] = [];
    for (let i = steps; i >= 0; i--) {
      const x = c1 + i * stepDx;
      const y = twoPreset.g(x);
      const sx = toSX(x, configTwoCurves);
      const sy = toSY(y, configTwoCurves);
      btmPts.push(`L ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }

    return `${topPts.join(' ')} ${btmPts.join(' ')} Z`;
  }, [twoPreset, mode, configTwoCurves]);

  // Two Curves: curve f(x) and curve g(x) paths
  const twoCurvesPaths = useMemo(() => {
    if (mode !== 'between_curves') return { pathF: '', pathG: '' };
    const steps = 200;
    const stepDx = (configTwoCurves.xMax - configTwoCurves.xMin) / steps;
    const ptsF: string[] = [];
    const ptsG: string[] = [];

    for (let i = 0; i <= steps; i++) {
      const x = configTwoCurves.xMin + i * stepDx;
      const yF = twoPreset.f(x);
      const yG = twoPreset.g(x);

      const sxF = toSX(x, configTwoCurves);
      const syF = toSY(yF, configTwoCurves);
      const sxG = toSX(x, configTwoCurves);
      const syG = toSY(yG, configTwoCurves);

      ptsF.push(`${i === 0 ? 'M' : 'L'} ${sxF.toFixed(1)} ${syF.toFixed(1)}`);
      ptsG.push(`${i === 0 ? 'M' : 'L'} ${sxG.toFixed(1)} ${syG.toFixed(1)}`);
    }

    return { pathF: ptsF.join(' '), pathG: ptsG.join(' ') };
  }, [twoPreset, mode, configTwoCurves]);

  const sumTypeLabels: Record<SumType, string> = {
    left: 'Kiri (Left)',
    right: 'Kanan (Right)',
    midpoint: 'Tengah (Midpoint)',
    trapezoid: 'Trapesium',
  };

  return (
    <div className="lesson-layout">
      {/* ── LEFT: Content Panel ── */}
      <div className="content-panel animate-slide-in-left">
        {/* Mode Switcher */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon cyan">∫</div>
            <div>
              <div className="card-title">Pilih Mode Eksplorasi <InfoTooltip text="Dua mode tersedia: (1) Jumlah Riemann untuk melihat bagaimana integral dihitung dari penjumlahan balok, (2) Luas Antara 2 Kurva untuk menghitung area di antara dua fungsi." /></div>
              <div className="card-subtitle">Jumlah Riemann vs Luas Antara Dua Kurva</div>
            </div>
          </div>
          <div className="tab-nav" style={{ width: '100%' }}>
            <button
              className={`tab-btn ${mode === 'riemann' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => {
                sound.playPop(480);
                setMode('riemann');
              }}
            >
              📦 Jumlah Riemann & TDK
            </button>
            <button
              className={`tab-btn ${mode === 'between_curves' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => {
                sound.playPop(520);
                setMode('between_curves');
              }}
            >
              📐 Luas Antara 2 Kurva
            </button>
          </div>
        </div>

        {/* ──── MODE 1: RIEMANN SUMS & TDK ──── */}
        {mode === 'riemann' && (
          <>
            {/* Function Selector */}
            <div className="card">
              <div className="card-header">
                <div className="card-icon violet">𝑓</div>
                <div className="card-title">Pilih Fungsi Integral</div>
              </div>
              <select
                className="custom-select"
                style={{ width: '100%' }}
                value={selectedFnId}
                onChange={(e) => handleSingleFnChange(e.target.value)}
              >
                {SINGLE_FUNCTIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Formula Display with FTC (TDK) */}
            <div className="card">
              <div className="card-header">
                <div className="card-icon emerald">📐</div>
                <div className="card-title">Teorema Dasar Kalkulus (TDK)</div>
              </div>
              <div className="formula-display" style={{ textAlign: 'center', padding: '12px' }}>
                <KTeX math={fn.latex} display />
              </div>
              <div className="formula-highlight" style={{ marginTop: '10px', textAlign: 'center' }}>
                <KTeX math={fn.latexIntegral} display />
              </div>
              <div style={{ marginTop: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Antiturunan: <KTeX math={fn.antiderivativeLatex} />
              </div>
            </div>

            {/* Sum Type Selector */}
            <div className="card">
              <div className="card-header">
                <div className="card-icon amber">🔢</div>
                <div className="card-title">Tipe Titik Sampel Riemann <InfoTooltip text="Pilih cara menentukan tinggi setiap balok partisi. Kiri: tinggi dari ujung kiri. Kanan: dari ujung kanan. Tengah: dari titik tengah (paling akurat). Trapesium: rata-rata kiri dan kanan." /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {(Object.entries(sumTypeLabels) as [SumType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    className={`step-chip ${sumType === key ? 'active' : ''}`}
                    style={{ textAlign: 'center', padding: '8px' }}
                    onClick={() => {
                      sound.playPop(500);
                      setSumType(key);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Partition Slider & Auto Convergence Button */}
            <div className="card">
              <div className="card-header">
                <div className="card-icon cyan">📊</div>
                <div className="card-title">Jumlah Partisi Subinterval (n) <InfoTooltip text="Atur jumlah balok yang membagi interval [a,b]. Semakin besar n, semakin akurat pendekatan Riemann terhadap nilai integral eksak. Klik tombol-tombol cepat atau jalankan animasi konvergensi!" /></div>
              </div>
              <div className="slider-group">
                <div className="slider-label">
                  <span>Jumlah balok partisi (n)</span>
                  <span className="slider-label-value" style={{ fontSize: 'var(--text-lg)' }}>{n} balok</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={80}
                  step={1}
                  value={n}
                  className="slider-amber"
                  onChange={(e) => setN(parseInt(e.target.value))}
                />
              </div>

              <div className="steps-row" style={{ marginTop: '8px' }}>
                {[1, 2, 4, 8, 16, 32, 50, 80].map((v) => (
                  <button
                    key={v}
                    className={`step-chip ${n === v ? 'active' : ''}`}
                    onClick={() => {
                      sound.playPop(520);
                      setN(v);
                    }}
                  >
                    n={v}
                  </button>
                ))}
              </div>

              <div className="btn-group" style={{ marginTop: '12px' }}>
                <button
                  className={`btn ${isConvergencePlaying ? 'btn-danger' : 'btn-primary'}`}
                  style={{ flex: 1 }}
                  onClick={toggleConvergence}
                >
                  {isConvergencePlaying ? '⏸ Jeda Konvergensi' : '▶ Simulasikan Konvergensi (n → ∞)'}
                </button>
              </div>
            </div>

            {/* Bounds Control */}
            <div className="card">
              <div className="card-header">
                <div className="card-icon rose">📏</div>
                <div className="card-title">Batas Interval Integrasi [a, b] <InfoTooltip text="Atur batas bawah (a) dan batas atas (b) integrasi. Balok-balok Riemann dan perhitungan luas hanya dihitung dalam interval ini." /></div>
              </div>
              <div className="info-grid">
                <div className="slider-group">
                  <div className="slider-label">
                    <span>Batas Bawah (a)</span>
                    <span className="slider-label-value">{boundsA.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={fn.boundsRange[0]}
                    max={fn.boundsRange[1] - 0.5}
                    step={0.1}
                    value={boundsA}
                    onChange={(e) => setBoundsA(parseFloat(e.target.value))}
                  />
                </div>
                <div className="slider-group">
                  <div className="slider-label">
                    <span>Batas Atas (b)</span>
                    <span className="slider-label-value">{boundsB.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={fn.boundsRange[0] + 0.5}
                    max={fn.boundsRange[1]}
                    step={0.1}
                    value={boundsB}
                    onChange={(e) => setBoundsB(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Results Comparison & Signed Area Breakdown */}
            <div className="card">
              <div className="card-header">
                <div className="card-icon cyan">📈</div>
                <div className="card-title">Analisis Hasil Eksak vs Pendekatan</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Jumlah Riemann (Aproksimasi Balok)
                  </div>
                  <div className="value-box cyan lg" style={{ width: '100%', justifyContent: 'center' }}>
                    Σ ≈ {riemannSum.toFixed(6)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Nilai Eksak Teorema Dasar Kalkulus F(b) − F(a)
                  </div>
                  <div className="value-box emerald lg" style={{ width: '100%', justifyContent: 'center' }}>
                    ∫ = {exactValue.toFixed(6)}
                  </div>
                </div>

                <div className="info-grid">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      Error Relatif
                    </div>
                    <div className={`value-box ${errorPercent < 1 ? 'emerald' : errorPercent < 5 ? 'amber' : 'rose'}`} style={{ width: '100%', justifyContent: 'center' }}>
                      {errorPercent.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      Luas Geometri Mutlak |A|
                    </div>
                    <div className="value-box amber" style={{ width: '100%', justifyContent: 'center' }}>
                      {areaBreakdown.totalGeometric.toFixed(4)}
                    </div>
                  </div>
                </div>

                {areaBreakdown.negArea > 0.01 && (
                  <div style={{ background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    💡 <strong>Catatan Luas Netto:</strong> Bagian kurva di atas sumbu-x bernilai <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>+{areaBreakdown.posArea.toFixed(2)}</span>, sedangkan di bawah sumbu-x bernilai <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>−{areaBreakdown.negArea.toFixed(2)}</span>. Integral tentu menjumlahkan aljabar keduanya.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ──── MODE 2: AREA BETWEEN TWO CURVES ──── */}
        {mode === 'between_curves' && (
          <>
            <div className="card">
              <div className="card-header">
                <div className="card-icon cyan">📐</div>
                <div className="card-title">Pilih Pasangan Dua Kurva</div>
              </div>
              <select
                className="custom-select"
                style={{ width: '100%' }}
                value={selectedTwoCurvesId}
                onChange={(e) => {
                  sound.playPop(480);
                  setSelectedTwoCurvesId(e.target.value);
                }}
              >
                {TWO_CURVES_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-icon violet">𝑓</div>
                <div className="card-title">Definisi Dua Kurva</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px 0' }}>
                <div className="formula-display" style={{ textAlign: 'center', borderColor: 'var(--accent-cyan)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-cyan)', fontWeight: 700 }}>Kurva Atas:</span>
                  <KTeX math={twoPreset.fLatex} display />
                </div>
                <div className="formula-display" style={{ textAlign: 'center', borderColor: 'var(--accent-violet)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-violet)', fontWeight: 700 }}>Kurva Bawah:</span>
                  <KTeX math={twoPreset.gLatex} display />
                </div>
              </div>

              <div className="formula-highlight" style={{ textAlign: 'center', marginTop: '8px' }}>
                <KTeX math={`L = \\int_{${twoPreset.intersectionBounds[0]}}^{${twoPreset.intersectionBounds[1]}} [f(x) - g(x)] \\, dx = ${twoPreset.exactArea.toFixed(3)} \\text{ satuan luas}`} display />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-icon emerald">📝</div>
                <div className="card-title">Langkah Integrasi Luas Daerah</div>
              </div>
              <div className="quiz-steps-list">
                {twoPreset.stepLatex.map((st, i) => (
                  <div key={i} className="quiz-step-item">
                    <div className="quiz-step-num">{i + 1}</div>
                    <div className="quiz-step-latex">
                      <KTeX math={st} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Mission Card */}
        <div className="mission-card">
          <div className="mission-tag">🎯 Misi Pemahaman</div>
          {mode === 'riemann' ? (
            <p className="mission-text">
              Jalankan animasi konvergensi partisi <strong>n → ∞</strong>.
              Saksikan balok-balok diskrit melebur mulus menjadi kurva kontinu.
              Taraf error akan turun drastis di bawah <strong>0.5%</strong>!
            </p>
          ) : (
            <p className="mission-text">
              Daerah berarsir kuning adalah wilayah tertutup di antara kedua kurva.
              Luasnya dihitung dengan mengurangkan kurva atas f(x) dengan kurva bawah g(x) pada rentang titik potong keduanya.
            </p>
          )}
        </div>

        {/* Navigation to Quiz CTA */}
        {onNavigateNext && (
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: 'var(--text-sm)', background: 'linear-gradient(135deg, #fb7185, #f43f5e)' }}
              onClick={onNavigateNext}
            >
              Uji Pemahaman di Kuis & Evaluasi 🎯 →
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: Canvas Panel ── */}
      <div className="canvas-panel animate-slide-in-right">
        {/* HUD */}
        <div className="canvas-hud">
          {mode === 'riemann' ? (
            <>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">Partisi n:</span>
                <span className="canvas-hud-value amber">{n}</span>
              </div>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">Σ Riemann:</span>
                <span className="canvas-hud-value cyan">{riemannSum.toFixed(4)}</span>
              </div>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">∫ Eksak:</span>
                <span className="canvas-hud-value emerald">{exactValue.toFixed(4)}</span>
              </div>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">Error:</span>
                <span className="canvas-hud-value" style={{ color: errorPercent < 1 ? '#34d399' : errorPercent < 5 ? '#fbbf24' : '#fb7185' }}>
                  {errorPercent.toFixed(2)}%
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">Titik Potong a:</span>
                <span className="canvas-hud-value amber">{twoPreset.intersectionBounds[0]}</span>
              </div>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">Titik Potong b:</span>
                <span className="canvas-hud-value amber">{twoPreset.intersectionBounds[1]}</span>
              </div>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">Luas Daerah L:</span>
                <span className="canvas-hud-value emerald">{twoPreset.exactArea.toFixed(3)}</span>
              </div>
            </>
          )}
        </div>

        {mode === 'riemann' ? (
          <CoordinateCanvas config={configSingle} evalFn={fn.f} title="Grafik Jumlah Riemann & Luas">
            {/* Riemann Rectangles */}
            {rects.map((r, i) => (
              <path key={i} d={r.path} fill={r.fill} stroke={r.stroke} strokeWidth="1" />
            ))}

            {/* Boundary Vertical Lines */}
            <line
              x1={toSX(a, configSingle)} y1={0}
              x2={toSX(a, configSingle)} y2={configSingle.height}
              stroke="#34d399" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6"
            />
            <line
              x1={toSX(b, configSingle)} y1={0}
              x2={toSX(b, configSingle)} y2={configSingle.height}
              stroke="#34d399" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6"
            />

            <text
              x={toSX(a, configSingle)} y={configSingle.height - 8}
              textAnchor="middle" fill="#34d399" fontSize="11"
              fontWeight="700" fontFamily="'JetBrains Mono', monospace"
            >
              a={a.toFixed(1)}
            </text>
            <text
              x={toSX(b, configSingle)} y={configSingle.height - 8}
              textAnchor="middle" fill="#34d399" fontSize="11"
              fontWeight="700" fontFamily="'JetBrains Mono', monospace"
            >
              b={b.toFixed(1)}
            </text>

            {/* Main Curve */}
            <path d={curvePath} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />

            {/* Delta x width on first box if n is reasonable */}
            {n <= 16 && n > 0 && (
              <text
                x={(toSX(a, configSingle) + toSX(a + dx, configSingle)) / 2}
                y={toSY(0, configSingle) + 20}
                textAnchor="middle" fill="#fbbf24" fontSize="9"
                fontFamily="'JetBrains Mono', monospace"
              >
                Δx={dx.toFixed(2)}
              </text>
            )}
          </CoordinateCanvas>
        ) : (
          <CoordinateCanvas config={configTwoCurves} title="Grafik Luas Antara 2 Kurva">
            {/* Shaded Area between curves */}
            <path
              d={twoCurvesShadedArea}
              fill="rgba(251, 191, 36, 0.25)"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />

            {/* Curve f(x) */}
            <path d={twoCurvesPaths.pathF} fill="none" stroke="#22d3ee" strokeWidth="3" />
            <text
              x={toSX(0, configTwoCurves)}
              y={toSY(twoPreset.f(0), configTwoCurves) - 10}
              textAnchor="middle" fill="#22d3ee" fontSize="11" fontWeight="700"
              fontFamily="'JetBrains Mono', monospace"
            >
              f(x)
            </text>

            {/* Curve g(x) */}
            <path d={twoCurvesPaths.pathG} fill="none" stroke="#a78bfa" strokeWidth="2.5" />
            <text
              x={toSX(0, configTwoCurves)}
              y={toSY(twoPreset.g(0), configTwoCurves) + 18}
              textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="700"
              fontFamily="'JetBrains Mono', monospace"
            >
              g(x)
            </text>

            {/* Intersection points */}
            {twoPreset.intersectionBounds.map((ptX, idx) => {
              const ptY = twoPreset.f(ptX);
              return (
                <g key={idx}>
                  <circle
                    cx={toSX(ptX, configTwoCurves)}
                    cy={toSY(ptY, configTwoCurves)}
                    r="6.5"
                    fill="#34d399"
                  />
                  <text
                    x={toSX(ptX, configTwoCurves)}
                    y={toSY(ptY, configTwoCurves) - 12}
                    textAnchor="middle"
                    fill="#34d399"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    ({ptX}, {ptY})
                  </text>
                </g>
              );
            })}
          </CoordinateCanvas>
        )}
      </div>
    </div>
  );
};

export default IntegralModule;
