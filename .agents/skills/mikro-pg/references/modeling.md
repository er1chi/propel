# Modeling

Extracted from [Modeling](https://mikro-orm.io/docs/modeling) (v7.1), PostgreSQL-focused.

---

## Defining Entities

Two main approaches:

1. **`defineEntity` + `p` builders** (recommended v7) — full type inference, no decorators
2. **Decorated classes** — `@Entity()`, `@Property()`, relation decorators

Every entity requires a primary key. Constructors are **never called** for managed (loaded) entities.

### defineEntity + class (recommended)

```ts
import { defineEntity, p } from '@mikro-orm/core';

const BookSchema = defineEntity({
  name: 'Book',
  extends: BaseEntitySchema,  // optional shared base
  properties: {
    id: p.integer().primary(),
    title: p.string(),
    author: () => p.manyToOne(AuthorSchema),
    publisher: () => p.manyToOne(PublisherSchema).ref().nullable(),
    tags: () => p.manyToMany(BookTagSchema).fixedOrder(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class Book extends BookSchema.class {}
BookSchema.setClass(Book);
```

### Schema-only (no class)

```ts
export const Book = defineEntity({ name: 'Book', properties: { ... } });
export type IBook = InferEntity<typeof Book>;
```

### Property builders (`p`)

| Builder | PostgreSQL type |
|---------|-------------------|
| `p.string()` | varchar |
| `p.text()` | text |
| `p.integer()` | integer / serial |
| `p.bigint()` | bigint / bigserial |
| `p.uuid()` | uuid |
| `p.boolean()` | boolean |
| `p.datetime()` | timestamptz |
| `p.date()` | date |
| `p.decimal(precision, scale)` | numeric |
| `p.json()` | jsonb |
| `p.type('string[]')` | text[] / array types |

Chain: `.primary()`, `.nullable()`, `.default('')`, `.defaultRaw('gen_random_uuid()')`, `.unique()`, `.index()`, `.hidden()`.

Use arrow functions for relation properties to avoid circular imports: `author: () => p.manyToOne(AuthorSchema)`.

---

## Relationships

Four types: `ManyToOne`, `OneToMany`, `OneToOne`, `ManyToMany`.

### ManyToOne (owning side)

```ts
author: () => p.manyToOne(AuthorSchema),
// or with Reference wrapper
author: () => p.manyToOne(AuthorSchema).ref(),
// lazy type-only
author: () => p.manyToOne(AuthorSchema).lazyRef(),
```

### OneToMany (inverse side)

```ts
// on Author
books: () => p.oneToMany(BookSchema).mappedBy('author'),
```

### OneToOne

```ts
profile: () => p.oneToOne(ProfileSchema).ref().owner(),
settings: () => p.oneToOne(SettingsSchema).mappedBy('user'),
```

### ManyToMany (PostgreSQL pivot table)

```ts
tags: () => p.manyToMany(BookTagSchema),
// custom pivot table
tags: () => p.manyToMany(BookTagSchema).pivotTable('book_to_tag'),
```

Bidirectional: owning side uses `inversedBy`, inverse uses `mappedBy`. Omitting `inversedBy` auto-wires from `mappedBy`.

### Cascading

```ts
author: () => p.manyToOne(AuthorSchema).cascade(Cascade.PERSIST),
books: () => p.oneToMany(BookSchema).mappedBy('author').cascade(Cascade.ALL),
```

---

## Type-Safe Relations

| Type | Runtime | Use Case |
|------|---------|----------|
| Plain `T` | Entity | Familiar, no populate safety |
| `Ref<T>` / `.ref()` | `Reference` wrapper | `.$`, `.get()`, `.load()` |
| `LazyRef<T>` / `.lazyRef()` | Plain entity | Compile-time populate safety, no wrapper overhead |

```ts
// assign Reference to Ref property
book.author = ref(author);
book.author = ref(AuthorSchema, authorId);

// PK → entity reference without EM
book.author = rel(AuthorSchema, authorId);
```

After `populate`, use `Loaded<T, 'relation'>` for narrowed types.

---

## Inheritance

| Strategy | Description |
|----------|-------------|
| Single Table | All subclasses in one table with discriminator |
| Class Table | Base + per-subclass tables |
| Concrete Table | Each concrete class has own table |

```ts
export const EmployeeSchema = defineEntity({
  name: 'Employee',
  abstract: true,
  discriminatorColumn: 'type',
  properties: { id: p.integer().primary(), type: p.string() },
});

export const ManagerSchema = defineEntity({
  name: 'Manager',
  extends: EmployeeSchema,
  discriminatorValue: 'manager',
  properties: { teamSize: p.integer() },
});
```

---

## Indexes

```ts
properties: {
  email: p.string().unique(),
  slug: p.string().index(),
},
indexes: [
  { properties: ['title', 'author'] },
  { name: 'custom_idx', properties: ['createdAt'], type: 'btree' },
],
```

PostgreSQL supports GIN indexes for JSON/array full-text via custom index options.

---

## Embeddables

Value objects embedded in entity table (no separate table):

```ts
const AddressSchema = defineEntity({
  name: 'Address',
  embeddable: true,
  properties: {
    street: p.string(),
    city: p.string(),
    zip: p.string(),
  },
});

// in User
address: () => p.embedded(AddressSchema),
```

---

## Composite Keys

```ts
properties: {
  book: () => p.manyToOne(BookSchema).primary(),
  tag: () => p.manyToOne(TagSchema).primary(),
},
```

---

## JSON Properties (PostgreSQL jsonb)

```ts
metadata: p.json().$type<{ key: string; value: unknown }>(),
settings: p.type('jsonb').$type<Record<string, boolean>>(),
```

Query with PostgreSQL operators: `$contains`, `$contained`, `$overlap`, `$hasKey`, `$hasKeys`, `$hasSomeKeys`.

---

## Custom Types

Implement `Type` interface for custom DB↔JS conversion:

```ts
export class PointType extends Type<{ x: number; y: number }, string> {
  convertToDatabaseValue(value) { return `(${value.x},${value.y})`; }
  convertToJSValue(value) { /* parse point string */ }
  getColumnType() { return 'point'; }
}

location: p.type(PointType),
```

Use `@mikro-orm/postgresql` built-in types where available (e.g. full-text, arrays).

---

## Base Entity Pattern

```ts
export const BaseEntitySchema = defineEntity({
  abstract: true,
  properties: {
    id: p.uuid().primary().defaultRaw('gen_random_uuid()'),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p.datetime().onCreate(() => new Date()).onUpdate(() => new Date()),
  },
});
```

With `extends` option, property initializers from base class run via `super()`.
