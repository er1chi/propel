# Getting Started

Based on [MikroORM Getting Started Guide](https://mikro-orm.io/docs/guide) (v7.1), adapted for PostgreSQL.

---

## Prerequisites

- Node.js 22.11+ (prefer 24+)
- PostgreSQL database
- TypeScript with strict mode recommended

---

## Installation

```bash
npm install @mikro-orm/core @mikro-orm/postgresql
npm install --save-dev @mikro-orm/cli typescript
```

Optional packages:

| Package | Purpose |
|---------|---------|
| `@mikro-orm/migrations` | Version-controlled schema changes |
| `@mikro-orm/seeder` | Test/seed data |
| `@mikro-orm/nestjs` | NestJS integration |

---

## Configuration

Create `src/mikro-orm.config.ts`:

```ts
import { defineConfig } from '@mikro-orm/postgresql';
import { UserSchema } from './modules/user/user.entity.js';

export default defineConfig({
  dbName: process.env.DB_NAME ?? 'blog',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD,
  entities: [UserSchema],
  debug: true,
});
```

`defineConfig` imported from `@mikro-orm/postgresql` auto-infers the PostgreSQL driver.

### Config discovery (CLI)

CLI searches (in order): `./src/mikro-orm.config.ts`, `./mikro-orm.config.ts`, compiled `.js` variants.

Override via `package.json`:

```json
{
  "mikro-orm": {
    "configPaths": ["./src/mikro-orm.config.ts", "./dist/mikro-orm.config.js"],
    "preferTs": true
  }
}
```

Environment variables: `MIKRO_ORM_CLI_CONFIG`, `MIKRO_ORM_CONTEXT_NAME`, `MIKRO_ORM_CLI_PREFER_TS`.

---

## Initializing the ORM

```ts
import { MikroORM } from '@mikro-orm/postgresql';
import config from './mikro-orm.config.js';

const orm = await MikroORM.init(config);
const em = orm.em;
```

Synchronous alternative: `new MikroORM(config)` — no folder-based discovery, no auto-loaded extensions, requires explicit metadata cache adapter.

---

## First Entity (defineEntity)

Recommended v7 pattern:

```ts
import { defineEntity, type InferEntity, p } from '@mikro-orm/core';

export const UserSchema = defineEntity({
  name: 'User',
  properties: {
    id: p.integer().primary(),
    fullName: p.string(),
    email: p.string(),
    password: p.string(),
    bio: p.text().default(''),
  },
});

export type IUser = InferEntity<typeof UserSchema>;
```

### Custom class with methods

```ts
export class User extends UserSchema.class {
  validatePassword(input: string): boolean {
    return this.password === input;
  }
}
UserSchema.setClass(User);
```

### Primary keys (PostgreSQL)

```ts
id: p.integer().primary(),           // serial/auto-increment
id: p.bigint().primary(),            // bigserial
id: p.uuid().primary(),                // uuid, default gen_random_uuid()
id: p.uuid().primary().defaultRaw('gen_random_uuid()'),
```

Properties with `.default()` or `.onCreate()` are optional in `em.create()`.

---

## EntityManager Basics

```ts
// create (auto-persists by default)
const user = orm.em.create(UserSchema, {
  email: 'foo@bar.com',
  fullName: 'Foo Bar',
  password: '123456',
});
await orm.em.flush();

// fetch
const users = await orm.em.find(UserSchema, {});
const user = await orm.em.findOne(UserSchema, { email: 'foo@bar.com' });

// update managed entity
user.fullName = 'Updated';
await orm.em.flush(); // no persist() needed for loaded entities

// remove
await orm.em.remove(user).flush();
```

---

## RequestContext

MikroORM is stateful — each request needs its own EntityManager fork:

```ts
import { RequestContext } from '@mikro-orm/core';

app.addHook('onRequest', (request, reply, done) => {
  RequestContext.create(orm.em, done);
});

// later — uses forked EM automatically
const users = await orm.em.find(UserSchema, {});
```

Register **after** body/query parsers, **before** route handlers. On app shutdown: `await orm.close()`.

For non-HTTP contexts (queues, cron): use `@CreateRequestContext()` decorator (see [integrations.md](integrations.md)).

---

## CLI Commands

```bash
npx mikro-orm debug
npx mikro-orm schema:create --dump
npx mikro-orm schema:update --dump --run
npx mikro-orm migration:create
npx mikro-orm migration:up
npx mikro-orm seeder:run
npx mikro-orm discovery:export   # generate entities barrel file
```

Verify setup: `npx mikro-orm debug`.

---

## Entity Discovery

```ts
// explicit (recommended)
entities: [UserSchema, ArticleSchema],

// folder-based
entities: ['./dist/app/**/*.entity.js'],
entitiesTs: ['./src/app/**/*.entity.ts'],
```

For NestJS monorepos with webpack, use `autoLoadEntities: true` or `discovery:export` barrel file instead of globs.

---

## DI Container Pattern

```ts
import { EntityManager, EntityRepository, MikroORM, Options } from '@mikro-orm/postgresql';

export interface Services {
  orm: MikroORM;
  em: EntityManager;
  user: EntityRepository<IUser>;
}

let cache: Services;

export function initORM(options?: Partial<Options>): Services {
  if (cache) return cache;
  const orm = new MikroORM({ ...config, ...options });
  return cache = {
    orm,
    em: orm.em,
    user: orm.em.getRepository(UserSchema),
  };
}
```

Override config in tests (e.g. separate test database or in-memory via `@mikro-orm/pglite` for unit tests).

---

## Type Safety (Guide Ch. 5)

- `InferEntity<typeof Schema>` — entity type from schema
- `Loaded<T, 'relation'>` — populated relation types
- `Ref<T>` / `.ref()` — runtime Reference wrapper with `.$`, `.get()`, `.load()`
- `LazyRef<T>` / `.lazyRef()` — type-only, no runtime wrapper
- QueryBuilder tracks aliases and selected fields at compile time

```ts
const article = await em.findOne(ArticleSchema, 1, { populate: ['author'] });
// article.author is Loaded<Author> when populate hint matches
```
