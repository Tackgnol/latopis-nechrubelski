# Research: WebVTT metadata-track `cuechange` vs manual `timeupdate` for verse highlighting

## Question

See `01-webvtt-highlight-feasibility.md`. Is `<track kind="metadata">` + `cuechange`
on an `<audio>` element reliable enough across current desktop/mobile Chrome,
Firefox, Safari to build verse-highlight sync on directly, or should the app
drive highlighting itself via `timeupdate` + a plain JSON cue array?

## What the spec says

- `<track>` is valid as a child of both `<audio>` and `<video>`; `kind="metadata"`
  is a normal enumerated value (also the fallback for any invalid `kind`).
  ([MDN: `<track>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track),
  [MDN: `HTMLTrackElement.kind`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTrackElement/kind))
- `TextTrack.mode` defaults to **`disabled`** unless the track has the `default`
  attribute. In `disabled` mode the user agent doesn't even parse cues and
  **`cuechange` never fires**. It must be set to `hidden` (or `showing`) in JS
  for cues to become active and events to fire — a very common source of
  "cuechange doesn't fire" bug reports that are actually just this default.
  ([MDN: `TextTrack.mode`](https://developer.mozilla.org/en-US/docs/Web/API/TextTrack/mode))
- `cuechange` fires on both the `TextTrack` and the `HTMLTrackElement` when the
  track is attached via `<track>` inside `<audio>`/`<video>`.
  ([MDN: `HTMLTrackElement: cuechange event`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTrackElement/cuechange_event))

## Baseline compatibility numbers

- caniuse (`mdn-api_texttrack_cuechange_event`): global support ~97%, listed as
  supported since Chrome 23, Firefox 31, Safari 6 (desktop) / Safari iOS 7,
  Chrome Android current. MDN separately marks the event "Widely available"
  / baseline since ~July 2019. ([caniuse](https://caniuse.com/mdn-api_texttrack_cuechange_event),
  [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTrackElement/cuechange_event))
- On paper this reads as "safe to use everywhere." In practice this number
  reflects the *API existing*, not the event *firing reliably* for the
  `audio` + `metadata` + locally-authored-VTT combination we'd actually use —
  see below.

## Known real-world reliability problems (the part caniuse doesn't capture)

1. **Metadata-track mode gotcha (all browsers).** Because `mode` defaults to
   `disabled`, any implementation that just appends a `<track kind="metadata">`
   and listens for `cuechange` without explicitly setting
   `track.mode = 'hidden'` will silently get nothing, on every engine. This is
   the single most common cause of "cuechange doesn't fire" reports across
   video.js issues. ([video.js #6196](https://github.com/videojs/video.js/issues/6196),
   [MDN mode docs](https://developer.mozilla.org/en-US/docs/Web/API/TextTrack/mode))
   This is a footgun, not a browser bug — it's avoidable by remembering one
   line of setup — but it's exactly the kind of subtlety that makes "just use
   the native track API" less of a free lunch than it looks.

2. **Safari/WebKit-specific instability, `<audio>` in particular.**
   - A video.js issue reports that in Safari, `player.textTracks()` returns a
     *native* `TextTrack` object (unlike other browsers' wrapped objects) and
     event listeners could not be attached to its `cuechange` event in the
     way the library expected.
     ([videojs/video.js#7417](https://github.com/videojs/video.js/issues/7417))
   - Apple Developer Forum reports describe `cuechange` simply **not firing**
     on specific iPhone/iOS versions (e.g. iPhone 13 Pro on iOS 15.4–15.5)
     for a hidden metadata track wired up exactly the way the spec describes,
     while the same code worked on other iPhone models — i.e. a
     device/OS-version-dependent WebKit regression, not a coding mistake.
     ([Apple Developer Forums #704536](https://developer.apple.com/forums/thread/704536))
   - Another Apple Developer Forum report describes `cuechange` firing but
     with **incorrect timing** ("triggers before time") for metadata tracks
     on iOS 11.3, when compared to the same cue times processed by JS-side
     text-track emulation. ([Apple Developer Forums #108954](https://developer.apple.com/forums/thread/108954))
   - Android WebView has an analogous bug: a `metadata` track set to `hidden`
     fails to fire `cuechange` in WebView while working in Chrome proper —
     showing this class of bug isn't unique to WebKit.
     ([videojs/video.js#6196](https://github.com/videojs/video.js/issues/6196),
     [googleads/videojs-ima#817](https://github.com/googleads/videojs-ima/issues/817))

3. **Community-standard workaround.** Multiple sources independently converge
   on the same mitigation: pair (or replace) `cuechange` listeners with a
   manual check of `track.activeCues` (or, more simply, current time vs. cue
   times) driven by the media element's `timeupdate` event, precisely because
   native `cuechange` firing cannot be trusted across engines/devices. This is
   the de facto standard cross-browser pattern, not a niche hack.

## Assessment for this app

The reported failures cluster almost exactly around our use case: a
*metadata*-kind track (not subtitles/captions), *hidden* mode, listened to via
`cuechange`, with WebKit as the weak link — including reports that isolate the
bug to specific iOS versions/devices rather than one-off misconfiguration.
Given:

- The app targets exactly the fragile combination (audio + metadata + cuechange).
- Verse-highlight sync is a user-visible correctness feature (wrong/missing
  highlight looks broken), not a nice-to-have that can silently degrade.
- Only iOS Safari is even a plausible target for "native app-like" playback
  polish here, and it's the engine with the most-documented problems.
- There are only ~6 cues (verses) per psalm — trivially small data.

...the WebVTT/`cuechange` route buys nothing (no built-in UI, no accessibility
benefit here since verses aren't user-facing captions) while inheriting a
real, currently-still-open-ended cross-browser reliability risk.

## Recommendation

**Option (b): don't use `<track>`/`cuechange` at all.** Drive highlighting
manually:

- Store cues as a plain JSON array per psalm/language, e.g.
  `[{ verse: 1, start: 0 }, { verse: 2, start: 12.4 }, ...]`.
- On the audio element's `timeupdate` event, find the last cue whose `start`
  is `<= audio.currentTime` and highlight that verse. With ~6 cues a linear
  scan from the end (or a simple binary search) is more than fast enough —
  `timeupdate` fires at most a few times a second, so there's no perf
  concern either way.
- No new dependency: this is control-flow anyone on the team can read in one
  pass, and pulling in a cue-timeline library (e.g. video.js's TextTrack
  polyfill machinery) to avoid ~10 lines of comparison logic would be pure
  overhead — it exists to paper over exactly the native inconsistencies we're
  choosing to sidestep by not using the native API in the first place.
- This also avoids needing to author/maintain `.vtt` cue *files* — the JSON
  array can live next to (or be generated from) whatever timing metadata the
  narration pipeline already produces, and is trivial to hand-edit.

No existing small library is worth adding for this — the comparison logic is
simpler than the API surface of any library that would provide it.

## Sources

- [MDN: `<track>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track)
- [MDN: `HTMLTrackElement.kind`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTrackElement/kind)
- [MDN: `TextTrack.mode`](https://developer.mozilla.org/en-US/docs/Web/API/TextTrack/mode)
- [MDN: `HTMLTrackElement: cuechange event`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTrackElement/cuechange_event)
- [MDN: `TextTrack: cuechange event`](https://developer.mozilla.org/en-US/docs/Web/API/TextTrack/cuechange_event)
- [caniuse: TextTrack `cuechange` event](https://caniuse.com/mdn-api_texttrack_cuechange_event)
- [video.js #6196 — hidden metadata track cuechange not firing on Android WebView](https://github.com/videojs/video.js/issues/6196)
- [googleads/videojs-ima #817 — same issue, IMA SDK context](https://github.com/googleads/videojs-ima/issues/817)
- [video.js #7417 — Safari returns a different TextTrack object type, listener attach issues](https://github.com/videojs/video.js/issues/7417)
- [Apple Developer Forums #704536 — cuechange stops firing on iPhone 13 Pro / iOS 15.4–15.5](https://developer.apple.com/forums/thread/704536)
- [Apple Developer Forums #108954 — cuechange fires early for metadata tracks on iOS 11.3](https://developer.apple.com/forums/thread/108954)
