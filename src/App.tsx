import React, { useState, useMemo } from 'react';
import LimitModule from './components/LimitModule';
import DerivativeModule from './components/DerivativeModule';
import IntegralModule from './components/IntegralModule';
import QuizModule from './components/QuizModule';
import FormulaModal from './components/FormulaModal';
import { sound } from './utils/audio';

/* =============================================================
   ANTIGRAVITY — Main Application Shell
   Platform Bahan Ajar Matematika Tingkat Lanjut (SMA TL)
   ============================================================= */

type Page = 'home' | 'limit' | 'derivative' | 'integral' | 'quiz';

// Floating particles for ambient background
const Particles: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animDuration: `${8 + Math.random() * 16}s`,
      animDelay: `${Math.random() * 10}s`,
      size: `${1.5 + Math.random() * 2}px`,
      opacity: 0.2 + Math.random() * 0.4,
      color: ['#22d3ee', '#a78bfa', '#fbbf24', '#34d399', '#fb7185'][Math.floor(Math.random() * 5)],
    }));
  }, []);

  return (
    <div className="particles-bg">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: p.animDuration,
            animationDelay: p.animDelay,
            boxShadow: `0 0 6px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  const toggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    sound.enabled = !next;
    if (!next) sound.playPop(520);
  };

  const navigateTo = (p: Page) => {
    sound.playPop(480);
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const moduleData = [
    {
      id: 'limit' as Page,
      icon: '∞',
      iconBg: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
      title: 'Limit Fungsi',
      subtitle: 'Aljabar, Trigonometri, & Asimtot Tak Hingga',
      desc: 'Visualisasikan konvergensi kiri-kanan, titik berlubang (hole), asimtot ketakhinggaan, dan kasus ketika limit tidak terdefinisi secara interaktif.',
      topics: ['Limit Aljabar & Akar', 'sin(x)/x & Trig Khusus', 'Limit Tak Hingga (x→∞)', 'Limit Tidak Ada', 'Pita Epsilon-Delta'],
    },
    {
      id: 'derivative' as Page,
      icon: '𝑓\'',
      iconBg: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
      title: 'Turunan (Diferensial)',
      subtitle: 'Garis Singgung, Garis Normal, & Kecekungan',
      desc: 'Eksplorasi transisi garis sekan ke garis singgung (h→0), kurva turunan f\'(x), garis normal tegak lurus, serta uji kecekungan turunan kedua f\'\'(x).',
      topics: ['Garis Singgung & Normal', 'Transisi Sekan h→0', 'Overlay Kurva f\'(x)', 'Uji f\'\'(x) & Kecekungan', 'Titik Stasioner & Belok'],
    },
    {
      id: 'integral' as Page,
      icon: '∫',
      iconBg: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      title: 'Integral & Luas Daerah',
      subtitle: 'Jumlah Riemann & Luas Antara 2 Kurva',
      desc: 'Pelajari akumulasi luas kurva melalui Jumlah Riemann (n partisi) dan visualisasikan langsung perhitungan luas tertutup di antara dua kurva berpotongan.',
      topics: ['Jumlah Riemann (Left/Right/Mid)', 'Konvergensi n→∞', 'Teorema Dasar Kalkulus', 'Luas Antara Dua Kurva', 'Luas Netto vs Geometris'],
    },
    {
      id: 'quiz' as Page,
      icon: '🎯',
      iconBg: 'linear-gradient(135deg, #fb7185, #f43f5e)',
      title: 'Kuis & Evaluasi',
      subtitle: '24 Soal Selektif Standar Ujian TL & UTBK',
      desc: 'Uji penguasaan konsep kalkulus Anda dengan 24 soal komprehensif, mode ujian berwaktu (timer), skor streak, dan pembahasan langkah demi langkah KaTeX.',
      topics: ['24 Soal Terpilih', 'Mode Timer Ujian', 'Pembahasan KaTeX Lengkap', 'Koneksi Simulasi Visual', 'Skor & Streak Rekor'],
    },
  ];

  return (
    <>
      <Particles />

      {/* ── Formula Modal ── */}
      <FormulaModal isOpen={isFormulaOpen} onClose={() => setIsFormulaOpen(false)} />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigateTo('home')}>
            <div>
              <div className="navbar-logo">ANTIGRAVITY</div>
              <div className="navbar-subtitle">Matematika Tingkat Lanjut</div>
            </div>
          </div>

          {page !== 'home' && (
            <div className="tab-nav">
              <button
                className={`tab-btn ${page === 'limit' ? 'active' : ''}`}
                onClick={() => navigateTo('limit')}
              >
                <span className="tab-icon">∞</span> Limit
              </button>
              <button
                className={`tab-btn ${page === 'derivative' ? 'active' : ''}`}
                onClick={() => navigateTo('derivative')}
              >
                <span className="tab-icon">𝑓'</span> Turunan
              </button>
              <button
                className={`tab-btn ${page === 'integral' ? 'active' : ''}`}
                onClick={() => navigateTo('integral')}
              >
                <span className="tab-icon">∫</span> Integral
              </button>
              <button
                className={`tab-btn ${page === 'quiz' ? 'active' : ''}`}
                onClick={() => navigateTo('quiz')}
              >
                <span className="tab-icon">🎯</span> Kuis & Evaluasi
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick Formula Sheet Button */}
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => {
                sound.playPop(520);
                setIsFormulaOpen(true);
              }}
            >
              <span>📐</span>
              <span className="hide-on-mobile">Rangkuman Rumus</span>
            </button>

            {/* Audio Toggle */}
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: 'var(--text-xs)' }}
              title={isSoundMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
              onClick={toggleSound}
            >
              {isSoundMuted ? '🔇' : '🔊'}
            </button>

            <div className="status-badge hide-on-mobile">
              <span className="status-dot" />
              Engine V2.0
            </div>
          </div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <div className="app-container">
        {page === 'home' && (
          <div className="animate-fade-in-up">
            {/* Hero Section */}
            <div className="hero-section">
              <h1>Matematika Tingkat Lanjut Jadi Visual & Menyenangkan</h1>
              <p>
                Platform bahan ajar interaktif untuk siswa SMA & pembelajar kalkulus. Pahami konsep
                <strong> Limit</strong>, <strong>Turunan</strong>, dan <strong>Integral</strong> melalui
                visualisasi geometris real-time tanpa rumus membosankan.
              </p>
              <div className="btn-group" style={{ justifyContent: 'center' }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '12px 32px', fontSize: 'var(--text-base)' }}
                  onClick={() => navigateTo('limit')}
                >
                  Mulai Modul Limit →
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '12px 28px', fontSize: 'var(--text-base)' }}
                  onClick={() => {
                    sound.playPop(520);
                    setIsFormulaOpen(true);
                  }}
                >
                  📐 Buka Rangkuman Rumus
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '12px 28px', fontSize: 'var(--text-base)' }}
                  onClick={() => navigateTo('quiz')}
                >
                  🎯 Kuis & Evaluasi
                </button>
              </div>
            </div>

            {/* Module Cards Grid */}
            <div className="modules-grid" style={{ paddingBottom: '60px' }}>
              {moduleData.map((mod, idx) => (
                <div
                  key={mod.id}
                  className={`module-card animate-fade-in-up delay-${idx + 1}`}
                  onClick={() => navigateTo(mod.id)}
                >
                  <div
                    className="module-card-icon"
                    style={{ background: mod.iconBg, color: '#050a18', fontWeight: 900, fontSize: '1.4rem' }}
                  >
                    {mod.icon}
                  </div>
                  <h3>{mod.title}</h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-cyan)', marginBottom: '8px', fontWeight: 600 }}>
                    {mod.subtitle}
                  </div>
                  <p>{mod.desc}</p>
                  <div className="module-topics">
                    {mod.topics.map((topic) => (
                      <span key={topic} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', paddingBottom: '40px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              <p>Dirancang sesuai standar Kurikulum Merdeka Matematika Tingkat Lanjut (Fase F+).</p>
              <p style={{ marginTop: '4px', opacity: 0.6 }}>Antigravity © 2026 — Platform Bahan Ajar Matematika Interaktif</p>
            </div>
          </div>
        )}

        {page === 'limit' && (
          <LimitModule onNavigateNext={() => navigateTo('derivative')} />
        )}
        {page === 'derivative' && (
          <DerivativeModule onNavigateNext={() => navigateTo('integral')} />
        )}
        {page === 'integral' && (
          <IntegralModule onNavigateNext={() => navigateTo('quiz')} />
        )}
        {page === 'quiz' && (
          <QuizModule onNavigateModule={(m) => navigateTo(m)} />
        )}
      </div>
    </>
  );
};

export default App;
