/* Resonance Music — sharing and independent, moderated song conversations.
   Hakanai public site key (not a password). */
(() => {
  'use strict';
  const HAKANAI_SITE_KEY = '76cc43fe-877b-4cb9-9d66-f59f0c745595';
  const SITE_URL = 'https://cosmicretune.com/';

  async function copyLink(url, feedback) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const field = document.createElement('textarea');
        field.value = url;
        field.setAttribute('readonly', '');
        field.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(field);
        field.select();
        const ok = document.execCommand('copy');
        field.remove();
        if (!ok) throw new Error('Clipboard unavailable');
      }
      feedback.textContent = 'Link copied — ready to share.';
    } catch (_) {
      feedback.textContent = 'Copy this address: ' + url;
    }
  }

  async function share(title, url, feedback) {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    await copyLink(url, feedback);
  }

  function initSiteShare() {
    const button = document.getElementById('share-resonance-site');
    if (!button) return;
    const feedback = document.getElementById('site-share-feedback');
    button.addEventListener('click', () => share('Resonance Music', SITE_URL, feedback));
  }

  function initSongEngagement() {
    const area = document.getElementById('song-engagement');
    if (!area) return;

    const slug = new URLSearchParams(location.search).get('slug');
    // Only show conversations and sharing on real songs.
    const song = (window.RESONANCE_SONGS || []).find(s => s.slug === slug);
    if (!song) return;

    area.hidden = false;
    const url = SITE_URL + 'song.html?slug=' + encodeURIComponent(slug);
    const feedback = document.getElementById('song-share-feedback');
    const title = song.title + ' — Resonance Music';

    document.getElementById('share-this-song').addEventListener('click', () => share(title, url, feedback));
    document.getElementById('copy-song-link').addEventListener('click', () => copyLink(url, feedback));
    document.getElementById('email-song-link').href =
      'mailto:?subject=' + encodeURIComponent(title) +
      '&body=' + encodeURIComponent('I thought you might enjoy this song:\n' + url);

    // Separate comment thread for every song, even though each uses song.html.
    // Stable IDs keep comments attached if a song URL is ever rearranged.
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.hakanai.io/embed.js';
    script.dataset.key = HAKANAI_SITE_KEY;
    script.dataset.pageId = 'resonance-song-' + slug;
    script.dataset.url = url;
    script.dataset.theme = 'dark';
    document.body.appendChild(script);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSiteShare();
    initSongEngagement();
  });
})();
