# Brand fonts

Self-hosted so the system works offline, in exports, and without flagging
"missing brand fonts." `colors_and_type.css` declares the `@font-face` rules;
these files back them. All free / open-license.

## Active faces (the four assigned slots)

| File | Family | Slot / role | Source | License |
|---|---|---|---|---|
| `Michroma-Regular.woff2` | Michroma | **main** — body / UI / headings (`--font-sans`) | Google Fonts | SIL OFL 1.1 |
| `Orbitron-VF.woff2` | Orbitron (variable) | **display** — wordmark, heroes (`--font-mono-display`) | Google Fonts | SIL OFL 1.1 |
| `Syne-VF.woff2` | Syne (variable) | **code / labels** (`--font-code`) | Google Fonts | SIL OFL 1.1 |
| `MonaspaceXenon-Regular/Bold.woff` | Monaspace Xenon | **serif / long-form** slot (slab mono) (`--font-serif`) | githubnext/monaspace `v1.101` | SIL OFL 1.1 |

> Note: Michroma is a single weight (no bold), Syne is proportional (not
> monospace), and the serif slot is a slab-*mono*. Chosen for a sci-fi /
> retro-OS look over long-form readability — fine for short artifacts.

## Kept as fallbacks / quick revert

These backed the previous default set and stay self-hosted so reverting is a
one-line token change in `colors_and_type.css`:

| File | Family | Source | License |
|---|---|---|---|
| `Recursive-VF.woff2` | Recursive (variable, weights 300–1000 + `slnt`/`CASL`/`MONO` axes) | Google Fonts | SIL OFL 1.1 |
| `IBMPlexSerif-400/500/600/700.woff2` | IBM Plex Serif | Google Fonts | SIL OFL 1.1 |
| `CommitMono-400/700.woff2` | Commit Mono | Fontsource (`@fontsource/commit-mono@5.2.5`) | free to use (see commitmono.com) |

All files are the **latin** subset.

## Re-downloading

If a file is ever lost, the exact upstream URLs are:

For the Google-hosted faces, resolve the `/* latin */` woff2 from the returned CSS:

```
Michroma:              https://fonts.googleapis.com/css2?family=Michroma&display=swap
Orbitron (latin VF):   https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap
Syne (latin VF):       https://fonts.googleapis.com/css2?family=Syne:wght@400..800&display=swap
Recursive (latin VF):  https://fonts.googleapis.com/css2?family=Recursive:slnt,wght,CASL,MONO@-15..0,400..900,0..1,0..1&display=swap
IBM Plex Serif:        https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;500;600;700&display=swap
Commit Mono 400/700:   https://cdn.jsdelivr.net/npm/@fontsource/commit-mono@5.2.5/files/commit-mono-latin-{400,700}-normal.woff2
Monaspace Xenon R/B:   https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.101/fonts/webfonts/MonaspaceXenon-{Regular,Bold}.woff
```

## Note on the specimen pages

`ui_kits/bli/fonts.html` and `fonts-v2.html` are exploration pages that reference
several *other* mono fonts (Iosevka, Cascadia, Departure Mono, the other Monaspace
faces). Those are not brand fonts and aren't shipped here — the pages fall back to
system mono for them. Only the four families above are part of the system.
