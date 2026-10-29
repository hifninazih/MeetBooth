'use client';

import React from 'react';
import { AVAILABLE_STICKERS } from '@/lib/constants';
import { Smile, Trash2 } from 'lucide-react';

interface StickerSelectorProps {
  onAddSticker: (emoji: string) => void;
  onClearStickers?: () => void;
  stickerCount: number;
}

export default function StickerSelector({
  onAddSticker,
  onClearStickers,
  stickerCount,
}: StickerSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Smile className="h-4 w-4 text-rose-500" />
          Stiker & Dekorasi
        </label>
        {stickerCount > 0 && onClearStickers && (
          <button
            onClick={onClearStickers}
            className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
          >
            <Trash2 className="h-3 w-3" />
            Hapus Semua ({stickerCount})
          </button>
        )}
      </div>

      <p className="text-xs text-zinc-500 mb-2.5">
        Klik stiker untuk menempelkannya ke frame photobooth Anda.
      </p>

      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
        {AVAILABLE_STICKERS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onAddSticker(emoji)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-200 text-xl shadow-xs transition-transform hover:scale-125 hover:bg-rose-50 hover:border-rose-300 dark:bg-zinc-800 dark:border-zinc-700 active:scale-95"
            title={`Tambahkan stiker ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
