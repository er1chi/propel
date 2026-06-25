# Core Concepts

Extracted from [Core Concepts](https://mikro-orm.io/docs/core-concepts) (v7.1).

---

## Architecture Patterns

| Pattern | Role |
|---------|------|
| **Data Mapper** | Entities are plain objects; ORM handles persistence |
| **Unit of Work** | Tracks changes, persists in one transaction on `flush()` |
| **Identity Map** | One entity instance per database row per request |

### Key Components

| Component | Responsibility |
|-----------|---------------|
| EntityManager | Main API: `find`, `persist`, `remove`, `flush` |
| UnitOfWork | Change tracking, query ordering, transactions |
| IdentityMap | PK-indexed entity cache |
| MetadataStorage | Entity definitions discovered at startup |
| Hydrator | DB rows → entity instances |
| Driver | Database abstraction (`PostgreSqlDriver`) |
| QueryBuilder | Programmatic SQL (PostgreSQL driver) |

---

## Entity Lifecycle

| State | Description |
|-------|-------------|
| **New** | Created via `em.create()` — inserted on `flush()` |
| **Managed** | Tracked by UnitOfWork — changes detected on `flush()` |
| **Detached** | Not tracked (`em.clear()` or different EM fork) — reattach via `em.merge()` |
| **Removed** | Scheduled for deletion via `em.remove()` — deleted on `flush()` |

---

## EntityManager

### persist + flush

```ts
const book = await em.findOne(BookSchema, 1);
book.title = 'Updated';
await em.flush(); // no persist() needed for managed entities

// new entities
await em.persist(book).flush();
// or
em.persist(book1, book2, book3);
await em.flush();
```

`em.create()` auto-persists by default. Unpersisted relation references are cascade-persisted.

### Entity References

```ts
const userRef = em.getReference(UserSchema, 1);
// (User) { id: 1 } — uninitialized, PK only

author.favouriteBook = em.getReference(BookSchema, 1);
em.remove(em.getReference(BookSchema, 2));
author.books.add(em.getReference(BookSchema, 3));

// initialize reference
await wrap(userRef).init();
```

Use `Ref<T>` wrapper for type-safe references (see [modeling.md](modeling.md)).

### WrappedEntity

Access via `wrap(entity)`:

```ts
import { wrap } from '@mikro-orm/core';

wrap(userRef).isInitialized();
await wrap(userRef).init();
wrap(entity).toObject();  // serialization
wrap(entity).toJSON();
```

Or extend `BaseEntity` for methods directly on entity.

### Fetching

```ts
const author = await em.findOne(AuthorSchema, 123);
const books = await em.find(BookSchema, { author: 1 });
const all = await em.findAll(BookSchema, { where: { published: true } });
const [items, total] = await em.findAndCount(ArticleSchema, {}, { limit, offset });
```

### Removing

```ts
await em.remove(em.getReference(BookSchema, 1)).flush();
await em.nativeDelete(BookSchema, { active: false }); // bulk, no hooks
```

---

## Unit of Work

- Same PK → same instance: `em.findOne(Author, 1) === em.findOne(Author, 1)`
- Identity map indexed by PK only — different WHERE clauses still hit DB but return same instance
- `em.flush()` diffs managed entities against original snapshot — only changed fields UPDATE

### Flush Modes

| Mode | Behavior |
|------|----------|
| `FlushMode.AUTO` | Default — flush before query if overlap detected |
| `FlushMode.COMMIT` | Delay flush until transaction commit |
| `FlushMode.ALWAYS` | Flush before every query |

---

## Identity Map & Request Context

- One identity map per request — never share global EM
- `em.fork()` creates clean EM with own identity map
- `RequestContext.create(orm.em, next)` — AsyncLocalStorage-based forking
- `em.clear()` clears identity map
- `allowGlobalContext: true` or `MIKRO_ORM_ALLOW_GLOBAL_CONTEXT` for tests only

Under the hood: `orm.em.find()` → `orm.em.getContext().find()` → `RequestContext.getEntityManager().find()`.

---

## Transactions

All `em.flush()` changes run inside a transaction by default.

```ts
await em.transactional(async em => {
  const author = em.create(AuthorSchema, { name: 'God' });
  // rolls back on error
});
```

Nested transactions use savepoints. See [Advanced → propagation](https://mikro-orm.io/docs/propagation).

---

## Repositories

```ts
const repo = em.getRepository(AuthorSchema);
const author = await repo.findOne({ name: 'Jon' });

// custom repository
@Entity({ repository: () => AuthorRepository })
export class Author { ... }

export class AuthorRepository extends EntityRepository<Author> {
  findByName(name: string) {
    return this.findOne({ name });
  }
}
```

Register custom repo on entity via `repository: () => AuthorRepository` and `[EntityRepositoryType]?: AuthorRepository`.

---

## Collections

OneToMany / ManyToMany use `Collection<T>`:

```ts
author.books.add(book);
author.books.remove(book);
author.books.init();       // load collection
await author.books.loadItems();
author.books.isInitialized();
```

Bidirectional: set owning side (`ManyToOne`) or use `mappedBy`/`inversedBy`.

---

## wrap() Helper

```ts
import { wrap } from '@mikro-orm/core';

wrap(entity).assign({ title: 'New' });
wrap(entity).toObject();
wrap(entity).serialize({ groups: ['public'] });
```
