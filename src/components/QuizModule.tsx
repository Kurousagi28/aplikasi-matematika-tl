import React, { useState, useMemo, useEffect } from 'react';
import KTeX from './KTeX';
import { sound } from '../utils/audio';

/* =============================================================
   ANTIGRAVITY — Modul Kuis & Evaluasi Interaktif Komprehensif
   Platform Bahan Ajar Matematika Tingkat Lanjut (SMA TL)
   Topik: Limit, Turunan, Integral
   Fitur:
   - 24 Soal Selektif (Standar UTBK & Ujian Tingkat Lanjut)
   - Filter Topik & Tingkat Kesulitan Dinamis
   - Mode Ujian Berwaktu (Countdown Timer) & Mode Santai
   - Penilaian Real-time, Streak Multiplier, & Haptic Audio Feedback
   - Pembahasan Langkah Demi Langkah KaTeX Lengkap
   - Koneksi Visual Langsung ke Simulasi Modul
   - Penyimpanan Skor Tertinggi Otomatis (LocalStorage)
   ============================================================= */

export type TopicCategory = 'all' | 'limit' | 'derivative' | 'integral';
export type DifficultyLevel = 'all' | 'dasar' | 'menengah' | 'tantangan';

export interface QuizQuestion {
  id: number;
  category: 'limit' | 'derivative' | 'integral';
  categoryTitle: string;
  difficulty: 'dasar' | 'menengah' | 'tantangan';
  questionText: string;
  questionLatex?: string;
  options: {
    id: string;
    text: string;
    isLatex?: boolean;
  }[];
  correctId: string;
  explanationSummary: string;
  stepByStepLatex: string[];
  visualConnectionTip: string;
  relatedModuleId: 'limit' | 'derivative' | 'integral';
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ─── LIMIT ───
  {
    id: 1,
    category: 'limit',
    categoryTitle: 'Limit Aljabar',
    difficulty: 'dasar',
    questionText: 'Tentukan nilai dari limit fungsi aljabar berikut:',
    questionLatex: '\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '2' },
      { id: 'C', text: '4' },
      { id: 'D', text: '\\infty', isLatex: true },
    ],
    correctId: 'C',
    explanationSummary:
      'Substitusi langsung menghasilkan bentuk tak tentu 0/0. Faktorkan pembilang untuk mengeliminasi pembuat nol.',
    stepByStepLatex: [
      '\\text{Bentuk awal: } \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = \\frac{2^2 - 4}{2 - 2} = \\frac{0}{0} \\quad (\\text{Bentuk Tak Tentu})',
      '\\text{Faktorkan pembilang: } x^2 - 4 = (x - 2)(x + 2)',
      '\\text{Sederhanakan: } \\lim_{x \\to 2} \\frac{(x - 2)(x + 2)}{x - 2} = \\lim_{x \\to 2} (x + 2)',
      '\\text{Substitusi } x = 2: 2 + 2 = 4',
    ],
    visualConnectionTip:
      'Pada grafik Modul Limit, fungsi ini memiliki titik berlubang (hole / removable discontinuity) tepat di x = 2, namun pendekatan kiri dan kanan sama-sama menuju y = 4.',
    relatedModuleId: 'limit',
  },
  {
    id: 2,
    category: 'limit',
    categoryTitle: 'Limit Trigonometri',
    difficulty: 'dasar',
    questionText: 'Berdasarkan sifat limit trigonometri fundamental, tentukan nilai dari:',
    questionLatex: '\\lim_{x \\to 0} \\frac{\\sin(6x)}{3x}',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '2' },
      { id: 'C', text: '3' },
      { id: 'D', text: '6' },
    ],
    correctId: 'B',
    explanationSummary:
      'Gunakan sifat limit trigonometri dasar: lim_{x -> 0} sin(ax) / (bx) = a / b.',
    stepByStepLatex: [
      '\\text{Rumus dasar: } \\lim_{x \\to 0} \\frac{\\sin(ax)}{bx} = \\frac{a}{b}',
      '\\text{Dengan } a = 6 \\text{ dan } b = 3:',
      '\\lim_{x \\to 0} \\frac{\\sin(6x)}{3x} = \\frac{6}{3} = 2',
    ],
    visualConnectionTip:
      'Perhatikan kurva sin(x)/x di Modul Limit. Saat x mendekati 0, kurva sin(ax) tumbuh a kali lebih cepat dari x di sekitar titik asal.',
    relatedModuleId: 'limit',
  },
  {
    id: 3,
    category: 'limit',
    categoryTitle: 'Limit Bentuk Akar',
    difficulty: 'menengah',
    questionText: 'Hitunglah nilai limit berikut dengan merasionalkan bentuk akar:',
    questionLatex: '\\lim_{x \\to 3} \\frac{\\sqrt{x + 1} - 2}{x - 3}',
    options: [
      { id: 'A', text: '\\frac{1}{4}', isLatex: true },
      { id: 'B', text: '\\frac{1}{2}', isLatex: true },
      { id: 'C', text: '1' },
      { id: 'D', text: '0' },
    ],
    correctId: 'A',
    explanationSummary:
      'Substitusi x = 3 menghasilkan 0/0. Kalikan pembilang dan penyebut dengan bentuk sekawan (sqrt(x+1) + 2).',
    stepByStepLatex: [
      '\\text{Kalikan sekawan: } \\lim_{x \\to 3} \\frac{\\sqrt{x+1} - 2}{x - 3} \\cdot \\frac{\\sqrt{x+1} + 2}{\\sqrt{x+1} + 2}',
      '\\text{Jabarkan pembilang: } (\\sqrt{x+1})^2 - 2^2 = (x + 1) - 4 = x - 3',
      '\\text{Bagi faktor sekutu: } \\lim_{x \\to 3} \\frac{x - 3}{(x - 3)(\\sqrt{x+1} + 2)} = \\lim_{x \\to 3} \\frac{1}{\\sqrt{x+1} + 2}',
      '\\text{Substitusi } x = 3: \\frac{1}{\\sqrt{3+1} + 2} = \\frac{1}{2 + 2} = \\frac{1}{4}',
    ],
    visualConnectionTip:
      'Metode perkalian sekawan adalah teknik aljabar untuk menyingkirkan indeterminasi 0/0 pada fungsi irasional.',
    relatedModuleId: 'limit',
  },
  {
    id: 4,
    category: 'limit',
    categoryTitle: 'Limit Trigonometri Lanjut',
    difficulty: 'tantangan',
    questionText: 'Gunakan identitas sudut rangkap cosinus untuk menentukan:',
    questionLatex: '\\lim_{x \\to 0} \\frac{1 - \\cos(2x)}{x^2}',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1' },
      { id: 'C', text: '2' },
      { id: 'D', text: '4' },
    ],
    correctId: 'C',
    explanationSummary:
      'Ubah 1 - cos(2x) menjadi 2*sin^2(x) menggunakan rumus identitas trigonometri.',
    stepByStepLatex: [
      '\\text{Identitas trigonometri: } \\cos(2x) = 1 - 2\\sin^2(x) \\implies 1 - \\cos(2x) = 2\\sin^2(x)',
      '\\text{Substitusi ke limit: } \\lim_{x \\to 0} \\frac{2\\sin^2(x)}{x^2} = 2 \\cdot \\lim_{x \\to 0} \\left(\\frac{\\sin x}{x}\\right)^2',
      '\\text{Karena } \\lim_{x \\to 0} \\frac{\\sin x}{x} = 1:',
      '= 2 \\cdot (1)^2 = 2',
    ],
    visualConnectionTip:
      'Di Modul Limit, bandingkan fungsi (1 - cos x)/x yang bernilai 0 di limit dengan fungsi ini yang berderajat x^2 di penyebut sehingga konvergen ke nilai positif 2.',
    relatedModuleId: 'limit',
  },
  {
    id: 5,
    category: 'limit',
    categoryTitle: 'Limit Tak Hingga Rasional',
    difficulty: 'menengah',
    questionText: 'Tentukan nilai limit rasional menuju tak hingga:',
    questionLatex: '\\lim_{x \\to \\infty} \\frac{4x^3 - 2x + 7}{2x^3 + 5x^2 - 1}',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '2' },
      { id: 'C', text: '4' },
      { id: 'D', text: '\\infty', isLatex: true },
    ],
    correctId: 'B',
    explanationSummary:
      'Karena derajat pembilang dan penyebut sama (pangkat tertinggi x^3), nilai limit ditentukan oleh rasio koefisien pangkat tertingginya.',
    stepByStepLatex: [
      '\\text{Bagi setiap suku dengan } x^3 \\text{ (pangkat tertinggi):}',
      '\\lim_{x \\to \\infty} \\frac{4 - \\frac{2}{x^2} + \\frac{7}{x^3}}{2 + \\frac{5}{x} - \\frac{1}{x^3}}',
      '\\text{Untuk } x \\to \\infty, \\text{ suku dengan penyebut } x \\text{ bernilai } 0:',
      '\\frac{4 - 0 + 0}{2 + 0 - 0} = \\frac{4}{2} = 2',
    ],
    visualConnectionTip:
      'Garis y = 2 merupakan asimtot datar (horizontal asymptote) kurva tersebut untuk x menuju tak hingga.',
    relatedModuleId: 'limit',
  },
  {
    id: 6,
    category: 'limit',
    categoryTitle: 'Syarat Eksistensi Limit',
    difficulty: 'dasar',
    questionText: 'Diberikan fungsi f(x) = |x| / x. Manakah pernyataan yang benar mengenai lim_{x -> 0} f(x)?',
    questionLatex: 'f(x) = \\frac{|x|}{x}, \\quad \\lim_{x \\to 0} f(x) = \\, ?',
    options: [
      { id: 'A', text: 'Bernilai 1' },
      { id: 'B', text: 'Bernilai -1' },
      { id: 'C', text: 'Tidak ada, karena limit kiri (-1) tidak sama dengan limit kanan (+1)' },
      { id: 'D', text: 'Bernilai 0' },
    ],
    correctId: 'C',
    explanationSummary:
      'Limit hanya ada jika limit kiri sama dengan limit kanan. Fungsi tanda melompat dari -1 ke 1 di x = 0.',
    stepByStepLatex: [
      '\\lim_{x \\to 0^-} \\frac{|x|}{x} = \\lim_{x \\to 0^-} \\frac{-x}{x} = -1',
      '\\lim_{x \\to 0^+} \\frac{|x|}{x} = \\lim_{x \\to 0^+} \\frac{x}{x} = +1',
      '\\text{Karena } \\lim_{x \\to 0^-} f(x) \\neq \\lim_{x \\to 0^+} f(x), \\text{ maka limit tidak ada.}',
    ],
    visualConnectionTip:
      'Buka Modul Limit dan pilih kasus "|x| / x (Limit Tidak Ada)" untuk melihat visualisasi loncatan titik kedua probe.',
    relatedModuleId: 'limit',
  },
  {
    id: 7,
    category: 'limit',
    categoryTitle: 'Limit Tak Hingga Selisih Akar',
    difficulty: 'tantangan',
    questionText: 'Gunakan rumus cepat selisih bentuk akar kuadrat (b - p)/(2√a) untuk menentukan:',
    questionLatex: '\\lim_{x \\to \\infty} \\left( \\sqrt{4x^2 + 6x - 1} - 2x \\right)',
    options: [
      { id: 'A', text: '\\frac{3}{4}', isLatex: true },
      { id: 'B', text: '\\frac{3}{2}', isLatex: true },
      { id: 'C', text: '3' },
      { id: 'D', text: '\\infty', isLatex: true },
    ],
    correctId: 'B',
    explanationSummary:
      'Ubah 2x menjadi sqrt(4x^2), lalu gunakan rumus (b - p)/(2*sqrt(a)) dengan a = 4, b = 6, p = 0.',
    stepByStepLatex: [
      '\\text{Bentuk setara: } \\lim_{x \\to \\infty} \\left( \\sqrt{4x^2 + 6x - 1} - \\sqrt{4x^2 + 0x + 0} \\right)',
      '\\text{Identifikasi: } a = 4, \\; b = 6, \\; p = 0',
      '\\text{Rumus: } L = \\frac{b - p}{2\\sqrt{a}} = \\frac{6 - 0}{2\\sqrt{4}} = \\frac{6}{2(2)} = \\frac{6}{4} = \\frac{3}{2} = 1.5',
    ],
    visualConnectionTip:
      'Rumus ini sangat sering diuji dalam UTBK SNBT dan ujian Matematika Tingkat Lanjut.',
    relatedModuleId: 'limit',
  },
  {
    id: 8,
    category: 'limit',
    categoryTitle: 'Limit Trigonometri Komposit',
    difficulty: 'tantangan',
    questionText: 'Hitunglah nilai limit berikut:',
    questionLatex: '\\lim_{x \\to 0} \\frac{x \\tan(3x)}{\\cos(2x) - 1}',
    options: [
      { id: 'A', text: '-\\frac{3}{2}', isLatex: true },
      { id: 'B', text: '\\frac{3}{2}', isLatex: true },
      { id: 'C', text: '-3' },
      { id: 'D', text: '0' },
    ],
    correctId: 'A',
    explanationSummary:
      'Ubah cos(2x) - 1 menjadi -2*sin^2(x), lalu bagi dengan x^2.',
    stepByStepLatex: [
      '\\cos(2x) - 1 = -(1 - \\cos(2x)) = -2\\sin^2(x)',
      '\\lim_{x \\to 0} \\frac{x \\tan(3x)}{-2\\sin^2(x)} = -\\frac{1}{2} \\lim_{x \\to 0} \\left[ \\frac{x}{\\sin x} \\cdot \\frac{\\tan(3x)}{\\sin x} \\right]',
      '= -\\frac{1}{2} \\cdot (1) \\cdot 3 = -\\frac{3}{2} = -1.5',
    ],
    visualConnectionTip:
      'Kombinasi tan(ax) dan (1 - cos(bx)) diselesaikan dengan mengubah cosinus ke sinus kuadrat.',
    relatedModuleId: 'limit',
  },

  // ─── TURUNAN ───
  {
    id: 9,
    category: 'derivative',
    categoryTitle: 'Turunan Fungsi Aljabar',
    difficulty: 'dasar',
    questionText: 'Diberikan fungsi aljabar f(x) = 2x³ − 5x² + 4x − 7. Berapakah nilai f\'(2)?',
    questionLatex: 'f(x) = 2x^3 - 5x^2 + 4x - 7, \\quad f\'(2) = \\, ?',
    options: [
      { id: 'A', text: '4' },
      { id: 'B', text: '6' },
      { id: 'C', text: '8' },
      { id: 'D', text: '12' },
    ],
    correctId: 'C',
    explanationSummary:
      'Terapkan aturan turunan polinomial d/dx(x^n) = n*x^(n-1), lalu masukkan nilai x = 2.',
    stepByStepLatex: [
      'f\'(x) = 6x^2 - 10x + 4',
      'f\'(2) = 6(2^2) - 10(2) + 4 = 24 - 20 + 4 = 8',
    ],
    visualConnectionTip:
      'Nilai f\'(2) = 8 merepresentasikan gradien (kemiringan) garis singgung kurva f(x) tepat pada titik di mana x = 2.',
    relatedModuleId: 'derivative',
  },
  {
    id: 10,
    category: 'derivative',
    categoryTitle: 'Gradien Garis Singgung',
    difficulty: 'menengah',
    questionText: 'Berapakah gradien garis singgung kurva parabola y = x² − 6x + 5 pada titik dengan absis x = 4?',
    questionLatex: 'y = x^2 - 6x + 5, \\quad m = \\left.\\frac{dy}{dx}\\right|_{x=4}',
    options: [
      { id: 'A', text: '-2' },
      { id: 'B', text: '0' },
      { id: 'C', text: '2' },
      { id: 'D', text: '4' },
    ],
    correctId: 'C',
    explanationSummary:
      'Gradien garis singgung m adalah nilai turunan pertama fungsi di titik kontak.',
    stepByStepLatex: [
      'm = y\' = \\frac{d}{dx}(x^2 - 6x + 5) = 2x - 6',
      '\\text{Evaluasi pada } x = 4: m = 2(4) - 6 = 8 - 6 = 2',
    ],
    visualConnectionTip:
      'Gunakan slider posisi x₀ pada Modul Turunan untuk kurva kuadrat. Geser ke x = 4 dan amati garis singgung kuning dengan kemiringan m = 2.',
    relatedModuleId: 'derivative',
  },
  {
    id: 11,
    category: 'derivative',
    categoryTitle: 'Persamaan Garis Normal',
    difficulty: 'menengah',
    questionText: 'Tentukan gradien garis normal kurva y = 2x² − 3x pada titik berabsis x = 1:',
    questionLatex: 'y = 2x^2 - 3x, \\quad m_n = -\\frac{1}{m}',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '-1' },
      { id: 'C', text: '2' },
      { id: 'D', text: '-\\frac{1}{2}', isLatex: true },
    ],
    correctId: 'B',
    explanationSummary:
      'Garis normal tegak lurus terhadap garis singgung, sehingga mn = -1/m.',
    stepByStepLatex: [
      '\\text{Gradien garis singgung: } m = y\' = 4x - 3',
      '\\text{Pada } x = 1: m = 4(1) - 3 = 1',
      '\\text{Gradien garis normal: } m_n = -\\frac{1}{m} = -\\frac{1}{1} = -1',
    ],
    visualConnectionTip:
      'Di Modul Turunan, centang "Tampilkan Garis Normal" untuk melihat garis tegak lurus berwarna rose.',
    relatedModuleId: 'derivative',
  },
  {
    id: 12,
    category: 'derivative',
    categoryTitle: 'Aturan Pembagian (Quotient Rule)',
    difficulty: 'menengah',
    questionText: 'Tentukan turunan pertama dari fungsi rasional f(x) = (2x + 1)/(x − 3):',
    questionLatex: 'f(x) = \\frac{2x + 1}{x - 3}',
    options: [
      { id: 'A', text: '\\frac{2}{(x - 3)^2}', isLatex: true },
      { id: 'B', text: '-\\frac{7}{(x - 3)^2}', isLatex: true },
      { id: 'C', text: '\\frac{7}{(x - 3)^2}', isLatex: true },
      { id: 'D', text: '2' },
    ],
    correctId: 'B',
    explanationSummary:
      'Gunakan aturan pembagian (u/v)\' = (u\'v - uv\') / v^2.',
    stepByStepLatex: [
      'u = 2x + 1 \\implies u\' = 2, \\quad v = x - 3 \\implies v\' = 1',
      'f\'(x) = \\frac{2(x - 3) - (2x + 1)(1)}{(x - 3)^2} = \\frac{2x - 6 - 2x - 1}{(x - 3)^2} = -\\frac{7}{(x - 3)^2}',
    ],
    visualConnectionTip:
      'Aturan pembagian memastikan perubahan penyebut kuadrat diperhitungkan secara akurat.',
    relatedModuleId: 'derivative',
  },
  {
    id: 13,
    category: 'derivative',
    categoryTitle: 'Aturan Rantai (Chain Rule)',
    difficulty: 'tantangan',
    questionText: 'Tentukan turunan pertama dari fungsi komposisi berpangkat:',
    questionLatex: 'f(x) = (3x^2 - 1)^4',
    options: [
      { id: 'A', text: '12x(3x^2 - 1)^3', isLatex: true },
      { id: 'B', text: '24x(3x^2 - 1)^3', isLatex: true },
      { id: 'C', text: '4(6x)^3', isLatex: true },
      { id: 'D', text: '24x(3x^2 - 1)^4', isLatex: true },
    ],
    correctId: 'B',
    explanationSummary:
      'Aturan rantai: d/dx [u^n] = n * u^(n-1) * u\'. Kalikan turunan luar dengan turunan dalam.',
    stepByStepLatex: [
      'u = 3x^2 - 1 \\implies u\' = 6x',
      'f\'(x) = 4(3x^2 - 1)^3 \\cdot (6x) = 24x(3x^2 - 1)^3',
    ],
    visualConnectionTip:
      'Aturan rantai adalah instrumen esensial dalam kalkulus diferensial untuk menangani fungsi bersarang.',
    relatedModuleId: 'derivative',
  },
  {
    id: 14,
    category: 'derivative',
    categoryTitle: 'Kecekungan & Titik Belok',
    difficulty: 'tantangan',
    questionText: 'Kurva f(x) = x³ − 6x² + 9x + 2 memiliki titik belok pada absis x = ...',
    questionLatex: 'f(x) = x^3 - 6x^2 + 9x + 2, \\quad f\'\'(x) = 0',
    options: [
      { id: 'A', text: 'x = 1' },
      { id: 'B', text: 'x = 2' },
      { id: 'C', text: 'x = 3' },
      { id: 'D', text: 'x = 0' },
    ],
    correctId: 'B',
    explanationSummary:
      'Titik belok terjadi saat turunan kedua bernilai 0 (f\'\'(x) = 0) dan kecekungan berubah arah.',
    stepByStepLatex: [
      'f\'(x) = 3x^2 - 12x + 9',
      'f\'\'(x) = 6x - 12',
      '\\text{Syarat titik belok: } f\'\'(x) = 0 \\implies 6x - 12 = 0 \\implies x = 2',
    ],
    visualConnectionTip:
      'Di titik belok, kurva berganti dari cekung ke bawah menjadi cekung ke atas.',
    relatedModuleId: 'derivative',
  },
  {
    id: 15,
    category: 'derivative',
    categoryTitle: 'Turunan Trigonometri Perkalian',
    difficulty: 'menengah',
    questionText: 'Tentukan turunan pertama dari fungsi f(x) = x² sin(x):',
    questionLatex: 'f(x) = x^2 \\sin(x)',
    options: [
      { id: 'A', text: '2x \\cos(x)', isLatex: true },
      { id: 'B', text: '2x \\sin(x) + x^2 \\cos(x)', isLatex: true },
      { id: 'C', text: 'x^2 \\cos(x) - 2x \\sin(x)', isLatex: true },
      { id: 'D', text: '2x \\sin(x) - x^2 \\cos(x)', isLatex: true },
    ],
    correctId: 'B',
    explanationSummary:
      'Gunakan aturan perkalian (u·v)\' = u\'v + uv\', di mana u = x^2 dan v = sin(x).',
    stepByStepLatex: [
      'u = x^2 \\implies u\' = 2x, \\quad v = \\sin(x) \\implies v\' = \\cos(x)',
      'f\'(x) = (2x)(\\sin x) + (x^2)(\\cos x) = 2x\\sin(x) + x^2\\cos(x)',
    ],
    visualConnectionTip:
      'Aturan perkalian merefleksikan perubahan dua variabel yang saling bergantung.',
    relatedModuleId: 'derivative',
  },
  {
    id: 16,
    category: 'derivative',
    categoryTitle: 'Titik Stasioner Polinomial',
    difficulty: 'menengah',
    questionText: 'Fungsi f(x) = x³ − 3x + 4 mencapai stasioner pada x = ...',
    questionLatex: 'f(x) = x^3 - 3x + 4, \\quad f\'(x) = 0',
    options: [
      { id: 'A', text: 'x = 0' },
      { id: 'B', text: 'x = 1 \\text{ dan } x = -1', isLatex: true },
      { id: 'C', text: 'x = 3 \\text{ dan } x = -3', isLatex: true },
      { id: 'D', text: 'x = \\sqrt{3}', isLatex: true },
    ],
    correctId: 'B',
    explanationSummary:
      'Kondisi stasioner tercapai saat garis singgung horizontal (gradien m = 0).',
    stepByStepLatex: [
      'f\'(x) = 3x^2 - 3 = 0 \\implies 3(x^2 - 1) = 0 \\implies x = \\pm 1',
    ],
    visualConnectionTip:
      'Buka fungsi f(x) = x³ − 3x di Modul Turunan untuk melihat langsung puncak di x = -1 dan lembah di x = 1.',
    relatedModuleId: 'derivative',
  },

  // ─── INTEGRAL ───
  {
    id: 17,
    category: 'integral',
    categoryTitle: 'Integral Tak Tentu',
    difficulty: 'dasar',
    questionText: 'Hitunglah integral tak tentu dari polinomial berikut:',
    questionLatex: '\\int (6x^2 - 4x + 3) \\, dx',
    options: [
      { id: 'A', text: '2x^3 - 2x^2 + 3x + C', isLatex: true },
      { id: 'B', text: '3x^3 - 2x^2 + 3x + C', isLatex: true },
      { id: 'C', text: '6x^3 - 4x^2 + 3x + C', isLatex: true },
      { id: 'D', text: '2x^3 - 4x^2 + 3x + C', isLatex: true },
    ],
    correctId: 'A',
    explanationSummary:
      'Gunakan aturan antiturunan integral d/dx: int x^n dx = (x^(n+1))/(n+1) + C.',
    stepByStepLatex: [
      '\\int 6x^2 \\, dx = 6 \\cdot \\frac{x^3}{3} = 2x^3',
      '\\int -4x \\, dx = -4 \\cdot \\frac{x^2}{2} = -2x^2',
      '\\int 3 \\, dx = 3x',
      '= 2x^3 - 2x^2 + 3x + C',
    ],
    visualConnectionTip:
      'Integral tak tentu merepresentasikan keluarga kurva antiturunan yang memiliki kemiringan turunan yang sama.',
    relatedModuleId: 'integral',
  },
  {
    id: 18,
    category: 'integral',
    categoryTitle: 'Integral Tentu (Definite Integral)',
    difficulty: 'menengah',
    questionText: 'Gunakan Teorema Dasar Kalkulus untuk mengevaluasi integral tentu berikut:',
    questionLatex: '\\int_{1}^{3} (3x^2 - 2x) \\, dx',
    options: [
      { id: 'A', text: '14' },
      { id: 'B', text: '16' },
      { id: 'C', text: '18' },
      { id: 'D', text: '20' },
    ],
    correctId: 'C',
    explanationSummary:
      'Cari antiturunan F(x), lalu hitung selisih nilai batas atas dan batas bawah: F(3) - F(1).',
    stepByStepLatex: [
      'F(x) = \\int (3x^2 - 2x) \\, dx = x^3 - x^2',
      'F(3) = 3^3 - 3^2 = 27 - 9 = 18',
      'F(1) = 1^3 - 1^2 = 1 - 1 = 0',
      'F(3) - F(1) = 18 - 0 = 18',
    ],
    visualConnectionTip:
      'Di Modul Integral, atur batas bawah a = 1 dan batas atas b = 3. Nilai eksak integral akan sama persis dengan perhitungan analitis ini.',
    relatedModuleId: 'integral',
  },
  {
    id: 19,
    category: 'integral',
    categoryTitle: 'Luas di Bawah Kurva',
    difficulty: 'dasar',
    questionText: 'Berapakah luas daerah yang dibatasi oleh kurva y = 3x², sumbu-x, garis x = 0, dan x = 2?',
    questionLatex: 'L = \\int_{0}^{2} 3x^2 \\, dx',
    options: [
      { id: 'A', text: '4 \\text{ satuan luas}', isLatex: true },
      { id: 'B', text: '6 \\text{ satuan luas}', isLatex: true },
      { id: 'C', text: '8 \\text{ satuan luas}', isLatex: true },
      { id: 'D', text: '12 \\text{ satuan luas}', isLatex: true },
    ],
    correctId: 'C',
    explanationSummary:
      'Luas di bawah kurva fungsi positif adalah integral tentu dari kurva tersebut pada interval yang ditentukan.',
    stepByStepLatex: [
      'L = \\left[ x^3 \\right]_0^2 = 2^3 - 0^3 = 8 \\text{ satuan luas}',
    ],
    visualConnectionTip:
      'Konsep luas daerah ini divisualisasikan secara langsung dengan penjumlahan balok-balok partisi pada Modul Integral.',
    relatedModuleId: 'integral',
  },
  {
    id: 20,
    category: 'integral',
    categoryTitle: 'Integral Trigonometri Linear',
    difficulty: 'menengah',
    questionText: 'Tentukan hasil pengintegralan trigonometri dengan substitusi linear:',
    questionLatex: '\\int \\cos(3x) \\, dx',
    options: [
      { id: 'A', text: '3\\sin(3x) + C', isLatex: true },
      { id: 'B', text: '-\\frac{1}{3}\\sin(3x) + C', isLatex: true },
      { id: 'C', text: '\\frac{1}{3}\\sin(3x) + C', isLatex: true },
      { id: 'D', text: '-\\sin(3x) + C', isLatex: true },
    ],
    correctId: 'C',
    explanationSummary:
      'Gunakan aturan substitusi linear: int cos(ax) dx = (1/a) * sin(ax) + C.',
    stepByStepLatex: [
      '\\int \\cos(3x) \\, dx = \\frac{1}{3} \\sin(3x) + C',
    ],
    visualConnectionTip:
      'Pengali 1/3 muncul sebagai kompensasi dari laju pertambahan argumen sudut dalam 3x.',
    relatedModuleId: 'integral',
  },
  {
    id: 21,
    category: 'integral',
    categoryTitle: 'Aproksimasi Jumlah Riemann',
    difficulty: 'tantangan',
    questionText: 'Interval [0, 6] dipartisi menjadi n = 3 subinterval sama panjang. Berapakah aproksimasi Jumlah Riemann Kiri (Left Sum) untuk f(x) = 2x?',
    questionLatex: 'f(x) = 2x, \\quad [a, b] = [0, 6], \\quad n = 3',
    options: [
      { id: 'A', text: '12' },
      { id: 'B', text: '24' },
      { id: 'C', text: '36' },
      { id: 'D', text: '48' },
    ],
    correctId: 'B',
    explanationSummary:
      'Lebar partisi dx = (6-0)/3 = 2. Titik sampel kiri adalah x = 0, 2, 4. Jumlahkan luas ketiga balok.',
    stepByStepLatex: [
      '\\Delta x = \\frac{6 - 0}{3} = 2',
      'x_0 = 0, \\; x_1 = 2, \\; x_2 = 4',
      'L_3 = 2 [f(0) + f(2) + f(4)] = 2 [0 + 4 + 8] = 2(12) = 24',
    ],
    visualConnectionTip:
      'Ubah tipe Riemann ke "Kiri (Left)" di Modul Integral dan set n = 3. Anda akan melihat langsung balok-balok dengan luas total 24 yang berada di bawah kurva!',
    relatedModuleId: 'integral',
  },
  {
    id: 22,
    category: 'integral',
    categoryTitle: 'Luas Antara Dua Kurva',
    difficulty: 'tantangan',
    questionText: 'Berapakah luas daerah yang dibatasi oleh parabola y = 4 − x² dan garis y = x + 2?',
    questionLatex: 'L = \\int_{-2}^{1} [(4 - x^2) - (x + 2)] \\, dx',
    options: [
      { id: 'A', text: '3.5 \\text{ satuan luas}', isLatex: true },
      { id: 'B', text: '4.5 \\text{ satuan luas}', isLatex: true },
      { id: 'C', text: '5.5 \\text{ satuan luas}', isLatex: true },
      { id: 'D', text: '6.0 \\text{ satuan luas}', isLatex: true },
    ],
    correctId: 'B',
    explanationSummary:
      'Cari batas titik potong 4 - x^2 = x + 2 => x = -2 dan x = 1. Integralkan selisih kurva atas kurva bawah.',
    stepByStepLatex: [
      '\\text{Titik potong: } x^2 + x - 2 = 0 \\implies x = -2 \\text{ dan } x = 1',
      'L = \\int_{-2}^1 (2 - x - x^2) \\, dx = \\left[ 2x - \\frac{x^2}{2} - \\frac{x^3}{3} \\right]_{-2}^1 = \\frac{9}{2} = 4.5',
    ],
    visualConnectionTip:
      'Buka tab "Luas Antara 2 Kurva" pada Modul Integral untuk melihat arsiran kuning daerah berluas 4.5 satuan ini.',
    relatedModuleId: 'integral',
  },
  {
    id: 23,
    category: 'integral',
    categoryTitle: 'Luas Netto vs Luas Geometris',
    difficulty: 'menengah',
    questionText: 'Hitunglah nilai integral tentu ∫_{0}^{2π} sin(x) dx:',
    questionLatex: '\\int_{0}^{2\\pi} \\sin(x) \\, dx = \\, ?',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '2' },
      { id: 'C', text: '4' },
      { id: 'D', text: '-2' },
    ],
    correctId: 'A',
    explanationSummary:
      'Integral tentu adalah akumulasi luas netto. Luas positif di [0, π] tepat saling meniadakan dengan luas negatif di [π, 2π].',
    stepByStepLatex: [
      '\\left[ -\\cos(x) \\right]_0^{2\\pi} = -\\cos(2\\pi) - (-\\cos(0)) = -1 - (-1) = 0',
      '\\text{Catatan: Luas geometris totalnya adalah } 2 + 2 = 4 \\text{ satuan luas.}',
    ],
    visualConnectionTip:
      'Pilih fungsi sin(x) di Modul Integral dengan batas [0, 2π]. Amati daerah hijau (+2) dan daerah merah (-2) yang menghasilkan integral netto = 0.',
    relatedModuleId: 'integral',
  },
  {
    id: 24,
    category: 'integral',
    categoryTitle: 'Volume Benda Putar Teoretis',
    difficulty: 'tantangan',
    questionText: 'Daerah yang dibatasi kurva y = x², sumbu-x, dan garis x = 2 diputar 360° mengelilingi sumbu-x. Berapakah volumenya?',
    questionLatex: 'V = \\pi \\int_{0}^{2} [x^2]^2 \\, dx',
    options: [
      { id: 'A', text: '\\frac{16}{5}\\pi \\text{ satuan volume}', isLatex: true },
      { id: 'B', text: '\\frac{32}{5}\\pi \\text{ satuan volume}', isLatex: true },
      { id: 'C', text: '8\\pi \\text{ satuan volume}', isLatex: true },
      { id: 'D', text: '\\frac{8}{3}\\pi \\text{ satuan volume}', isLatex: true },
    ],
    correctId: 'B',
    explanationSummary:
      'Gunakan metode cakram V = pi * int [f(x)]^2 dx.',
    stepByStepLatex: [
      'V = \\pi \\int_0^2 x^4 \\, dx = \\pi \\left[ \\frac{x^5}{5} \\right]_0^2 = \\pi \\left( \\frac{32}{5} - 0 \\right) = \\frac{32}{5}\\pi \\approx 6.4\\pi',
    ],
    visualConnectionTip:
      'Metode cakram mengintegralkan luas penampang lingkaran pi*r^2 sepanjang sumbu rotasi.',
    relatedModuleId: 'integral',
  },
];

