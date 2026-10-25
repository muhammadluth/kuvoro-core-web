# Kuvoro — Virtual office core
A cozy, pixel-inspired 2D office built with Next.js App Router, React, and TypeScript. Guests choose a nickname and an avatar color, explore the office using arrows / WASD, and see other connected guests.
## Start
```bash
npm ci
npm run dev
```
Open http://127.0.0.1:3000 (or a port explicitly owned by this application).
## Persistence
By default, presence is in memory in a single Next.js Node process; it expires after 25 seconds and does not survive restarts. For multi-process deployments, create a **dedicated** PostgreSQL database, apply `db/schema.sql`, then set `DATABASE_URL` securely in your environment. Do not commit credentials.
## Scripts
`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
## MVP scope
Guest room, avatar selection, keyboard/touch movement, other guests via 1.5-second polling, occupancy, mini map and chat-like activity panel. Real-time voice/video, true chat, SSO, private rooms, persistence of accounts and proximity calls are future work. No production hosting is configured by this repository.
