'use client';

import React from 'react';
import { PhotoboothSettings } from '@/types';
import { FRAME_THEMES, LAYOUT_OPTIONS } from '@/lib/constants';
import { LayoutGrid, Type, Calendar, Check, Sparkles } from 'lucide-react';

interface FrameSelectorProps {
  settings: PhotoboothSettings;
  onUpdateSettings: (newSettings: Partial<PhotoboothSettings>) => void;
}

export default function FrameSelector({ settings, onUpdateSettings }: FrameSelectorProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Layout Mode Selection */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 block">
          Pilih Format Tata Letak
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {LAYOUT_OPTIONS.map((layout) => {
            const isSelected = settings.layout === layout.id;
            return (
              <button
                key={layout.id}
                onClick={() => onUpdateSettings({ layout: layout.id })}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/50 text-rose-600 dark:bg-rose-950/30 dark:border-rose-400 dark:text-rose-300 ring-2 ring-rose-500/20'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                }`}
              >
                {layout.id === 'strip' && <div className="h-6 w-3 border-2 border-current rounded-sm mb-1.5" />}
                {layout.id === 'double-strip' && (
                  <div className="flex gap-0.5 mb-1.5">
                    <div className="h-6 w-2.5 border-2 border-current rounded-sm" />
                    <div className="h-6 w-2.5 border-2 border-current rounded-sm" />
                  </div>
                )}
                {layout.id === 'grid-2x2' && <LayoutGrid className="h-5 w-5 mb-1.5" />}
                <span className="text-xs font-semibold leading-tight">{layout.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Frame Theme Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Tema Warna Bingkai
          </label>
          <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Preset Estetik
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {FRAME_THEMES.map((theme) => {
            const isSelected =
              settings.frameThemeId === theme.id && settings.customFrameColor === theme.bgColor;
            return (
              <button
                key={theme.id}
                onClick={() =>
                  onUpdateSettings({
                    frameThemeId: theme.id,
                    customFrameColor: theme.bgColor,
                  })
                }
                className={`group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'border-zinc-900 bg-zinc-100 dark:border-white dark:bg-zinc-800 ring-2 ring-black/10'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900'
                }`}
              >
                <div
                  className="h-7 w-7 rounded-lg border border-black/10 shadow-sm flex items-center justify-center shrink-0"
                  style={{ backgroundColor: theme.bgColor }}
                >
                  {isSelected && (
                    <Check
                      className="h-4 w-4"
                      style={{ color: theme.bgColor === '#ffffff' ? '#000' : '#fff' }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">
                    {theme.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 capitalize">{theme.pattern || 'clean'}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Color Picker */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="relative flex items-center gap-2 flex-1">
            <input
              type="color"
              value={settings.customFrameColor}
              onChange={(e) => onUpdateSettings({ customFrameColor: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Warna Kustom: <span className="font-mono text-xs">{settings.customFrameColor}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Text & Watermark Personalization */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 block">
          Teks & Informasi Footer
        </label>
        
        <div className="space-y-3">
          {/* Title Input */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
            <Type className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={settings.title}
              maxLength={28}
              onChange={(e) => onUpdateSettings({ title: e.target.value })}
              placeholder="Judul / Nama Acara (cth: BESTIE DAY)"
              className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none dark:text-white"
            />
          </div>

          {/* Date Stamp Toggle & Input */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
            <input
              type="checkbox"
              id="showDateToggle"
              checked={settings.showDate}
              onChange={(e) => onUpdateSettings({ showDate: e.target.checked })}
              className="h-4 w-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer"
            />
            <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              disabled={!settings.showDate}
              value={settings.dateText}
              onChange={(e) => onUpdateSettings({ dateText: e.target.value })}
              placeholder="Tanggal (cth: 29 OKT 2026)"
              className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none disabled:opacity-40 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