interface QuizModuleProps {
  onNavigateModule?: (module: 'limit' | 'derivative' | 'integral') => void;
}

export const QuizModule: React.FC<QuizModuleProps> = ({ onNavigateModule }) => {
  // Filters
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('all');

  // Quiz Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // Timer Mode State
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [savedHighScore, setSavedHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('antigravity_quiz_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Filtered Question List
  const filteredQuestions = useMemo(() => {
    return QUIZ_QUESTIONS.filter((q) => {
      const matchTopic = selectedTopic === 'all' || q.category === selectedTopic;
      const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      return matchTopic && matchDiff;
    });
  }, [selectedTopic, selectedDifficulty]);

  // Safe Guard current question
  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  // Timer countdown
  useEffect(() => {
    if (!isTimerActive || isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsFinished(true);
          sound.playSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive, isFinished]);

  // Reset when filters change
  const handleFilterChange = (topic: TopicCategory, diff: DifficultyLevel) => {
    sound.playPop(480);
    setSelectedTopic(topic);
    setSelectedDifficulty(diff);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setStreak(0);
    setScore(0);
    setIsFinished(false);
    setReviewMode(false);
    setTimeLeft(600);
  };

  const handleSelectOption = (optId: string) => {
    if (isAnswerSubmitted) return;
    sound.playPop(520);
    setSelectedOption(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswerSubmitted || !currentQ) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctId;
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: selectedOption }));

    if (isCorrect) {
      sound.playSuccess();
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      const basePoints = currentQ.difficulty === 'dasar' ? 100 : currentQ.difficulty === 'menengah' ? 150 : 200;
      const streakBonus = Math.min((newStreak - 1) * 25, 100);
      const newScore = score + basePoints + streakBonus;
      setScore(newScore);

      if (newScore > savedHighScore) {
        setSavedHighScore(newScore);
        try {
          localStorage.setItem('antigravity_quiz_highscore', newScore.toString());
        } catch {
          // Ignore
        }
      }
    } else {
      sound.playError();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    sound.playPop(480);
    if (currentIndex < filteredQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextQ = filteredQuestions[nextIdx];
      const prevAnswer = userAnswers[nextQ?.id];
      if (prevAnswer) {
        setSelectedOption(prevAnswer);
        setIsAnswerSubmitted(true);
      } else {
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
      }
    } else {
      setIsFinished(true);
      sound.playSuccess();
    }
  };

  const handleJumpToQuestion = (idx: number) => {
    sound.playPop(450);
    setCurrentIndex(idx);
    const targetQ = filteredQuestions[idx];
    const prevAnswer = userAnswers[targetQ?.id];
    if (prevAnswer) {
      setSelectedOption(prevAnswer);
      setIsAnswerSubmitted(true);
    } else {
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    }
  };

  const handleRestartQuiz = () => {
    sound.playPop(400);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setStreak(0);
    setScore(0);
    setIsFinished(false);
    setReviewMode(false);
    setTimeLeft(600);
  };

  // Evaluation summary metrics
  const metrics = useMemo(() => {
    let correctCount = 0;
    const topicStats: Record<'limit' | 'derivative' | 'integral', { correct: number; total: number }> = {
      limit: { correct: 0, total: 0 },
      derivative: { correct: 0, total: 0 },
      integral: { correct: 0, total: 0 },
    };

    filteredQuestions.forEach((q) => {
      topicStats[q.category].total += 1;
      if (userAnswers[q.id] === q.correctId) {
        correctCount += 1;
        topicStats[q.category].correct += 1;
      }
    });

    const total = filteredQuestions.length || 1;
    const accuracy = Math.round((correctCount / total) * 100);

    let badge = 'Pemula Kalkulus';
    let badgeColor = 'amber';
    if (accuracy >= 90) {
      badge = 'Grandmaster Kalkulus';
      badgeColor = 'cyan';
    } else if (accuracy >= 75) {
      badge = 'Mahir Matematika TL';
      badgeColor = 'emerald';
    } else if (accuracy >= 50) {
      badge = 'Cakap Kalkulus';
      badgeColor = 'violet';
    }

    return { correctCount, total, accuracy, badge, badgeColor, topicStats };
  }, [filteredQuestions, userAnswers]);

  // Format timer
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, [timeLeft]);

  if (!currentQ) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Tidak ada soal yang cocok dengan filter yang dipilih.</h3>
        <button
          className="btn btn-primary"
          style={{ marginTop: '16px' }}
          onClick={() => handleFilterChange('all', 'all')}
        >
          Reset Semua Filter
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {/* ── Top Header / HUD ── */}
      <div className="quiz-hud-bar">
        <div className="quiz-hud-left">
          <div className="quiz-badge-topic">
            <span style={{ fontSize: '1.1rem' }}>🎯</span>
            <span>{currentQ.categoryTitle}</span>
          </div>
          <div className={`quiz-badge-diff ${currentQ.difficulty}`}>
            {currentQ.difficulty.toUpperCase()}
          </div>
        </div>

        <div className="quiz-hud-right">
          {isTimerActive && (
            <div className="quiz-stat-pill" style={{ borderColor: timeLeft < 60 ? 'var(--accent-rose)' : 'var(--border-subtle)' }}>
              <span style={{ color: timeLeft < 60 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>⏱</span>
              <span style={{ color: timeLeft < 60 ? 'var(--accent-rose)' : 'var(--text-primary)', fontWeight: 700 }}>
                {formattedTime}
              </span>
            </div>
          )}

          <div className="quiz-stat-pill">
            <span style={{ color: 'var(--accent-rose)' }}>🔥</span>
            <span>Streak: <strong>{streak}</strong></span>
          </div>

          <div className="quiz-stat-pill">
            <span style={{ color: 'var(--accent-amber)' }}>⭐</span>
            <span>Skor: <strong>{score}</strong></span>
          </div>

          {savedHighScore > 0 && (
            <div className="quiz-stat-pill" style={{ opacity: 0.85 }}>
              <span style={{ color: 'var(--accent-cyan)' }}>🏆</span>
              <span>Rekor: <strong>{savedHighScore}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="quiz-filter-bar card">
        <div className="filter-group">
          <span className="filter-label">Topik:</span>
          <div className="filter-chips">
            {(['all', 'limit', 'derivative', 'integral'] as const).map((t) => (
              <button
                key={t}
                className={`filter-chip ${selectedTopic === t ? 'active' : ''}`}
                onClick={() => handleFilterChange(t, selectedDifficulty)}
              >
                {t === 'all' ? 'Semua Topik' : t === 'limit' ? 'Limit' : t === 'derivative' ? 'Turunan' : 'Integral'}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Tingkat:</span>
          <div className="filter-chips">
            {(['all', 'dasar', 'menengah', 'tantangan'] as const).map((d) => (
              <button
                key={d}
                className={`filter-chip ${selectedDifficulty === d ? 'active' : ''}`}
                onClick={() => handleFilterChange(selectedTopic, d)}
              >
                {d === 'all' ? 'Semua' : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Timer Toggle Button */}
        <button
          className={`filter-chip ${isTimerActive ? 'active' : ''}`}
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            sound.playPop(480);
            setIsTimerActive(!isTimerActive);
          }}
        >
          {isTimerActive ? '⏱ Timer: Aktif' : '⏱ Aktifkan Mode Ujian Waktu'}
        </button>
      </div>

      {/* ── Main Quiz Game Area ── */}
      {!isFinished ? (
        <div className="quiz-main-grid">
          {/* Left: Active Question Card */}
          <div className="quiz-question-card card animate-fade-in-up">
            <div className="quiz-progress-meta">
              <span className="quiz-q-counter">
                Soal <strong>{currentIndex + 1}</strong> dari {filteredQuestions.length}
              </span>
              <span className="quiz-q-pts">
                +{currentQ.difficulty === 'dasar' ? 100 : currentQ.difficulty === 'menengah' ? 150 : 200} pts
              </span>
            </div>

            {/* Progress Bar */}
            <div className="quiz-progress-track">
              <div
                className="quiz-progress-bar"
                style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question Text & Latex */}
            <h3 className="quiz-q-text">{currentQ.questionText}</h3>
            {currentQ.questionLatex && (
              <div className="quiz-q-formula">
                <KTeX math={currentQ.questionLatex} display />
              </div>
            )}

            {/* Multiple Choice Options */}
            <div className="quiz-options-list">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrect = isAnswerSubmitted && opt.id === currentQ.correctId;
                const isWrong = isAnswerSubmitted && isSelected && !isCorrect;

                let optClass = 'quiz-option-btn';
                if (isSelected) optClass += ' selected';
                if (isCorrect) optClass += ' correct';
                if (isWrong) optClass += ' wrong';

                return (
                  <button
                    key={opt.id}
                    className={optClass}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={isAnswerSubmitted}
                  >
                    <div className="quiz-option-letter">{opt.id}</div>
                    <div className="quiz-option-text">
                      {opt.isLatex ? <KTeX math={opt.text} /> : opt.text}
                    </div>
                    {isCorrect && <span className="quiz-option-indicator">✓ Benar</span>}
                    {isWrong && <span className="quiz-option-indicator wrong">✗ Salah</span>}
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="quiz-action-bar">
              {!isAnswerSubmitted ? (
                <button
                  className="btn btn-primary"
                  style={{ padding: '10px 28px', fontSize: 'var(--text-sm)' }}
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                >
                  Periksa Jawaban →
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ padding: '10px 28px', fontSize: 'var(--text-sm)', background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' }}
                  onClick={handleNextQuestion}
                >
                  {currentIndex < filteredQuestions.length - 1 ? 'Soal Berikutnya →' : 'Lihat Hasil Evaluasi 🏆'}
                </button>
              )}
            </div>

            {/* Step-by-step Solution Explanation on submission */}
            {isAnswerSubmitted && (
              <div className="quiz-explanation-panel animate-fade-in-up">
                <div className="quiz-explanation-header">
                  <div className="card-icon emerald" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                    📖
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Pembahasan Langkah Demi Langkah
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {currentQ.explanationSummary}
                    </p>
                  </div>
                </div>

                <div className="quiz-steps-list">
                  {currentQ.stepByStepLatex.map((step, idx) => (
                    <div key={idx} className="quiz-step-item">
                      <div className="quiz-step-num">{idx + 1}</div>
                      <div className="quiz-step-latex">
                        <KTeX math={step} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Conceptual Link to Visual Simulations */}
                <div className="quiz-visual-link">
                  <span style={{ fontSize: '1.2rem' }}>💡</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--accent-cyan)' }}>
                      Koneksi Visual ke Konsep:
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {currentQ.visualConnectionTip}
                    </div>
                  </div>
                  {onNavigateModule && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 12px', fontSize: 'var(--text-xs)' }}
                      onClick={() => onNavigateModule(currentQ.relatedModuleId)}
                    >
                      Buka Simulasi →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Question Navigator & Summary */}
          <div className="quiz-sidebar card animate-slide-in-right">
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <div className="card-icon cyan">🧭</div>
              <div>
                <div className="card-title">Navigasi Soal ({filteredQuestions.length})</div>
                <div className="card-subtitle">Klik nomor untuk berpindah soal</div>
              </div>
            </div>

            <div className="quiz-nav-grid">
              {filteredQuestions.map((q, idx) => {
                const answer = userAnswers[q.id];
                const isCur = idx === currentIndex;
                const isDone = Boolean(answer);
                const isRight = answer === q.correctId;

                let pillClass = 'quiz-nav-pill';
                if (isCur) pillClass += ' current';
                if (isDone && isRight) pillClass += ' correct';
                if (isDone && !isRight) pillClass += ' wrong';

                return (
                  <button
                    key={q.id}
                    className={pillClass}
                    onClick={() => handleJumpToQuestion(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '16px 0' }} />

            {/* Quick Live Stats */}
            <div className="quiz-mini-stats">
              <div className="quiz-mini-stat-row">
                <span style={{ color: 'var(--text-muted)' }}>Dijawab:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {Object.keys(userAnswers).length} / {filteredQuestions.length}
                </span>
              </div>
              <div className="quiz-mini-stat-row">
                <span style={{ color: 'var(--text-muted)' }}>Streak Terbaik:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>🔥 {bestStreak}</span>
              </div>
              <div className="quiz-mini-stat-row">
                <span style={{ color: 'var(--text-muted)' }}>Total Skor:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{score} pts</span>
              </div>
            </div>

            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '16px' }}
              onClick={handleRestartQuiz}
            >
              🔄 Reset Kuis
            </button>
          </div>
        </div>
      ) : (
        /* ── Quiz Complete / Summary Card ── */
        <div className="quiz-summary-container animate-fade-in-up">
          <div className="card quiz-summary-card">
            <div className="quiz-summary-icon">🏆</div>
            <h1 className="quiz-summary-title">Evaluasi Selesai!</h1>
            <div className={`quiz-badge-grade ${metrics.badgeColor}`}>{metrics.badge}</div>

            <div className="quiz-score-circle">
              <div className="quiz-score-number">{metrics.accuracy}%</div>
              <div className="quiz-score-subtext">Akurasi Jawaban</div>
            </div>

            <div className="quiz-stats-grid">
              <div className="quiz-stat-card">
                <div className="stat-label">Jawaban Benar</div>
                <div className="stat-val emerald">{metrics.correctCount} / {metrics.total}</div>
              </div>
              <div className="quiz-stat-card">
                <div className="stat-label">Total Skor Diperoleh</div>
                <div className="stat-val amber">{score} pts</div>
              </div>
              <div className="quiz-stat-card">
                <div className="stat-label">Streak Beruntun</div>
                <div className="stat-val rose">🔥 {bestStreak}</div>
              </div>
            </div>

            {/* Breakdown per Topic */}
            <div className="quiz-breakdown-box">
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '12px' }}>
                Penguasaan Berdasarkan Topik:
              </h4>
              {(['limit', 'derivative', 'integral'] as const).map((cat) => {
                const stat = metrics.topicStats[cat];
                if (stat.total === 0) return null;
                const pct = Math.round((stat.correct / stat.total) * 100);
                const title = cat === 'limit' ? 'Limit Fungsi' : cat === 'derivative' ? 'Turunan (Diferensial)' : 'Integral';
                const col = cat === 'limit' ? 'var(--accent-cyan)' : cat === 'derivative' ? 'var(--accent-violet)' : 'var(--accent-amber)';

                return (
                  <div key={cat} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{title}</span>
                      <span style={{ fontWeight: 600, color: col }}>{pct}% ({stat.correct}/{stat.total})</span>
                    </div>
                    <div className="quiz-progress-track" style={{ height: '6px' }}>
                      <div className="quiz-progress-bar" style={{ width: `${pct}%`, background: col }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="quiz-summary-actions">
              <button
                className="btn btn-primary"
                style={{ padding: '12px 32px' }}
                onClick={handleRestartQuiz}
              >
                🔄 Ulangi Kuis
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '12px 24px' }}
                onClick={() => {
                  sound.playPop(480);
                  setIsFinished(false);
                  setReviewMode(true);
                  setCurrentIndex(0);
                  setSelectedOption(userAnswers[filteredQuestions[0].id] || null);
                  setIsAnswerSubmitted(true);
                }}
              >
                📝 Review Semua Pembahasan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizModule;
