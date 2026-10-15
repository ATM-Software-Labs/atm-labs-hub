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

`https://trujillomingorance.com/brand/tokens.css` was not published when this version shipped. The same tokens from the live hub stylesheet are vendored in `public/css/tokens.css`.

`https://trujillomingorance.com/brand/favicon.svg` (and the matching `.ico`, apple-touch, and 192/512 icons) was not published yet. Labs vendors the icons currently served from the apex root.

## Repository

```
public/                 Cloudflare Pages output
  index.html            es
  en/index.html         en
  ca/index.html         ca
  404.html
  css/tokens.css        vendored hub tokens
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
