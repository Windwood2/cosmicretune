# Resonance Music Website — Version 2 (Simple Plug-and-Play)

This is the simplified restart version.

## WHAT THIS VERSION DOES

- Gives you a complete working website immediately
- Includes starter artwork already built into the site
- Uses ONE reusable song page template (`song.html`)
- Lets you paste lyrics as plain text
- Lets you add MP3 and MP4 files by dropping them into folders
- Keeps editing small and manageable

## FIRST LAUNCH

1. Unzip the folder anywhere you want
2. Double-click `START_SITE.bat`
3. A black window opens
4. Open this in your browser:

`http://localhost:8000`

Leave the black window open while you use the site.

## FOLDER MAP

- `index.html` = home page
- `songs.html` = all songs list
- `song.html` = reusable song-page template
- `philosophy.html` = philosophy page
- `about.html` = about page
- `visuals.html` = artwork page
- `js/songs.js` = master song list
- `data/lyrics/` = all lyric text files
- `media/audio/` = MP3 files
- `media/video/` = MP4 files
- `assets/art/` = artwork images

## HOW TO ADD A NEW SONG

You only need to do 4 things.

### 1) Add the song to `js/songs.js`

Open `js/songs.js` in Notepad++ or VS Code.
Copy one song block and change the text.

Example:

```js
{
  slug: 'my-new-song',
  title: 'My New Song',
  short: 'A short line under the title',
  description: 'One paragraph about the song.',
  status: 'Ready for your media files',
  quote: 'A strong line from the lyric'
}
```

The **slug** is important.
Use lowercase letters and hyphens only.

Example slug:

`my-new-song`

### 2) Add the MP3

Put your audio file here:

`media/audio/my-new-song.mp3`

The filename must match the slug exactly.

### 3) Add the lyrics

Create this file:

`data/lyrics/my-new-song.txt`

Paste the lyrics in as normal text.
No `\n` codes.
No special formatting required.

### 4) Optional video

If you have a video, put it here:

`media/video/my-new-song.mp4`

Again, the filename must match the slug.

### 5) Refresh the site

In your browser press:

`Ctrl + F5`

That forces a fresh reload.

## HOW SONG PAGES WORK

Each song opens through this format:

`http://localhost:8000/song.html?slug=the-deep-bend`

So you do NOT create a new HTML page for every song.
You just add the song to `songs.js`, add the files, and the reusable template handles the rest.

## HOW TO CHANGE TEXT PAGES

You can directly edit:

- `index.html`
- `philosophy.html`
- `about.html`
- `visuals.html`

If you only want to change wording, open the file in Notepad++ and edit the visible text.

## INCLUDED ARTWORK

Already included inside `assets/art/`:

- `earth-hero.png`
- `listening-room.png`
- `cosmic-mind.png`
- `resonance-field.png`

You can keep them, replace them, or add more later.

## IF A SONG DOESN'T SHOW AUDIO OR VIDEO

Check these things:

- Does the filename exactly match the slug?
- Is the audio file in `media/audio`?
- Is the video file in `media/video`?
- Did you press `Ctrl + F5`?

## IF THE SITE DOESN'T OPEN

Make sure Python is installed.
Then double-click `START_SITE.bat` again.
Or run this in a command window from the site folder:

`python -m http.server 8000`

Then open:

`http://localhost:8000`

## THE WHOLE POINT OF VERSION 2

This version is meant to reduce overwhelm.
You should NOT have to edit dozens of pages.
You should NOT have to write code just to add lyrics.
You should mostly be able to:

- make music
- drop files in folders
- refresh the browser

