import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import KTeX from './KTeX';
import CoordinateCanvas, { CanvasConfig, toSX, toSY } from './CoordinateCanvas';
import { sound } from '../utils/audio';

/* =============================================================
   MODUL LIMIT — Visualisasi Interaktif Lanjutan
   - Limit aljabar & trigonometri di titik berhingga
   - Limit menuju ketakhinggaan (x → ∞) & Asimtot datar
   - Kasus Limit Tidak Ada (Diskontinuitas Lompat / Jump Discontinuity)
   - Tabel Pendekatan Numerik Real-time
   - Pembahasan Aljabar Langkah demi Langkah (KaTeX)
   - Pita Epsilon-Delta (ε-δ) Interaktif
   - Animasi Peluncuran Probe Otomatis
   ============================================================= */

export type LimitKind = 'finite' | 'infinity' | 'nonexistent';

export type LimitFunction = {
  id: string;
  kind: LimitKind;
  label: string;
  latex: string;
  latexLimit: string;
  f: (x: number) => number;
  singularity: number; // For finite; for infinity it can be infinity target
  limitValue: number | null; // null if limit doesn't exist
  steps: string[];
  desc: string;
  isInfinity?: boolean;
};

export const LIMIT_FUNCTIONS: LimitFunction[] = [
  // ── Aljabar Berhingga ──
  {
    id: 'aljabar1',
    kind: 'finite',
    label: '(x² − 4) / (x − 2)',
    latex: 'f(x) = \\frac{x^2 - 4}{x - 2}',
    latexLimit: '\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = 4',
    f: (x: number) => (x * x - 4) / (x - 2),
    singularity: 2,
    limitValue: 4,
    steps: [
      '\\text{Substitusi langsung: } \\frac{2^2 - 4}{2 - 2} = \\frac{0}{0} \\quad (\\text{Bentuk Tak Tentu})',
      '\\text{Faktorkan pembilang: } x^2 - 4 = (x - 2)(x + 2)',
      '\\text{Eliminasi faktor pembuat nol } (x - 2): \\lim_{x \\to 2} (x + 2)',
      '\\text{Substitusi nilai limit: } 2 + 2 = 4',
    ],
    desc: 'Limit aljabar dengan pemfaktoran selisih kuadrat. Di x = 2 fungsi berlubang (hole), namun pendekatan dari kiri dan kanan berkonvergen sempurna ke y = 4.',
  },
  {
    id: 'akar1',
    kind: 'finite',
    label: '(√(x + 4) − 2) / x',
    latex: 'f(x) = \\frac{\\sqrt{x + 4} - 2}{x}',
    latexLimit: '\\lim_{x \\to 0} \\frac{\\sqrt{x + 4} - 2}{x} = \\frac{1}{4} = 0.25',
    f: (x: number) => (Math.sqrt(x + 4) - 2) / x,
    singularity: 0,
    limitValue: 0.25,
    steps: [
      '\\text{Substitusi langsung: } \\frac{\\sqrt{0 + 4} - 2}{0} = \\frac{0}{0}',
      '\\text{Kalikan sekawan: } \\frac{\\sqrt{x+4}-2}{x} \\cdot \\frac{\\sqrt{x+4}+2}{\\sqrt{x+4}+2}',
      '\\text{Sederhanakan pembilang: } \\frac{(x + 4) - 4}{x(\\sqrt{x+4}+2)} = \\frac{x}{x(\\sqrt{x+4}+2)} = \\frac{1}{\\sqrt{x+4}+2}',
      '\\text{Substitusi } x \\to 0: \\frac{1}{\\sqrt{0+4}+2} = \\frac{1}{2 + 2} = \\frac{1}{4} = 0.25',
    ],
    desc: 'Metode perkalian bentuk sekawan pada bentuk irasional untuk menghilangkan pembagi nol.',
  },
  {
    id: 'trig1',
    kind: 'finite',
    label: 'sin(x) / x',
    latex: 'f(x) = \\frac{\\sin(x)}{x}',
    latexLimit: '\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1',
    f: (x: number) => Math.sin(x) / x,
    singularity: 0,
    limitValue: 1,
    steps: [
      '\\text{Bentuk tak tentu di } x = 0: \\frac{\\sin 0}{0} = \\frac{0}{0}',
      '\\text{Berdasarkan Teorema Apit (Squeeze Theorem) pada lingkaran satuan:}',
      '\\cos(x) < \\frac{\\sin(x)}{x} < 1 \\quad \\text{untuk } x \\in \\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)',
      '\\text{Karena } \\lim_{x \\to 0} \\cos(x) = 1 \\text{ dan } \\lim_{x \\to 0} 1 = 1, \\text{ maka } \\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1',
    ],
    desc: 'Limit trigonometri fundamental paling terkenal dalam kalkulus, dibuktikan melalui Teorema Apit.',
  },
  {
    id: 'trig2',
    kind: 'finite',
    label: '(1 − cos(x)) / x',
    latex: 'f(x) = \\frac{1 - \\cos(x)}{x}',
    latexLimit: '\\lim_{x \\to 0} \\frac{1 - \\cos(x)}{x} = 0',
    f: (x: number) => (1 - Math.cos(x)) / x,
    singularity: 0,
    limitValue: 0,
    steps: [
      '\\text{Bentuk awal: } \\frac{1 - \\cos 0}{0} = \\frac{0}{0}',
      '\\text{Ubah dengan sudut rangkap: } 1 - \\cos(x) = 2\\sin^2\\left(\\frac{x}{2}\\right)',
      '\\lim_{x \\to 0} \\frac{2\\sin^2(x/2)}{x} = \\lim_{x \\to 0} \\left[ \\frac{\\sin(x/2)}{x/2} \\cdot \\sin\\left(\\frac{x}{2}\\right) \\right]',
      '\\text{Evaluasi limit: } 1 \\cdot \\sin(0) = 1 \\cdot 0 = 0',
    ],
    desc: 'Limit trigonometri klasik kedua, laju kelengkungan cosinus di sekitar x = 0 sebanding dengan x², sehingga pembagian dengan x menghasilkan 0.',
  },
  {
    id: 'trig3',
    kind: 'finite',
    label: 'tan(2x) / x',
    latex: 'f(x) = \\frac{\\tan(2x)}{x}',
    latexLimit: '\\lim_{x \\to 0} \\frac{\\tan(2x)}{x} = 2',
    f: (x: number) => Math.tan(2 * x) / x,
    singularity: 0,
    limitValue: 2,
    steps: [
      '\\text{Ubah tangen menjadi sinus per cosinus: } \\frac{\\sin(2x)}{x \\cos(2x)}',
      '\\lim_{x \\to 0} \\left( \\frac{\\sin(2x)}{2x} \\cdot \\frac{2}{\\cos(2x)} \\right)',
      '\\text{Gunakan sifat } \\lim_{u \\to 0} \\frac{\\sin u}{u} = 1: 1 \\cdot \\frac{2}{\\cos(0)} = 1 \\cdot 2 = 2',
    ],
    desc: 'Penerapan sifat limit trigonometri rasio sudut rangkap.',
  },

  // ── Kasus Limit Tidak Ada (Jump Discontinuity) ──
  {
    id: 'nonexistent1',
    kind: 'nonexistent',
    label: '|x| / x (Limit Tidak Ada)',
    latex: 'f(x) = \\frac{|x|}{x} = \\operatorname{sgn}(x)',
    latexLimit: '\\lim_{x \\to 0} \\frac{|x|}{x} = \\text{TIDAK ADA}',
    f: (x: number) => (x > 0 ? 1 : x < 0 ? -1 : NaN),
    singularity: 0,
    limitValue: null,
    steps: [
      '\\text{Definisi nilai mutlak: } |x| = x \\text{ jika } x > 0, \\text{ dan } |x| = -x \\text{ jika } x < 0',
      '\\text{Pendekatan Kiri } (x \\to 0^-): \\lim_{x \\to 0^-} \\frac{-x}{x} = -1',
      '\\text{Pendekatan Kanan } (x \\to 0^+): \\lim_{x \\to 0^+} \\frac{x}{x} = +1',
      '\\text{Karena } \\lim_{x \\to 0^-} f(x) \\neq \\lim_{x \\to 0^+} f(x), \\text{ maka limit di } x = 0 \\textbf{ TIDAK ADA!}',
    ],
    desc: 'Contoh krusial di SMA: Limit HANYA ada jika pendekatan kiri sama dengan pendekatan kanan. Pada fungsi tanda ini, terjadi loncatan dari -1 ke +1.',
  },

  // ── Limit di Ketakhinggaan (x → ∞) ──
  {
    id: 'infinity1',
    kind: 'infinity',
    isInfinity: true,
    label: '(2x² + 1) / (x² + 3)  [x → ∞]',
    latex: 'f(x) = \\frac{2x^2 + 1}{x^2 + 3}',
    latexLimit: '\\lim_{x \\to \\infty} \\frac{2x^2 + 1}{x^2 + 3} = 2',
    f: (x: number) => (2 * x * x + 1) / (x * x + 3),
    singularity: 10, // representative large probe
    limitValue: 2,
    steps: [
      '\\text{Bentuk tak tentu: } \\frac{\\infty}{\\infty}',
      '\\text{Bagi pembilang dan penyebut dengan pangkat tertinggi } x^2:',
      '\\lim_{x \\to \\infty} \\frac{2 + \\frac{1}{x^2}}{1 + \\frac{3}{x^2}}',
      '\\text{Karena } \\lim_{x \\to \\infty} \\frac{1}{x^2} = 0: \\frac{2 + 0}{1 + 0} = 2',
      '\\text{Garis } y = 2 \\text{ adalah asimtot datar (horizontal asymptote).}',
    ],
    desc: 'Limit di ketakhinggaan dengan derajat pembilang sama dengan derajat penyebut. Kurva mendekati garis asimtot horizontal y = 2.',
  },
  {
    id: 'infinity2',
    kind: 'infinity',
    isInfinity: true,
    label: '(4x − 2) / (x² + 1)  [x → ∞]',
    latex: 'f(x) = \\frac{4x - 2}{x^2 + 1}',
    latexLimit: '\\lim_{x \\to \\infty} \\frac{4x - 2}{x^2 + 1} = 0',
    f: (x: number) => (4 * x - 2) / (x * x + 1),
    singularity: 10,
    limitValue: 0,
    steps: [
      '\\text{Derajat pembilang (1) < Derajat penyebut (2):}',
      '\\lim_{x \\to \\infty} \\frac{\\frac{4}{x} - \\frac{2}{x^2}}{1 + \\frac{1}{x^2}} = \\frac{0 - 0}{1 + 0} = 0',
      '\\text{Kurva semakin mendekati sumbu-x } (y = 0) \\text{ saat x membesar.}',
    ],
    desc: 'Karena penyebut tumbuh jauh lebih cepat dibanding pembilang, nilai fungsi teredam menuju nol.',
  },
];

