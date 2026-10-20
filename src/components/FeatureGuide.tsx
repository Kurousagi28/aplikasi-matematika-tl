import React, { useState } from 'react';

/* =============================================================
   FeatureGuide — Panel penjelasan fitur untuk setiap modul
   Menampilkan tooltip informatif yang menjelaskan setiap
   elemen/kontrol pada modul yang sedang aktif.
   ============================================================= */

type ActiveModule = 'home' | 'limit' | 'derivative' | 'integral' | 'quiz';

interface FeatureGuideProps {
  activeModule: ActiveModule;
}

interface GuideItem {
  icon: string;
  title: string;
  description: string;
}

const MODULE_GUIDES: Record<ActiveModule, GuideItem[]> = {
  home: [
    {
      icon: '🏠',
      title: 'Halaman Utama',
      description: 'Ini adalah dashboard utama. Klik salah satu kartu modul untuk mulai belajar topik Limit, Turunan, atau Integral.',
    },
    {
      icon: '📐',
      title: 'Rangkuman Rumus',
      description: 'Klik tombol ini di navbar untuk membuka ringkasan semua rumus penting kalkulus — bisa diakses kapan saja dari halaman mana pun.',
    },
    {
      icon: '🔊',
      title: 'Toggle Suara',
      description: 'Aplikasi memiliki efek suara interaktif. Klik tombol speaker di navbar untuk mengaktifkan/menonaktifkan suara.',
    },
  ],
  limit: [
    {
      icon: '📋',
      title: 'Pilihan Kasus Limit',
      description: 'Dropdown untuk memilih berbagai fungsi limit — dari aljabar sederhana, trigonometri, hingga limit di ketakhinggaan dan kasus limit tidak ada.',
    },
    {
      icon: '🎚️',
      title: 'Slider Jarak Probe',
      description: 'Geser slider untuk mengatur jarak "probe" dari titik singularitas. Semakin kecil jaraknya, semakin dekat f(x) dengan nilai limit L.',
    },
    {
      icon: '▶️',
      title: 'Animasi Pendekatan Otomatis',
      description: 'Klik untuk memulai animasi yang secara otomatis memperkecil jarak probe. Amati bagaimana nilai f(x) berkonvergen!',
    },
    {
      icon: '📏',
      title: 'Pita Epsilon-Delta',
      description: 'Visualisasi definisi formal limit. Epsilon (ε) = toleransi vertikal, Delta (δ) = toleransi horizontal. Jika x ada di dalam pita δ, maka f(x) pasti di pita ε.',
    },
    {
      icon: '📊',
      title: 'Tabel Pendekatan Numerik',
      description: 'Tabel yang menunjukkan nilai f(x) dari kiri dan kanan saat mendekati titik singularitas — bukti numerik konvergensi.',
    },
    {
      icon: '🎨',
      title: 'Grafik Interaktif',
      description: 'Grafik menampilkan kurva f(x), titik probe kiri (biru) dan kanan (merah), serta titik berlubang (hollow circle) di singularitas.',
    },
  ],
  derivative: [
    {
      icon: '📈',
      title: 'Pilihan Fungsi Kurva',
      description: 'Pilih dari berbagai fungsi — polinomial, trigonometri, bentuk akar — untuk mengeksplorasi turunan dan garis singgung.',
    },
    {
      icon: '📐',
      title: 'Mode Garis Singgung/Sekan',
      description: 'Toggle antara garis singgung (tangent) dan garis sekan (secant). Pada mode sekan, perkecil h untuk melihat transisi ke garis singgung!',
    },
    {
      icon: '🔴',
      title: 'Garis Normal',
      description: 'Centang untuk menampilkan garis normal — garis tegak lurus terhadap garis singgung di titik kontak P.',
    },
    {
      icon: '🟣',
      title: "Grafik Turunan f'(x)",
      description: "Tampilkan overlay kurva turunan. Perhatikan: saat f'(x) = 0, garis singgung mendatar (titik stasioner)!",
    },
    {
      icon: '🎯',
      title: 'Posisi Titik Kontak P',
      description: 'Geser slider ATAU klik langsung di grafik untuk memindahkan titik kontak. Persamaan garis singgung & normal update real-time.',
    },
    {
      icon: '🔄',
      title: 'Osilasi Otomatis',
      description: 'Animasi yang menggerakkan titik P bolak-balik sepanjang kurva — amati bagaimana garis singgung berputar mengikuti kelengkungan kurva.',
    },
  ],
  integral: [
    {
      icon: '📦',
      title: 'Mode Jumlah Riemann',
      description: 'Visualisasi integral sebagai penjumlahan luas balok persegi panjang. Semakin banyak partisi (n), semakin akurat pendekatan.',
    },
    {
      icon: '📐',
      title: 'Mode Luas Antara 2 Kurva',
      description: 'Hitung luas daerah tertutup di antara dua kurva. Langkah: cari titik potong → tentukan kurva atas/bawah → integralkan selisih.',
    },
    {
      icon: '🔢',
      title: 'Tipe Titik Sampel',
      description: 'Pilih cara menentukan tinggi balok Riemann: ujung Kiri, Kanan, Tengah (Midpoint), atau Trapesium. Midpoint biasanya paling akurat.',
    },
    {
      icon: '📊',
      title: 'Slider Jumlah Partisi (n)',
      description: 'Atur jumlah balok partisi. Klik tombol n=1, n=4, n=16, dst. untuk melihat perbedaan akurasi secara dramatis.',
    },
    {
      icon: '▶️',
      title: 'Simulasi Konvergensi',
      description: 'Animasi yang menambah n secara otomatis dari 2 hingga 80. Lihat bagaimana error turun drastis saat balok semakin banyak!',
    },
    {
      icon: '📏',
      title: 'Batas Interval [a, b]',
      description: 'Atur batas integrasi bawah (a) dan atas (b). Balok Riemann hanya dihitung di dalam interval ini.',
    },
  ],
  quiz: [
    {
      icon: '🎯',
      title: 'Kuis Interaktif',
      description: '24 soal dari topik Limit, Turunan, dan Integral. Filter berdasarkan topik dan tingkat kesulitan.',
    },
    {
      icon: '⏱️',
      title: 'Mode Timer',
      description: 'Aktifkan timer untuk simulasi ujian berwaktu. Setiap soal memiliki batas waktu — latihan untuk menghadapi UTBK!',
    },
    {
      icon: '🔥',
      title: 'Streak & Skor',
      description: 'Jawab benar berturut-turut untuk mendapat streak multiplier. Skor tertinggi disimpan otomatis.',
    },
    {
      icon: '📝',
      title: 'Pembahasan Lengkap',
      description: 'Setiap soal dilengkapi pembahasan langkah demi langkah dengan notasi KaTeX dan koneksi ke visualisasi modul.',
    },
  ],
};

export const FeatureGuide: React.FC<FeatureGuideProps> = ({ activeModule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const guides = MODULE_GUIDES[activeModule];

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`feature-guide-toggle ${isOpen ? 'guide-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Panduan Fitur"
        aria-label="Buka Panduan Fitur"
      >
        <span className="guide-icon">{isOpen ? '✕' : 'ℹ️'}</span>
      </button>

      {/* Slide-out Panel */}
      <div className={`feature-guide-panel ${isOpen ? 'guide-panel-open' : ''}`}>
        <div className="guide-panel-header">
          <h3>📖 Panduan Fitur</h3>
          <p>Penjelasan setiap kontrol pada halaman ini</p>
        </div>
        <div className="guide-panel-content">
          {guides.map((item, index) => (
            <div key={index} className="guide-item">
              <div className="guide-item-icon">{item.icon}</div>
              <div className="guide-item-text">
                <div className="guide-item-title">{item.title}</div>
                <div className="guide-item-desc">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="guide-backdrop" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default FeatureGuide;
