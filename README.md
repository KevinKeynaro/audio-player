# Audio Player

Aplikasi web pemutar audio sederhana dan rapi yang mengelompokkan audio berdasarkan struktur foldernya.

## Fitur Utama

- **Pengelompokan Folder**: Menampilkan daftar audio yang dikelompokkan berdasarkan nama folder asalnya.
- **Loop Audio**: Pemutaran otomatis berulang pada audio yang sama secara default.
- **Tanpa Auto-Next**: Audio tidak otomatis beralih ke file lain setelah selesai diputar.
- **Buka Folder Lain**: Dukungan memuat folder audio lokal langsung dari perangkat.
- **Kontrol Lengkap**: Play/Pause, Next/Prev manual, Slider Durasi (Seek), Volume, Mute, Shuffle, dan Pengatur Kecepatan (0.5x - 2.0x).
- **Pencarian**: Filter audio instan berdasarkan judul, nama file, atau nama folder.
- **Pintasan Keyboard**:
  - `Spasi`: Play / Pause
  - `Panah Kiri` / `Kanan`: Mundur / Maju 5 detik
  - `Panah Atas` / `Bawah`: Naik / Turun volume

## Struktur Direktori

```text
audio-player/
├── assets/
│   └── audio/          # File audio bawaan
├── css/
│   └── styles.css      # Desain tampilan
├── js/
│   └── script.js       # Logika pemutar audio
├── index.html          # Halaman utama
└── README.md
```

## Cara Menjalankan

Buka file `index.html` langsung di peramban (browser) apa pun seperti Chrome, Edge, atau Firefox.
