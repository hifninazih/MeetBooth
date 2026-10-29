# Rencana Pengembangan: Web Photobooth Online

## 1. Ringkasan Proyek
Aplikasi *photobooth* berbasis web interaktif di mana pengguna dapat mengambil serangkaian foto (biasanya 3-4 foto) menggunakan kamera perangkat (webcam/kamera depan), membingkainya dalam *template* bergaya *photo strip*, dan mengunduh hasil akhirnya secara langsung. 

## 2. Tech Stack
*   **Framework:** Next.js (menggunakan *App Router* terbaru).
*   **Styling:** Tailwind CSS (untuk mendesain antarmuka dengan cepat dan responsif).
*   **State Management:** React `useState` & `useRef` (cukup untuk MVP), atau Zustand (jika nanti manajemen state menjadi lebih kompleks).
*   **Kamera & Media:** WebRTC API (`navigator.mediaDevices.getUserMedia`).
*   **Manipulasi Gambar:** HTML5 `<canvas>` API murni atau menggunakan *library* ringan seperti `html2canvas` untuk mempermudah ekspor elemen UI menjadi gambar.
*   **Deployment:** Vercel.

## 3. Fitur MVP (Minimum Viable Product)
- [ ] Permintaan izin akses kamera.
- [ ] Tampilan *live preview* kamera (mirrored/terbalik seperti cermin).
- [ ] Tombol *Shutter* dengan hitung mundur (*timer*) 3 detik.
- [ ] Fitur *multi-shoot*: Mengambil 3 foto berturut-turut secara otomatis dengan jeda *timer*.
- [ ] Pilihan desain bingkai (*frame/overlay*).
- [ ] Halaman pratinjau hasil (menyatukan foto dan bingkai).
- [ ] Tombol *Download* (mengunduh hasil ke format PNG/JPEG).

## 4. Struktur Folder Next.js (App Router)
Struktur awal yang direkomendasikan:

```text
/src
  /app
    layout.tsx      # Layout utama (font, metadata)
    page.tsx        # Halaman Landing (tombol "Mulai")
    /booth
      page.tsx      # Halaman utama aplikasi (Kamera & Timer)
    /result
      page.tsx      # Halaman hasil (Preview & Download)
  /components
    CameraFeed.tsx  # Komponen pengelola video stream
    Countdown.tsx   # Komponen timer visual
    PhotoStrip.tsx  # Komponen penyusun canvas/foto + bingkai
  /hooks
    useCamera.ts    # Custom hook untuk handle getUserMedia
  /public
    /frames         # Aset PNG transparan untuk bingkai
    /sounds         # Efek suara (shutter.mp3, timer-beep.mp3)
```

## 5. Roadmap Pengembangan

### Fase 1: Setup & Fondasi Kamera
- [ ] Inisialisasi proyek Next.js dengan Tailwind (`npx create-next-app@latest`).
- [ ] Buat struktur folder di dalam `/src`.
- [ ] Buat custom hook `useCamera.ts` untuk mengelola *stream* video.
- [ ] Buat komponen `CameraFeed.tsx` yang menerima *stream* dan menampilkannya di elemen `<video>`.

### Fase 2: Logika Capture & Timer
- [ ] Tambahkan elemen `<canvas>` tersembunyi untuk mengambil tangkapan layar dari `<video>`.
- [ ] Buat fungsi `takePhoto()` yang menyimpan data gambar (Base64/Blob) ke dalam array *state*.
- [ ] Bangun komponen `Countdown.tsx` yang berjalan sebelum setiap foto diambil.
- [ ] Gabungkan logika sehingga menekan "Mulai" akan memicu loop: Timer (3s) -> Capture -> Jeda -> Ulang (sampai 3-4 foto).

### Fase 3: Komposisi Visual (The Photo Strip)
- [ ] Buat komponen `PhotoStrip.tsx`.
- [ ] Desain tata letak HTML/CSS menggunakan Tailwind untuk menumpuk gambar-gambar yang diambil di bawah lapisan *image overlay* (PNG transparan `/public/frames/frame-1.png`).
- [ ] Tambahkan opsi bagi pengguna untuk memilih warna latar belakang atau *frame* yang berbeda.

### Fase 4: Export & Polish (Juiciness)
- [ ] Implementasikan fitur unduh (Download). Ubah gabungan HTML/CSS (atau gabungan Canvas) menjadi satu file gambar utuh.
- [ ] Tambahkan efek kilatan putih (flash) CSS saat fungsi `takePhoto()` berjalan.
- [ ] Tambahkan elemen audio HTML5 untuk memutar efek suara *beep* dan *shutter* kamera.
- [ ] Pastikan responsivitas optimal di layar ponsel (karena rasio kamera ponsel dan laptop berbeda).

## 6. Langkah Selanjutnya
Mulai dari **Fase 1**. Kita perlu melakukan inisialisasi *repository* dan membangun fungsi `useCamera` agar kamu bisa melihat wajahmu sendiri di layar peramban.