import Link from 'next/link';
import {
  Camera,
  Shield,
  Download,
  ArrowRight,
  Heart,
  Users,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
        {/* Background glow dots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[600px] rounded-full bg-gradient-to-tr from-pink-300/30 via-rose-300/20 to-amber-200/30 blur-3xl dark:from-pink-900/20 dark:via-rose-950/20 dark:to-amber-950/10" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            
            {/* Left Column: Copywriting & CTAs */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50/80 px-3.5 py-1.5 text-xs font-semibold text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 mb-5">
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                <span>Bisa Foto Bareng Dari Jarak Jauh (Online Duo Room)</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-6xl dark:text-zinc-50 leading-[1.12]">
                Web Photobooth <br />
                <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                  Bisa Foto Berdua Dari Jauh
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Mau foto bareng pacar, sahabat LDR, atau teman tapi lagi terpisah jarak? Buka room virtual, sambungkan kamera berdua secara realtime via WebRTC, hitung mundur tersinkronisasi, dan cetak foto strip kembar!
              </p>

              {/* Dual Primary CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
                {/* 1. Duo Remote Room Button */}
                <Link
                  href="/room"
                  className="flex h-13 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-8 text-base font-bold text-white shadow-lg shadow-rose-500/25 transition-all hover:opacity-95 hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Users className="h-5 w-5" />
                  <span>Foto Berdua Jarak Jauh</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>

                {/* 2. Solo Booth Button */}
                <Link
                  href="/booth"
                  className="flex h-13 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-850"
                >
                  <Camera className="h-4 w-4 text-rose-500" />
                  <span>Foto Sendiri (Solo)</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-rose-500 fill-current" />
                  <span>WebRTC Video Call + Shutter Sync</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>100% Peer-to-Peer Privat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Download className="h-4 w-4 text-amber-500" />
                  <span>High-Res Photo Strip Cetak</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Mockup of a Duo Photo Strip */}
            <div className="flex justify-center lg:col-span-5">
              <div className="relative">
                {/* Floating decorative badges */}
                <div className="absolute -top-4 -left-6 z-20 rounded-2xl bg-white p-3 shadow-xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 animate-bounce duration-1000">
                  <span className="text-2xl">👩‍❤️‍👨</span>
                </div>
                <div className="absolute -bottom-4 -right-4 z-20 rounded-2xl bg-white p-3 shadow-xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 animate-pulse">
                  <span className="text-2xl">💖</span>
                </div>

                {/* Simulated Duo Photo Strip */}
                <div className="w-[280px] sm:w-[300px] rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-zinc-900/10 dark:bg-zinc-900 dark:ring-zinc-800 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  {/* Photo 1: Split Left & Right */}
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-900 mb-3 relative flex divide-x-2 divide-white/40 shadow-inner">
                    <div className="w-1/2 h-full bg-gradient-to-tr from-pink-300 to-rose-200 flex items-center justify-center text-2xl font-bold">
                      👩
                    </div>
                    <div className="w-1/2 h-full bg-gradient-to-tr from-sky-200 to-indigo-300 flex items-center justify-center text-2xl font-bold">
                      👨
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white flex items-center justify-center text-[10px] shadow">
                      💖
                    </div>
                  </div>

                  {/* Photo 2 */}
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-900 mb-3 relative flex divide-x-2 divide-white/40 shadow-inner">
                    <div className="w-1/2 h-full bg-gradient-to-tr from-amber-200 to-pink-200 flex items-center justify-center text-2xl font-bold">
                      ✌️
                    </div>
                    <div className="w-1/2 h-full bg-gradient-to-tr from-emerald-200 to-teal-200 flex items-center justify-center text-2xl font-bold">
                      ✌️
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white flex items-center justify-center text-[10px] shadow">
                      ✨
                    </div>
                  </div>

                  {/* Photo 3 */}
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-900 mb-4 relative flex divide-x-2 divide-white/40 shadow-inner">
                    <div className="w-1/2 h-full bg-gradient-to-tr from-purple-200 to-pink-200 flex items-center justify-center text-2xl font-bold">
                      🥰
                    </div>
                    <div className="w-1/2 h-full bg-gradient-to-tr from-rose-200 to-amber-200 flex items-center justify-center text-2xl font-bold">
                      🥰
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white flex items-center justify-center text-[10px] shadow">
                      💌
                    </div>
                  </div>

                  {/* Strip Footer */}
                  <div className="text-center pt-1 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="font-extrabold text-xs tracking-widest text-zinc-900 dark:text-zinc-100 uppercase">
                      LDR BESTIES • ONLINE
                    </p>
                    <p className="text-[10px] font-bold tracking-widest text-rose-500 mt-0.5">
                      FOTO BARENG DARI JAUH
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Duo Virtual Room Feature Showcase */}
      <section className="border-t border-zinc-200/80 bg-gradient-to-b from-rose-50/40 to-transparent py-16 dark:border-zinc-850 dark:from-zinc-900/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
              Inovasi Photobooth Terbaru
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
              Bagaimana Cara Foto Berdua Dari Jarak Jauh?
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Seperti ruang online meet, namun dirancang khusus untuk sesi foto strip estetik bersama.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-rose-100 bg-white p-7 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 mb-5 font-black text-lg">
                1
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-2">
                Bikin Room & Kirim Link
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Cukup tekan &quot;Bikin Room&quot;, dapatkan kode unik 6-karakter atau tautan langsung, lalu kirim ke sahabat atau pasanganmu.
              </p>
            </div>

            <div className="rounded-3xl border border-rose-100 bg-white p-7 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400 mb-5 font-black text-lg">
                2
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-2">
                Kamera Menyatu & Bisa Ngobrol
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Kedua webcam kalian langsung tersambung side-by-side secara real-time. Ada fitur mic agar bisa langsung mencocokkan pose!
              </p>
            </div>

            <div className="rounded-3xl border border-rose-100 bg-white p-7 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 mb-5 font-black text-lg">
                3
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-2">
                Shutter Sync & Cetak Bersama
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Hitung mundur 3s jalan bareng di kedua layar! Foto kedua wajah digabung otomatis dalam satu frame strip dan bisa diunduh kalian berdua.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/room"
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition"
            >
              <Users className="h-4 w-4" />
              <span>Coba Room Berdua Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
