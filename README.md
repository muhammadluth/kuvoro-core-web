# Kuvoro — Virtual office core
A pixel-art virtual office built with Next.js App Router, Phaser 4, React, and TypeScript. Guests choose a nickname and an avatar color, explore the office using arrows / WASD, and see other connected guests.
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
Guest room, avatar selection, keyboard/touch movement, other guests via 1.5-second polling, occupancy and member presence panel. Chat, voice and video are intentionally out of scope; SSO, private rooms and persistent accounts are not implemented. No production hosting is configured by this repository.

## Virtual world

Phaser 4 renders a 24x16 pixel-art office, with directional character movement, furniture collision, and the existing multi-user presence. The office graphics are original procedural pixel art. Kenney Roguelike Indoor assets have a CC0 license; see `public/assets/KENNEY-LICENSE.txt`.
