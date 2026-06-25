# Advanced

Extracted from [Advanced](https://mikro-orm.io/docs/advanced) (v7.1), PostgreSQL-focused.

---

## Events & Lifecycle Hooks

Two mechanisms: **entity hooks** (on entity) and **EventSubscribers** (separate classes). Hooks run before subscribers.

| Event | When |
|-------|------|
| `onInit` | Entity created (`em.create()` or loaded) |
| `onLoad` | Fully loaded from DB (not references) |
| `beforeCreate` / `afterCreate` | Insert lifecycle |
| `beforeUpdate` / `afterUpdate` | Update lifecycle |
| `beforeUpsert` / `afterUpsert` | Upsert lifecycle |
| `beforeDelete` / `afterDelete` | Delete lifecycle |

### defineEntity hooks

```ts
ArticleSchema.addHook('beforeCreate', async (args: EventArgs<Article>) => {
  args.entity.slug = args.entity.title.toLowerCase().replace(/\s+/g, '-');
});

ArticleSchema.addHook('beforeUpdate', async (args: EventArgs<Article>) => {
  args.entity.updatedAt = new Date();
});
```

Use `addHook` after class definition for full type safety (inline `hooks` property types as `any`).

### Flush Events

| Event | When |
|-------|------|
| `onFlush` | Before change sets computed — modify scheduled entities |
| `afterFlush` | After successful flush |

Use `onFlush` for soft-delete, audit trails, cross-entity validation.

### EventSubscriber

```ts
export class AuthorSubscriber implements EventSubscriber<Author> {
  getSubscribedEntities() { return [AuthorSchema]; }
  async afterCreate(args: EventArgs<Author>) { /* ... */ }
}
```

Register via config `subscribers: [AuthorSubscriber]` or `em.getEventManager().registerSubscriber()`.

---

## Cascading

Control how operations propagate to relations:

```ts
import { Cascade } from '@mikro-orm/core';

author: () => p.manyToOne(AuthorSchema).cascade(Cascade.PERSIST),
books: () => p.oneToMany(BookSchema).mappedBy('author').cascade(Cascade.ALL),
```

| Cascade | Effect |
|---------|--------|
| `PERSIST` | Cascade persist to new related entities |
| `MERGE` | Cascade merge |
| `REMOVE` | Cascade remove |
| `ALL` | All of the above |

Bidirectional relations cascade from both sides when configured. `orphanRemoval: true` deletes removed collection items.

---

## Serializing

ORM defines `toJSON()` on entities during discovery. Use MikroORM serialization instead of class-transformer (especially in NestJS).

### Hidden Properties

```ts
[HiddenProps]?: 'password';

password: p.string().hidden(),
// or
password: Hidden<string>,
```

### Shadow (non-persisted) Properties

```ts
commentCount: p.integer().persist(false),
```

Populated via QueryBuilder aggregations or `em.assign()`.

### Serialization Groups

```ts
title: p.string().serialize({ groups: ['public'] }),

wrap(entity).serialize({ groups: ['public'] });
wrap(entity).toObject();
wrap(entity).toJSON();
```

### Relation Serializers

```ts
author: () => p.manyToOne(AuthorSchema).serializer(a => a.name, { serializedName: 'authorName' }),
```

---

## Caching

Two distinct concepts:

| Type | Scope | Purpose |
|------|-------|---------|
| **Identity Map** | Single request | Entity instance deduplication |
| **Result Cache** | Cross-request | Cache query results |

```ts
const authors = await em.find(AuthorSchema, {}, {
  cache: ['author-list', 60_000], // key + TTL ms
});
```

Configure via `resultCache` adapter (Redis, in-memory). Not a replacement for identity map.

Metadata cache (separate): `metadataCache` config + `npx mikro-orm cache:generate`.

---

## Dataloaders

Native support for batching relation loads (GraphQL-friendly):

```ts
const author = await book.author.load({ dataloader: true });
const items = await book.tags.loadItems({ dataloader: true });
```

Enable globally:

```ts
dataloader: true,
// or
dataloader: DataloaderType.ALL,
```

Works with `@ResolveField` in NestJS GraphQL resolvers.

---

## Streaming

Stream large result sets without loading all into memory:

```ts
for await (const author of em.stream(AuthorSchema, {})) {
  // process one at a time
}
```

PostgreSQL supports streaming via cursor-based reads.

---

## Query Cancellation

Cancel long-running queries:

```ts
const abortController = new AbortController();
const promise = em.find(AuthorSchema, {}, { signal: abortController.signal });
abortController.abort();
```

Requires driver support — available on PostgreSQL driver.

---

## Read Connections

Configure read replicas for read-heavy workloads:

```ts
replicas: [
  { host: 'replica1.example.com', port: 5432 },
],
preferReadReplicas: true,
```

Writes go to primary; reads can route to replicas.

---

## Propagation

Transaction propagation modes for `em.transactional()`:

| Mode | Behavior |
|------|----------|
| `REQUIRED` | Join existing or create new (default) |
| `REQUIRES_NEW` | Always new transaction |
| `MANDATORY` | Must have existing transaction |
| `NOT_SUPPORTED` | Suspend current transaction |

Nested transactions use PostgreSQL savepoints.

---

## Property Validation

Validate entity state before flush:

```ts
properties: {
  email: p.string().validate({ type: 'email' }),
  age: p.integer().validate({ min: 0, max: 150 }),
},
```

Or custom validators. Runs during flush before SQL generation.

---

## Custom Repositories

```ts
export class ArticleRepository extends EntityRepository<Article> {
  async findPublished(limit = 10) {
    return this.find({ publishedAt: { $ne: null } }, { limit, orderBy: { publishedAt: 'DESC' } });
  }
}

// register on entity
@Entity({ repository: () => ArticleRepository })
export class Article {
  [EntityRepositoryType]?: ArticleRepository;
}
```

Use with QueryBuilder for complex reporting queries.

---

## Soft Delete via onFlush

Common pattern — intercept removes in `onFlush` and convert to UPDATE:

```ts
subscriber.onFlush = (args) => {
  for (const changeSet of args.uow.getChangeSets()) {
    if (changeSet.type === ChangeSetType.DELETE) {
      changeSet.payload.deletedAt = new Date();
      changeSet.type = ChangeSetType.UPDATE;
    }
  }
};
```

Combine with global filter `{ deletedAt: null }`.
