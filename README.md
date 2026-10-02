<p align="left"><img src="assets/wordmark-on-dark.svg#gh-dark-mode-only" width="100%" alt="Gonzalo Méndez" /><img src="assets/wordmark-on-light.svg#gh-light-mode-only" width="100%" alt="" /></p>

<p align="left"><samp>AI SYSTEMS &amp; TRUST BOUNDARIES &nbsp;·&nbsp; MONTEVIDEO, UY &nbsp;·&nbsp; <a href="https://gonzalomendez.vercel.app/">SITE</a> &nbsp;·&nbsp; <a href="https://www.linkedin.com/in/gonzalomendezdev">LINKEDIN</a> &nbsp;·&nbsp; <a href="mailto:gonzalomendezdev@gmail.com">EMAIL</a></samp></p>

---

Gonzalo Méndez is a full-stack developer in Montevideo, Uruguay. His work keeps landing on the same problem: **data crossing a boundary it shouldn't.** [Oclushion](https://github.com/coweringg/Oclushion) sanitizes prompts and repository context locally — PII, secrets, API keys, payment data — before any external model sees them. [LawCaseAI](https://github.com/coweringg/LawCaseAI) accepts a payment only after the webhook signature verifies.

Currently building **Oclushion**, an AI-native desktop IDE, and the Sano Shield privacy layer inside it.

## Selected work

### [Oclushion](https://github.com/coweringg/Oclushion) — AI-native desktop IDE

A Tauri desktop shell over a pnpm/Turborepo monorepo: 12 packages, a control API, a public web surface, and an optional browser companion.

The interesting part is the trust model. **Sano Shield** runs a local sanitization-and-restoration pipeline over prompts and repo context, so nothing sensitive reaches an external provider. AI-written code and shell commands land in **Safe Diff quarantine** and cannot touch the workspace until a human approves them. Marketplace artifacts are rejected unless they match the SHA-256 declared by the remote catalog. Updater signing keypairs are generated per release — nothing ships under a placeholder key.

Local topology is real infrastructure, not mocks: PostgreSQL, Redis, a Python PII service, the shield proxy, and the structured-data gateway, all under Docker Compose. `SECURITY.md`, gitleaks, Renovate, Playwright, and a `typecheck / lint / test / build` gate.

```bash
pnpm install && docker compose up -d && pnpm dev
```

### [LawCaseAI](https://github.com/coweringg/LawCaseAI) — AI-assisted legal document review

Next.js 16 · React 19 · Express · MongoDB. [Live demo](https://lawcaseai-gamma.vercel.app/).

Case chat is grounded in whatever the matter actually contains — PDFs, transcripts, audio, video on Cloudflare R2 — with per-organization AI cost telemetry so spend is attributable. Multi-tenant organizations with seat-based licensing and Admin/Member/Viewer roles. Paddle webhooks are processed **only** on SDK signature verification, payloads are sanitized against NoSQL injection and XSS, and Helmet sets a real CSP.

### [portfolio](https://github.com/coweringg/portfolio) — personal site

Vite + TypeScript. The site this README links to: [gonzalomendez.vercel.app](https://gonzalomendez.vercel.app/).

## Recently

<!-- feed:start -->

- [Oclushion](https://github.com/coweringg/Oclushion) · TypeScript — 2026-07-28
- [LawCaseAI](https://github.com/coweringg/LawCaseAI) · TypeScript — 2026-05-20
- [portfolio](https://github.com/coweringg/portfolio) · TypeScript — 2026-05-17
<!-- feed:end -->

## Stack

<samp>TypeScript · React · Next.js · Node.js · Express · Java · Tauri · Turborepo · PostgreSQL · MongoDB · MySQL · Docker · Playwright</samp>

<details>
<summary>Everything else</summary>

**Interface** Tailwind CSS · TanStack Query · Framer Motion · Vite

**Data** Mongoose · Redis · OpenRouter · Zod

**Security** JWT · Helmet · gitleaks · rate limiting · CSP · payload sanitization · SHA-256 integrity · signed updaters

**Platform** Docker Compose · Vercel · Render · Cloudflare R2 · Paddle · Tauri updater

**Practice** REST API design · Git · GitHub Actions · Renovate · Postman · Figma · Jira · Scrum

</details>

---

<sub>Every repository, release, and merged pull request above is fetched from the GitHub API by
<a href="https://github.com/coweringg/coweringg/blob/main/.github/workflows/build-readme.yml">a scheduled workflow</a>
— not typed by hand. <a href="mailto:gonzalomendezdev@gmail.com">gonzalomendezdev@gmail.com</a></sub>