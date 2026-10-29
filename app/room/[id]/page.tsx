'use client';

import React, { useState, useEffect, useRef, useCallback, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useWebRTCRoom } from '@/hooks/useWebRTCRoom';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { usePhotoboothStore } from '@/hooks/usePhotoboothStore';
import { captureDuoPhoto } from '@/lib/duoComposite';
import Countdown from '@/components/Countdown';
import {
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  FlipHorizontal,
  Share2,
  Check,
  Users,
  Sparkles,
  Heart,
  Timer,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

function DuoBoothRoomContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  const [participantId, setParticipantId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('duo_participant_id') || '';
  });

  const [participantName, setParticipantName] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('duo_participant_name') || '';
  });

  const [role, setRole] = useState<'host' | 'guest'>(() => {
    if (typeof window === 'undefined') return 'guest';
    return (sessionStorage.getItem('duo_role') as 'host' | 'guest') || 'guest';
  });

  const [hasJoined, setHasJoined] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!(
      sessionStorage.getItem('duo_participant_id') &&
      sessionStorage.getItem('duo_participant_name')
    );
  });

  const [nameInput, setNameInput] = useState<string>('');
  const [isJoiningDirect, setIsJoiningDirect] = useState<boolean>(false);

  // Video element refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Booth settings & state
  const { photos, resetPhotos, addPhoto, updateSettings } = usePhotoboothStore();
  const [isLocalMirrored, setIsLocalMirrored] = useState<boolean>(true);
  const [isRemoteMirrored] = useState<boolean>(true);
  const [soundEnabled] = useState<boolean>(true);
  const [shotCount, setShotCount] = useState<3 | 4>(3);
  const [timerDuration, setTimerDuration] = useState<3 | 5 | 10>(3);

  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const { playBeep, playShutter, playSuccess } = useAudioEffects(soundEnabled);

  // WebRTC Hook
  const {
    localStream,
    remoteStream,
    friendParticipant,
    isGuestJoined,
    isMicMuted,
    isCameraOff,
    toggleMic,
    toggleCamera,
    triggerRemoteCountdown,
    syncCapturedPhoto,
    triggerFinishSession,
    setOnCountdownReceived,
    setOnPhotoSynced,
    setOnFinishSession,
  } = useWebRTCRoom({
    roomId,
    participantId,
    participantName,
    role,
  });

  // Attach media streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Flash helper
  const triggerFlash = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
    }, 350);
  }, []);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Run countdown animation & snap
  const executeCountdownAndSnap = useCallback(
    async (duration: number, poseIndex: number) => {
      setCurrentShotIndex(poseIndex);

      for (let s = duration; s > 0; s--) {
        setCountdown(s);
        playBeep(s === 1);
        await sleep(1000);
      }

      setCountdown(0);
      playShutter();
      triggerFlash();

      // Capture dual-camera composite
      const duoPhoto = captureDuoPhoto({
        localVideo: localVideoRef.current,
        remoteVideo: remoteVideoRef.current,
        isLocalMirrored,
        isRemoteMirrored,
        style: 'side-by-side',
        localName: participantName,
        remoteName: friendParticipant?.name || 'Teman',
      });

      if (duoPhoto) {
        addPhoto(duoPhoto);
        syncCapturedPhoto(duoPhoto);
      }

      await sleep(300);
      setCountdown(null);
    },
    [
      isLocalMirrored,
      isRemoteMirrored,
      participantName,
      friendParticipant,
      playBeep,
      playShutter,
      triggerFlash,
      addPhoto,
      syncCapturedPhoto,
    ]
  );

  // Host starts the full multi-shoot loop
  const handleStartCaptureSequence = useCallback(async () => {
    if (isSessionActive) return;

    setIsSessionActive(true);
    resetPhotos();

    for (let i = 0; i < shotCount; i++) {
      triggerRemoteCountdown(timerDuration);
      await executeCountdownAndSnap(timerDuration, i);

      if (i < shotCount - 1) {
        await sleep(1400);
      }
    }

    playSuccess();
    triggerFinishSession();
    await sleep(600);
    setIsSessionActive(false);

    // Save duo settings
    updateSettings({
      title: `${participantName.toUpperCase()} & ${
        (friendParticipant?.name || 'BESTIE').toUpperCase()
      }`,
    });

    router.push('/result');
  }, [
    isSessionActive,
    shotCount,
    timerDuration,
    participantName,
    friendParticipant,
    resetPhotos,
    triggerRemoteCountdown,
    executeCountdownAndSnap,
    playSuccess,
    triggerFinishSession,
    updateSettings,
    router,
  ]);

  // Set listeners for remote triggers
  useEffect(() => {
    setOnCountdownReceived(async (duration) => {
      setIsSessionActive(true);
      await executeCountdownAndSnap(duration, currentShotIndex);
      setIsSessionActive(false);
    });

    setOnPhotoSynced((dataUrl) => {
      addPhoto(dataUrl);
    });

    setOnFinishSession(() => {
      playSuccess();
      updateSettings({
        title: `${participantName.toUpperCase()} & ${
          (friendParticipant?.name || 'BESTIE').toUpperCase()
        }`,
      });
      router.push('/result');
    });
  }, [
    setOnCountdownReceived,
    setOnPhotoSynced,
    setOnFinishSession,
    executeCountdownAndSnap,
    currentShotIndex,
    addPhoto,
    playSuccess,
    participantName,
    friendParticipant,
    updateSettings,
    router,
  ]);

  // Direct Join Prompt if opening shared link
  const handleDirectJoin = async () => {
    const name = nameInput.trim() || 'Teman';
    setIsJoiningDirect(true);

    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', guestName: name }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Gagal masuk ke room');
      }

      sessionStorage.setItem('duo_participant_id', data.participantId);
      sessionStorage.setItem('duo_participant_name', name);
      sessionStorage.setItem('duo_role', 'guest');

      setParticipantId(data.participantId);
      setParticipantName(name);
      setRole('guest');
      setHasJoined(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal bergabung');
    } finally {
      setIsJoiningDirect(false);
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  // Direct Join Screen
  if (!hasJoined) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-zinc-950 text-white">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-4">
            <Heart className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black">Undangan Photobooth Berdua!</h2>
          <p className="mt-2 text-xs text-zinc-400">
            Temanmu mengundangmu untuk foto bareng dari jarak jauh di room ini.
          </p>

          <div className="mt-6 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Nama Kamu
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ketik namamu..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleDirectJoin}
            disabled={isJoiningDirect}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition"
          >
            <span>{isJoiningDirect ? 'Menghubungkan...' : 'Gabung ke Photobooth'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Top Header & Share Link Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-0.5 text-xs font-bold text-rose-400">
                <Heart className="h-3 w-3 fill-current" />
                Duo Online Room
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Kode: <strong className="text-white">{roomId}</strong>
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {isGuestJoined
                ? `Terhubung dengan ${friendParticipant?.name} ✨`
                : 'Menunggu teman bergabung... Bagikan link di samping!'}
            </p>
          </div>

          {/* Quick Actions: Copy Link & Mic/Video Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
            >
              {copySuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Link Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-rose-400" />
                  <span>Bagikan Link Room</span>
                </>
              )}
            </button>

            {/* Mic Toggle */}
            <button
              onClick={toggleMic}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                isMicMuted
                  ? 'bg-red-950/60 text-red-400 border border-red-800'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-white'
              }`}
            >
              {isMicMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              <span>{isMicMuted ? 'Mic Mati' : 'Mic Aktif'}</span>
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleCamera}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                isCameraOff
                  ? 'bg-red-950/60 text-red-400 border border-red-800'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-white'
              }`}
            >
              {isCameraOff ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
              <span>{isCameraOff ? 'Kamera Mati' : 'Kamera Aktif'}</span>
            </button>
          </div>
        </div>

        {/* Dual Video Screen & Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Dual Video Feed */}
          <div className="lg:col-span-8 flex flex-col items-center">
            
            {/* The Duo Photobooth Frame Container */}
            <div className="relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-2 ring-zinc-800">
              
              <div className="absolute inset-0 grid grid-cols-2 divide-x-2 divide-white/20">
                {/* Left Half: Local Camera Feed */}
                <div className="relative h-full w-full overflow-hidden bg-zinc-950">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`h-full w-full object-cover ${
                      isLocalMirrored ? '-scale-x-100' : 'scale-x-100'
                    }`}
                  />
                  <div className="absolute bottom-3 left-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    {participantName} (Kamu)
                  </div>
                </div>

                {/* Right Half: Remote Camera Feed */}
                <div className="relative h-full w-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                  {remoteStream ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className={`h-full w-full object-cover ${
                        isRemoteMirrored ? '-scale-x-100' : 'scale-x-100'
                      }`}
                    />
                  ) : (
                    <div className="flex flex-col items-center p-6 text-center">
                      <div className="h-12 w-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 animate-pulse">
                        <Users className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold text-zinc-300">Menunggu Teman...</p>
                      <p className="text-[10px] text-zinc-500 mt-1 max-w-[160px]">
                        Kirimkan link room agar temanmu langsung masuk ke sini.
                      </p>
                      <button
                        onClick={handleCopyLink}
                        className="mt-3 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-semibold text-white shadow"
                      >
                        Salin Link
                      </button>
                    </div>
                  )}

                  {friendParticipant && (
                    <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                      {friendParticipant.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Center Heart Emblem */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xl">
                <span className="text-lg">💖</span>
              </div>

              {/* Live Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  <span className="h-2 w-2 rounded-full bg-red-500 -ml-3.5" />
                  DUO LIVE
                </span>
                <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white shadow">
                  Foto {currentShotIndex + 1} dari {shotCount}
                </span>
              </div>

              {/* Mirror Toggle */}
              <button
                onClick={() => setIsLocalMirrored(!isLocalMirrored)}
                className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] text-white hover:bg-black/80 transition"
              >
                <FlipHorizontal className="h-3 w-3" />
                <span>Mirror: {isLocalMirrored ? 'ON' : 'OFF'}</span>
              </button>

              {/* Screen Flash Animation */}
              {isFlashing && (
                <div className="absolute inset-0 z-40 bg-white animate-flash pointer-events-none" />
              )}

              {/* Synchronized Countdown Overlay */}
              <Countdown currentCount={countdown} message="DUO SMILE! 📸" />
            </div>

            {/* Session Settings Bar */}
            <div className="mt-5 w-full max-w-2xl rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4">
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

              {photos.length > 0 && !isSessionActive && (
                <button
                  onClick={resetPhotos}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 font-medium transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Foto ({photos.length})</span>
                </button>
              )}
            </div>

            {/* Shutter Button */}
            <div className="mt-6 flex flex-col items-center">
              <button
                onClick={handleStartCaptureSequence}
                disabled={isSessionActive}
                className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 shadow-2xl shadow-rose-500/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <div className="absolute inset-1 rounded-full border-2 border-white/40" />
                <Camera className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
              </button>
              <span className="mt-3 text-sm font-bold text-zinc-200">
                {isSessionActive
                  ? 'Sedang Jepret Pose Berdua...'
                  : `Mulai Foto Berdua (${shotCount} Pose)`}
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5">
                Hitung mundur akan berbunyi di layar kamu dan layar temanmu secara bersamaan!
              </span>
            </div>

          </div>

          {/* Right Column: Live Duo Gallery Strip */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-rose-400" />
                  Koleksi Pose Berdua ({photos.length}/{shotCount})
                </h3>
              </div>

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
                      <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-700/60">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photo.dataUrl}
                            alt={`Duo Pose ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-zinc-600">Pose #{idx + 1}</span>
                        )}
                        {isCurrent && (
                          <div className="absolute inset-0 bg-rose-500/30 flex items-center justify-center animate-pulse">
                            <Camera className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200">Pose #{idx + 1}</p>
                        <p className="text-[11px] text-zinc-400">
                          {photo ? 'Tersimpan & Sinkron' : 'Menunggu pose...'}
                        </p>
                      </div>
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
                  <span>Desain Strip & Unduh Hasil</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>

            {/* Distance Love Tips Card */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-xs text-zinc-400 space-y-2">
              <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-current" />
                Tips Pose Jarak Jauh:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                <li>Bikin pose setengah hati (kamu tangan kiri, temanmu tangan kanan) agar menyatu di garis tengah!</li>
                <li>Bisa saling mengobrol lewat mic untuk mencocokkan gaya sebelum menekan shutter.</li>
                <li>Setelah selesai, kalian berdua bisa sama-sama mengunduh file strip yang sama persis!</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function DuoBoothRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-zinc-400 bg-zinc-950">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent mb-3" />
            <p className="text-xs">Menyiapkan room photobooth...</p>
          </div>
        </div>
      }
    >
      <DuoBoothRoomContent params={params} />
    </Suspense>
  );
}
