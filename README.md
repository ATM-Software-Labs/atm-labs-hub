# ATM Software Labs — Labs

**Production:** [labs.trujillomingorance.com](https://labs.trujillomingorance.com)

Directory of the services published on `trujillomingorance.com`. The visual system matches the hub at [trujillomingorance.com](https://trujillomingorance.com): permanently dark, Inter and JetBrains Mono, slate surfaces, emerald and cyan accents.

Locales: Spanish at `/` (default), English at `/en/`, Catalan at `/ca/`. The language switcher stores `atm_lang_choice`.

## Pages

| Path | Role |
| --- | --- |
| `/` | Spanish directory |
| `/en/` | English directory |
| `/ca/` | Catalan directory |
| `/api/projects` | Published catalog (Pages Function) |
| `/api/auth/*` | Auth proxy to `ai.trujillomingorance.com` |

Shared tokens are copied from [brand/tokens.css](https://trujillomingorance.com/brand/tokens.css) into `public/css/tokens.css`. Labs keeps short aliases (`--bg`, `--cyan`) on top of the published `--atm-*` names.

The labs mark (white line art, cyan lower A, LABS tag) is copied from [brand/labs](https://trujillomingorance.com/brand/labs/): `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `assets/og.png`, `assets/lockup.svg`, and `assets/banner.png`. Pages reference icons, the header lockup, and the Open Graph image with `?v=20261015d`. The `.ico` link is `/assets/favicon.ico` because the zone cache ignores query strings on `/favicon.ico`. The header still links back to the hub. The cyan hairline and the LABS tag keep this site distinct from the apex.

## Repository

```
public/                 Cloudflare Pages output
  index.html            es
  en/index.html         en
  ca/index.html         ca
  404.html
  css/tokens.css        vendored brand tokens plus labs aliases
  css/labs.css          layout, components, motion
  js/                   directory, language memory, 404
  assets/fonts/         self-hosted Inter and JetBrains Mono (SIL OFL)
functions/              Pages Functions
scripts/build-pages.js  regenerates the locale pages
test/                   node:test
```

## Develop

```bash
npm test
npm run build
```

`main` deploys to [labs.trujillomingorance.com](https://labs.trujillomingorance.com).

## Author

Alberto Trujillo Mingorance · [ATM Software Labs](https://github.com/ATM-Software-Labs) · [LinkedIn](https://www.linkedin.com/in/alberto-trujillo-mingorance-288237266)

Copyright (c) 2026 Alberto Trujillo Mingorance (ATM Software Labs). MIT License.
