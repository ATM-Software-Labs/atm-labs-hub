# ATM Software Labs - Ecosystem Hub

Production Gateway: [labs.trujillomingorance.com](https://labs.trujillomingorance.com)

The central directory and navigation portal for the services, tools, and technical resources deployed across the trujillomingorance.com ecosystem.

---

## Active Subdomain Directory

| Domain | Service | Stack Overview |
| :--- | :--- | :--- |
| [ai.trujillomingorance.com](https://ai.trujillomingorance.com) | Trujillo AI Studio | Multimodal AI assistant on Groq LPU and Cloudflare Workers |
| [rewrite.trujillomingorance.com](https://rewrite.trujillomingorance.com) | Rewrite AI | Editorial rewriter and humanizer with Edge streaming |
| [focusguard.trujillomingorance.com](https://focusguard.trujillomingorance.com) | FocusGuard | Zero-Trust DNS-over-HTTPS filtering, ad-blocking, and parental controls |
| [trujillomingorance.com](https://trujillomingorance.com) | Engineering Portfolio | Personal portfolio, skills showcase, and systems engineering background |
| [guides.trujillomingorance.com](https://guides.trujillomingorance.com) | ATM Technical Guides | In-depth engineering runbooks, mail architectures, and technical docs |
| [labs.trujillomingorance.com](https://labs.trujillomingorance.com) | Ecosystem Hub | Central service directory with client-side search |

---

## System Architecture and Design

- Deployment Platform: Cloudflare Pages running on an anycast edge network.
- Visual Architecture: Obsidian navy background (#080c14) with semi-translucent mica acrylic cards (rgba(15, 22, 36, 0.78)), Microsoft technical blue accents (#0078d4), and clear typography using system font stacks.
- Search and Filtering: Pure client-side fuzzy search with zero runtime overhead, instant category filtering, and responsive mobile navigation.
- Reliability: Direct edge delivery with near-zero latency and high uptime.

---

## Repository Structure

atm-labs-hub/
├── .github/
│   └── workflows/
│       └── ci.yml        # Asset integrity and build verification
├── public/               # Static web directory deployed to Cloudflare Pages
│   ├── 404.html          # Diagnostic 404 handler matching corporate styling
│   ├── index.html        # Main service directory with client-side search
│   └── styles.css        # Design tokens, acrylic layering, and responsive layout
├── package.json          # Project manifest and deployment scripts
└── wrangler.toml         # Cloudflare Pages deployment configuration

---

## Branching Model

- main: Production branch. Automatically deployed to [labs.trujillomingorance.com](https://labs.trujillomingorance.com).
- develop: Staging and active integration branch. Used to test directory changes and style tweaks.

---

## Deployment Instructions

To deploy to Cloudflare Pages using Wrangler:

1. Authenticate with Cloudflare:
   npx wrangler login

2. Deploy the public directory directly to Cloudflare Pages:
   npx wrangler pages deploy public --project-name atm-labs-hub --commit-dirty=true

---

## Author & Organization

- Organization: ATM Software Labs
- GitHub Org: [github.com/atm-software-labs](https://github.com/atm-software-labs)
- LinkedIn Org: [company/atm-software-labs](https://www.linkedin.com/company/atm-software-labs)
- Author: Alberto Trujillo Mingorance
- Personal Website: [trujillomingorance.com](https://trujillomingorance.com)
- Personal GitHub: [@trujillomingorance](https://github.com/trujillomingorance)

---

## License

Copyright (c) 2026 Alberto Trujillo Mingorance (ATM Software Labs). Released under the [MIT License](./LICENSE).
