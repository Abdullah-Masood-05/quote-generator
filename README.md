# Feelings Quote Generator

Describe how you're feeling and get short, share-ready quotes for your
**WhatsApp Status** and **Instagram Stories** — with one-tap copy, a downloadable
story image (1080×1920), and a WhatsApp share link.

Built with **Next.js 16** + **React 19**, running on **Bun**. Quotes come from a
separate [`quote-backend`](../quote-backend) service powered by Groq.

```
AI-App/
├── quote-generator/   ← this app (frontend)
└── quote-backend/     ← Groq-powered API (separate repo)
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

Start the backend first (in `../quote-backend`: `bun run dev`), then:

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
