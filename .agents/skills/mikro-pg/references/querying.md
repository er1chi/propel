# Querying

Extracted from [Querying](https://mikro-orm.io/docs/querying) (v7.1), PostgreSQL-focused.

---

## Query Conditions

```ts
await em.find(AuthorSchema, { name: 'Jon' });
await em.find(AuthorSchema, { id: [1, 2, 7] });           // $in shorthand
await em.find(AuthorSchema, { id: { $gt: 5, $lt: 10 } }); // combined on one field
```

### Comparison Operators

| Operator | Description |
|----------|-------------|
| `$eq`, `$ne` | Equal / not equal |
| `$gt`, `$gte`, `$lt`, `$lte` | Comparisons |
| `$in`, `$nin` | Array contains / not contains |
| `$like` | SQL LIKE |
| `$re` | Regex (PostgreSQL ~ operator) |
| `$ilike` | Case-insensitive LIKE (**PostgreSQL only**) |
| `$fulltext` | Full-text search |

### PostgreSQL-Only Array/JSON Operators

| Operator | SQL | Use |
|----------|-----|-----|
| `$overlap` | `&&` | Array overlap |
| `$contains` | `@>` | Contains |
| `$contained` | `<@` | Contained by |
| `$hasKey` | `?` | JSON has key |
| `$hasSomeKeys` | `?\|` | Has any keys |
| `$hasKeys` | `?&` | Has all keys |

### Logical Operators

`$and`, `$or`, `$not`. Relation conditions:

```ts
await em.find(BookSchema, {
  author: { name: { $like: '%snow%' } },
  tags: { name: 'fiction' },
});
```

### Other

- `$exists: true/false` — null checks on relations
- `$eq: null` — IS NULL
- `$re` with PostgreSQL: use `$ilike` for case-insensitive pattern match

---

## Populating Relations

```ts
const books = await em.find(BookSchema, {}, {
  populate: ['author', 'tags'],
});

// nested
populate: ['author.books', 'publisher.tests']

// all relations (select-in strategy, handles cycles)
populate: ['*']

// auto-populate relations used in filter
populate: ['$infer']
```

MikroORM loads each table once — no N+1 for nested populate. ManyToMany uses pivot table JOINs.

### Loading Strategies

| Strategy | Description |
|----------|-------------|
| `select-in` | Separate query per relation level (default) |
| `joined` | JOIN in single query — use for to-one, not collections with pagination |

```ts
await em.find(BookSchema, {}, {
  populate: ['author'],
  strategy: LoadStrategy.JOINED,
});
```

Global default via `loadStrategy` config option.

---

## Filters

Global or named filters applied automatically:

```ts
// entity definition
filters: {
  softDelete: { cond: { deletedAt: null }, default: true },
},

// disable for query
await em.find(BookSchema, {}, { filters: { softDelete: false } });
```

Parameterized filters, `@Filter()` decorator (legacy), or `em.addFilter()` at runtime.

---

## QueryBuilder

Import from driver package:

```ts
import { EntityManager } from '@mikro-orm/postgresql';

const qb = em.createQueryBuilder(AuthorSchema, 'a');
// or em.qb(AuthorSchema, 'a')
```

### Select

```ts
const authors = await em.createQueryBuilder(AuthorSchema, 'a')
  .select('*')
  .where({ name: { $like: '%test%' } })
  .orderBy({ name: 'asc' })
  .limit(10)
  .getResultList();

// typed partial select
const rows = await em.createQueryBuilder(AuthorSchema, 'a')
  .select(['a.id', 'a.email'])
  .leftJoinAndSelect('a.books', 'b', {}, ['title'])
  .execute();
```

### Update / Delete

```ts
await em.createQueryBuilder(AuthorSchema)
  .update({ name: 'updated' })
  .where({ id: 123 })
  .execute();

await em.createQueryBuilder(AuthorSchema)
  .delete()
  .where({ id: 456 })
  .execute();
```

### Execute Options

```ts
await qb.execute('all');  // array (default)
await qb.execute('get');  // single row
await qb.execute('run');  // { affectedRows, insertId, row }

// options: mapResults, mergeResults, rawResults
```

QueryBuilder is fully type-safe — aliases, joins, and selected fields tracked at compile time. Can be `await`ed directly.

### Raw SQL via QB

```ts
const res = await em.createQueryBuilder(AuthorSchema)
  .select('*')
  .where({ id: { $in: [1, 2, 3] } })
  .execute();
```

---

## Raw Queries

```ts
const result = await em.execute('SELECT 1 + 1 as result');
const rows = await em.execute('SELECT * FROM author WHERE id = ?', [1]);

// bulk without entity tracking (no lifecycle hooks)
await em.insert(AuthorSchema, { name: 'test', email: 't@e.com' });
await em.nativeUpdate(AuthorSchema, { active: true }, { active: false });
await em.nativeDelete(AuthorSchema, { active: false });
await em.nativeInsert(AuthorSchema, [{ name: 'a' }, { name: 'b' }]);
```

Use `raw()` fragments in migrations and QueryBuilder.

---

## Kysely Integration

MikroORM v7 integrates Kysely for type-safe SQL. Access via driver:

```ts
const db = em.getKnex(); // or Kysely instance depending on setup
```

See [Kysely docs](https://mikro-orm.io/docs/kysely) for query composition alongside ORM.

---

## Pagination

```ts
const [items, total] = await em.findAndCount(ArticleSchema, {}, {
  limit: 10,
  offset: 20,
  orderBy: { createdAt: 'DESC' },
});
```

For complex pagination with joins, prefer QueryBuilder with `limit`/`offset`.
