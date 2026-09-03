window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('boot').classList.add('hide'), 500);
});

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- avatar: toca para cambiar ---------- */
const avatarRing = document.getElementById('avatarRing');
const avImgs = avatarRing.querySelectorAll('.av');
function cycleAvatar(){
  const i = [...avImgs].findIndex(img => img.classList.contains('active'));
  avImgs[i].classList.remove('active');
  avImgs[(i + 1) % avImgs.length].classList.add('active');
}
avatarRing.addEventListener('click', cycleAvatar);
avatarRing.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleAvatar(); } });

/* ---------- ficha de jugador: carrusel + tilt 3D ---------- */
const ficha = document.getElementById('fichaCard');
const slides = ficha.querySelectorAll('.fs');
const dots = ficha.querySelectorAll('.dot');
dots.forEach(dot => dot.addEventListener('click', () => {
  const i = +dot.dataset.i;
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  slides[i].classList.add('active');
  dot.classList.add('active');
}));
if (!reduceMotion) {
  ficha.addEventListener('mousemove', (e) => {
    const r = ficha.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    ficha.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg)`;
    ficha.style.setProperty('--mx', (x * 100) + '%');
    ficha.style.setProperty('--my', (y * 100) + '%');
  });
  ficha.addEventListener('mouseleave', () => {
    ficha.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  });
}

/* ---------- ambient bokeh lights ---------- */
if (!reduceMotion) {
  const bokehLayer = document.getElementById('bokeh');
  const bokehColors = ['#3ddcd6', '#00ff88', '#6a4fd6', '#4fa3ff'];
  for (let i = 0; i < 16; i++) {
    const b = document.createElement('span');
    const size = 40 + Math.random() * 120;
    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.left = Math.random() * 100 + '%';
    b.style.background = bokehColors[i % bokehColors.length];
    b.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    b.style.animationDuration = (14 + Math.random() * 16) + 's';
    b.style.animationDelay = (-Math.random() * 20) + 's';
    bokehLayer.appendChild(b);
  }
}

/* ---------- Sumeru-style dendro leaf rain ---------- */
if (!reduceMotion) {
  const rain = document.getElementById('leafRain');
  const leafSVG = (color) => `
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M8 1c4 2 6 6 4 11-2 3-6 4-8 1C2 9 3 4 8 1z" fill="${color}"/>
    </svg>`;
  const leafColors = ['#00ff88', '#00cc66', '#3ddcd6', '#7be495'];
  const density = window.innerWidth < 700 ? 16 : 30;
  for (let i = 0; i < density; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.style.left = Math.random() * 100 + '%';
    leaf.style.setProperty('--sway', (Math.random() * 60 - 30) + 'px');
    leaf.style.animationDuration = (10 + Math.random() * 14) + 's';
    leaf.style.animationDelay = (-Math.random() * 20) + 's';
    leaf.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
    leaf.innerHTML = leafSVG(leafColors[i % leafColors.length]);
    rain.appendChild(leaf);
  }
}

/* ================= FLOATING DRAGGABLE MUSIC PLAYER ================= */
(() => {
  const PLAYLIST = [
    {
      title: 'Aria Math',
      artist: 'C418 — Minecraft Volume Alpha',
      src: 'assets/audio/aria-math.mp3'
    },
    {
      title: 'Subwoofer Lullaby',
      artist: 'C418 — Minecraft Volume Alpha',
      src: 'assets/audio/subwoofer-lullaby.mp3'
    }
  ];

  const player = document.getElementById('player');
  const audio = document.getElementById('audio');
  const head = document.getElementById('playerHead');
  const collapseBtn = document.getElementById('playerCollapse');
  const btnPlay = document.getElementById('btnPlay');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const iconPlay = document.getElementById('iconPlay');
  const iconPause = document.getElementById('iconPause');
  const progress = document.getElementById('progress');
  const progressFill = document.getElementById('progressFill');
  const progressThumb = document.getElementById('progressThumb');
  const timeCurrent = document.getElementById('timeCurrent');
  const timeTotal = document.getElementById('timeTotal');
  const trackTitle = document.getElementById('trackTitle');
  const trackArtist = document.getElementById('trackArtist');
  const volSlider = document.getElementById('volSlider');
  const playlistToggle = document.getElementById('playlistToggle');
  const playlistEl = document.getElementById('playlist');
  const audioHint = document.getElementById('audioHint');

  let current = 0;
  let userStarted = false;

  function fmt(s){
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2,'0')}`;
  }

  function renderPlaylist(){
    playlistEl.innerHTML = '';
    PLAYLIST.forEach((t, i) => {
      const item = document.createElement('div');
      item.className = 'playlist-item' + (i === current ? ' active' : '');
      item.innerHTML = `
        <span class="pi-num">${i + 1}</span>
        <span class="pi-meta">
          <span class="pi-title">${t.title}</span>
          <span class="pi-artist">${t.artist}</span>
        </span>
        <span class="pi-dur">${i === current ? '♪' : ''}</span>
      `;
      item.addEventListener('click', () => loadTrack(i, true));
      playlistEl.appendChild(item);
    });
  }

  function loadTrack(i, autoplay){
    current = (i + PLAYLIST.length) % PLAYLIST.length;
    const t = PLAYLIST[current];
    audio.src = t.src;
    trackTitle.textContent = t.title;
    trackArtist.textContent = t.artist;
    renderPlaylist();
    if (autoplay) play();
  }

  function play(){
    audio.play().then(() => {
      userStarted = true;
      player.classList.add('playing');
      iconPlay.style.display = 'none';
      iconPause.style.display = '';
      audioHint.classList.remove('show');
    }).catch(() => {
      audioHint.classList.add('show');
      setTimeout(() => audioHint.classList.remove('show'), 2400);
    });
  }

  function pause(){
    audio.pause();
    player.classList.remove('playing');
    iconPlay.style.display = '';
    iconPause.style.display = 'none';
  }

  btnPlay.addEventListener('click', () => { audio.paused ? play() : pause(); });
  btnNext.addEventListener('click', () => loadTrack(current + 1, true));
  btnPrev.addEventListener('click', () => loadTrack(current - 1, true));

  audio.addEventListener('timeupdate', () => {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progressFill.style.width = pct + '%';
    progressThumb.style.left = pct + '%';
    timeCurrent.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener('loadedmetadata', () => { timeTotal.textContent = fmt(audio.duration); });
  audio.addEventListener('ended', () => loadTrack(current + 1, true));

  function seek(e){
    const r = progress.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const pct = Math.min(1, Math.max(0, x / r.width));
    if (audio.duration) audio.currentTime = pct * audio.duration;
  }
  progress.addEventListener('click', seek);
  let seeking = false;
  progress.addEventListener('mousedown', () => seeking = true);
  window.addEventListener('mousemove', (e) => { if (seeking) seek(e); });
  window.addEventListener('mouseup', () => seeking = false);

  volSlider.addEventListener('input', () => { audio.volume = volSlider.value / 100; });
  audio.volume = 0.55;

  playlistToggle.addEventListener('click', () => {
    playlistEl.classList.toggle('open');
    playlistToggle.classList.toggle('active');
  });

  collapseBtn.addEventListener('click', () => player.classList.toggle('collapsed'));

  loadTrack(0, false);

  // attempt gentle autoplay; browsers require a user gesture, so fall back to
  // starting on first interaction anywhere on the page
  play();
  const startOnGesture = () => {
    if (!userStarted) play();
    window.removeEventListener('pointerdown', startOnGesture);
    window.removeEventListener('keydown', startOnGesture);
  };
  window.addEventListener('pointerdown', startOnGesture, { once: true });
  window.addEventListener('keydown', startOnGesture, { once: true });

  /* ---------- draggable widget ---------- */
  let dragging = false, offX = 0, offY = 0;

  function clamp(val, min, max){ return Math.min(max, Math.max(min, val)); }

  function setPosition(x, y){
    const w = player.offsetWidth, h = player.offsetHeight;
    x = clamp(x, 8, window.innerWidth - w - 8);
    y = clamp(y, 8, window.innerHeight - h - 8);
    player.style.left = x + 'px';
    player.style.top = y + 'px';
    player.style.bottom = 'auto';
    player.style.right = 'auto';
  }

  function startDrag(clientX, clientY){
    dragging = true;
    player.classList.add('dragging');
    const r = player.getBoundingClientRect();
    offX = clientX - r.left;
    offY = clientY - r.top;
  }
  function moveDrag(clientX, clientY){
    if (!dragging) return;
    setPosition(clientX - offX, clientY - offY);
  }
  function endDrag(){
    dragging = false;
    player.classList.remove('dragging');
  }

  head.addEventListener('mousedown', (e) => { startDrag(e.clientX, e.clientY); e.preventDefault(); });
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  head.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchend', endDrag);

  window.addEventListener('resize', () => {
    const r = player.getBoundingClientRect();
    setPosition(r.left, r.top);
  });
})();
