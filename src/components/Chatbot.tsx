import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sound } from '../utils/audio';

/* =============================================================
   CHATBOT — Asisten Matematika Interaktif
   
   Knowledge-based chatbot yang menjawab pertanyaan seputar:
   - Limit Fungsi (aljabar, trigonometri, ketakhinggaan)
   - Turunan / Diferensial (singgung, normal, kecekungan)
   - Integral (Riemann, luas daerah, TDK)
   
   Fitur:
   - Floating widget di pojok kanan bawah
   - Konteks-aware (tahu modul aktif)
   - Quick reply buttons untuk pertanyaan umum
   - Typing animation
   - Riwayat chat per sesi
   ============================================================= */

type ActiveModule = 'home' | 'limit' | 'derivative' | 'integral' | 'quiz';

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatbotProps {
  activeModule: ActiveModule;
}

// ─── Knowledge Base ────────────────────────────────────────────
interface KnowledgeEntry {
  keywords: string[];
  answer: string;
  followUp?: string[];
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ── LIMIT ──
  {
    keywords: ['apa itu limit', 'pengertian limit', 'definisi limit', 'limit itu apa'],
    answer: '📘 **Limit** adalah nilai yang didekati oleh suatu fungsi f(x) ketika variabel x mendekati suatu nilai tertentu c.\n\nSecara formal:\nlim(x→c) f(x) = L\n\nArtinya: semakin dekat x ke c, semakin dekat f(x) ke L.\n\n💡 Coba buka **Modul Limit** dan geser slider "Jarak Probe" mendekati 0 untuk melihat bagaimana f(x) mendekati nilai limit!',
    followUp: ['Apa itu bentuk tak tentu?', 'Apa syarat limit ada?', 'Apa itu epsilon-delta?'],
  },
  {
    keywords: ['bentuk tak tentu', '0/0', 'nol per nol', 'indeterminate'],
    answer: '🔍 **Bentuk Tak Tentu 0/0** terjadi ketika substitusi langsung menghasilkan 0/0.\n\nIni BUKAN berarti limitnya 0 atau tidak ada! Kita perlu teknik khusus:\n\n1. **Pemfaktoran** — Faktorkan pembilang/penyebut, eliminasi faktor pembuat nol\n2. **Perkalian Sekawan** — Untuk bentuk akar, kalikan dengan konjugatnya\n3. **Sifat Trigonometri** — Gunakan lim sin(ax)/bx = a/b\n\n💡 Di Modul Limit, pilih fungsi (x²-4)/(x-2) dan lihat bagaimana walaupun ada "lubang" di x=2, limitnya tetap 4!',
    followUp: ['Cara faktorisasi limit?', 'Apa itu sekawan?', 'Contoh limit trigonometri?'],
  },
  {
    keywords: ['syarat limit ada', 'limit ada', 'limit exist', 'kapan limit ada'],
    answer: '✅ **Syarat Limit Ada:**\n\nLimit lim(x→c) f(x) ada jika dan hanya jika:\n• Limit kiri = Limit kanan\n• lim(x→c⁻) f(x) = lim(x→c⁺) f(x)\n\nJika keduanya tidak sama, maka **limit TIDAK ADA** (DNE).\n\n💡 Coba pilih fungsi |x|/x di Modul Limit — perhatikan probe kiri menuju -1 dan probe kanan menuju +1. Karena berbeda, limitnya tidak ada!',
    followUp: ['Contoh limit tidak ada?', 'Apa itu diskontinuitas lompat?'],
  },
  {
    keywords: ['epsilon delta', 'epsilon-delta', 'ε-δ', 'definisi formal limit'],
    answer: '📏 **Definisi Epsilon-Delta (ε-δ):**\n\nlim(x→c) f(x) = L artinya:\nUntuk setiap ε > 0, terdapat δ > 0 sehingga:\njika 0 < |x - c| < δ, maka |f(x) - L| < ε\n\n🎯 Artinya sederhana:\n• ε = toleransi error pada sumbu-y\n• δ = jarak pada sumbu-x\n\nJika x berada dalam "pita δ" di sekitar c, maka f(x) pasti berada dalam "pita ε" di sekitar L.\n\n💡 Aktifkan toggle "Pita Epsilon-Delta" di Modul Limit untuk melihat visualisasinya secara langsung!',
  },
  {
    keywords: ['limit tak hingga', 'limit infinity', 'x menuju tak hingga', 'asimtot', 'limit di ketakhinggaan'],
    answer: '🌌 **Limit di Ketakhinggaan (x → ∞):**\n\nUntuk fungsi rasional P(x)/Q(x):\n\n• Derajat P = Derajat Q → Limit = koefisien tertinggi P / koefisien tertinggi Q\n• Derajat P < Derajat Q → Limit = 0\n• Derajat P > Derajat Q → Limit = ±∞\n\nGaris y = L disebut **asimtot horizontal**.\n\n💡 Pilih fungsi (2x²+1)/(x²+3) di Modul Limit dan geser slider x ke kanan. Lihat kurva mendekati garis y = 2!',
  },
  {
    keywords: ['limit trigonometri', 'sin x / x', 'sinx/x', 'limit trig'],
    answer: '📐 **Limit Trigonometri Fundamental:**\n\n• lim(x→0) sin(ax)/bx = a/b\n• lim(x→0) tan(ax)/bx = a/b\n• lim(x→0) (1 - cos(ax))/x = 0\n• lim(x→0) (1 - cos(ax))/x² = a²/2\n\nLimit sin(x)/x = 1 dibuktikan melalui **Teorema Apit** (Squeeze Theorem).\n\n💡 Pilih fungsi sin(x)/x di Modul Limit dan lihat bagaimana kurva mendekati y = 1 dari kedua sisi!',
  },
  {
    keywords: ['cara faktor', 'faktorisasi', 'pemfaktoran limit'],
    answer: '🔧 **Teknik Pemfaktoran Limit:**\n\nLangkah:\n1. Substitusi langsung → dapat 0/0\n2. Faktorkan pembilang dan penyebut\n3. Eliminasi faktor pembuat nol\n4. Substitusi ulang\n\nContoh: lim(x→2) (x²-4)/(x-2)\n= lim(x→2) (x-2)(x+2)/(x-2)\n= lim(x→2) (x+2) = 4\n\n📝 Pola umum: a² - b² = (a-b)(a+b)',
  },
  {
    keywords: ['sekawan', 'konjugat', 'perkalian sekawan', 'rasionalisasi'],
    answer: '🔧 **Teknik Perkalian Sekawan:**\n\nDigunakan untuk bentuk akar, contoh:\nlim(x→0) (√(x+4) - 2)/x\n\nKalikan dengan sekawan: (√(x+4) + 2)/(√(x+4) + 2)\n\nPembilang menjadi: (x+4) - 4 = x\nHasil: x / (x(√(x+4)+2)) = 1/(√(x+4)+2)\n\nSubstitusi x=0: 1/(2+2) = 1/4 = 0.25\n\n💡 Lihat visualisasinya di Modul Limit dengan fungsi (√(x+4)-2)/x!',
  },

