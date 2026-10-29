'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Image as ImageIcon, Heart } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 text-white shadow-md shadow-rose-500/20">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5 text-lg">
              MeetBooth
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                PRO
              </span>
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 -mt-0.5">Instant & Remote Strip Memories</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          {/* Duo Online Room Button */}
          <Link
            href="/room"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
              pathname.startsWith('/room')
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40'
            }`}
          >
            <Heart className="h-4 w-4 fill-current" />
            <span>Foto Berdua Jarak Jauh</span>
          </Link>

          {/* Solo Booth Button */}
          <Link
            href="/booth"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors ${
              pathname === '/booth'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Solo Booth</span>
          </Link>

          {/* Result Studio */}
          <Link
            href="/result"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors ${
              pathname === '/result'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Studio Edit</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
