# Schema & Database

Extracted from [Schema & Database](https://mikro-orm.io/docs/schema-database) (v7.1), PostgreSQL-focused.

---

## Schema Generator

**Dev/prototyping only — never use `--run` in production.**

```bash
npx mikro-orm schema:create --dump    # preview CREATE SQL
npx mikro-orm schema:create --run     # create DB + schema

npx mikro-orm schema:update --dump    # preview diff
npx mikro-orm schema:update --run
npx mikro-orm schema:update --run --safe   # no destructive changes
npx mikro-orm schema:update --run --no-drop-tables

npx mikro-orm schema:drop --dump
npx mikro-orm schema:fresh --run      # DROP + recreate (destructive!)
npx mikro-orm schema:fresh --run --seed
```

`schema:create` creates the PostgreSQL database if missing.

### Config Options

```ts
schemaGenerator: {
  disableForeignKeys: true,
  createForeignKeyConstraints: true,
  ignoreSchema: ['pg_catalog'],
  ignoreTriggers: false,
  ignoreRoutines: false,
  skipTables: ['audit_log'],
  skipColumns: { users: ['legacy_col'] },
},
```

Programmatic: `orm.schema.createSchema()`, `updateSchema()`, `dropSchema()`.

---

## Migrations

Install and register:

```bash
npm install @mikro-orm/migrations
```

```ts
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';

export default defineConfig({
  extensions: [Migrator],
  migrations: {
    path: './src/migrations',
    pathTs: './src/migrations',
    glob: '!(*.d).{js,ts}',
  },
});
```

### Migration Class

```ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20240101120000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`create table "author" (
      "id" serial primary key,
      "name" varchar(255) not null
    );`);
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "author" cascade;');
  }
}
```

Prefer raw SQL in migrations over `EntityManager` (metadata drift risk).

### CLI

```bash
npx mikro-orm migration:create              # diff from snapshot
npx mikro-orm migration:create --initial  # initial schema dump
npx mikro-orm migration:up
npx mikro-orm migration:down
npx mikro-orm migration:list
npx mikro-orm migration:pending
npx mikro-orm migration:check               # exit code for CI
npx mikro-orm migration:fresh               # drop all + rerun
```

Migrations run in transactions by default (master transaction wraps all pending). Override per migration: `isTransactional(): boolean`.

Snapshots in migrations folder track schema state between diffs — commit with migration files.

PostgreSQL note: snapshot diffs may show minor type alias differences (`int` vs `int4`).

---

## Seeding

```bash
npm install @mikro-orm/seeder
```

```ts
import { Seeder } from '@mikro-orm/seeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    em.create(UserSchema, { email: 'admin@example.com', fullName: 'Admin' });
    await em.flush();
  }
}
```

Config:

```ts
seeder: {
  path: './src/seeders',
  defaultSeeder: 'DatabaseSeeder',
},
```

```bash
npx mikro-orm seeder:create UsersSeeder
npx mikro-orm seeder:run
npx mikro-orm seeder:run --class=UsersSeeder
```

---

## Entity Generator

Introspect existing PostgreSQL schema → generate entities:

```bash
npx mikro-orm generate-entities --save ./src/entities
```

Useful for brownfield projects. Review and refine generated entities.

---

## Naming Strategy

Default: snake_case table/column names. Customize:

```ts
import { UnderscoreNamingStrategy } from '@mikro-orm/core';

namingStrategy: UnderscoreNamingStrategy,
// or custom class implementing NamingStrategy
```

Entity `name` vs table name: `@Entity({ tableName: 'users' })` or `tableName` in defineEntity.

---

## Multiple Schemas (PostgreSQL)

```ts
@Entity({ schema: 'auth' })
// or in defineEntity: schema: 'auth'

// config
schema: 'public',  // default schema
```

Cross-schema FKs supported. Use `ignoreSchema` in schemaGenerator to exclude system schemas.

---

## Virtual Entities

Read-only entities from SQL expression (no table, no PK, no change tracking):

```ts
export const ArticleListingSchema = defineEntity({
  name: 'ArticleListing',
  expression: (em, where, options) => {
    const qb = em.createQueryBuilder(ArticleSchema, 'a');
    qb.select(['a.title', 'a.slug', 'count(c.id) as comment_count'])
      .leftJoin('a.comments', 'c')
      .groupBy(['a.id']);
    return qb;
  },
  properties: {
    title: p.string(),
    slug: p.string(),
    commentCount: p.integer(),
  },
});
```

Expression can be SQL string or callback returning QueryBuilder. Supports scalar props and to-one relations.

---

## View Entities

Database views managed by schema generator and migrations:

```ts
export const ActiveUsersView = defineEntity({
  name: 'ActiveUsersView',
  expression: 'select id, email from "user" where active = true',
  properties: { id: p.integer(), email: p.string() },
});
```

Creates `CREATE VIEW` in schema diff. Tracked in migrations unlike virtual entities.

---

## Materialized Views (PostgreSQL)

```ts
@Entity({ materialized: true })
// or materialized: true in defineEntity
```

Schema generator emits `CREATE MATERIALIZED VIEW`. Refresh manually in PostgreSQL.

---

## Stored Routines

Map PostgreSQL functions/procedures to entity methods or use `expression` entities. `ignoreRoutines: true` protects hand-written DB routines from schema diff drops.

---

## Database Utilities

```bash
npx mikro-orm database:create
npx mikro-orm database:import dump.sql
```

Connection config for PostgreSQL:

```ts
defineConfig({
  dbName: 'myapp',
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'secret',
  // connection string alternative:
  clientUrl: 'postgresql://user:pass@localhost:5432/myapp',
  pool: { min: 2, max: 10 },
  driverOptions: { connection: { ssl: { rejectUnauthorized: false } } },
})
```

Read replicas: see [read-connections](https://mikro-orm.io/docs/read-connections).