  // ── TURUNAN ──
  {
    keywords: ['apa itu turunan', 'pengertian turunan', 'definisi turunan', 'turunan itu apa', 'diferensial'],
    answer: '📘 **Turunan (Diferensial)** adalah laju perubahan sesaat suatu fungsi.\n\nSecara geometris: turunan f\'(x₀) = **gradien garis singgung** kurva di titik x₀.\n\nDefinisi formal:\nf\'(x) = lim(h→0) [f(x+h) - f(x)] / h\n\nAnalogi: Jika f(x) adalah posisi, maka f\'(x) adalah kecepatan sesaat.\n\n💡 Di Modul Turunan, pilih mode "Garis Sekan" dan perkecil h menuju 0 — lihat garis sekan berubah menjadi garis singgung!',
    followUp: ['Apa aturan turunan dasar?', 'Apa itu garis singgung?', 'Apa itu garis normal?'],
  },
  {
    keywords: ['aturan turunan', 'rumus turunan', 'turunan dasar', 'power rule'],
    answer: '📐 **Aturan Turunan Dasar:**\n\n• d/dx [xⁿ] = n·xⁿ⁻¹ (Aturan Pangkat)\n• d/dx [c] = 0 (Konstanta)\n• d/dx [sin x] = cos x\n• d/dx [cos x] = -sin x\n• d/dx [tan x] = sec²x\n\n**Aturan Operasi:**\n• (u·v)\' = u\'v + uv\' (Product Rule)\n• (u/v)\' = (u\'v - uv\')/v² (Quotient Rule)\n• [f(g(x))]\' = f\'(g(x))·g\'(x) (Chain Rule)\n\n💡 Buka Rangkuman Rumus (📐) untuk referensi lengkap!',
    followUp: ['Apa itu chain rule?', 'Contoh product rule?'],
  },
  {
    keywords: ['garis singgung', 'tangent', 'persamaan garis singgung'],
    answer: '📏 **Garis Singgung (Tangent Line):**\n\nGaris singgung kurva y = f(x) di titik (x₀, y₀):\n\n**y - y₀ = m(x - x₀)**\n\ndi mana m = f\'(x₀) adalah gradien di titik tersebut.\n\n🎯 Sifat penting:\n• Garis singgung menyentuh kurva di tepat satu titik (lokal)\n• Gradien = 0 → garis singgung mendatar (titik stasioner)\n\n💡 Di Modul Turunan, aktifkan mode "Garis Singgung" dan geser titik P untuk melihat persamaan garis berubah real-time!',
    followUp: ['Apa itu garis normal?', 'Kapan gradien = 0?'],
  },
  {
    keywords: ['garis normal', 'normal line', 'tegak lurus'],
    answer: '📏 **Garis Normal:**\n\nGaris normal adalah garis yang **tegak lurus** terhadap garis singgung di titik singgung.\n\nJika gradien singgung = m, maka:\n**Gradien normal = -1/m**\n\nPersamaan: y - y₀ = (-1/m)(x - x₀)\n\n💡 Di Modul Turunan, centang "Tampilkan Garis Normal" untuk melihat kedua garis sekaligus!',
  },
  {
    keywords: ['titik stasioner', 'titik kritis', 'maksimum', 'minimum', 'titik belok'],
    answer: '📊 **Titik Stasioner & Analisis:**\n\nTitik stasioner terjadi saat f\'(x) = 0.\n\n**Uji Turunan Kedua:**\n• f\'\'(x₀) > 0 → Minimum lokal (cekung ke atas ∪)\n• f\'\'(x₀) < 0 → Maksimum lokal (cekung ke bawah ∩)\n• f\'\'(x₀) = 0 → Titik belok (perlu uji lanjut)\n\n💡 Di Modul Turunan, pilih f(x) = x³ - 3x. Geser x₀ ke x = -1 (maks) dan x = 1 (min). Aktifkan kurva f\'(x) untuk melihat di mana turunan = 0!',
    followUp: ['Apa itu kecekungan?', 'Cara uji turunan kedua?'],
  },
  {
    keywords: ['kecekungan', 'concavity', 'cekung', 'turunan kedua'],
    answer: '📈 **Kecekungan Kurva (Concavity):**\n\n• **f\'\'(x) > 0** → Kurva cekung ke atas (∪) — seperti mangkuk terbuka\n• **f\'\'(x) < 0** → Kurva cekung ke bawah (∩) — seperti mangkuk terbalik\n• **f\'\'(x) = 0** dan berubah tanda → **Titik Belok** (inflection point)\n\n💡 Di Modul Turunan, aktifkan "Grafik Turunan f\'(x)" dan amati bagaimana tanda f\'\'(x) berubah di status bar bawah!',
  },
  {
    keywords: ['sekan', 'secant', 'garis sekan', 'h menuju 0'],
    answer: '📐 **Transisi Garis Sekan → Garis Singgung:**\n\nGaris sekan menghubungkan dua titik pada kurva: P(x₀, f(x₀)) dan Q(x₀+h, f(x₀+h)).\n\nGradien sekan = [f(x₀+h) - f(x₀)] / h\n\nSaat h → 0, titik Q mendekati P, dan garis sekan berubah menjadi garis singgung!\n\nIni persis definisi turunan: f\'(x₀) = lim(h→0) [f(x₀+h) - f(x₀)] / h\n\n💡 Di Modul Turunan, pilih mode "Garis Sekan" dan perkecil h perlahan. Lihat garis sekan menyatu menjadi garis singgung!',
  },

