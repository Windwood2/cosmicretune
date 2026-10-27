/* Self-contained image viewer. No frameworks, services or tracking. */
(() => {
 'use strict';
 const entries = window.INNER_VIEWS || [];
 const dialog = document.getElementById('art-viewer');
 if (!dialog || !entries.length || typeof dialog.showModal !== 'function') return;
 const byId = new Map(entries.map(entry => [entry.id, entry]));
 const filters = [...document.querySelectorAll('[data-filter]')];
 const items = [...document.querySelectorAll('.view-item')];
 const image = document.getElementById('viewer-image');
 const title = document.getElementById('viewer-title');
 const category = document.getElementById('viewer-category');
 const description = document.getElementById('viewer-description');
 const counter = document.getElementById('viewer-counter');
 const stage = document.getElementById('viewer-stage');
 const loading = document.getElementById('viewer-loading');
 const status = document.getElementById('viewer-status');
 const original = document.getElementById('viewer-original');
 const playButton = document.getElementById('viewer-play');
 const zoomButton = document.getElementById('viewer-zoom');
 const fullButton = document.getElementById('viewer-fullscreen');
 const pace = document.getElementById('viewer-pace');
 let activeFilter = 'inner', sequence = [], index = 0, opener = null;
 let playing = false, timer = null, generation = 0, zoomed = false, enteredFullscreen = false;
 let pointer = null, suppressClickUntil = 0;

 function filterMatches(entry, filter) { return filter === 'inner' ? entry.group !== 'earlier' : entry.group === filter; }
 function applyFilter(filter) {
  activeFilter = filter;
  sequence = entries.filter(entry => filterMatches(entry, filter));
  items.forEach(item => { item.hidden = !filterMatches(byId.get(item.dataset.id), filter); });
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  document.getElementById('view-count').textContent = `${sequence.length} views`;
 }
 function clearTimer() { if (timer !== null) clearTimeout(timer); timer = null; }
 function schedule() {
  clearTimer();
  if (playing && dialog.open && !document.hidden) timer = setTimeout(() => navigate(1, false), Number(pace.value) * 1000);
 }
 function setPlaying(value) {
  playing = Boolean(value);
  playButton.textContent = playing ? 'Pause slideshow' : 'Play slowly';
  playButton.setAttribute('aria-pressed', String(playing));
  if (playing) schedule(); else clearTimer();
 }
 function setZoom(value) {
  zoomed = Boolean(value);
  stage.classList.toggle('is-zoomed', zoomed);
  zoomButton.textContent = zoomed ? 'Fit image' : 'Zoom in';
  zoomButton.setAttribute('aria-pressed', String(zoomed));
  image.setAttribute('aria-label', zoomed ? 'Zoomed image. Click to fit.' : 'Click image to zoom.');
  if (!zoomed) stage.scrollTo(0, 0);
  else requestAnimationFrame(() => stage.scrollTo((stage.scrollWidth - stage.clientWidth) / 2, (stage.scrollHeight - stage.clientHeight) / 2));
 }
 async function showImage() {
  clearTimer();
  const entry = sequence[index];
  const ticket = ++generation;
  setZoom(false);
  title.textContent = entry.title;
  category.textContent = entry.category;
  description.textContent = entry.description;
  counter.textContent = `${index + 1} / ${sequence.length}`;
  image.alt = entry.alt;
  image.src = entry.thumb;
  original.href = entry.src;
  loading.hidden = false;
  stage.setAttribute('aria-busy', 'true');
  try {
   const large = new Image();
   large.src = entry.src;
   await large.decode();
   if (ticket !== generation || !dialog.open) return;
   image.src = entry.src;
   status.textContent = `${entry.title}. Image ${index + 1} of ${sequence.length}.`;
   for (const offset of [-1, 1]) {
    const near = sequence[(index + offset + sequence.length) % sequence.length];
    const preload = new Image(); preload.src = near.src;
   }
  } catch {
   if (ticket !== generation || !dialog.open) return;
   status.textContent = 'The large image could not load. You can try Open image.';
  } finally {
   if (ticket === generation && dialog.open) {
    loading.hidden = true;
    stage.setAttribute('aria-busy', 'false');
    schedule();
   }
  }
 }
 function openViewer(id, element, autoplay = false) {
  const entry = byId.get(id);
  if (!entry) return;
  if (!filterMatches(entry, activeFilter)) applyFilter(entry.group === 'earlier' ? 'earlier' : 'inner');
  index = sequence.findIndex(item => item.id === id);
  opener = element;
  document.documentElement.classList.add('viewer-open');
  if (!dialog.open) dialog.showModal();
  setPlaying(autoplay);
  showImage();
  document.getElementById('viewer-close').focus({ preventScroll: true });
 }
 function navigate(direction, manual = true) {
  if (manual) setPlaying(false);
  index = (index + direction + sequence.length) % sequence.length;
  showImage();
 }
 function closeViewer() { if (dialog.open) dialog.close(); }
 function cleanup() {
  generation++;
  setPlaying(false);
  setZoom(false);
  document.documentElement.classList.remove('viewer-open');
  pointer = null;
  if (enteredFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  enteredFullscreen = false;
  if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
 }
 filters.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
 document.querySelectorAll('[data-view]').forEach(link => link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  openViewer(link.dataset.view, link);
 }));
 document.getElementById('gallery-play').addEventListener('click', event => openViewer(sequence[0].id, event.currentTarget, true));
 document.getElementById('viewer-close').addEventListener('click', closeViewer);
 document.getElementById('viewer-prev').addEventListener('click', () => navigate(-1));
 document.getElementById('viewer-next').addEventListener('click', () => navigate(1));
 playButton.addEventListener('click', () => setPlaying(!playing));
 pace.addEventListener('change', schedule);
 zoomButton.addEventListener('click', () => { setPlaying(false); setZoom(!zoomed); });
 image.addEventListener('click', () => { if (performance.now() > suppressClickUntil) { setPlaying(false); setZoom(!zoomed); } });
 fullButton.hidden = typeof document.documentElement.requestFullscreen !== 'function' || document.fullscreenEnabled === false;
 fullButton.addEventListener('click', async () => {
  try {
   if (document.fullscreenElement) await document.exitFullscreen();
   else { await document.documentElement.requestFullscreen(); enteredFullscreen = true; }
  } catch { status.textContent = 'Full screen is unavailable in this browser. The large viewer remains open.'; }
 });
 document.addEventListener('fullscreenchange', () => {
  fullButton.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
  fullButton.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
 });
 dialog.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
 dialog.addEventListener('close', cleanup);
 document.addEventListener('visibilitychange', () => { if (document.hidden) setPlaying(false); });
 dialog.addEventListener('keydown', event => {
  if (event.target.matches('input,select,textarea,[contenteditable="true"]')) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
  if (event.key === '+' || event.key === '=') { event.preventDefault(); setPlaying(false); setZoom(true); }
  if (event.key === '-') { event.preventDefault(); setZoom(false); }
  if (event.code === 'Space' && !event.target.closest('button,a')) { event.preventDefault(); setPlaying(!playing); }
 });
 stage.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  pointer = { id:event.pointerId, x:event.clientX, y:event.clientY, left:stage.scrollLeft, top:stage.scrollTop, zoomed, type:event.pointerType };
  if (zoomed && event.pointerType === 'mouse') { stage.setPointerCapture(event.pointerId); stage.classList.add('is-dragging'); }
 });
 stage.addEventListener('pointermove', event => {
  if (!pointer || pointer.id !== event.pointerId || !pointer.zoomed || pointer.type !== 'mouse') return;
  stage.scrollLeft = pointer.left - (event.clientX - pointer.x);
  stage.scrollTop = pointer.top - (event.clientY - pointer.y);
 });
 stage.addEventListener('pointerup', event => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
  if (!pointer.zoomed && Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.6) { suppressClickUntil = performance.now() + 400; navigate(dx < 0 ? 1 : -1); }
  if (pointer.zoomed && Math.abs(dx) + Math.abs(dy) > 8) suppressClickUntil = performance.now() + 400;
  stage.classList.remove('is-dragging');
  if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  pointer = null;
 });
 stage.addEventListener('pointercancel', () => { pointer = null; stage.classList.remove('is-dragging'); });
 applyFilter('inner');
 document.getElementById('gallery-filters').hidden = false;
 document.getElementById('gallery-play').hidden = false;
})();
