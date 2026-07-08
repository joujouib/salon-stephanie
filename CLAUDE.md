# Salon Stephanie — project rules

## Stack
Next.js App Router (JavaScript, NOT TypeScript), Prisma 6, Neon Postgres,
Clerk auth, Tailwind v4. Deployed on Vercel, DB on Neon.

## Hard rules
- Read files before editing them. Never assume contents.
- One feature per session. Do not refactor, rename, or "improve" unrelated code.
- Always propose a plan and wait for approval before writing code.
- After changes: list every modified file with a one-line summary,
  and explain any new concepts introduced (teach me, I'm learning).
- All admin UI must be "mom-friendly": large text (text-xl/2xl+),
  high contrast (text-cream, text-gold, no faded grays for readable text),
  big touch targets (py-4+), plain language, confirmations before destructive actions.
- Protected API routes use Clerk: const { userId } = await auth(); 401 if missing.
  Every route that writes data, and any route exposing client personal data, must be protected.
- Money is integers. Soft-delete/hide instead of hard delete.
- Never touch .env or commit secrets.

## Context
Built by a CS master's student learning web dev, for his mother's
walk-in salon in Beirut (no appointments, no client accounts).
Owner has limited eyesight — accessibility matters.
The full requirements doc is docs/requirements.md (16-table plan, v4).