  // ── INTEGRAL ──
  {
    keywords: ['apa itu integral', 'pengertian integral', 'definisi integral', 'integral itu apa'],
    answer: '📘 **Integral** adalah konsep kebalikan dari turunan (anti-diferensiasi) dan juga merepresentasikan **luas daerah di bawah kurva**.\n\nDua jenis:\n• **Integral Tak Tentu**: ∫ f(x) dx = F(x) + C (anti-turunan)\n• **Integral Tentu**: ∫ₐᵇ f(x) dx = F(b) - F(a) (luas terukur)\n\n💡 Di Modul Integral, lihat bagaimana balok-balok Riemann mengaproksimasi luas kurva — semakin banyak balok, semakin akurat!',
    followUp: ['Apa itu Jumlah Riemann?', 'Apa itu TDK?', 'Bagaimana luas antara 2 kurva?'],
  },
  {
    keywords: ['jumlah riemann', 'riemann sum', 'riemann', 'partisi'],
    answer: '📦 **Jumlah Riemann:**\n\nCara mengaproksimasi luas di bawah kurva dengan membagi menjadi n balok persegi panjang.\n\n**4 Tipe Titik Sampel:**\n• **Kiri (Left)** — tinggi balok diambil dari ujung kiri\n• **Kanan (Right)** — tinggi balok diambil dari ujung kanan\n• **Tengah (Midpoint)** — tinggi balok diambil dari titik tengah\n• **Trapesium** — rata-rata ujung kiri dan kanan\n\nSemakin banyak n (partisi), semakin akurat hasilnya!\n\n💡 Di Modul Integral, klik "Simulasikan Konvergensi (n → ∞)" dan lihat error turun drastis!',
    followUp: ['Mana yang paling akurat?', 'Apa hubungannya dengan integral?'],
  },
  {
    keywords: ['teorema dasar kalkulus', 'tdk', 'fundamental theorem', 'ftc'],
    answer: '⚡ **Teorema Dasar Kalkulus (TDK / FTC):**\n\nTeorema ini menghubungkan integral dan turunan:\n\n∫ₐᵇ f(x) dx = F(b) - F(a)\n\ndi mana F(x) adalah anti-turunan f(x), yaitu F\'(x) = f(x).\n\nContoh: ∫₀³ x² dx = [x³/3]₀³ = 27/3 - 0 = 9\n\nTeorema ini membuktikan bahwa Jumlah Riemann (lim n→∞) = F(b) - F(a).\n\n💡 Di Modul Integral, bandingkan nilai Σ Riemann dengan nilai eksak ∫. Semakin besar n, semakin dekat!',
  },
  {
    keywords: ['luas antara dua kurva', 'luas daerah', 'dua kurva', 'between curves', 'area between'],
    answer: '📐 **Luas Antara Dua Kurva:**\n\nJika f(x) ≥ g(x) pada [a, b], maka:\n\nL = ∫ₐᵇ [f(x) - g(x)] dx\n\n**Langkah:**\n1. Tentukan titik potong kedua kurva (cari a dan b)\n2. Tentukan mana kurva atas (f) dan bawah (g)\n3. Integralkan selisih f(x) - g(x)\n\n💡 Di Modul Integral, pilih mode "Luas Antara 2 Kurva" dan lihat daerah berarsir kuning di antara kedua kurva!',
  },
  {
    keywords: ['luas netto', 'signed area', 'luas negatif', 'area negatif'],
    answer: '⚠️ **Luas Netto vs Luas Geometris:**\n\n• **Luas Netto (Signed Area)**: Integral tentu ∫ₐᵇ f(x) dx — bagian di bawah sumbu-x dihitung NEGATIF\n• **Luas Geometris (Total)**: ∫ₐᵇ |f(x)| dx — semua bagian dihitung POSITIF\n\nContoh: ∫₀²π sin(x) dx = 0 (netto), tapi luas geometris = 4\n\n💡 Di Modul Integral, pilih f(x) = sin(x) dengan batas [0, 2π]. Perhatikan catatan "Luas Netto" yang muncul!',
  },
  {
    keywords: ['trapesium', 'midpoint', 'akurat', 'mana yang paling akurat'],
    answer: '🎯 **Perbandingan Akurasi Metode Riemann:**\n\nUntuk jumlah partisi n yang sama:\n• **Midpoint (Tengah)** — Biasanya paling akurat\n• **Trapesium** — Kedua paling akurat\n• **Left/Right** — Akurasi terendah\n\nSemua metode konvergen ke nilai yang sama saat n → ∞.\n\n💡 Di Modul Integral, coba ganti tipe dari Left ke Midpoint dengan n=6 dan bandingkan error-nya!',
  },

