---
name: mikro-pg
description: Configure and use MikroORM 7.1 with PostgreSQL. Use when setting up entities, migrations, querying, NestJS integration, RequestContext, defineEntity, QueryBuilder, or schema management with @mikro-orm/postgresql.
---

# MikroORM 7.1 + PostgreSQL

**Scope:** MikroORM v7.1 only, PostgreSQL driver (`@mikro-orm/postgresql`) only.  
**Official docs:** [mikro-orm.io/docs/guide](https://mikro-orm.io/docs/guide)

---

## Packages

```bash
npm install @mikro-orm/core @mikro-orm/postgresql
npm install --save-dev @mikro-orm/cli

# optional
npm install @mikro-orm/migrations @mikro-orm/seeder
npm install @mikro-orm/nestjs  # NestJS only
```

Import driver-specific types from `@mikro-orm/postgresql` (not `@mikro-orm/core`) for `QueryBuilder`, typed `EntityManager`, and `EntityRepository`.

---

## Quick Start

```ts
import { MikroORM } from "@mikro-orm/postgresql";

const orm = await MikroORM.init({
  entities: [UserSchema],
  dbName: "my_db",
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "secret",
});
```

Prefer `defineConfig` from the driver package:

```ts
import { defineConfig } from "@mikro-orm/postgresql";

export default defineConfig({
  entities: [UserSchema],
  dbName: "my_db",
  debug: process.env.NODE_ENV !== "production",
});
```

---

## Critical Rules

1. **Never share EntityManager across requests** — fork per request via `RequestContext` or `em.fork()`.
2. **Import SQL types from driver package** — `EntityManager`, `EntityRepository`, `QueryBuilder` from `@mikro-orm/postgresql`.
3. **v7 requires explicit config** — `MikroORM.init()` and `MikroOrmModule.forRoot()` need options (no empty init).
4. **Managed entities skip constructors** — constructors run only for `new Entity()` or `em.create()`.
5. **Use migrations in production** — `SchemaGenerator` is for dev/prototyping only.
6. **NestJS serialization** — `ClassSerializerInterceptor` breaks on `Reference`/`Collection`; use MikroORM serialization API.

---

## Reference Guide

| Topic              | Reference                                                        | Load When                                               |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------------------- |
| Getting Started    | [references/getting-started.md](references/getting-started.md)   | Bootstrap, CLI, first entity, RequestContext            |
| Core Concepts      | [references/core-concepts.md](references/core-concepts.md)       | EntityManager, Unit of Work, Identity Map, transactions |
| Modeling           | [references/modeling.md](references/modeling.md)                 | Entities, relations, embeddables, indexes, custom types |
| Querying           | [references/querying.md](references/querying.md)                 | find/populate, filters, QueryBuilder, raw SQL           |
| Schema & Database  | [references/schema-and-database.md](references/schema-and-database.md) | Migrations, seeding, schema generator, views            |
| Advanced           | [references/advanced.md](references/advanced.md)                 | Events, cascading, serialization, caching, dataloaders  |
| NestJS Integration | [references/integrations.md](references/integrations.md)       | `@mikro-orm/nestjs`, DI, testing, GraphQL               |
| Recipes            | [references/recipes.md](references/recipes.md)                   | Entity constructors, `rel()`/`ref()` helpers            |
| Doc Links          | [references/references.md](references/references.md)             | Official MikroORM doc URLs                              |
| Examples           | [references/example-integrations.md](references/example-integrations.md) | NestJS sample repos                                     |
