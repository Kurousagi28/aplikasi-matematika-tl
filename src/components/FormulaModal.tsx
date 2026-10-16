import React, { useState } from 'react';
import KTeX from './KTeX';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'limit' | 'derivative' | 'integral';

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Category>('limit');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>📐</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                Rangkuman Rumus Kalkulus Lengkap
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Bahan Ajar Matematika Tingkat Lanjut SMA / Kurikulum Merdeka
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="tab-nav" style={{ width: '100%', marginBottom: '16px' }}>
          <button
            className={`tab-btn ${activeTab === 'limit' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setActiveTab('limit')}
          >
            ∞ Rumus Limit
          </button>
          <button
            className={`tab-btn ${activeTab === 'derivative' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setActiveTab('derivative')}
          >
            𝑓' Rumus Turunan
          </button>
          <button
            className={`tab-btn ${activeTab === 'integral' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setActiveTab('integral')}
          >
            ∫ Rumus Integral
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scroll">
          {activeTab === 'limit' && (
            <div className="formula-sections">
              <div className="formula-group">
                <h3>1. Definisi & Sifat Dasar Limit</h3>
                <div className="formula-item">
                  <div className="formula-title">Syarat Eksistensi Limit</div>
                  <KTeX math="\lim_{x \to c} f(x) = L \iff \lim_{x \to c^-} f(x) = \lim_{x \to c^+} f(x) = L" display />
                  <p className="formula-note">Limit ada jika dan hanya jika limit kiri sama dengan limit kanan.</p>
                </div>
                <div className="formula-item">
                  <div className="formula-title">Sifat Linearitas</div>
                  <KTeX math="\lim_{x \to c} [k \cdot f(x) \pm g(x)] = k \lim_{x \to c} f(x) \pm \lim_{x \to c} g(x)" display />
                </div>
              </div>

              <div className="formula-group">
                <h3>2. Limit Fungsi Trigonometri Khusus</h3>
                <div className="formula-grid-2">
                  <div className="formula-item">
                    <KTeX math="\lim_{x \to 0} \frac{\sin(ax)}{bx} = \frac{a}{b}" display />
                  </div>
                  <div className="formula-item">
                    <KTeX math="\lim_{x \to 0} \frac{\tan(ax)}{bx} = \frac{a}{b}" display />
                  </div>
                  <div className="formula-item">
                    <KTeX math="\lim_{x \to 0} \frac{1 - \cos(ax)}{x} = 0" display />
                  </div>
                  <div className="formula-item">
                    <KTeX math="\lim_{x \to 0} \frac{1 - \cos(ax)}{x^2} = \frac{a^2}{2}" display />
                  </div>
                </div>
              </div>

              <div className="formula-group">
                <h3>3. Limit di Ketakhinggaan (Asimtot)</h3>
                <div className="formula-item">
                  <div className="formula-title">Limit Rasional Derajat Tertinggi</div>
                  <KTeX math="\lim_{x \to \infty} \frac{a x^m + \dots}{b x^n + \dots} = \begin{cases} \frac{a}{b}, & m = n \\ 0, & m < n \\ \pm \infty, & m > n \end{cases}" display />
                </div>
                <div className="formula-item">
                  <div className="formula-title">Rumus Selisih Bentuk Akar Kuadrat</div>
                  <KTeX math="\lim_{x \to \infty} \left(\sqrt{a x^2 + bx + c} - \sqrt{a x^2 + px + q}\right) = \frac{b - p}{2\sqrt{a}}" display />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'derivative' && (
            <div className="formula-sections">
              <div className="formula-group">
                <h3>1. Definisi Formal & Aturan Dasar</h3>
                <div className="formula-item">
                  <div className="formula-title">Definisi Turunan (Limit Garis Sekan)</div>
                  <KTeX math="f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}" display />
                </div>
                <div className="formula-item">
                  <div className="formula-title">Aturan Pangkat Aljabar</div>
                  <KTeX math="\frac{d}{dx}[x^n] = n x^{n-1}, \quad \frac{d}{dx}[c] = 0" display />
                </div>
              </div>

              <div className="formula-group">
                <h3>2. Aturan Operasi Diferensiasi</h3>
                <div className="formula-item">
                  <div className="formula-title">Aturan Perkalian (Product Rule)</div>
                  <KTeX math="(u \cdot v)' = u'v + uv'" display />
                </div>
                <div className="formula-item">
                  <div className="formula-title">Aturan Pembagian (Quotient Rule)</div>
                  <KTeX math="\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}, \quad v \neq 0" display />
                </div>
                <div className="formula-item">
                  <div className="formula-title">Aturan Rantai (Chain Rule)</div>
                  <KTeX math="\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx} \quad \implies \quad [f(g(x))]' = f'(g(x)) \cdot g'(x)" display />
                </div>
              </div>

              <div className="formula-group">
                <h3>3. Turunan Trigonometri Standar</h3>
                <div className="formula-grid-2">
                  <div className="formula-item"><KTeX math="\frac{d}{dx}[\sin x] = \cos x" display /></div>
                  <div className="formula-item"><KTeX math="\frac{d}{dx}[\cos x] = -\sin x" display /></div>
                  <div className="formula-item"><KTeX math="\frac{d}{dx}[\tan x] = \sec^2 x" display /></div>
                  <div className="formula-item"><KTeX math="\frac{d}{dx}[\cot x] = -\csc^2 x" display /></div>
                </div>
              </div>

              <div className="formula-group">
                <h3>4. Tafsiran Geometris: Garis Singgung & Normal</h3>
                <div className="formula-item">
                  <div className="formula-title">Persamaan Garis Singgung di (x₀, y₀)</div>
                  <KTeX math="y - y_0 = m(x - x_0), \quad \text{di mana } m = f'(x_0)" display />
                </div>
                <div className="formula-item">
                  <div className="formula-title">Persamaan Garis Normal di (x₀, y₀)</div>
                  <KTeX math="y - y_0 = -\frac{1}{m}(x - x_0), \quad (m \neq 0)" display />
                </div>
                <div className="formula-item">
                  <div className="formula-title">Uji Kecekungan & Titik Belok</div>
                  <p className="formula-note">
                    Jika <KTeX math="f''(x_0) > 0" />, kurva cekung ke atas (minimum lokal).<br />
                    Jika <KTeX math="f''(x_0) < 0" />, kurva cekung ke bawah (maksimum lokal).<br />
                    Jika <KTeX math="f''(x_0) = 0" /> dan terjadi perubahan tanda kecekungan, maka (x₀, y₀) adalah titik belok.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integral' && (
            <div className="formula-sections">
              <div className="formula-group">
                <h3>1. Rumus Dasar Integral Tak Tentu</h3>
                <div className="formula-item">
                  <div className="formula-title">Aturan Pangkat Aljabar</div>
                  <KTeX math="\int x^n \, dx = \frac{x^{n+1}}{n+1} + C, \quad (n \neq -1)" display />
                </div>
                <div className="formula-item">
                  <div className="formula-title">Integral Trigonometri</div>
                  <div className="formula-grid-2">
                    <div><KTeX math="\int \cos(ax) \, dx = \frac{1}{a} \sin(ax) + C" display /></div>
                    <div><KTeX math="\int \sin(ax) \, dx = -\frac{1}{a} \cos(ax) + C" display /></div>
                  </div>
                </div>
              </div>

              <div className="formula-group">
                <h3>2. Teorema Dasar Kalkulus & Sifat Integral Tentu</h3>
                <div className="formula-item">
                  <div className="formula-title">Teorema Dasar Kalkulus (TDK)</div>
                  <KTeX math="\int_a^b f(x) \, dx = \left[ F(x) \right]_a^b = F(b) - F(a)" display />
                </div>
                <div className="formula-item">
                  <div className="formula-title">Definisi Limit Jumlah Riemann</div>
                  <KTeX math="\int_a^b f(x) \, dx = \lim_{n \to \infty} \sum_{i=1}^n f(x_i^*) \Delta x, \quad \Delta x = \frac{b-a}{n}" display />
                </div>
              </div>

              <div className="formula-group">
                <h3>3. Aplikasi: Luas Daerah & Volume Benda Putar</h3>
                <div className="formula-item">
                  <div className="formula-title">Luas Daerah Antara Dua Kurva [a, b]</div>
                  <KTeX math="L = \int_a^b \left[ f(x) - g(x) \right] \, dx, \quad \text{dengan } f(x) \ge g(x)" display />
                </div>
                <div className="formula-item">
                  <div className="formula-title">Volume Putar Terhadap Sumbu-x (Metode Cakram)</div>
                  <KTeX math="V = \pi \int_a^b [f(x)]^2 \, dx" display />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormulaModal;
