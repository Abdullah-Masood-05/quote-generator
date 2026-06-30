<p align="center">
  <img src="public/logo.svg" alt="Feelings Quote Generator" width="116" height="116" />
</p>

<h1 align="center">Feelings Quote Generator</h1>

<p align="center">
  Turn your feelings into share-ready quotes for <b>WhatsApp Status</b> &amp; <b>Instagram Stories</b>.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-1.x-000000?logo=bun&logoColor=white" />
  <img alt="Quotes by Groq" src="https://img.shields.io/badge/Quotes%20by-Groq-F55036" />
</p>

Describe how you're feeling and get short, share-ready quotes for your
**WhatsApp Status** and **Instagram Stories** — with one-tap copy, a downloadable
story image (1080×1920), and a WhatsApp share link.

Built with **Next.js 16** + **React 19**, running on **Bun**. Quotes come from a
separate [`vibequotes-api`](https://github.com/Abdullah-Masood-05/vibequotes-api)
service powered by Groq.

```
AI-App/
├── vibequotes/       ← this app (frontend)
└── vibequotes-api/   ← Groq-powered API (separate repo)
```

## Requirements

- [Bun](https://bun.sh) 1.x
- The `quote-backend` running (see its README)

## Setup

```bash
bun install
cp .env.example .env.local   # adjust the backend URL if needed
```

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Run

Start the backend first (in `../vibequotes-api`: `bun run dev`), then:

```bash
bun run dev      # http://localhost:3000
```

Other scripts: `bun run build`, `bun run start`, `bun run lint`.

## How it works

1. You type a feeling and pick a tone + target platform.
2. The app calls `POST {NEXT_PUBLIC_API_URL}/api/quotes`.
3. The backend asks Groq for original, status-sized quotes (with hashtags for
   Instagram) and returns them.
4. Each quote can be copied, downloaded as a story image, or sent to WhatsApp.

If the backend can't reach Groq (or has no API key), it returns built-in sample
quotes so the app keeps working.
