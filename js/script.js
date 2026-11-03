// Data audio default bawaan folder assets/audio
const DEFAULT_TRACKS = [
  {
    id: "track-1",
    title: "Bel Istirahat",
    filename: "bel-istirahat.mpeg",
    folder: "assets/audio",
    src: "assets/audio/bel-istirahat.mpeg",
    duration: 0
  },
  {
    id: "track-2",
    title: "Backsound Ruang Tamu",
    filename: "backsound-ruang-tamu.mpeg",
    folder: "assets/audio",
    src: "assets/audio/backsound-ruang-tamu.mpeg",
    duration: 0
  },
  {
    id: "track-3",
    title: "Sound Ambulan",
    filename: "sound-ambulan.mpeg",
    folder: "assets/audio",
    src: "assets/audio/sound-ambulan.mpeg",
    duration: 0
  },
  {
    id: "track-4",
    title: "Suara Ritmis Monitor Detak Jantung",
    filename: "suara-ritmis-monitor-detak-jantung.mpeg",
    folder: "assets/audio",
    src: "assets/audio/suara-ritmis-monitor-detak-jantung.mpeg",
    duration: 0
  }
];

// State Aplikasi
let playlist = [...DEFAULT_TRACKS];
let currentTrackIndex = -1;
let isPlaying = false;
let isShuffle = false;
let isLoop = true; // Default aktif: mengulang audio yang sama
let lastVolume = 0.8;
let searchQuery = '';

// DOM Elements
const audio = document.getElementById('audioElement');
const folderGroupsContainer = document.getElementById('folderGroupsContainer');
const totalAudioBadge = document.getElementById('totalAudioBadge');
const searchInput = document.getElementById('searchInput');
const resetPlaylistBtn = document.getElementById('resetPlaylistBtn');
const folderInput = document.getElementById('folderInput');

// Player Elements
const currentTrackFolder = document.getElementById('currentTrackFolder');
const currentTrackTitle = document.getElementById('currentTrackTitle');
const currentTrackFile = document.getElementById('currentTrackFile');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loopBtn = document.getElementById('loopBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const volumeBar = document.getElementById('volumeBar');
const volumeValue = document.getElementById('volumeValue');
const muteBtn = document.getElementById('muteBtn');
const volumeHighIcon = document.getElementById('volumeHighIcon');
const volumeMuteIcon = document.getElementById('volumeMuteIcon');
const speedSelect = document.getElementById('speedSelect');

// Format Detik -> MM:SS
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Bersihkan nama file menjadi judul yang rapi
function cleanFileName(filename) {
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  return withoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());
}

// Render daftar folder & audio
function renderPlaylist() {
  folderGroupsContainer.innerHTML = '';

  // Filter berdasarkan pencarian
  const filteredTracks = playlist.filter(track => {
    const q = searchQuery.toLowerCase();
    return track.title.toLowerCase().includes(q) ||
           track.filename.toLowerCase().includes(q) ||
           track.folder.toLowerCase().includes(q);
  });

  totalAudioBadge.textContent = `${filteredTracks.length} Audio`;

  if (filteredTracks.length === 0) {
    folderGroupsContainer.innerHTML = `
      <div class="empty-state">
        <p>Tidak ada audio yang ditemukan.</p>
      </div>
    `;
    return;
  }

  // Kelompokkan audio berdasarkan foldernya
  const groups = {};
  filteredTracks.forEach(track => {
    if (!groups[track.folder]) {
      groups[track.folder] = [];
    }
    groups[track.folder].push(track);
  });

  // Urutkan nama folder
  const sortedFolders = Object.keys(groups).sort();

  sortedFolders.forEach(folderName => {
    const tracksInFolder = groups[folderName];
    const groupCard = document.createElement('div');
    groupCard.className = 'folder-group';

    // Header Folder
    const header = document.createElement('div');
    header.className = 'folder-header';
    header.innerHTML = `
      <div class="folder-header-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span>${folderName}</span>
      </div>
      <span class="folder-count">${tracksInFolder.length} file</span>
    `;

    // Daftar Audio dalam Folder
    const ul = document.createElement('ul');
    ul.className = 'track-list';

    tracksInFolder.forEach(track => {
      const originalIndex = playlist.findIndex(t => t.id === track.id);
      const isCurrent = originalIndex === currentTrackIndex;

      const li = document.createElement('li');
      li.className = `track-item ${isCurrent ? 'active' : ''}`;
      li.onclick = () => playTrack(originalIndex);

      li.innerHTML = `
        <div class="track-item-left">
          <div class="track-status-icon">
            ${isCurrent && isPlaying ?
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' :
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>'
            }
          </div>
          <div class="track-info-col">
            <span class="track-item-name">${track.title}</span>
            <span class="track-item-filename">${track.filename}</span>
          </div>
        </div>
        <span class="track-item-duration" id="dur-${track.id}">
          ${track.duration ? formatTime(track.duration) : '--:--'}
        </span>
      `;

      ul.appendChild(li);
    });

    groupCard.appendChild(header);
    groupCard.appendChild(ul);
    folderGroupsContainer.appendChild(groupCard);
  });
}

