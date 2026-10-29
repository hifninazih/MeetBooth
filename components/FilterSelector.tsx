'use client';

import React from 'react';
import { FilterStyle } from '@/types';
import { FILTER_OPTIONS } from '@/lib/constants';
import { Check } from 'lucide-react';

interface FilterSelectorProps {
  currentFilter: FilterStyle;
  onSelectFilter: (filter: FilterStyle) => void;
  sampleThumbnail?: string;
}

export default function FilterSelector({
  currentFilter,
  onSelectFilter,
  sampleThumbnail,
}: FilterSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Filter Warna Foto
        </label>
        <span className="text-xs text-zinc-400">Pilih efek estetika</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {FILTER_OPTIONS.map((filter) => {
          const isSelected = currentFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onSelectFilter(filter.id)}
              className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'border-rose-500 bg-rose-50/50 text-rose-600 dark:bg-rose-950/30 dark:border-rose-400 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
              }`}
            >
              {/* Mini Preview Box */}
              <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 mb-1.5 bg-zinc-100 dark:bg-zinc-800">
                {sampleThumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sampleThumbnail}
                    alt={filter.name}
                    className="h-full w-full object-cover"
                    style={{ filter: filter.cssFilter }}
                  />
                ) : (
                  <div
                    className="h-full w-full bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500"
                    style={{ filter: filter.cssFilter }}
                  />
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-rose-500/30 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white drop-shadow" />
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold leading-tight">{filter.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
