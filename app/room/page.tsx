'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Video,
  ArrowRight,
  Heart,
  Globe,
} from 'lucide-react';

export default function RoomLobbyPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Create Room
  const handleCreateRoom = async () => {
    const name = userName.trim() || 'Saya';
    setIsCreating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: name }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Gagal membuat room');
      }

      sessionStorage.setItem('duo_participant_id', data.participantId);
      sessionStorage.setItem('duo_participant_name', name);
      sessionStorage.setItem('duo_role', 'host');

      router.push(`/room/${data.room.id}`);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Join Room
  const handleJoinRoom = async () => {
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) {
      setErrorMessage('Silakan masukkan Kode Room');
      return;
    }

    const name = userName.trim() || 'Teman';
    setIsJoining(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/rooms/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', guestName: name }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Room tidak ditemukan atau sudah penuh.');
      }

      sessionStorage.setItem('duo_participant_id', data.participantId);
      sessionStorage.setItem('duo_participant_name', name);
      sessionStorage.setItem('duo_role', 'guest');

      router.push(`/room/${data.room.id}`);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'Gagal bergabung');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex-1 py-10 sm:py-16 bg-gradient-to-b from-rose-50/50 via-zinc-50 to-zinc-50 dark:from-zinc-950 dark:via-zinc-900/60 dark:to-zinc-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 mb-4">
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            <span>Photobooth Jarak Jauh (Virtual Duo Room)</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-tight">
            Foto Bareng Dari <br />
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              Jarak Jauh Seperti Temu Nyata
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Koneksikan kameramu dan kamera temanmu dalam satu room virtual. Hitung mundur tersinkronisasi, jepret pose bareng, dan buat foto strip bersama!
          </p>
        </div>

        {/* Input Name & Action Cards */}
        <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 mb-10">
          
          {/* User Name Input */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Nama / Panggilan Kamu
            </label>
            <input
              type="text"
              value={userName}
              maxLength={20}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Contoh: Maya / Rizky"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold focus:border-rose-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Create Room Button */}
            <div className="flex flex-col justify-between rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50/30 p-5 dark:border-rose-950 dark:bg-zinc-850">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white mb-3 shadow-md shadow-rose-500/20">
                  <Video className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Buat Room Baru
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Mulai room baru & bagikan tautan/kode ke temanmu.
                </p>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 px-4 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition disabled:opacity-50"
              >
                <span>{isCreating ? 'Membuat Room...' : 'Bikin Room Sekarang'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Join Room Box */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-850">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-white mb-3 dark:bg-zinc-700">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Gabung ke Room Teman
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Masukkan kode room yang diberikan temanmu.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <input
                  type="text"
                  value={roomCodeInput}
                  maxLength={10}
                  onChange={(e) => setRoomCodeInput(e.target.value)}
                  placeholder="Kode (cth: LDR-892)"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-mono uppercase text-center focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={isJoining}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 px-4 text-xs font-bold text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-50"
                >
                  <span>{isJoining ? 'Menghubungkan...' : 'Gabung Room'}</span>
                </button>
              </div>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-rose-500" />
              WebRTC Audio & Video Peer-to-Peer
            </span>
            <Link href="/booth" className="font-semibold text-rose-500 hover:underline">
              Atau coba Solo Booth →
            </Link>
          </div>

        </div>

        {/* How it works 4-step banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-2xl mb-1 block">🔗</span>
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">1. Bagikan Link</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Kirim link room ke teman via WA/Telegram.</p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-2xl mb-1 block">📹</span>
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">2. Kamera Terhubung</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Kedua webcam muncul bersama berdampingan.</p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-2xl mb-1 block">⏱️</span>
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">3. Sync Shutter</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Hitung mundur 3s jalan bareng di kedua layar.</p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-2xl mb-1 block">🎞️</span>
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">4. Unduh Berdua</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Hasil photo strip berdua siap disimpan.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
