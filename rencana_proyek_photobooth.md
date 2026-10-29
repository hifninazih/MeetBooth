# Rencana Pengembangan: Web Photobooth Online (Solo & Duo Virtual Room)

## 1. Ringkasan Proyek
Aplikasi *photobooth* berbasis web interaktif di mana pengguna dapat mengambil serangkaian foto (biasanya 3-4 foto) baik secara **Solo** maupun **Duo Room (Foto Bareng dari Jarak Jauh via WebRTC)** seperti ruang *online meet*, membingkainya dalam *template* bergaya *photo strip*, dan mengunduh hasil akhirnya secara langsung. 

## 2. Tech Stack
*   **Framework:** Next.js 16 (App Router) + TypeScript
*   **Styling:** Tailwind CSS
*   **Realtime & Media:** WebRTC API (`RTCPeerConnection`, `getUserMedia`, STUN Google servers) & Next.js Signaling API
*   **State Management:** React `useState`, `useCallback` & SessionStorage sync (`usePhotoboothStore`)
*   **Manipulasi Gambar:** HTML5 `<canvas>` API resolusi tinggi & Duo Split-Screen composite generator
*   **Audio FX:** Web Audio API synthesizer (countdown beep, shutter mechanical click, success chime)
*   **Efek Visual:** Screen flash animation CSS & `canvas-confetti`

## 3. Fitur Utama

### A. Fitur Solo Photobooth
- [x] Permintaan izin akses kamera (WebRTC `getUserMedia` dengan graceful error message).
- [x] Tampilan *live preview* kamera (mirrored/normal toggle).
- [x] Penggantian kamera depan / belakang untuk perangkat HP/mobile atau webcam eksternal.
- [x] Tombol *Shutter* dengan hitung mundur (*timer*) 3, 5, atau 10 detik.
- [x] Fitur *multi-shoot*: Mengambil 3 atau 4 foto beruntun secara otomatis dengan jeda *timer*.
- [x] Efek kilatan layar putih (*flash*) dan efek suara mekanis kamera saat foto terjepret.
- [x] Galeri thumbnail langsung di halaman booth dengan opsi foto ulang pose tertentu (*retake*).

### B. Fitur Duo Virtual Room (Foto Bareng dari Jarak Jauh) 💖
- [x] **Sistem Room & Kode Unik:** Buat room baru (menghasilkan kode 6-karakter seperti `LDR-892` atau link langsung) atau gabung ke room teman.
- [x] **Video Call & Audio Peer-to-Peer:** Kedua pengguna dapat melihat webcam masing-masing secara *side-by-side* dan saling mengobrol menggunakan mic untuk mencocokkan pose.
- [x] **Synchronized Shutter & Countdown:** Ketika salah satu menekan tombol shutter, hitung mundur (3s/5s) dan bunyi *beep* berjalan secara serentak di kedua layar.
- [x] **Duo Split-Screen Composite:** Kedua wajah digabungkan secara otomatis dalam satu frame foto di setiap jepretan pose (kiri & kanan dengan emblem love/divider).
- [x] **Sinkronisasi Hasil:** Setelah selesai sesi foto, kedua pengguna otomatis diarahkan ke studio kustomisasi dan mendapatkan koleksi foto strip yang sama persis untuk diunduh berdua.

### C. Studio Desain & Ekspor Hasil
- [x] Pilihan desain bingkai (*Classic White, Midnight Black, Sweet Pink, Lavender Dream, Vintage Cream, Cyber Mint, Film Negative*, serta pemilih warna hex kustom).
- [x] Pilihan format tata letak: *Single Strip*, *Twin Strip (2x side-by-side with scissors line)*, dan *Grid 2x2*.
- [x] Filter foto real-time: *Original, B&W Classic, Vintage Warm, Warm Glow, Cool Teal, Sepia Noir, Soft Dream*.
- [x] Personalisasi judul strip, tanggal, dan stiker emoji interaktif.
- [x] Ekspor hasil: Download PNG resolusi tinggi, Download JPEG, Salin Gambar ke Clipboard, dan Cetak (*Print*).
- [x] Mode Demo: Tombol uji coba langsung dengan foto contoh jika kamera belum terpasang.

## 4. Struktur Folder Terpasang

```text
/app
  layout.tsx           # Layout utama, metadata SEO, Suspense Navbar & Footer
  page.tsx             # Halaman Landing (Hero Solo & Duo, Mockup Strip, Fitur)
  globals.css          # Tailwind CSS v4 & Flash animation keyframes
  /api
    /rooms             # API pembuat room
    /rooms/[id]        # API bergabung ke room & update status
    /rooms/[id]/signal # API sinyalisasi WebRTC & event sinkronisasi shutter
  /booth
    page.tsx           # Halaman Solo Photobooth (Kamera, Shutter, Multi-shoot, Retake)
  /room
    page.tsx           # Lobby Duo Room (Buat Room Baru / Gabung Room Teman)
    /[id]
      page.tsx         # Virtual Duo Photobooth Room (Video call berdua, sync shutter)
  /result
    page.tsx           # Studio hasil (Live Preview, Template/Filter/Sticker, Download)
/components
  Navbar.tsx           # Header navigasi (Solo Booth, Duo Room, Studio Edit)
  Footer.tsx           # Footer privasi & keamanan browser
  CameraFeed.tsx       # Pengelola video stream, framing guide, & flash
  Countdown.tsx        # Overlay visual hitung mundur (3... 2... 1... SMILE!)
  PhotoStrip.tsx       # Komponen visual strip, layout, filter, teks & stiker
  FrameSelector.tsx    # Pemilih format strip, tema bingkai, warna kustom & teks
  FilterSelector.tsx   # Pemilih filter warna foto dengan thumbnail preview
  StickerSelector.tsx  # Pemilih stiker emoji dekoratif
/hooks
  useCamera.ts         # Hook WebRTC, device enumeration, switch camera, capture
  useWebRTCRoom.ts     # Hook koneksi video call berdua & sinkronisasi shutter
  useAudioEffects.ts   # Web Audio API sound synthesis (beeps, shutter, success)
  usePhotoboothStore.ts# Manajemen state foto, pengaturan & persistensi sessionStorage
/lib
  duoComposite.ts      # Engine penggabung dua webcam ke dalam satu foto pose berdua
  canvasRenderer.ts    # Engine komposit canvas resolusi tinggi untuk download PNG/JPEG
  roomStore.ts         # In-memory storage room & sinyalisasi WebRTC
  constants.ts         # Preset tema bingkai, filter, tata letak, dan stiker
/types
  index.ts             # Definisi antarmuka TypeScript
```
