'use client';

import React, { RefObject } from 'react';
import { RefreshCw, AlertCircle, FlipHorizontal } from 'lucide-react';

interface CameraFeedProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isMirrored: boolean;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  isFlashing: boolean;
  currentShotIndex?: number;
  totalShots?: number;
}

export default function CameraFeed({
  videoRef,
  isMirrored,
  isLoading,
  error,
  onRetry,
  isFlashing,
  currentShotIndex = 0,
  totalShots = 3,
}: CameraFeedProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-zinc-800">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`h-full w-full object-cover transition-transform duration-300 ${
          isMirrored ? '-scale-x-100' : 'scale-x-100'
        }`}
      />

      {/* Camera Framing Grid / Guide Overlay */}
      <div className="pointer-events-none absolute inset-0 border-[6px] border-white/10 rounded-3xl">
        {/* Subtle Crosshairs in corners */}
        <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-white/40" />
        <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-white/40" />
        <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-white/40" />
        <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-white/40" />
      </div>

      {/* Live Badge & Shot Progress Indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="h-2 w-2 rounded-full bg-red-500 -ml-3.5" />
          LIVE
        </span>

        <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white shadow">
          Foto {currentShotIndex + 1} dari {totalShots}
        </span>
      </div>

      {/* Mirror Indicator Badge */}
      <div className="absolute top-4 right-4 z-20">
        <span className="flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white/90">
          <FlipHorizontal className="h-3 w-3" />
          {isMirrored ? 'Mirror Aktif' : 'Normal'}
        </span>
      </div>

      {/* Screen Flash Animation */}
      {isFlashing && (
        <div className="absolute inset-0 z-40 bg-white animate-flash pointer-events-none" />
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/90 text-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-zinc-300">Menghubungkan ke kamera...</p>
          <p className="text-xs text-zinc-500 mt-1">Izinkan browser mengakses webcam Anda</p>
        </div>
      )}

      {/* Error / Permission Denied State */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/95 p-6 text-center text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400 mb-3">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-red-200">Akses Kamera Bermasalah</h3>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">{error}</p>
          <button
            onClick={onRetry}
            className="mt-6 flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-600"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Hubungkan Lagi
          </button>
        </div>
      )}
    </div>
  );
}
