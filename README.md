# 🚀 ANTIGRAVITY — Platform Bahan Ajar Matematika Tingkat Lanjut (SMA TL)

Platform interaktif bahan ajar Matematika Tingkat Lanjut (SMA Fase F+ / Kalkulus) yang dirancang untuk membuat konsep-konsep abstrak seperti **Limit**, **Turunan**, dan **Integral** menjadi visual, intuitif, dan mudah dipahami.

---

## 🌟 Fitur Utama

### 1. 🔍 Modul Limit Interaktif
* **Limit Aljabar & Bentuk Akar**: Faktorisasi selisih kuadrat, perkalian sekawan, dan titik singularitas berlubang (*hole*).
* **Limit Trigonometri Fundamental**: Visualisasi $\frac{\sin x}{x} \to 1$, $\frac{1-\cos x}{x} \to 0$, dan rasio sudut rangkap.
* **Limit di Ketakhinggaan ($x \to \infty$)**: Eksplorasi nilai fungsi menuju tak hingga dan garis asimtot horizontal.
* **Kasus Limit Tidak Ada**: Visualisasi diskontinuitas loncatan (*jump discontinuity*) pada fungsi tanda $f(x) = \frac{|x|}{x}$.
* **Tabel Pendekatan Numerik**: Tabel pendekatan kiri dan kanan otomatis.
* **Pita Presisi Epsilon-Delta ($\varepsilon$-$\delta$)**: Visualisasi intuitif definisi formal limit kalkulus.
* **Simulasi Pendekatan Otomatis**: Animasi peluncuran probe ke titik singularitas.

### 2. 📐 Modul Turunan (Diferensial)
* **Transisi Garis Sekan ke Garis Singgung ($h \to 0$)**: Bukti visual limit gradien sekan mendekati gradien tangen eksak.
* **Garis Normal Lengkap**: Visualisasi garis tegak lurus ($m_n = -\frac{1}{m}$) beserta rumus persamaan garis $y - y_0 = m_n(x - x_0)$ real-time.
* **Overlay Grafik Turunan $f'(x)$**: Menampilkan kurva turunan pada bidang koordinat yang sama untuk melihat keterkaitan titik puncak/lembah dengan pemotongan sumbu-$x$.
* **Analisis Kecekungan & Turunan Kedua $f''(x)$**: Uji kecekungan kurva (cekung ke atas, cekung ke bawah, dan titik belok).
* **Interaksi Langsung pada Kanvas**: Klik langsung pada bidang koordinat untuk memindahkan titik kontak.

### 3. 📦 Modul Integral & Luas Daerah
* **Jumlah Riemann**: Pilihan titik sampel Kiri (*Left*), Kanan (*Right*), Tengah (*Midpoint*), dan Trapesium.
* **Animasi Konvergensi ($n \to \infty$)**: Animasi pertambahan partisi dari 2 hingga 80 balok dengan error mengecil menuju 0%.
* **Mode Luas Antara Dua Kurva**: Menghitung luas daerah tertutup antara parabola dan garis atau dua parabola berpotongan.
* **Analisis Luas Netto vs Luas Geometri Mutlak**: Pemahaman luas bertanda (*signed area*) pada kurva yang memotong sumbu-$x$.
* **Teorema Dasar Kalkulus (TDK)**: Langkah evaluasi antiturunan $F(b) - F(a)$ secara terstruktur.

### 4. 🎯 Modul Kuis & Evaluasi
* **24 Soal Selektif Standar UTBK & Ujian Tingkat Lanjut**: Mencakup materi Limit, Turunan, dan Integral dengan 3 tingkat kesulitan (*Dasar*, *Menengah*, *Tantangan*).
* **Mode Ujian Berwaktu (Timer)**: Opsi simulasi ujian dengan batas waktu 10 menit.
* **Pembahasan Langkah demi Langkah (KaTeX)**: Solusi analitis lengkap setiap soal.
* **Koneksi Visual ke Simulasi**: Rekomendasi modul untuk langsung mencoba konsep soal di simulasi.
* **Penyimpanan Rekor Skor (LocalStorage)**: Skor tertinggi dan rekor streak tersimpan otomatis.

### 5. 📚 Rangkuman Rumus Lengkap & Audio Feedback
* **Modal Rangkuman Rumus**: Akses cepat ke lembar rumus Limit, Turunan, dan Integral dari navbar.
* **Audio Synthesizer Interaktif**: Efek suara sintetis lembut menggunakan Web Audio API browser (dengan tombol mute/unmute).

---

## 🛠️ Teknologi yang Digunakan
* **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Bundler & Dev Server**: [Vite 5](https://vitejs.dev/)
* **Formula Renderer**: [KaTeX](https://katex.org/)
* **Grafik & Kanvas**: SVG Koordinat Kartesius Responsif
* **Styling**: Vanilla CSS (CSS Variables Design System, Dark Mode Space Theme)

---

## 🚀 Cara Menjalankan Secara Lokal

```bash
# Clone repository
git clone https://github.com/Kurousagi28/aplikasi-matematika-tl.git

# Masuk ke direktori
cd aplikasi-matematika-tl

# Install dependencies
npm install

# Jalankan server pengembangan
npm run dev
```

Buka peramban di `http://localhost:5173/`.

Untuk membangun berkas produksi:
```bash
npm run build
```

---

## 📄 Lisensi
Platform bahan ajar ini dibangun untuk tujuan edukasi.
Antigravity © 2026 — Matematika Tingkat Lanjut.