  // ── KUIS ──
  {
    keywords: ['kuis', 'quiz', 'evaluasi', 'soal', 'ujian'],
    answer: '🎯 **Kuis & Evaluasi:**\n\nKuis berisi 24 soal komprehensif dari 3 topik:\n• 8 soal Limit (aljabar, trigonometri, tak hingga)\n• 8 soal Turunan (singgung, normal, stasioner)\n• 8 soal Integral (Riemann, TDK, luas daerah)\n\n**Fitur:**\n• Mode Timer (ujian berwaktu) & Mode Santai\n• Filter topik & tingkat kesulitan\n• Streak multiplier untuk skor bonus\n• Pembahasan KaTeX lengkap\n\n💡 Klik "Kuis & Evaluasi" di navbar untuk mulai!',
  },

  // ── NAVIGASI & BANTUAN ──
  {
    keywords: ['cara pakai', 'cara menggunakan', 'bagaimana cara', 'tutorial', 'panduan'],
    answer: '📖 **Panduan Penggunaan Antigravity:**\n\n1. **Pilih Modul** — Klik kartu di halaman utama atau tab di navbar\n2. **Pilih Fungsi** — Gunakan dropdown untuk memilih fungsi matematika\n3. **Interaksi Grafik** — Geser slider, klik canvas, atau jalankan animasi\n4. **Baca Penjelasan** — Buka langkah pembuktian dan catatan konseptual\n5. **Uji Pemahaman** — Kerjakan kuis di akhir\n\n💡 Setiap kontrol memiliki ikon ℹ️ — hover untuk penjelasan detail!',
  },
  {
    keywords: ['rumus', 'rangkuman', 'formula', 'cheat sheet'],
    answer: '📐 **Rangkuman Rumus:**\n\nKlik tombol "📐 Rangkuman Rumus" di navbar untuk membuka modal berisi semua rumus penting:\n\n• Limit: Sifat dasar, trigonometri, ketakhinggaan\n• Turunan: Power rule, product/quotient/chain rule, trig\n• Integral: Aturan pangkat, TDK, luas daerah\n\n💡 Modal ini bisa dibuka kapan saja dari halaman mana pun!',
  },

