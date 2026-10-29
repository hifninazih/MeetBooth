import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50/50 py-8 text-zinc-500 dark:border-zinc-850 dark:bg-zinc-950/40 dark:text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Privasi Terjaga: 100% foto diproses di browser Anda, tidak pernah diunggah ke server mana pun.</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>Dibuat dengan</span>
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 inline" />
          <span>untuk momen berharga Anda</span>
        </div>
      </div>
    </footer>
  );
}
