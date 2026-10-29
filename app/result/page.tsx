'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { usePhotoboothStore } from '@/hooks/usePhotoboothStore';
import { renderPhotoboothCanvas } from '@/lib/canvasRenderer';
import PhotoStrip from '@/components/PhotoStrip';
import FrameSelector from '@/components/FrameSelector';
import FilterSelector from '@/components/FilterSelector';
import StickerSelector from '@/components/StickerSelector';
import {
  Download,
  Copy,
  Printer,
  Camera,
  Check,
  Sparkles,
  Palette,
  Sliders,
  Smile,
  AlertCircle,
} from 'lucide-react';

export default function ResultPage() {
  const router = useRouter();
  const {
    photos,
    settings,
    isLoaded,
    updateSettings,
    addSticker,
    removeSticker,
    savePhotos,
  } = usePhotoboothStore();

  const [activeTab, setActiveTab] = useState<'frame' | 'filter' | 'stickers'>('frame');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg'>('png');

  // Trigger celebration confetti
  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981'],
      });
    } catch {
      // Ignored if confetti fails
    }
  }, []);

  // Download Handler
  const handleDownload = async (format: 'png' | 'jpeg' = 'png') => {
    if (photos.length === 0 || isExporting) return;

    try {
      setIsExporting(true);
      const canvas = await renderPhotoboothCanvas(photos, settings, 2.5);

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, 0.95);

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `photobooth-${settings.layout}-${timestamp}.${format}`;
      link.href = dataUrl;
      link.click();

      triggerCelebration();
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal mengunduh foto. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to Clipboard
  const handleCopyToClipboard = async () => {
    if (photos.length === 0) return;

    try {
      const canvas = await renderPhotoboothCanvas(photos, settings, 2);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2500);
          } else {
            alert('Fitur salin ke clipboard tidak didukung oleh browser Anda.');
          }
        } catch (e) {
          console.warn('Clipboard write failed:', e);
          alert('Izin clipboard ditolak oleh browser.');
        }
      }, 'image/png');
    } catch (e) {
      console.error('Clipboard error:', e);
    }
  };

  // Print Handler
  const handlePrint = async () => {
    try {
      const canvas = await renderPhotoboothCanvas(photos, settings, 2);
      const dataUrl = canvas.toDataURL('image/png');

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak Photobooth</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
              img { max-height: 95vh; max-width: 95vw; object-fit: contain; }
              @media print {
                body { margin: 0; padding: 0; }
                img { max-width: 100%; height: auto; }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e) {
      console.error('Print error:', e);
    }
  };

  // Load sample demo photos for instant testing
  const handleLoadDemoPhotos = () => {
    const demoPhotos = [
      createSamplePhoto('Pose 1: Senyum Cantik 😊', '#fb7185', '#fda4af'),
      createSamplePhoto('Pose 2: Peace Sign ✌️', '#c084fc', '#e9d5ff'),
      createSamplePhoto('Pose 3: Bestie Love 💖', '#38bdf8', '#bae6fd'),
    ];
    savePhotos(demoPhotos);
  };

  const handleRetake = () => {
    router.push('/booth');
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 sm:py-12 bg-zinc-50/50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-rose-500" />
              Studio Hasil & Kustomisasi
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Sesuaikan bingkai, warna, filter, dan unduh strip fotomu dalam resolusi tinggi.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/booth"
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <Camera className="h-3.5 w-3.5 text-rose-500" />
              <span>Foto Lagi</span>
            </Link>
          </div>
        </div>

        {/* Empty State when no photos are captured */}
        {photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 sm:p-14 text-center dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Belum Ada Foto yang Diambil
            </h2>
            <p className="mt-2 max-w-md mx-auto text-sm text-zinc-500 dark:text-zinc-400">
              Buka kamera photobooth untuk mulai menjepret serangkaian foto, atau muat foto contoh untuk mencoba studio kustomisasi sekarang!
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/booth"
                className="flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition"
              >
                <Camera className="h-4 w-4" />
                <span>Buka Kamera Sekarang</span>
              </Link>

              <button
                onClick={handleLoadDemoPhotos}
                className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Coba dengan Foto Contoh (Demo)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Main Studio Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Interactive Photo Strip Preview Container */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="sticky top-24 flex flex-col items-center w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-rose-500" />
                  Pratinjau Nyata Photo Strip
                </span>

                <div className="max-w-full flex justify-center overflow-x-auto pb-4">
                  <PhotoStrip
                    photos={photos}
                    settings={settings}
                    onRemoveSticker={removeSticker}
                    onRetakePhoto={handleRetake}
                  />
                </div>

                <p className="text-[11px] text-zinc-400 mt-2 text-center">
                  💡 Tips: Klik pada stiker untuk menghapusnya. Hover pada foto untuk opsi foto ulang.
                </p>
              </div>
            </div>

            {/* Right: Customization Controls & Export Options */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Export Action Card */}
              <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Download className="h-5 w-5 text-rose-500" />
                      Ekspor & Unduh Hasil
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Dihasilkan dalam resolusi tinggi siap cetak dan dibagikan.
                    </p>
                  </div>

                  {/* Format Selector */}
                  <div className="flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800 text-xs font-semibold">
                    <button
                      onClick={() => setDownloadFormat('png')}
                      className={`px-3 py-1 rounded-md transition ${
                        downloadFormat === 'png'
                          ? 'bg-white shadow text-zinc-900 dark:bg-zinc-700 dark:text-white'
                          : 'text-zinc-500'
                      }`}
                    >
                      PNG (Crisp)
                    </button>
                    <button
                      onClick={() => setDownloadFormat('jpeg')}
                      className={`px-3 py-1 rounded-md transition ${
                        downloadFormat === 'jpeg'
                          ? 'bg-white shadow text-zinc-900 dark:bg-zinc-700 dark:text-white'
                          : 'text-zinc-500'
                      }`}
                    >
                      JPEG
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Primary Download Button */}
                  <button
                    onClick={() => handleDownload(downloadFormat)}
                    disabled={isExporting}
                    className="sm:col-span-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:opacity-95 active:scale-98 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    <span>{isExporting ? 'Memproses...' : `Unduh ${downloadFormat.toUpperCase()}`}</span>
                  </button>

                  {/* Copy Image Button */}
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3.5 px-4 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-600 font-bold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-zinc-500" />
                        <span>Salin Gambar</span>
                      </>
                    )}
                  </button>

                  {/* Print Button */}
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3.5 px-4 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition"
                  >
                    <Printer className="h-4 w-4 text-zinc-500" />
                    <span>Cetak Strip</span>
                  </button>
                </div>
              </div>

              {/* Customization Tabs */}
              <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {/* Tab Navigation */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6 gap-2">
                  <button
                    onClick={() => setActiveTab('frame')}
                    className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
                      activeTab === 'frame'
                        ? 'border-rose-500 text-rose-600 dark:border-rose-400 dark:text-rose-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Palette className="h-4 w-4" />
                    <span>Bingkai & Teks</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('filter')}
                    className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
                      activeTab === 'filter'
                        ? 'border-rose-500 text-rose-600 dark:border-rose-400 dark:text-rose-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Sliders className="h-4 w-4" />
                    <span>Filter Foto</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('stickers')}
                    className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
                      activeTab === 'stickers'
                        ? 'border-rose-500 text-rose-600 dark:border-rose-400 dark:text-rose-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Smile className="h-4 w-4" />
                    <span>Stiker ({settings.stickers.length})</span>
                  </button>
                </div>

                {/* Tab Contents */}
                {activeTab === 'frame' && (
                  <FrameSelector
                    settings={settings}
                    onUpdateSettings={updateSettings}
                  />
                )}

                {activeTab === 'filter' && (
                  <FilterSelector
                    currentFilter={settings.filter}
                    onSelectFilter={(filter) => updateSettings({ filter })}
                    sampleThumbnail={photos[0]?.dataUrl}
                  />
                )}

                {activeTab === 'stickers' && (
                  <StickerSelector
                    onAddSticker={addSticker}
                    onClearStickers={() => updateSettings({ stickers: [] })}
                    stickerCount={settings.stickers.length}
                  />
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// Helper function to create stylish demo photo canvas
function createSamplePhoto(caption: string, color1: string, color2: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Decorative circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(320, 240, 140, 0, Math.PI * 2);
    ctx.fill();

    // Caption
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(caption, 320, 240);
  }

  return {
    id: `demo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    dataUrl: canvas.toDataURL('image/jpeg', 0.9),
    timestamp: Date.now(),
  };
}
