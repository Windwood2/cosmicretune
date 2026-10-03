function bySlug(slug) {
  return (window.RESONANCE_SONGS || []).find(song => song.slug === slug);
}
function songAudioPath(slug) { return `media/audio/${slug}.mp3`; }
function songVideoPath(slug) { return `media/video/${slug}.mp4`; }
function songLyricsPath(slug) { return `data/lyrics/${slug}.txt`; }

function escapeHtml(str='') {
  return String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function setActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
}

function renderSongCards(targetId, limit = null) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const songs = window.RESONANCE_SONGS || [];
  const list = limit ? songs.slice(0, limit) : songs;
  el.innerHTML = list.map(song => `
    <article class="card song-card">
      <img class="card-media" src="${song.image || 'assets/art/listening-room.png'}" alt="${escapeHtml(song.title)} artwork">
      <div class="card-body">
        <div class="kicker">Song</div>
        <h3><a href="song.html?slug=${encodeURIComponent(song.slug)}">${escapeHtml(song.title)}</a></h3>
        <p class="small">${escapeHtml(song.short || '')}</p>
        <p>${escapeHtml(song.description || '')}</p>
        ${song.quote ? `<p class="quote">${escapeHtml(song.quote)}</p>` : ''}
        <a class="btn" href="song.html?slug=${encodeURIComponent(song.slug)}">Listen</a>
      </div>
    </article>
  `).join('');
}

async function fileExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (!res.ok) return false;
    const len = Number(res.headers.get('content-length') || 0);
    return !len || len > 1000;
  } catch {
    return false;
  }
}

async function loadText(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('not found');
  return res.text();
}

async function renderSongPage() {
  const target = document.getElementById('song-page');
  if (!target) return;

  const slug = new URLSearchParams(location.search).get('slug') || '';
  const song = bySlug(slug);

  if (!song) {
    target.innerHTML = `<div class="panel"><h2>Song not found</h2><p><a href="songs.html">Return to the listening room.</a></p></div>`;
    return;
  }

  document.title = `${song.title} — Resonance Music`;

  const hero = document.querySelector('.hero-bg');
  if (hero && song.image) hero.style.backgroundImage = `url('${song.image}')`;

  const heroTitle = document.querySelector('.hero-content h1');
  const heroLead = document.querySelector('.hero-content .lead');
  if (heroTitle) heroTitle.textContent = song.title;
  if (heroLead && song.short) heroLead.textContent = song.short;

  const audioPath = songAudioPath(song.slug);
  const videoPath = songVideoPath(song.slug);
  const lyricsPath = songLyricsPath(song.slug);

  const [hasAudio, hasVideo, lyricsText] = await Promise.all([
    fileExists(audioPath),
    fileExists(videoPath),
    loadText(lyricsPath).catch(() => '')
  ]);

  const audioSection = hasAudio ? `
    <section class="panel audio-box">
      <h3>Listen</h3>
      <audio controls preload="metadata"><source src="${audioPath}" type="audio/mpeg"></audio>
    </section>` : '';

  const videoSection = hasVideo ? `
    <section class="panel video-box">
      <h3>Watch</h3>
      <video controls preload="metadata"><source src="${videoPath}" type="video/mp4"></video>
    </section>` : '';

  const lyricsSection = lyricsText.trim() ? `
    <section class="panel lyrics-box">
      <h3>Lyrics</h3>
      <pre class="lyrics">${escapeHtml(lyricsText)}</pre>
    </section>` : '';

  target.innerHTML = `
    <div class="song-layout">
      <div class="song-main">
        <section class="panel info-box">
          <div class="kicker">Song</div>
          <h1>${escapeHtml(song.title)}</h1>
          <p class="lead">${escapeHtml(song.short || '')}</p>
          <p>${escapeHtml(song.description || '')}</p>
        </section>
        ${audioSection}
        ${videoSection}
        ${lyricsSection}
      </div>
      <aside class="song-side">
        <section class="card">
          <img class="card-media" src="${song.image || 'assets/art/resonance-field.png'}" alt="${escapeHtml(song.title)} artwork">
          ${song.quote ? `<div class="card-body"><div class="kicker">Line</div><p class="quote">${escapeHtml(song.quote)}</p></div>` : ''}
        </section>
      </aside>
    </div>
  `;
}

window.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  renderSongCards('home-songs', 4);
  renderSongCards('all-songs');
  renderSongPage();
});
