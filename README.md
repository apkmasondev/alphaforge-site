# AlphaForge website

Source of the project page for [AlphaForge](https://github.com/apkmasondev/AlphaForge) — a free, local
image toolkit for Windows (AI background removal with real alpha, upscale, resize, convert, compress).

**Live:** https://apkmason.dev/alphaforge-site/

Plain HTML, CSS and a little JavaScript — no build step, no frameworks, no cookies, no analytics, no
external fonts. English and Polish (auto-detected, switchable).

Preview locally:

```bash
python -m http.server 8000
```

## Updating for a new release

Search `index.html` for `v1.0.0`, `1.0.0` and `158 MB` (download links, version, size) and replace the
SHA-256 in the *Verify the download* block.

## Credits

* Photos in the screenshots and the demo: public domain (CC0) from Wikimedia Commons — see the credits
  section on the page for links.
* Icons: [Lucide](https://lucide.dev) (ISC); GitHub mark from [Octicons](https://github.com/primer/octicons) (MIT).

Site code: MIT.
