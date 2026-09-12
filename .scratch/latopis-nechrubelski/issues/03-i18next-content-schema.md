Type: grilling
Status: resolved

## Question

Psalm text currently lives as a single embedded plain-text blob (`<script type="text/plain" id="latopis">` in `PoC.html`), parsed at runtime by a bespoke regex parser (`parseLatopis`) into `{ cover, psalms: [{ num, label, verses: [{ n, t }] }] }`.

The map commits to authoring verse text as typed i18next resources instead (build-time-complete per locale, no runtime missing-translation UI). Decide:

- The concrete i18next namespace/key shape for psalm content (e.g. one `psalms` namespace keyed by `psalm.<romanOrArabicNum>.verse.<n>`, vs. a structured array/object per psalm) — pick whichever plays well with i18next's typed-keys tooling.
- How the Roman-numeral psalm numbering (`I`–`VII`) in the source text maps to the Arabic numbering used in the `?psalm=4` deep link and in routes like `/pl/psalm/4`.
- How Psalm VII's unusual verse numbering (`7:7`, not `7:1`) is represented so it doesn't need special-casing throughout the codebase.
- Where the cover/title block (`Latopis Nechrubelski`, `Pisma Nienazwane`, etc.) and per-psalm labels (e.g. "PSALM VII KOŃCZĄCY") live in the same schema.
- A one-time migration note: the existing Polish text should be transcribed into the new schema once, then the old regex parser and the "paste text" UI (`#btnPaste`/`#panel`) can be dropped since content is no longer runtime-editable.

## Answer

- **Verse shape**: each psalm's verses are a map keyed by verse-number-string (`{"1": "...", ..., "6": "..."}`), not a 0-indexed array. Psalm VII's map has exactly one key, `"7"` — this is what makes its `7:7` numbering fall out for free, no special-casing needed anywhere a verse is picked or rendered. A roll (or the "Reveal the End" action) just selects among whichever keys exist for that psalm.
- **Numbering**: the canonical id everywhere in code/routes/content (`?psalm=4`, `/psalm/4`, resource keys) is the Arabic numeral, 1-7. The Roman numeral shown in the UI (`I`-`VII`) is **not** stored in content at all — it's locale-independent, so it's a tiny static frontend lookup array/formatter (`["I","II","III","IV","V","VI","VII"]`), applied purely at display time.
- **Cover/labels**: one `psalms` i18next namespace/resource holds everything. Cover/title block lives as flat keys (`cover.title`, `cover.subtitle`, etc.) sibling to the `psalms` map; each psalm object carries its own `label` field (e.g. "PSALM VII KOŃCZĄCY").
- **Typed completeness**: each locale's resource module is typed against a TS type inferred from the Polish (default) resource (e.g. `type PsalmsResource = typeof pl; const en: PsalmsResource = enResource`), so a partial or missing translation is a compile error, not a runtime fallback.
- **Migration**: one-time hand-transcription of `PoC.html`'s embedded Polish text into this resource shape, done in the same change that deletes `parseLatopis`, the `<script type="text/plain" id="latopis">` blob, and the `#btnPaste`/`#panel` runtime-paste UI — no transitional period where both old and new content paths coexist.