  // ── DEFAULT ──
  {
    keywords: ['halo', 'hai', 'hello', 'hi', 'hey', 'apa kabar'],
    answer: '👋 Halo! Saya **Asisten Matematika Antigravity**.\n\nSaya bisa membantu menjelaskan konsep:\n• 📈 **Limit** — konvergensi, bentuk tak tentu, epsilon-delta\n• 📉 **Turunan** — garis singgung, normal, kecekungan\n• 📊 **Integral** — Riemann, TDK, luas daerah\n\nSilakan tanya apa saja! 😊',
    followUp: ['Apa itu limit?', 'Apa itu turunan?', 'Apa itu integral?'],
  },
  {
    keywords: ['terima kasih', 'makasih', 'thanks', 'thank you', 'thx'],
    answer: '😊 Sama-sama! Senang bisa membantu.\n\nJangan ragu bertanya lagi jika ada konsep yang masih membingungkan. Selamat belajar! 📚✨',
  },
];

// Context-aware suggestions based on active module
const MODULE_SUGGESTIONS: Record<ActiveModule, string[]> = {
  home: ['Apa itu limit?', 'Apa itu turunan?', 'Apa itu integral?', 'Cara pakai aplikasi ini?'],
  limit: ['Apa itu bentuk tak tentu?', 'Apa itu epsilon-delta?', 'Limit trigonometri?', 'Limit di ketakhinggaan?'],
  derivative: ['Apa itu garis singgung?', 'Apa itu garis normal?', 'Apa itu titik stasioner?', 'Apa itu kecekungan?'],
  integral: ['Apa itu Jumlah Riemann?', 'Apa itu TDK?', 'Luas antara 2 kurva?', 'Luas netto vs geometris?'],
  quiz: ['Tips mengerjakan kuis?', 'Rangkuman rumus?', 'Apa itu limit?', 'Apa itu integral?'],
};