// Muat durasi metadata untuk trek lokal jika belum ada
function preloadTrackDurations() {
  playlist.forEach(track => {
    if (!track.duration && track.src) {
      const tempAudio = new Audio();
      tempAudio.src = track.src;
      tempAudio.addEventListener('loadedmetadata', () => {
        track.duration = tempAudio.duration;
        const durEl = document.getElementById(`dur-${track.id}`);
        if (durEl) {
          durEl.textContent = formatTime(track.duration);
        }
      });
    }
  });
}

// Putar Track berdasarkan Index
function playTrack(index) {
  if (index < 0 || index >= playlist.length) return;

  const track = playlist[index];
  currentTrackIndex = index;

  audio.src = track.src;
  audio.loop = isLoop;
  audio.playbackRate = parseFloat(speedSelect.value) || 1.0;
  audio.play()
    .then(() => {
      isPlaying = true;
      updatePlayerUI();
      renderPlaylist();
    })
    .catch(err => {
      console.error("Gagal memutar audio:", err);
    });

  updatePlayerUI();
  renderPlaylist();
}

// Update tampilan Player saat track berubah
function updatePlayerUI() {
  if (currentTrackIndex >= 0 && currentTrackIndex < playlist.length) {
    const track = playlist[currentTrackIndex];
    currentTrackTitle.textContent = track.title;
    currentTrackFolder.textContent = `Folder: ${track.folder}`;
    currentTrackFile.textContent = track.filename;
    document.title = `${track.title} • Audio Player`;
  } else {
    currentTrackTitle.textContent = "Pilih audio untuk memutar";
    currentTrackFolder.textContent = "Tidak ada audio";
    currentTrackFile.textContent = "";
    document.title = "Audio Player";
  }

  if (isPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }
}

// Toggle Play/Pause
function togglePlay() {
  if (currentTrackIndex === -1 && playlist.length > 0) {
    playTrack(0);
    return;
  }

  if (audio.paused) {
    audio.play();
    isPlaying = true;
  } else {
    audio.pause();
    isPlaying = false;
  }
  updatePlayerUI();
  renderPlaylist();
}

// Track Berikutnya
function nextTrack() {
  if (playlist.length === 0) return;

  if (isShuffle) {
    let nextIndex;
    if (playlist.length === 1) {
      nextIndex = 0;
    } else {
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentTrackIndex);
    }
    playTrack(nextIndex);
  } else {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlist.length) {
      if (loopMode === 'all') {
        nextIndex = 0;
      } else {
        return; // Selesai jika tidak loop
      }
    }
    playTrack(nextIndex);
  }
}

// Track Sebelumnya
function prevTrack() {
  if (playlist.length === 0) return;

  // Jika lagu sudah berjalan lebih dari 3 detik, ulangi dari awal
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  let prevIndex = currentTrackIndex - 1;
  if (prevIndex < 0) {
    prevIndex = playlist.length - 1;
  }
  playTrack(prevIndex);
}

// Setup Event Listeners Audio
audio.addEventListener('timeupdate', () => {
  if (!isNaN(audio.duration) && audio.duration > 0) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progressPercent;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    totalDurationEl.textContent = formatTime(audio.duration);
  }
});

audio.addEventListener('loadedmetadata', () => {
  totalDurationEl.textContent = formatTime(audio.duration);
  if (currentTrackIndex >= 0 && playlist[currentTrackIndex]) {
    playlist[currentTrackIndex].duration = audio.duration;
    const durEl = document.getElementById(`dur-${playlist[currentTrackIndex].id}`);
    if (durEl) durEl.textContent = formatTime(audio.duration);
  }
});

audio.addEventListener('ended', () => {
  // Jika loop aktif, putar ulang audio yang sama
  if (isLoop) {
    audio.currentTime = 0;
    audio.play();
  } else {
    // Jangan alihkan otomatis ke audio lain ketika selesai
    isPlaying = false;
    audio.currentTime = 0;
    progressBar.value = 0;
    currentTimeEl.textContent = "00:00";
    updatePlayerUI();
    renderPlaylist();
  }
});

