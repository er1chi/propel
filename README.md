# Propel CRM v2

Updated version of my previous crm portfolio project with a lot more features since my skills have improved \
including infrastructure as everything used is self-hosted/managed

Also, I use a selfhosted gitea instance for all of my code now on a home server ( which has been very fun to learn/set up ) so this project serves as at least some proof that I can code.

Maybe 25% ai usage here (frontend & some docker, which i had to fix...) just to show I can work on similar projects with/out said tools

Used on frontend because I've just done the common patterns so much atp and its definitely easier to iterate on designs/flows this way since I'm not a strong designer

## Key Features

- [ ] in app e2e encrypted messages
- [ ] file upload/share/download/...crud
- [ ] custom data model (from twenty)
- [ ] invoice handling (esign compliance)
- [ ] calendar integration
- [ ] notes
- [ ] ai agents that handle some tasks(?)

### Some Stretch Goals

- [ ] Rewrite some deps to reduce amount of external dependencies

## Tech Used

- Tailwind CSS, Shadcn UI
- React, Tanstack Router
- Vite Plus
- Node, Nest
- Redis + Queues, PostgreSQL
- Minio
- Docker

### Reminder

install socket firewall `npm i -g sfw` \
and simply prepend to any npm related install command like: \
`sfw pnpm install` or `sfw pnpm add --filter @repo/pkg npm-dep`
