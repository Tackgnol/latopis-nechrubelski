Type: research
Status: resolved

## Question

The map plans to sync verse highlighting to one continuous narrated audio file per psalm per language, using the browser-native `<track kind="metadata">` WebVTT text track and `cuechange` events against an `<audio>` element, with per-verse start times authored as `.vtt` cue files checked into the repo.

Is this reliable enough across current browsers (desktop + mobile Safari/Chrome/Firefox) to build on directly, or are there known gaps (e.g. metadata-track `cuechange` firing inconsistently, or not at all, on some engines) that mean the app should instead drive highlighting itself via `timeupdate` + a plain JSON cue array (binary-searching the current verse from `audio.currentTime`)?

Recommend one approach, and if it's the `timeupdate`/JSON-cue fallback, note whether any existing small library already does this well (vs. it being trivial enough to hand-roll — a JSON array of `{ verse, start }` and one comparison loop).

## Answer

Do not use `<track kind="metadata">` + `cuechange`. While the API exists broadly (caniuse shows ~97% support), metadata tracks default to `mode="disabled"` (no events fire until JS sets `mode="hidden"`), and WebKit specifically has documented, version-dependent bugs where `cuechange` on hidden metadata tracks fails to fire or fires with wrong timing on iOS Safari — exactly the audio+metadata+cuechange combination this app would rely on. The de facto community workaround is already to fall back to `timeupdate` polling, so skip the native track API entirely: store per-psalm cues as a plain JSON array (`{ verse, start }`), and on `timeupdate` find the active verse with a trivial linear/binary scan (~6 cues per psalm). No `.vtt` files, no new dependency — hand-rolled comparison logic is simpler than any library's API surface. See `01-research-findings.md` for full sources and citations.
