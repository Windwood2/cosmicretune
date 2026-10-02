function bySlug(slug) {
  return (window.RESONANCE_SONGS || []).find(song => song.slug === slug);
}
function songAudioPath(slug) { return `media/audio/${slug}.mp3`; }
function songVideoPath(slug) { return `media/video/${slug}.mp4`; }
function songLyricsPath(slug) { return `data/lyrics/${slug}.txt`; }
function escapeHtml(str='') {
  return str.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
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
  const items = (limit ? window.RESONANCE_SONGS.slice(0, limit) : window.RESONANCE_SONGS)
    .map(song => `
      <article class="card song-card">
        <img class="card-media" src="${song.image || 'assets/art/listening-room.png'}" alt="${escapeHtml(song.title)} artwork">
        <div class="card-body">
          <div class="kicker">Song</div>
          <h3><a href="song.html?slug=${encodeURIComponent(song.slug)}">${escapeHtml(song.title)}</a></h3>
          <p class="small">${escapeHtml(song.short)}</p>
          <p>${escapeHtml(song.description)}</p>
          <p class="quote">${escapeHtml(song.quote)}</p>
          <a class="btn" href="song.html?slug=${encodeURIComponent(song.slug)}">Open song page</a>
        </div>
      </article>
    `).join('');
  el.innerHTML = items;
}
async function fileExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (e) {
    return false;
  }
}
async function loadText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('not found');
  return res.text();
}
async function renderSongPage() {
  const target = document.getElementById('song-page');
  if (!target) return;
  const slug = new URLSearchParams(location.search).get('slug') || '';
  const song = bySlug(slug);
  if (!song) {
    target.innerHTML = `<div class="panel"><h2>Song not found</h2><p>Open <a href="songs.html">the songs page</a> and choose a listed song.</p></div>`;
    return;
  }
  document.title = `${song.title} — Resonance Music`;
  const hero = document.querySelector('.hero-bg');
  if (hero && song.image) hero.style.backgroundImage = `url('${song.image}')`;
  const audioPath = songAudioPath(song.slug);
  const videoPath = songVideoPath(song.slug);
  const lyricsPath = songLyricsPath(song.slug);
  const [hasAudio, hasVideo, lyricsText] = await Promise.all([
    fileExists(audioPath),
    fileExists(videoPath),
    loadText(lyricsPath).catch(() => '')
  ]);
  target.innerHTML = `
    <div class="song-layout">
      <div class="song-main">
        <section class="panel info-box">
          <div class="kicker">Song</div>
          <h1>${escapeHtml(song.title)}</h1>
          <p class="lead">${escapeHtml(song.short)}</p>
          <p>${escapeHtml(song.description)}</p>
          <div class="meta"><span>${escapeHtml(song.status || '')}</span><span>Slug: ${escapeHtml(song.slug)}</span></div>
        </section>
        <section class="panel audio-box">
          <h3>Audio</h3>
          ${hasAudio ? `<audio controls preload="none"><source src="${audioPath}" type="audio/mpeg"></audio>` : `<div class="note">Drop your MP3 here: <strong>${audioPath}</strong></div>`}
        </section>
        <section class="panel video-box">
          <h3>Video</h3>
          ${hasVideo ? `<video controls preload="metadata"><source src="${videoPath}" type="video/mp4"></video>` : `<div class="note">Optional: add a video here — <strong>${videoPath}</strong></div>`}
        </section>
        <section class="panel lyrics-box">
          <h3>Lyrics</h3>
          ${lyricsText.trim() ? `<pre class="lyrics">${escapeHtml(lyricsText)}</pre>` : `<div class="note">Paste lyrics into <strong>${lyricsPath}</strong> as plain text.</div>`}
        </section>
      </div>
      <aside class="song-side">
        <section class="card">
          <img class="card-media" src="${song.image || 'assets/art/resonance-field.png'}" alt="${escapeHtml(song.title)} artwork">
          <div class="card-body">
            <div class="kicker">Line</div>
            <p class="quote">${escapeHtml(song.quote)}</p>
          </div>
        </section>
        <section class="panel" style="margin-top:1rem;">
          <h3>Quick add checklist</h3>
          <ol class="steps">
            <li>Add the MP3 file named <strong>${song.slug}.mp3</strong> inside <strong>media/audio</strong></li>
            <li>Optional: add <strong>${song.slug}.mp4</strong> inside <strong>media/video</strong></li>
            <li>Paste your lyrics into <strong>${song.slug}.txt</strong> inside <strong>data/lyrics</strong></li>
            <li>Refresh the browser with <strong>Ctrl + F5</strong></li>
          </ol>
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
