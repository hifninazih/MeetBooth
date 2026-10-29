# MeetBooth 📸💖

> **Web Photobooth Virtual Room** — Abadikan momen berharga dengan foto strip estetik, baik sendiri (*Solo Booth*) maupun berdua dari jarak jauh (*Duo Virtual Room*) secara real-time via WebRTC!

---

## ✨ Fitur Utama

### 1. Duo Virtual Room (Foto Berdua Jarak Jauh)
* **Bikin & Gabung Room:** Buat room privat dalam 1 klik dengan kode unik 6-karakter atau tautan langsung.
* **Video Call & Audio Real-Time:** Sambungkan kamera dan mikrofon kedua orang via WebRTC Peer-to-Peer untuk saling mengobrol dan mencocokkan pose.
* **Synchronized Shutter & Countdown:** Hitung mundur (3s/5s) dan efek suara *beep* berbunyi secara serentak di kedua layar saat tombol shutter ditekan.
* **Duo Split-Screen Composite:** Kedua wajah digabungkan secara otomatis dalam satu frame foto di setiap jepretan pose (kiri & kanan dengan aksen divider estetik).
* **Unduh Kembar:** Kedua peserta otomatis mendapatkan hasil photo strip yang sama persis untuk disimpan berdua.

### 2. Solo Photobooth
* **Multi-Shoot Otomatis:** Opsi 3 atau 4 pose berurutan dengan hitung mundur otomatis.
* **Mirror & Switch Camera:** Mode cermin (*mirrored*) untuk preview natural, serta dukungan pergantian kamera depan/belakang pada smartphone.
* **Efek Flash & Suara:** Kilatan layar putih (*screen flash*) dan efek suara mekanik shutter sintetis berbasis Web Audio API (tanpa file audio eksternal).
* **Pose Retake:** Ambil ulang pose tertentu jika ekspresi belum pas.

### 3. Studio Kustomisasi Strip
* **3 Pilihan Format Layout:**
  * **Single Strip:** Format klasik memanjang 1 kolom (3–4 foto).
  * **Twin Strip (2x):** Dua strip identik berdampingan dengan garis potong gunting (*scissor cut line*).
  * **Grid 2x2:** Format kotak polaroid modern.
* **7 Tema Bingkai Estetik:** *Classic White, Midnight Black, Sweet Pink, Lavender Dream, Vintage Cream, Cyber Mint, Film Negative*, serta pemilih warna hex kustom.
* **Filter Foto Real-Time:** *Original, B&W Classic, Vintage Warm, Warm Glow, Cool Teal, Sepia Noir, Soft Dream*.
* **Stiker & Teks:** Bebas menambahkan stiker emoji dekoratif, mengubah nama/judul strip, dan tanggal cetak.

### 4. Ekspor Siap Cetak
* **High-Res Canvas Rendering:** Skala 2.5x untuk ketajaman kualitas cetak fisik.
* **Format Unduhan:** PNG berkualitas tinggi atau JPEG ringan.
* **Salin ke Clipboard:** Langsung dipaste ke WhatsApp, Telegram, dll.
* **Cetak Langsung (*Print*):** Tata letak ramah cetak otomatis.
* **Efek Konfeti:** Perayaan visual saat foto berhasil diunduh.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) 16 (App Router) + [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Realtime & Media:** WebRTC API (`RTCPeerConnection`, `getUserMedia`, Google STUN Servers) + Next.js Route Handlers
* **Audio FX:** Web Audio API AudioContext
* **Komposisi Gambar:** HTML5 Canvas API (High-DPI 2.5x Scale)
* **Animasi:** `canvas-confetti`, CSS Keyframes

---

## 🚀 Memulai (Local Development)

1. **Clone repositori:**
   ```bash
   git clone https://github.com/hifninazih/MeetBooth.git
   cd MeetBooth
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```

4. Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deploy ke Vercel

Aplikasi ini dapat langsung di-deploy secara gratis ke [Vercel](https://vercel.com/):

1. Hubungkan repositori GitHub ini ke dashboard Vercel Anda.
2. Vercel akan otomatis mendeteksi proyek Next.js.
3. Klik **Deploy** dan aplikasi Anda akan langsung memiliki domain HTTPS publik yang siap digunakan oleh siapa saja di seluruh dunia!

---

## 🔒 Privasi

Semua pemrosesan foto, komposit canvas, dan audio berlangsung 100% di browser pengguna (*client-side*). Foto tidak pernah diunggah atau disimpan di server luar.