function findAnswer(userInput: string): { answer: string; followUp?: string[] } {
  const input = userInput.toLowerCase().trim();

  // Try exact keyword matching first
  for (const entry of KNOWLEDGE_BASE) {
    for (const keyword of entry.keywords) {
      if (input.includes(keyword.toLowerCase())) {
        return { answer: entry.answer, followUp: entry.followUp };
      }
    }
  }

  // Partial matching with scoring
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    const inputWords = input.split(/\s+/);
    for (const keyword of entry.keywords) {
      const kwWords = keyword.toLowerCase().split(/\s+/);
      for (const iw of inputWords) {
        for (const kw of kwWords) {
          if (iw.length >= 3 && kw.includes(iw)) score += 2;
          else if (kw.length >= 3 && iw.includes(kw)) score += 1;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return { answer: bestMatch.answer, followUp: bestMatch.followUp };
  }

  // Default fallback
  return {
    answer: '🤔 Maaf, saya belum sepenuhnya memahami pertanyaan Anda.\n\nCoba tanyakan tentang:\n• Konsep **Limit** (bentuk tak tentu, trigonometri, epsilon-delta)\n• Konsep **Turunan** (garis singgung, normal, kecekungan)\n• Konsep **Integral** (Riemann, TDK, luas daerah)\n\nAtau klik salah satu pertanyaan cepat di bawah! 👇',
    followUp: ['Apa itu limit?', 'Apa itu turunan?', 'Apa itu integral?'],
  };
}

// ─── Main Component ────────────────────────────────────────────
export const Chatbot: React.FC<ChatbotProps> = ({ activeModule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] = useState<string[]>(
    MODULE_SUGGESTIONS[activeModule]
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgIdRef = useRef(0);

  // Update suggestions when module changes
  useEffect(() => {
    setCurrentFollowUp(MODULE_SUGGESTIONS[activeModule]);
  }, [activeModule]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const toggleChat = () => {
    sound.playPop(isOpen ? 350 : 520);
    setIsOpen(!isOpen);

    // Show welcome message on first open
    if (!isOpen && messages.length === 0) {
      const moduleNames: Record<ActiveModule, string> = {
        home: 'halaman utama',
        limit: 'Modul Limit',
        derivative: 'Modul Turunan',
        integral: 'Modul Integral',
        quiz: 'Kuis & Evaluasi',
      };
      const welcomeMsg: ChatMessage = {
        id: msgIdRef.current++,
        role: 'bot',
        text: `👋 Halo! Saya **Asisten Matematika Antigravity**.\n\nSaat ini kamu sedang di **${moduleNames[activeModule]}**. Saya bisa membantu menjelaskan konsep matematika, cara menggunakan fitur, atau menjawab pertanyaan seputar materi.\n\nSilakan ketik pertanyaan atau pilih topik di bawah! 👇`,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  };

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: msgIdRef.current++,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    sound.playPop(480);

    // Simulate typing delay
    setTimeout(() => {
      const { answer, followUp } = findAnswer(text);
      const botMsg: ChatMessage = {
        id: msgIdRef.current++,
        role: 'bot',
        text: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      if (followUp) setCurrentFollowUp(followUp);
      sound.playPop(600);
    }, 600 + Math.random() * 800);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  // Format message text (basic markdown-like formatting)
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Bullet points
      if (formatted.startsWith('• ')) {
        return (
          <div key={i} className="chat-bullet">
            <span className="chat-bullet-dot">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
          </div>
        );
      }
      if (formatted.trim() === '') return <br key={i} />;
      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="chatbot-root">
      {/* ── Chat Window (Only visible when opened) ── */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <div className="chatbot-title">Asisten Matematika</div>
                <div className="chatbot-status">
                  <span className="chatbot-status-dot" />
                  Online
                </div>
              </div>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={toggleChat}
              aria-label="Tutup Chat"
              title="Tutup Obrolan"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-msg ${msg.role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`}
              >
                {msg.role === 'bot' && <div className="chatbot-msg-avatar">🤖</div>}
                <div className={`chatbot-msg-bubble ${msg.role === 'user' ? 'chatbot-bubble-user' : 'chatbot-bubble-bot'}`}>
                  {formatText(msg.text)}
                  <div className="chatbot-msg-time">
                    {msg.timestamp.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="chatbot-msg chatbot-msg-bot">
                <div className="chatbot-msg-avatar">🤖</div>
                <div className="chatbot-bubble-bot chatbot-typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggestions */}
          {currentFollowUp.length > 0 && (
            <div className="chatbot-suggestions">
              {currentFollowUp.map((suggestion) => (
                <button
                  key={suggestion}
                  className="chatbot-suggestion-btn"
                  onClick={() => handleQuickReply(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form className="chatbot-input-area" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Tanya seputar Limit, Turunan, Integral..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!inputValue.trim()}
              aria-label="Kirim"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* ── Floating Toggle Button ── */}
      <button
        className={`chatbot-fab ${isOpen ? 'chatbot-fab-active' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Tutup Chat' : 'Buka Chatbot Asisten'}
        title="Tanya Asisten Matematika"
      >
        <span className="chatbot-fab-icon">{isOpen ? '✕' : '💬'}</span>
        {!isOpen && <span className="chatbot-fab-label">Tanya AI</span>}
      </button>
    </div>
  );
};

export default Chatbot;