// Kontrol Progress Bar (Seek)
progressBar.addEventListener('input', (e) => {
  if (audio.duration) {
    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
  }
});

// Kontrol Volume
volumeBar.addEventListener('input', (e) => {
  const vol = parseFloat(e.target.value);
  audio.volume = vol;
  updateVolumeUI(vol);
});

function updateVolumeUI(vol) {
  volumeValue.textContent = `${Math.round(vol * 100)}%`;
  if (vol === 0) {
    volumeHighIcon.style.display = 'none';
    volumeMuteIcon.style.display = 'block';
  } else {
    volumeHighIcon.style.display = 'block';
    volumeMuteIcon.style.display = 'none';
  }
}

muteBtn.addEventListener('click', () => {
  if (audio.volume > 0) {
    lastVolume = audio.volume;
    audio.volume = 0;
    volumeBar.value = 0;
  } else {
    audio.volume = lastVolume || 0.8;
    volumeBar.value = audio.volume;
  }
  updateVolumeUI(audio.volume);
});

// Mode Loop (Default: Aktif)
loopBtn.addEventListener('click', () => {
  isLoop = !isLoop;
  audio.loop = isLoop;
  loopBtn.classList.toggle('active', isLoop);
  loopBtn.title = isLoop ? 'Ulangi (Loop): Aktif' : 'Ulangi (Loop): Mati';
});

// Mode Shuffle
shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
  shuffleBtn.title = isShuffle ? 'Acak: Aktif' : 'Acak: Mati';
});

// Kecepatan Pemutaran
speedSelect.addEventListener('change', (e) => {
  audio.playbackRate = parseFloat(e.target.value);
});

// Tombol Player
playPauseBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

// Pencarian
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderPlaylist();
});

// Reset ke Default
resetPlaylistBtn.addEventListener('click', () => {
  playlist = [...DEFAULT_TRACKS];
  searchQuery = '';
  searchInput.value = '';
  renderPlaylist();
  preloadTrackDurations();
});

// Input Folder Pengguna (Folder Picker)
folderInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  const audioExtensions = ['.mp3', '.mpeg', '.mpg', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.webm'];

  // Filter file audio
  const audioFiles = files.filter(file => {
    const name = file.name.toLowerCase();
    return file.type.startsWith('audio/') || audioExtensions.some(ext => name.endsWith(ext));
  });

  if (audioFiles.length === 0) {
    alert("Tidak ditemukan file audio di folder tersebut.");
    return;
  }

  // Bangun daftar trek baru dengan nama folder terstruktur
  const newTracks = audioFiles.map((file, idx) => {
    // Ambil path folder dari relative path (misal "Album A/Subfolder/song.mp3")
    let folderName = "Folder Baru";
    if (file.webkitRelativePath) {
      const pathParts = file.webkitRelativePath.split('/');
      if (pathParts.length > 1) {
        // Ambil semua folder kecuali nama file terakhir
        folderName = pathParts.slice(0, -1).join('/');
      }
    }

    return {
      id: `custom-${Date.now()}-${idx}`,
      title: cleanFileName(file.name),
      filename: file.name,
      folder: folderName,
      src: URL.createObjectURL(file),
      duration: 0
    };
  });

  // Ganti playlist dengan folder baru
  playlist = newTracks;
  currentTrackIndex = -1;
  audio.pause();
  isPlaying = false;
  updatePlayerUI();
  renderPlaylist();
  preloadTrackDurations();
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  // Jangan tangani shortcut saat sedang mengetik di input pencarian
  if (e.target.tagName === 'INPUT') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      togglePlay();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - 5);
      break;
    case 'ArrowRight':
      e.preventDefault();
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
      break;
    case 'ArrowUp':
      e.preventDefault();
      audio.volume = Math.min(1, audio.volume + 0.05);
      volumeBar.value = audio.volume;
      updateVolumeUI(audio.volume);
      break;
    case 'ArrowDown':
      e.preventDefault();
      audio.volume = Math.max(0, audio.volume - 0.05);
      volumeBar.value = audio.volume;
      updateVolumeUI(audio.volume);
      break;
  }
});

// Inisialisasi awal
audio.loop = isLoop;
audio.volume = parseFloat(volumeBar.value);
renderPlaylist();
preloadTrackDurations();
