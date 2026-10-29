'use client';

import React from 'react';
import { CapturedPhoto, PhotoboothSettings, StickerItem } from '@/types';
import { FRAME_THEMES, FILTER_OPTIONS } from '@/lib/constants';
import { X } from 'lucide-react';

interface PhotoStripProps {
  photos: CapturedPhoto[];
  settings: PhotoboothSettings;
  onRemoveSticker?: (id: string) => void;
  onRetakePhoto?: (index: number) => void;
}

export default function PhotoStrip({
  photos,
  settings,
  onRemoveSticker,
  onRetakePhoto,
}: PhotoStripProps) {
  const theme = FRAME_THEMES.find((t) => t.id === settings.frameThemeId) || FRAME_THEMES[0];
  const bgColor = settings.customFrameColor || theme.bgColor;
  const textColor = theme.textColor;
  const accentColor = theme.accentColor;

  const currentFilter = FILTER_OPTIONS.find((f) => f.id === settings.filter) || FILTER_OPTIONS[0];

  const renderPhotoItem = (photo: CapturedPhoto, index: number) => {
    return (
      <div
        key={photo.id || index}
        className="group relative overflow-hidden rounded-md bg-zinc-900 shadow-md ring-1 ring-black/10 aspect-[4/3] w-full"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.dataUrl}
          alt={`Pose ${index + 1}`}
          className="h-full w-full object-cover transition-all duration-300"
          style={{ filter: currentFilter.cssFilter }}
        />

        {/* Retake this photo button overlay */}
        {onRetakePhoto && (
          <button
            onClick={() => onRetakePhoto(index)}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold backdrop-blur-[1px]"
            title="Foto ulang foto ini"
          >
            <span className="rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-md border border-white/40">
              📸 Foto Ulang (#{index + 1})
            </span>
          </button>
        )}
      </div>
    );
  };

  const renderFooter = (keyPrefix: string = 'footer') => {
    return (
      <div key={keyPrefix} className="mt-5 pb-3 text-center flex flex-col items-center">
        {settings.title && (
          <h2
            className="font-black text-sm tracking-widest uppercase transition-colors"
            style={{ color: textColor }}
          >
            {settings.title}
          </h2>
        )}

        {settings.showDate && settings.dateText && (
          <p
            className="mt-1 text-[11px] font-semibold tracking-widest uppercase transition-colors"
            style={{ color: accentColor }}
          >
            {settings.dateText}
          </p>
        )}

        {settings.showWatermark && (
          <p
            className="mt-2 text-[9px] font-medium tracking-wider uppercase opacity-40 transition-colors"
            style={{ color: textColor }}
          >
            ONLINE BOOTH • MEMORIES
          </p>
        )}
      </div>
    );
  };

  const renderSingleStripColumn = (keyPrefix: string = 'strip') => {
    return (
      <div key={keyPrefix} className="flex flex-col gap-3.5 flex-1">
        {photos.map((photo, index) => renderPhotoItem(photo, index))}
        {renderFooter(`${keyPrefix}-footer`)}
      </div>
    );
  };

  return (
    <div
      id="photobooth-strip-container"
      className="relative select-none rounded-xl p-6 sm:p-7 shadow-2xl transition-all duration-300 border border-black/5 max-w-full overflow-hidden"
      style={{
        backgroundColor: bgColor,
      }}
    >
      {/* Pattern Decorative Overlay */}
      {theme.pattern === 'dots' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(${accentColor} 1.5px, transparent 1.5px)`,
            backgroundSize: '18px 18px',
          }}
        />
      )}
      {theme.pattern === 'grid' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      )}
      {theme.pattern === 'film' && (
        <div className="pointer-events-none absolute inset-y-0 left-1 right-1 flex justify-between px-1">
          <div className="flex flex-col justify-around py-4 opacity-75">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`sprocket-l-${i}`} className="h-3 w-2 rounded-sm bg-white/80" />
            ))}
          </div>
          <div className="flex flex-col justify-around py-4 opacity-75">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`sprocket-r-${i}`} className="h-3 w-2 rounded-sm bg-white/80" />
            ))}
          </div>
        </div>
      )}

      {/* Main Layout Content */}
      <div className="relative z-10">
        {settings.layout === 'strip' && (
          <div className="w-[260px] sm:w-[280px]">
            {renderSingleStripColumn('single')}
          </div>
        )}

        {settings.layout === 'double-strip' && (
          <div className="flex gap-6 sm:gap-8 items-stretch relative">
            <div className="w-[240px] sm:w-[260px]">
              {renderSingleStripColumn('left')}
            </div>

            {/* Scissors cut line */}
            <div className="relative flex flex-col items-center justify-between border-r-2 border-dashed border-zinc-400/40">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs text-zinc-400">✂</span>
            </div>

            <div className="w-[240px] sm:w-[260px]">
              {renderSingleStripColumn('right')}
            </div>
          </div>
        )}

        {settings.layout === 'grid-2x2' && (
          <div className="w-[320px] sm:w-[380px]">
            <div className="grid grid-cols-2 gap-3.5">
              {photos.slice(0, 4).map((photo, index) => renderPhotoItem(photo, index))}
            </div>
            {renderFooter('grid-footer')}
          </div>
        )}
      </div>

      {/* Stickers Overlay */}
      {settings.stickers && settings.stickers.map((sticker: StickerItem) => (
        <div
          key={sticker.id}
          className="group absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
          style={{
            left: `${sticker.x}%`,
            top: `${sticker.y}%`,
            transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
            fontSize: `${sticker.size}px`,
          }}
          onClick={() => onRemoveSticker && onRemoveSticker(sticker.id)}
          title="Klik untuk menghapus stiker"
        >
          <span>{sticker.emoji}</span>
          {onRemoveSticker && (
            <span className="absolute -top-1 -right-1 hidden rounded-full bg-red-500 p-0.5 text-white group-hover:block shadow">
              <X className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
