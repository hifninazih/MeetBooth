'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCamera } from '@/hooks/useCamera';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { usePhotoboothStore } from '@/hooks/usePhotoboothStore';
import CameraFeed from '@/components/CameraFeed';
import Countdown from '@/components/Countdown';
import {
  Camera,
  FlipHorizontal,
  Volume2,
  VolumeX,
  Timer,
  Layers,
  RotateCcw,
  ArrowRight,
  Sparkles,
  SwitchCamera,
  CheckCircle2,
} from 'lucide-react';

export default function BoothPage() {
  const router = useRouter();
  const {
    photos,
    settings,
    addPhoto,
    replacePhoto,
    resetPhotos,
    updateSettings,
  } = usePhotoboothStore();

  const [isMirrored, setIsMirrored] = useState(settings.isMirrored);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [shotCount, setShotCount] = useState<3 | 4>(settings.shotCount);
  const [timerDuration, setTimerDuration] = useState<3 | 5 | 10>(settings.timerDuration);

  const {
    videoRef,
    devices,
    selectedDeviceId,
    isLoading,
    error,
    startCamera,
    switchDevice,
    toggleFacingMode,
    capturePhoto,
  } = useCamera({ isMirrored });

  const { playBeep, playShutter, playSuccess } = useAudioEffects(soundEnabled);

  // Booth Session State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  // Sync settings when changed
  useEffect(() => {
    updateSettings({
      isMirrored,
      soundEnabled,
      shotCount,
      timerDuration,
    });
  }, [isMirrored, soundEnabled, shotCount, timerDuration, updateSettings]);

  // Flash trigger helper
  const triggerFlash = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
    }, 350);
  }, []);

  // Sleep utility for async countdown flow
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Run single countdown for a shot
  const runSingleCountdown = useCallback(
    async (seconds: number): Promise<boolean> => {
      for (let s = seconds; s > 0; s--) {
        setCountdown(s);
        playBeep(s === 1);
        await sleep(1000);
      }
      setCountdown(0);
      playShutter();
      triggerFlash();
      await sleep(250);
      setCountdown(null);
      return true;
    },
    [playBeep, playShutter, triggerFlash]
  );

  // Start Multi-shoot loop
  const handleStartCaptureSequence = useCallback(async () => {
    if (isSessionActive || isLoading || !!error) return;

    setIsSessionActive(true);

    if (retakeIndex !== null) {
      // Retaking single photo
      setCurrentShotIndex(retakeIndex);
      await runSingleCountdown(timerDuration);
      const photoDataUrl = capturePhoto();
      if (photoDataUrl) {
        replacePhoto(retakeIndex, photoDataUrl);
      }
      setRetakeIndex(null);
      setIsSessionActive(false);
      return;
    }

    // New full sequence: clear existing photos
    resetPhotos();

    for (let i = 0; i < shotCount; i++) {
      setCurrentShotIndex(i);
      await runSingleCountdown(timerDuration);

      const photoDataUrl = capturePhoto();
      if (photoDataUrl) {
        addPhoto(photoDataUrl);
      }

      // Rest interval between shots
      if (i < shotCount - 1) {
        await sleep(1200);
      }
    }

    playSuccess();
    await sleep(600);
    setIsSessionActive(false);

    // Auto navigate to result page after complete session
    router.push('/result');
  }, [
    isSessionActive,
    isLoading,
    error,
    retakeIndex,
    shotCount,
    timerDuration,
    runSingleCountdown,
    capturePhoto,
    replacePhoto,
    resetPhotos,
    addPhoto,
    playSuccess,
    router,
  ]);

  const handleRetakeSingle = (index: number) => {
    setRetakeIndex(index);
    setCurrentShotIndex(index);
  };

  const handleCancelRetake = () => {
    setRetakeIndex(null);
  };

  const isAllPhotosTaken = photos.length >= shotCount;

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header Controls Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Camera className="h-6 w-6 text-rose-500" />
              Kamera Photobooth
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Siapkan ekspresi terbaikmu! Foto akan diambil secara otomatis.
            </p>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Mirror Toggle */}
            <button
              onClick={() => setIsMirrored(!isMirrored)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                isMirrored
                  ? 'bg-zinc-800 text-rose-400 border border-rose-500/30'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
              title="Aktifkan atau matikan mode cermin (mirror)"
            >
              <FlipHorizontal className="h-3.5 w-3.5" />
              <span>Mirror: {isMirrored ? 'ON' : 'OFF'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                soundEnabled
                  ? 'bg-zinc-800 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
              title="Suara countdown & shutter"
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span>{soundEnabled ? 'Suara ON' : 'Mute'}</span>
            </button>

            {/* Device Switcher (Mobile front/back or camera list) */}
            {devices.length > 1 ? (
              <select
                value={selectedDeviceId}
                onChange={(e) => switchDevice(e.target.value)}
                className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-rose-500"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={toggleFacingMode}
                className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition"
                title="Ganti kamera depan / belakang"
              >
                <SwitchCamera className="h-3.5 w-3.5" />
                <span>Ganti Kamera</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: Camera & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Camera Feed Viewport */}
          <div className="lg:col-span-8 flex flex-col items-center">
            <div className="relative w-full max-w-2xl">
              <CameraFeed
                videoRef={videoRef}
                isMirrored={isMirrored}
                isLoading={isLoading}
                error={error}
                onRetry={() => startCamera()}
                isFlashing={isFlashing}
                currentShotIndex={currentShotIndex}
                totalShots={shotCount}
              />

              {/* Countdown overlay */}
              <Countdown currentCount={countdown} />
            </div>

            {/* Session Settings Bar */}
            <div className="mt-5 w-full max-w-2xl rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4">
              
              {/* Shot Count selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-rose-400" />
                  Jumlah Pose:
                </span>
                <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
                  <button
                    disabled={isSessionActive}
                    onClick={() => setShotCount(3)}
                    className={`rounded px-3 py-1 text-xs font-semibold transition ${
                      shotCount === 3
                        ? 'bg-rose-500 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    3 Foto
                  </button>
                  <button
                    disabled={isSessionActive}
                    onClick={() => setShotCount(4)}
                    className={`rounded px-3 py-1 text-xs font-semibold transition ${
                      shotCount === 4
                        ? 'bg-rose-500 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    4 Foto
                  </button>
                </div>
              </div>

              {/* Timer Duration selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5 text-amber-400" />
                  Timer:
                </span>
                <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
                  {[3, 5, 10].map((t) => (
                    <button
                      key={t}
                      disabled={isSessionActive}
                      onClick={() => setTimerDuration(t as 3 | 5 | 10)}
                      className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                        timerDuration === t
                          ? 'bg-amber-500 text-white shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Session button if photos exist */}
              {photos.length > 0 && !isSessionActive && (
                <button
                  onClick={resetPhotos}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 font-medium transition"
                  title="Hapus foto saat ini dan ulangi dari awal"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset ({photos.length})</span>
                </button>
              )}
            </div>

            {/* Big Shutter Trigger Button */}
            <div className="mt-6 flex flex-col items-center">
              {retakeIndex !== null ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-amber-500/20 border border-amber-500/40 px-4 py-1.5 text-xs font-semibold text-amber-300">
                    Mode Foto Ulang: Pose #{retakeIndex + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleStartCaptureSequence}
                      disabled={isSessionActive || isLoading || !!error}
                      className="flex items-center gap-2.5 rounded-full bg-amber-500 px-8 py-3.5 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/30 transition hover:bg-amber-400 disabled:opacity-50"
                    >
                      <Camera className="h-4 w-4" />
                      Jepret Foto #{retakeIndex + 1}
                    </button>
                    <button
                      onClick={handleCancelRetake}
                      className="rounded-full bg-zinc-800 px-4 py-3.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleStartCaptureSequence}
                    disabled={isSessionActive || isLoading || !!error}
                    className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-500 shadow-2xl shadow-rose-500/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <div className="absolute inset-1 rounded-full border-2 border-white/40" />
                    <Camera className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
                  </button>
                  <span className="mt-3 text-sm font-bold text-zinc-200">
                    {isSessionActive
                      ? 'Sedang Mengambil Foto...'
                      : `Mulai Sesi (${shotCount} Foto Otomatis)`}
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-0.5">
                    Hitung mundur {timerDuration} detik per foto
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Right: Live Gallery & Preview Strip */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-rose-400" />
                  Hasil Jepretan ({photos.length}/{shotCount})
                </h3>

                {isAllPhotosTaken && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Lengkap!
                  </span>
                )}
              </div>

              {/* Slots List */}
              <div className="space-y-3">
                {Array.from({ length: shotCount }).map((_, idx) => {
                  const photo = photos[idx];
                  const isCurrent = isSessionActive && currentShotIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`relative flex items-center gap-3 rounded-2xl border p-2.5 transition-all ${
                        isCurrent
                          ? 'border-rose-500 bg-rose-950/20 ring-2 ring-rose-500/20'
                          : photo
                          ? 'border-zinc-700 bg-zinc-800/60'
                          : 'border-dashed border-zinc-800 bg-zinc-950/40'
                      }`}
                    >
                      {/* Thumbnail or Placeholder */}
                      <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-700/60">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photo.dataUrl}
                            alt={`Pose ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-zinc-600">#{idx + 1}</span>
                        )}
                        {isCurrent && (
                          <div className="absolute inset-0 bg-rose-500/30 flex items-center justify-center animate-pulse">
                            <Camera className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info & Retake button */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200">Pose #{idx + 1}</p>
                        <p className="text-[11px] text-zinc-400">
                          {photo ? 'Foto tersimpan' : 'Menunggu giliran...'}
                        </p>
                      </div>

                      {/* Retake Action */}
                      {photo && !isSessionActive && (
                        <button
                          onClick={() => handleRetakeSingle(idx)}
                          className="rounded-lg bg-zinc-700/80 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-600 transition"
                        >
                          Ulang
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Continue to Result CTA */}
              <div className="mt-6 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => router.push('/result')}
                  disabled={photos.length === 0}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition shadow-lg ${
                    photos.length > 0
                      ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-rose-500/25 hover:opacity-95 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {isAllPhotosTaken
                      ? 'Desain & Unduh Strip'
                      : `Lihat Hasil (${photos.length} Foto)`}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>

            {/* Tips Card */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-xs text-zinc-400 space-y-2">
              <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Tips Hasil Maksimal:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                <li>Pastikan ruangan memiliki pencahayaan cukup menghadap wajah.</li>
                <li>Gunakan mode Mirror agar gerakan terasa natural seperti di depan cermin.</li>
                <li>Setelah selesai, kamu bebas mengganti warna bingkai, filter, dan menempelkan stiker lucu!</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
