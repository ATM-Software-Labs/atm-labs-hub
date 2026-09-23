# Your Organization - Ecosystem Hub

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Deployed-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://subdomain.yourdomain.com)
[![Status](https://img.shields.io/badge/Status-Operational-107c41?style=flat-square)](#)
[![Theme](https://img.shields.io/badge/Design_System-Mica_Corporate-0078d4?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

Production Gateway: [subdomain.yourdomain.com](https://subdomain.yourdomain.com)

The central directory and navigation portal for the services, tools, and technical resources deployed across the `yourdomain.com` ecosystem.

---

## Active Subdomain Directory

| Domain | Service | Stack Overview |
| :--- | :--- | :--- |
| `subdomain.yourdomain.com` | Trujillo AI Studio | Multimodal AI assistant on Groq LPU and Cloudflare Workers |
| `subdomain.yourdomain.com` | Rewrite AI | Editorial rewriter and humanizer with Edge streaming |
| `subdomain.yourdomain.com` | FocusGuard | Zero-Trust DNS-over-HTTPS filtering, ad-blocking, and parental controls |
| `your-portfolio.com` | Engineering Portfolio | Personal portfolio, skills showcase, and systems engineering background |
| `subdomain.yourdomain.com` | ATM Technical Guides | In-depth engineering runbooks, mail architectures, and technical docs |
| `subdomain.yourdomain.com` | Ecosystem Hub | Central service directory with client-side search |

---

## System Architecture and Design

- Deployment Platform: Cloudflare Pages running on an anycast edge network.
- Visual Architecture: Obsidian navy background (#080c14) with semi-translucent mica acrylic cards (`rgba(15, 22, 36, 0.78)`), Microsoft technical blue accents (#0078d4), and clear typography using system font stacks.
- Search and Filtering: Pure client-side fuzzy search with zero runtime overhead, instant category filtering, and responsive mobile navigation.
- Reliability: Direct edge delivery with near-zero latency and high uptime.

---

## Repository Structure

```
atm-labs-hub/
├── .github/
│   └── workflows/
│       └── ci.yml       # Asset integrity and build verification
├── public/              # Static web directory deployed to Cloudflare Pages
│   ├── 404.html         # Diagnostic 404 handler matching corporate styling
│   ├── index.html       # Main service directory with client-side search
│   └── styles.css       # Design tokens, acrylic layering, and responsive layout
├── package.json         # Project manifest and deployment scripts
└── wrangler.toml        # Cloudflare Pages deployment configuration
```

---

## Branching Model

- `main`: Production branch. Automatically deployed to `subdomain.yourdomain.com`.
- `develop`: Staging and active integration branch. Used to test directory changes and style tweaks.

---

## Deployment Instructions

To deploy to Cloudflare Pages using Wrangler:

```bash
# Login to Cloudflare if not already authenticated
npx wrangler login

# Deploy current directory directly to Cloudflare Pages
npx wrangler pages deploy . --project-name atm-labs-hub --commit-dirty=true
```

---

## Author

Your Name  
- Website: [your-portfolio.com](https://your-portfolio.com)  
- GitHub: [@your-github-username](https://github.com/your-github-username)

---

## License

Copyright (c) 2026 Your Name. Released under the MIT License.

