# Does Opus-in-Ogg reach every reader?

Research for [#4](https://github.com/Tackgnol/latopis-nechrubelski/issues/4), part of the
narration map [#3](https://github.com/Tackgnol/latopis-nechrubelski/issues/3). Answered
2026-09-20 against primary sources only (WHATWG, WebKit, Chromium, Mozilla, Android,
Go and Caddy source, caniuse's raw feature JSON).

The repo had no research-notes convention before this file. It is placed at
`docs/research/<question>.md`; follow that for the next one.

## Answer in one paragraph

Opus-in-Ogg plays everywhere **except Apple platforms older than spring 2025**. WebKit only
added the **Ogg container** in Safari 18.4 / iOS 18.4 / macOS 15.4, and on macOS it is gated
on the OS, not just the browser version — a Mac on Sonoma running Safari 18.4 still cannot
play it. Every device capped below iOS 18 (iPhone 8, X, and older) is permanently excluded.
That is too big a hole for a reading app, so **ship one universally-safe format instead of
two**: transcode to AAC-LC mono in `.m4a` at upload time and serve only that. It is smaller
than the current Opus files, needs no `<source>` list, no `canPlayType`, no second rsync
tree, and no per-browser branch in the player.

---

## 1. The codec was never the problem; the container was

Opus the codec has been decodable by Safari since Safari 11 / iOS 11 — but only inside a
**CAF** file:

> "Safari supports Opus in the `<audio>` element only when packaged in a CAF file, and only
> on macOS High Sierra (10.13) or iOS 11."
> — [MDN, Web audio codec guide § Opus](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs#opus)

caniuse's raw feature data says the same in its notes:

> `#1`: "Supported only when packaged in a CAF file and on macOS High Sierra/iOS 11 or later
> (constant bit-rate only)."
> `#2`/`#3`: "Supported in a WebM container (all bitrates)."
> — [caniuse-db `features-json/opus.json`](https://github.com/Fyrd/caniuse/blob/main/features-json/opus.json)

So `.opus` (Ogg container, VBR) missed on Safari for two independent reasons: wrong
container, and CAF support was CBR-only.

The container gap closed in Safari 18.4:

> "WebKit for Safari 18.4 rounds out our support for media formats by adding **Ogg container
> support for both Opus and Vorbis audio** on macOS Sequoia 15.4, iOS 18.4, iPadOS 18.4, and
> visionOS 2.4."
> — [WebKit blog, "WebKit in Safari 18.4"](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/)

MDN's container guide carries the same note:

> "Safari 18.4+ (on macOS 15.4+, iOS 18.4+, iPadOS 18.4+, and visionOS 2.4+) added support
> for Opus and Vorbis codecs in Ogg containers."
> — [MDN, Media container formats § Ogg](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers#ogg)

**The macOS gate is the sharp edge.** caniuse marks desktop Safari 18.4–27 as *partial* with
note `#4`: "Partial support refers to requiring macOS 15.4 Sequoia or later"
([opus.json](https://github.com/Fyrd/caniuse/blob/main/features-json/opus.json)). iOS Safari
18.4+ is plain `y` because the OS and the browser ship together there. Desktop Safari is not
self-contained: Apple ships Safari 18.4 to Sonoma and Ventura as well, and those users get a
browser that reports the right version and still cannot decode Ogg. A version sniff on
Safari would be wrong.

MDN's audio-codec page still says "CAF only" for Safari and has not caught up with 18.4; the
WebKit blog and MDN's *container* page are the authorities here.

## 2. Version floors per browser

`audio/ogg; codecs=opus` in `<audio>`:

| Target | Floor | Source |
|---|---|---|
| Safari (iOS/iPadOS) | **18.4** | [WebKit blog 18.4](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/); caniuse `ios_saf` 18.4 = `y` |
| Safari (macOS) | **18.4 *and* macOS 15.4** | same blog post ("on macOS Sequoia 15.4"); caniuse `safari` 18.4+ = `a #4` |
| Firefox (desktop) | **15** | ["Native support for the Opus audio codec added"](http://website-archive.mozilla.org/www.mozilla.org/firefox_releasenotes/en-US/firefox/15.0/releasenotes/) — Firefox 15.0 release notes |
| Firefox (Android) | supported | caniuse `and_ff` = `y` |
| Chrome (desktop) | **33** | caniuse `chrome`: `n` through 32, `y` from 33 |
| Chrome (Android) | supported | caniuse `and_chr` = `y` |
| Edge | **14** (and all Chromium Edge, 79+) | caniuse `edge`: `n` for 12–13, `y` from 14 |
| Android WebView | **Android 5.0** | [Android supported media formats](https://developer.android.com/media/platform/supported-formats) — Opus decoder "Android 5.0+", container "Ogg (.ogg)" |

Chromium's own MIME registry confirms the current Blink behaviour, and shows there is no
Android-specific gate on Opus (only VP8 is probed against the platform decoder):

> `AddContainerWithCodecs("audio/ogg", ogg_audio_codecs);` where `ogg_audio_codecs` is
> `{FLAC, OPUS, VORBIS}`
> — [`media/base/mime_util_internal.cc`](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/media/base/mime_util_internal.cc)

So: Firefox, Chrome, Edge and Android are all fine and have been for a decade. Apple is the
whole question.

## 3. The fallback, and why it is a *replacement* rather than a fallback

Three options were on the table.

### (a) Two `<source>` children on one `<audio>`

Mechanically sound. The HTML spec's resource selection algorithm does exactly what you want:

> "If candidate has a `type` attribute whose value, when parsed as a MIME type (including any
> codecs described by the `codecs` parameter, for types that define that parameter),
> represents a type that the user agent knows it cannot render, then end the synchronous
> section, and jump down to the failed with elements step below."
> — [WHATWG HTML, media load algorithm](https://html.spec.whatwg.org/multipage/media.html#concept-media-load-algorithm)

The element then continues through the remaining `<source>` children in tree order, so no JS
is needed. But it does not save any work: to have a second format at all you must transcode
all 149 files anyway. You then keep *two* trees on the VM, rsync both, and re-upload both
every time a verse is re-recorded. The only thing you buy is bandwidth for modern
browsers — and see below, the fallback format is *smaller* than the Opus originals, so there
is no bandwidth to buy.

### (b) One universally-safe format — **chosen**

AAC-LC in `.m4a`. MP4 with AAC is the one combination no current target refuses
([MDN, MP4 container](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers#mpeg-4_mp4);
[MDN, AAC](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs#aac_advanced_audio_coding)).
Safari has supported it since 3.1, iOS since day one, Android since 3.0.

One caveat, from the primary source, worth writing down rather than discovering later:

> "Due to patent issues, Firefox does not directly support AAC. Instead, Firefox relies upon
> a platform's native support for AAC."
> — [MDN § AAC](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs#aac_advanced_audio_coding)

In practice that means Windows, macOS and Android decode it via the OS, and desktop Linux
Firefox needs system FFmpeg — which every mainstream distro ships. This is a far narrower
hole than "every iPhone older than 2025", and it is the same hole every podcast site lives
with.

### (c) Transcode to CAF

Rejected. It only helps Safari 11–18.3, requires constant-bitrate Opus (caniuse note `#1`),
needs a second tree *and* a Safari-specific selection step, and `audio/x-caf` is exactly the
Apple-only special case this ticket exists to stop repeating.

### Verdict

**(b), by a distance.** Fewest moving parts for a hand-run rsync of static files: one tree,
one extension, one URL per verse, one `src` attribute. (a) is (b) plus a second tree and a
second rsync for no gain; (c) is (a) with a worse second format.

## 4. Implementation notes

**`<source type>` selection needs no JS.** Per the WHATWG algorithm quoted above, the UA
skips a `<source>` whose `type` it knows it cannot render and walks on to the next. It is
reliable. It just stops being necessary once there is only one format.

**Do not lean on `canPlayType`.** Its contract is deliberately vague:

> `""` — "The media cannot be played on the current device."
> `"probably"` — "The media is probably playable on this device."
> `"maybe"` — "There is not enough information to determine whether the media can play
> (until playback is actually attempted)."
> — [MDN, `HTMLMediaElement.canPlayType()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canPlayType)

A `"maybe"` is not a yes, and a browser that answers `""` for `audio/ogg; codecs=opus` today
is the pre-18.4 Safari we are designing around. Feature-detecting it is strictly worse than
not needing to. *Not verified on a physical device in this session:* the exact string
pre-18.4 Safari returns for `audio/ogg`. The recommendation does not depend on it, since we
stop shipping Ogg.

**Content-Type is a real trap, and it is worse than expected.** Caddy's file server does not
sniff:

> "It does not perform MIME sniffing to determine Content-Type based on contents, but does
> use the extension (if known)"
>
> ```go
> if respHeader.Get("Content-Type") == "" {
>     mtyp := mime.TypeByExtension(filepath.Ext(filename))
>     if mtyp == "" {
>         // do not allow Go to sniff the content-type
>         respHeader["Content-Type"] = nil
> ```
> — [`modules/caddyhttp/fileserver/staticfiles.go`](https://github.com/caddyserver/caddy/blob/master/modules/caddyhttp/fileserver/staticfiles.go)

If Go's table has no entry, Caddy sends **no `Content-Type` header at all**. And Go's builtin
table only learned `.opus` very recently: `go1.25.0`'s `builtinTypesLower` is 16 entries and
contains no audio types whatsoever; `.opus` → `audio/ogg`, `.ogg`, `.oga`, `.m4a` →
`audio/mp4` and `.mp3` first appear in the expanded table that landed in
[CL 614376, merged 2025-09-30](https://github.com/golang/go/commits/master/src/mime/type.go)
and ships from **Go 1.26** ([`src/mime/type.go`](https://github.com/golang/go/blob/master/src/mime/type.go),
verified against the `go1.19`…`go1.27.0` tags).

Below Go 1.26 the type comes only from the host's MIME database, which Go reads from
`/usr/local/share/mime/globs2`, `/usr/share/mime/globs2`, `/etc/mime.types`,
`/etc/apache2/mime.types`, `/etc/apache/mime.types`, `/etc/httpd/conf/mime.types`
([`src/mime/type.go` doc comment](https://github.com/golang/go/blob/master/src/mime/type.go)).
On a normal Debian/Ubuntu host with `shared-mime-info` that works; on a stripped image it
silently does not.

This matters most for Safari, because Apple's decoder is fed the HTTP MIME type directly and
does not guess:

> "The AVURLAssetReader required being provided with the mimetype as AVF doesn't do any
> sniffing."
> — [WebKit commit 314462@main](https://commits.webkit.org/314462@main)

**So set the header explicitly in the Caddyfile rather than trusting the host.** One line in
the audio route:

```caddyfile
header Content-Type "audio/mp4"
```

(`audio/mp4` is the correct type for AAC in `.m4a`; it is what Go 1.26+ maps `.m4a` to.)

## 5. The actual files

Measured on 2026-09-20 in `Psalmy/` (gitignored) with `ffprobe` from ffmpeg, plus a
byte-level check of the first four bytes of every file.

- **149 files, all genuinely Ogg.** Every one begins `4f 67 67 53` (`OggS`) followed by
  `OpusHead`; zero exceptions. `ffprobe` reports `format_name=ogg`,
  `codec_name=opus`, `codec_long_name=Opus (Opus Interactive Audio Codec)`,
  48000 Hz, 2 channels, ~124 kbps, `TAG:encoder=Lavc58.134.100 libopus`.
- **Total: 21,784,617 bytes (20.8 MiB).**
- Per file: min 39,131 B, median 130,550 B, mean 146,205 B, max 448,362 B.
- **Total duration: 1,343.3 s (22 min 23 s).** Per verse: min 2.4 s, mean 9.0 s, max 26.9 s.
- Per variant (what one reader actually downloads for a whole read-through):
  A 4.54 MB / 36 files, B 4.73 MB / 36, C 6.03 MB / 36, D 4.66 MB / 36. The remaining 5 files
  are `Psalmy/Psalm 7/` (7:7 in A, B, C, D and `A (alt)`), which sit directly in the psalm
  folder rather than under a `Wariant X` subfolder — the upload script must handle that shape.

**Bandwidth after transcoding.** 1,343 s of speech at AAC-LC **64 kbps mono** is ~10.7 MB for
all four variants, ~2.7 MB per variant — roughly **half** the current Opus footprint, because
the sources are 124 kbps *stereo* for what is mono spoken word. Even at 96 kbps the full set
is ~16 MB. Shipping AAC costs nothing in bytes; it saves them.

## 6. What this means for the build

- **Upload script:** one `ffmpeg -i "$f" -vn -ac 1 -c:a aac -b:a 64k` per file into the
  normalised output name, then rsync one tree of `.m4a`. Still one tree, still one rsync.
  Re-recording a verse re-transcodes and re-uploads exactly that one file.
- **Player:** `<audio src="…/<verse>.m4a">`. No `<source>` children, no `canPlayType`, no
  format branch, no Safari special case. The existing atom
  (`frontend/app/components/atoms/AudioPlayer/AudioPlayer.tsx`) already takes a single `src`.
- **Caddy:** the audio route sets `header Content-Type "audio/mp4"` so nothing depends on the
  host's MIME database or on which Go version built the Caddy binary.
- **Keep the `.opus` originals as the masters.** They are the recording source; only the
  served tree is AAC.

## Sources

- [WHATWG HTML — media element load algorithm](https://html.spec.whatwg.org/multipage/media.html#concept-media-load-algorithm)
- [WebKit — WebKit in Safari 18.4](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/)
- [WebKit — commit 314462@main (AVFoundation MIME handling for Ogg)](https://commits.webkit.org/314462@main)
- [Chromium — `media/base/mime_util_internal.cc`](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/media/base/mime_util_internal.cc)
- [Mozilla — Firefox 15.0 release notes](http://website-archive.mozilla.org/www.mozilla.org/firefox_releasenotes/en-US/firefox/15.0/releasenotes/)
- [MDN — Media container formats](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers)
- [MDN — Web audio codec guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs)
- [MDN — `HTMLMediaElement.canPlayType()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canPlayType)
- [Android — Supported media formats](https://developer.android.com/media/platform/supported-formats)
- [caniuse-db — `features-json/opus.json`](https://github.com/Fyrd/caniuse/blob/main/features-json/opus.json)
- [Caddy — `modules/caddyhttp/fileserver/staticfiles.go`](https://github.com/caddyserver/caddy/blob/master/modules/caddyhttp/fileserver/staticfiles.go)
- [Go — `src/mime/type.go`](https://github.com/golang/go/blob/master/src/mime/type.go) and its commit history