interface LimitModuleProps {
  onNavigateNext?: () => void;
}

export const LimitModule: React.FC<LimitModuleProps> = ({ onNavigateNext }) => {
  const [selectedFnId, setSelectedFnId] = useState('aljabar1');
  const [probeOffset, setProbeOffset] = useState(1.5); // distance from singularity
  const [largeX, setLargeX] = useState(8); // for infinity limit
  const [showEpsilonDelta, setShowEpsilonDelta] = useState(false);
  const [epsilon, setEpsilon] = useState(0.5);
  const [showSteps, setShowSteps] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const [isApproaching, setIsApproaching] = useState(false);
  const animRef = useRef<number | null>(null);

  const fn = LIMIT_FUNCTIONS.find((f) => f.id === selectedFnId)!;
  const isInf = fn.isInfinity;
  const s = fn.singularity;

  // Probe values for finite limit
  const xLeft = s - probeOffset;
  const xRight = s + probeOffset;
  const yLeft = fn.f(xLeft);
  const yRight = fn.f(xRight);
  const errorLeft = fn.limitValue !== null ? Math.abs(yLeft - fn.limitValue) : NaN;
  const errorRight = fn.limitValue !== null ? Math.abs(yRight - fn.limitValue) : NaN;

  // For infinity limit
  const yInf = fn.f(largeX);
  const errorInf = fn.limitValue !== null ? Math.abs(yInf - fn.limitValue) : NaN;

  // Automated approach animation
  const toggleApproach = useCallback(() => {
    if (isApproaching) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setIsApproaching(false);
    } else {
      setIsApproaching(true);
      sound.playPop(520);
      let currentDist = isInf ? 2 : 2.5;

      const animateStep = () => {
        if (isInf) {
          currentDist += 0.2;
          if (currentDist > 25) {
            setIsApproaching(false);
            sound.playSuccess();
            return;
          }
          setLargeX(currentDist);
        } else {
          currentDist *= 0.96;
          if (currentDist < 0.005) {
            setProbeOffset(0.002);
            setIsApproaching(false);
            sound.playSuccess();
            return;
          }
          setProbeOffset(currentDist);
        }
        animRef.current = requestAnimationFrame(animateStep);
      };
      animRef.current = requestAnimationFrame(animateStep);
    }
  }, [isApproaching, isInf]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Canvas configuration adapted to function
  const config: CanvasConfig = useMemo(() => {
    if (isInf) {
      return { xMin: -1, xMax: 20, yMin: -0.5, yMax: 3.0, width: 600, height: 450 };
    }
    if (fn.id === 'nonexistent1') {
      return { xMin: -4, xMax: 4, yMin: -2.5, yMax: 2.5, width: 600, height: 450 };
    }
    if (fn.singularity === 0) {
      return { xMin: -5, xMax: 5, yMin: -1.5, yMax: 2.5, width: 600, height: 450 };
    }
    const L = fn.limitValue ?? 4;
    return {
      xMin: s - 4.5,
      xMax: s + 4.5,
      yMin: L - 3.5,
      yMax: L + 3.5,
      width: 600,
      height: 450,
    };
  }, [fn, s, isInf]);

  // Delta calculation for Epsilon-Delta visualization: |x - s| < delta implies |f(x) - L| < epsilon
  const delta = useMemo(() => {
    if (!showEpsilonDelta || fn.limitValue === null) return 0;
    // For linear approximation delta ≈ epsilon / |slope|
    if (fn.id === 'aljabar1') return epsilon; // slope = 1
    if (fn.id === 'trig1') return Math.sqrt(6 * epsilon);
    return epsilon * 0.8;
  }, [showEpsilonDelta, epsilon, fn]);

  // Generate curve path, skipping singularity
  const curvePath = useMemo(() => {
    const segments: string[] = [];
    const steps = 350;
    const dx = (config.xMax - config.xMin) / steps;
    let inPath = false;

    for (let i = 0; i <= steps; i++) {
      const x = config.xMin + i * dx;
      if (!isInf && Math.abs(x - s) < 0.02) {
        inPath = false;
        continue;
      }
      const y = fn.f(x);
      if (!isFinite(y) || Math.abs(y) > 50) {
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
  }, [fn, config, s, isInf]);

  // Numerical approach table points
  const tableData = useMemo(() => {
    if (isInf) {
      const xVals = [5, 10, 25, 50, 100, 500, 1000];
      return xVals.map((xv) => ({
        x: xv,
        fx: fn.f(xv),
        err: fn.limitValue !== null ? Math.abs(fn.f(xv) - fn.limitValue) : NaN,
      }));
    }
    const offsets = [0.5, 0.1, 0.05, 0.01, 0.001];
    return offsets.map((off) => {
      const xl = s - off;
      const xr = s + off;
      return {
        off,
        xl,
        yl: fn.f(xl),
        xr,
        yr: fn.f(xr),
      };
    });
  }, [fn, s, isInf]);

  return (
    <div className="lesson-layout">
      {/* ── LEFT: Content Panel ── */}
      <div className="content-panel animate-slide-in-left">
        {/* Function Selector with Categories */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon cyan">∞</div>
            <div>
              <div className="card-title">Pilih Kasus Limit</div>
              <div className="card-subtitle">Aljabar, Trigonometri, Asimtot, & Kasus Khusus</div>
            </div>
          </div>
          <select
            className="custom-select"
            style={{ width: '100%' }}
            value={selectedFnId}
            onChange={(e) => {
              sound.playPop(480);
              setSelectedFnId(e.target.value);
              setProbeOffset(1.5);
              setLargeX(8);
              if (isApproaching && animRef.current) {
                cancelAnimationFrame(animRef.current);
                setIsApproaching(false);
              }
            }}
          >
            <optgroup label="Limit Titik Berhingga (Aljabar & Bentuk Akar)">
              {LIMIT_FUNCTIONS.filter((f) => f.kind === 'finite' && !f.id.startsWith('trig')).map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </optgroup>
            <optgroup label="Limit Fungsi Trigonometri">
              {LIMIT_FUNCTIONS.filter((f) => f.id.startsWith('trig')).map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </optgroup>
            <optgroup label="Kasus Konseptual (Limit Tidak Ada)">
              {LIMIT_FUNCTIONS.filter((f) => f.kind === 'nonexistent').map((f) => (
                <option key={f.id} value={f.id}>⚠️ {f.label}</option>
              ))}
            </optgroup>
            <optgroup label="Limit di Ketakhinggaan (x → ∞ & Asimtot)">
              {LIMIT_FUNCTIONS.filter((f) => f.kind === 'infinity').map((f) => (
                <option key={f.id} value={f.id}>🌌 {f.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Formula Display */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon violet">𝑓</div>
            <div className="card-title">Definisi Fungsi & Nilai Limit</div>
          </div>
          <div className="formula-display" style={{ textAlign: 'center', padding: '14px' }}>
            <KTeX math={fn.latex} display />
          </div>
          <div style={{ marginTop: '10px' }}>
            <div className="formula-highlight">
              <KTeX math={fn.latexLimit} display />
            </div>
          </div>
        </div>

        {/* Step-by-Step Proof Accordion */}
        <div className="card">
          <div
            className="card-header"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setShowSteps(!showSteps)}
          >
            <div className="card-icon emerald">📝</div>
            <div style={{ flex: 1 }}>
              <div className="card-title">Pembuktian Aljabar Langkah Demi Langkah</div>
              <div className="card-subtitle">Klik untuk {showSteps ? 'sembunyikan' : 'tampilkan'} penyelesaian analitis</div>
            </div>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
              {showSteps ? '▲' : '▼'}
            </span>
          </div>

          {showSteps && (
            <div className="quiz-steps-list" style={{ marginTop: '12px' }}>
              {fn.steps.map((st, i) => (
                <div key={i} className="quiz-step-item">
                  <div className="quiz-step-num">{i + 1}</div>
                  <div className="quiz-step-latex">
                    <KTeX math={st} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Probe / Approach Slider Controls */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon amber">🎯</div>
            <div className="card-title">
              {isInf ? 'Nilai x Menuju Tak Hingga' : `Kontrol Pendekatan ke Titik x = ${s}`}
            </div>
          </div>

          {!isInf ? (
            <>
              <div className="slider-group">
                <div className="slider-label">
                  <span>Jarak probe dari x = {s} (|x − c|)</span>
                  <span className="slider-label-value">{probeOffset.toFixed(4)}</span>
                </div>
                <input
                  type="range"
                  min={0.001}
                  max={2.5}
                  step={0.001}
                  value={probeOffset}
                  onChange={(e) => setProbeOffset(parseFloat(e.target.value))}
                />
              </div>

              {/* Quick step buttons */}
              <div style={{ marginTop: '10px' }}>
                <div className="steps-row">
                  {[2.0, 1.0, 0.5, 0.1, 0.01, 0.001].map((v) => (
                    <button
                      key={v}
                      className={`step-chip ${Math.abs(probeOffset - v) < 0.0005 ? 'active' : ''}`}
                      onClick={() => {
                        sound.playPop(500);
                        setProbeOffset(v);
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="slider-group">
                <div className="slider-label">
                  <span>Nilai x (menuju ∞)</span>
                  <span className="slider-label-value">x = {largeX.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  step={0.1}
                  value={largeX}
                  onChange={(e) => setLargeX(parseFloat(e.target.value))}
                />
              </div>

              <div className="steps-row" style={{ marginTop: '10px' }}>
                {[2, 5, 10, 15, 20, 25].map((v) => (
                  <button
                    key={v}
                    className={`step-chip ${Math.abs(largeX - v) < 0.1 ? 'active' : ''}`}
                    onClick={() => {
                      sound.playPop(500);
                      setLargeX(v);
                    }}
                  >
                    x = {v}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Action: Auto-approach animation */}
          <div className="btn-group" style={{ marginTop: '14px' }}>
            <button
              className={`btn ${isApproaching ? 'btn-danger' : 'btn-primary'}`}
              style={{ flex: 1 }}
              onClick={toggleApproach}
            >
              {isApproaching ? '⏸ Jeda Animasi' : '▶ Simulasikan Pendekatan Otomatis'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                sound.playPop(350);
                setProbeOffset(1.5);
                setLargeX(8);
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Epsilon-Delta Option Toggle (Only for finite with limit) */}
        {!isInf && fn.limitValue !== null && (
          <div className="card">
            <div className="card-header" style={{ marginBottom: '8px' }}>
              <div className="card-icon rose">📏</div>
              <div style={{ flex: 1 }}>
                <div className="card-title">Pita Presisi Epsilon-Delta (ε-δ)</div>
                <div className="card-subtitle">Visualisasi formal definisi kalkulus lanjut</div>
              </div>
              <input
                type="checkbox"
                id="toggle-eps-delta"
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                checked={showEpsilonDelta}
                onChange={(e) => setShowEpsilonDelta(e.target.checked)}
              />
            </div>

            {showEpsilonDelta && (
              <div className="slider-group" style={{ marginTop: '12px' }}>
                <div className="slider-label">
                  <span>Toleransi Vertikal Epsilon (ε)</span>
                  <span className="slider-label-value">ε = {epsilon.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.5}
                  step={0.05}
                  value={epsilon}
                  onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Jika rentang x berada di dalam selang <KTeX math={`(${s} - \\delta, ${s} + \\delta)`} />, maka nilai f(x) dijamin berada di dalam <KTeX math={`(${fn.limitValue} - \\epsilon, ${fn.limitValue} + \\epsilon)`} />.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Numerical Table of Values */}
        <div className="card">
          <div
            className="card-header"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setShowTable(!showTable)}
          >
            <div className="card-icon cyan">📊</div>
            <div style={{ flex: 1 }}>
              <div className="card-title">Tabel Pendekatan Numerik</div>
              <div className="card-subtitle">Bukti konvergensi angka tabel textbook</div>
            </div>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
              {showTable ? '▲' : '▼'}
            </span>
          </div>

          {showTable && (
            <div style={{ overflowX: 'auto', marginTop: '10px' }}>
              {!isInf ? (
                <table className="custom-table" style={{ width: '100%', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr>
                      <th>Jarak</th>
                      <th>x⁻ (Kiri)</th>
                      <th>f(x⁻)</th>
                      <th>x⁺ (Kanan)</th>
                      <th>f(x⁺)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row: any, idx) => (
                      <tr key={idx}>
                        <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>±{row.off}</td>
                        <td>{row.xl.toFixed(3)}</td>
                        <td style={{ color: 'var(--accent-cyan)' }}>{isFinite(row.yl) ? row.yl.toFixed(5) : 'undef'}</td>
                        <td>{row.xr.toFixed(3)}</td>
                        <td style={{ color: 'var(--accent-rose)' }}>{isFinite(row.yr) ? row.yr.toFixed(5) : 'undef'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="custom-table" style={{ width: '100%', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr>
                      <th>Nilai x</th>
                      <th>Nilai f(x)</th>
                      <th>Selisih |f(x) − L|</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row: any, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>x = {row.x}</td>
                        <td style={{ color: 'var(--accent-cyan)' }}>{row.fx.toFixed(6)}</td>
                        <td style={{ color: 'var(--accent-amber)' }}>{row.err.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Conceptual Mission & Status */}
        <div className="mission-card">
          <div className="mission-tag">🔬 Catatan Konseptual</div>
          {fn.kind === 'nonexistent' ? (
            <p className="mission-text" style={{ color: 'var(--accent-rose)' }}>
              <strong>Perhatian:</strong> Perhatikan probe kiri f(x⁻) = -1.0 dan probe kanan f(x⁺) = +1.0. Keduanya <strong>tidak bertemu di satu titik</strong>! Inilah bukti bahwa limit tidak memiliki nilai (tidak terdefinisi).
            </p>
          ) : isInf ? (
            <p className="mission-text">
              Perbesar nilai <strong>x</strong> menuju nilai yang sangat besar. Amati kurva semakin merapat ke garis asimtot horizontal <strong>y = {fn.limitValue}</strong>.
            </p>
          ) : (
            <p className="mission-text">
              Geser slider hingga jarak mendekati 0. Walaupun di titik singularitas <strong>x = {s}</strong> fungsi berlubang/tak tentu (0/0), kedua probe berkonvergen sempurna ke bilangan limit yang sama!
            </p>
          )}
        </div>

        {/* Module Navigation CTA */}
        {onNavigateNext && (
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: 'var(--text-sm)' }}
              onClick={onNavigateNext}
            >
              Lanjut ke Modul Turunan (Diferensial) →
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: Canvas Panel ── */}
      <div className="canvas-panel animate-slide-in-right">
        {/* HUD Overlay */}
        <div className="canvas-hud">
          <div className="canvas-hud-row">
            <span className="canvas-hud-label">Limit L:</span>
            <span className="canvas-hud-value emerald">
              {fn.limitValue !== null ? fn.limitValue : 'TIDAK ADA'}
            </span>
          </div>
          {!isInf ? (
            <>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">f(x⁻):</span>
                <span className="canvas-hud-value cyan">{isFinite(yLeft) ? yLeft.toFixed(4) : 'undef'}</span>
              </div>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">f(x⁺):</span>
                <span className="canvas-hud-value rose">{isFinite(yRight) ? yRight.toFixed(4) : 'undef'}</span>
              </div>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">Jarak:</span>
                <span className="canvas-hud-value amber">{probeOffset.toFixed(4)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">x:</span>
                <span className="canvas-hud-value amber">{largeX.toFixed(2)}</span>
              </div>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">f(x):</span>
                <span className="canvas-hud-value cyan">{yInf.toFixed(5)}</span>
              </div>
              <div className="canvas-hud-row">
                <span className="canvas-hud-label">|f(x) − L|:</span>
                <span className="canvas-hud-value violet">{errorInf.toFixed(5)}</span>
              </div>
            </>
          )}
        </div>

        <CoordinateCanvas config={config}>
          {/* Epsilon band (horizontal region L ± epsilon) */}
          {showEpsilonDelta && fn.limitValue !== null && (
            <rect
              x={0}
              y={toSY(fn.limitValue + epsilon, config)}
              width={config.width}
              height={toSY(fn.limitValue - epsilon, config) - toSY(fn.limitValue + epsilon, config)}
              fill="rgba(52, 211, 153, 0.08)"
              stroke="rgba(52, 211, 153, 0.3)"
              strokeDasharray="4 4"
            />
          )}

          {/* Delta band (vertical region s ± delta) */}
          {showEpsilonDelta && !isInf && (
            <rect
              x={toSX(s - delta, config)}
              y={0}
              width={toSX(s + delta, config) - toSX(s - delta, config)}
              height={config.height}
              fill="rgba(167, 139, 250, 0.07)"
              stroke="rgba(167, 139, 250, 0.3)"
              strokeDasharray="4 4"
            />
          )}

          {/* Limit horizontal reference line */}
          {fn.limitValue !== null && (
            <>
              <line
                x1={0}
                y1={toSY(fn.limitValue, config)}
                x2={config.width}
                y2={toSY(fn.limitValue, config)}
                stroke="#34d399"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity="0.6"
              />
              <text
                x={config.width - 10}
                y={toSY(fn.limitValue, config) - 8}
                fill="#34d399"
                fontSize="11"
                textAnchor="end"
                fontWeight="700"
                fontFamily="'JetBrains Mono', monospace"
              >
                {isInf ? `Asimtot y = ${fn.limitValue}` : `L = ${fn.limitValue}`}
              </text>
            </>
          )}

          {/* Main Curve */}
          <path d={curvePath} fill="none" stroke="#22d3ee" strokeWidth="2.8" strokeLinecap="round" />

          {/* For jump discontinuity (nonexistent limit): show open/closed circles at -1 and 1 */}
          {fn.id === 'nonexistent1' && (
            <>
              <circle cx={toSX(0, config)} cy={toSY(1, config)} r="6" fill="#0d1730" stroke="#22d3ee" strokeWidth="2" />
              <circle cx={toSX(0, config)} cy={toSY(-1, config)} r="6" fill="#0d1730" stroke="#22d3ee" strokeWidth="2" />
            </>
          )}

          {/* Hole at finite singularity if limit exists */}
          {!isInf && fn.limitValue !== null && fn.id !== 'nonexistent1' && (
            <circle
              cx={toSX(s, config)}
              cy={toSY(fn.limitValue, config)}
              r="6.5"
              fill="#0d1730"
              stroke="#22d3ee"
              strokeWidth="2.5"
            />
          )}

          {/* Probes for finite limit */}
          {!isInf && (
            <>
              {/* Vertical dotted drop lines */}
              <line
                x1={toSX(xLeft, config)} y1={toSY(0, config)}
                x2={toSX(xLeft, config)} y2={toSY(yLeft, config)}
                stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"
              />
              <line
                x1={toSX(xRight, config)} y1={toSY(0, config)}
                x2={toSX(xRight, config)} y2={toSY(yRight, config)}
                stroke="#fb7185" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"
              />

              {/* Left probe circle */}
              {isFinite(yLeft) && (
                <g>
                  <circle cx={toSX(xLeft, config)} cy={toSY(yLeft, config)} r="7" fill="#22d3ee" />
                  <circle cx={toSX(xLeft, config)} cy={toSY(yLeft, config)} r="13" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.3" />
                  <text
                    x={toSX(xLeft, config)}
                    y={toSY(yLeft, config) - 16}
                    textAnchor="middle" fill="#22d3ee"
                    fontSize="10" fontWeight="600" fontFamily="'JetBrains Mono', monospace"
                  >
                    x⁻={xLeft.toFixed(2)}
                  </text>
                </g>
              )}

              {/* Right probe circle */}
              {isFinite(yRight) && (
                <g>
                  <circle cx={toSX(xRight, config)} cy={toSY(yRight, config)} r="7" fill="#fb7185" />
                  <circle cx={toSX(xRight, config)} cy={toSY(yRight, config)} r="13" fill="none" stroke="#fb7185" strokeWidth="1.5" opacity="0.3" />
                  <text
                    x={toSX(xRight, config)}
                    y={toSY(yRight, config) - 16}
                    textAnchor="middle" fill="#fb7185"
                    fontSize="10" fontWeight="600" fontFamily="'JetBrains Mono', monospace"
                  >
                    x⁺={xRight.toFixed(2)}
                  </text>
                </g>
              )}
            </>
          )}

          {/* Infinity Probe */}
          {isInf && isFinite(yInf) && (
            <g>
              <line
                x1={toSX(largeX, config)} y1={toSY(0, config)}
                x2={toSX(largeX, config)} y2={toSY(yInf, config)}
                stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7"
              />
              <circle cx={toSX(largeX, config)} cy={toSY(yInf, config)} r="8" fill="#fbbf24" />
              <circle cx={toSX(largeX, config)} cy={toSY(yInf, config)} r="14" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.3" />
              <text
                x={toSX(largeX, config)}
                y={toSY(yInf, config) - 16}
                textAnchor="middle" fill="#fbbf24"
                fontSize="10" fontWeight="700" fontFamily="'JetBrains Mono', monospace"
              >
                ({largeX.toFixed(1)}, {yInf.toFixed(3)})
              </text>
            </g>
          )}
        </CoordinateCanvas>
      </div>
    </div>
  );
};

export default LimitModule;
