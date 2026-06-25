# Recipes: Entity Constructors

Extracted from [Using Entity Constructors](https://mikro-orm.io/docs/entity-constructors) (v7.1).

---

## Overview

MikroORM **never calls constructors on managed entities** (loaded via EntityManager). Constructors run only for:

- `new Entity(...)` 
- `em.create()` (which may invoke constructor)

Use constructors to enforce required data at creation time.

---

## Basic Constructor

```ts
@Entity()
export class Book {
  @Property()
  title: string;

  @ManyToOne()
  author: Author;

  @ManyToOne()
  publisher?: Publisher;

  constructor(title: string, author: Author) {
    this.title = title;
    this.author = author;
  }
}
```

```ts
const author = new Author();
const book = new Book('Foo', author);
```

---

## em.create() Respects Constructor

Constructor parameters inferred from property names — names must match exactly:

```ts
const book = em.create(Book, { title: 'Foo', author, foo: 123 });
// passes title + author to constructor, assigns foo directly
```

---

## POJO in Constructor (Anti-Pattern)

```ts
// BAD — dto.author as number won't type-check as Author
constructor(dto: { title: string; author: number }) {
  this.author = dto.author; // wrong type
}
```

ORM expects entity instances in relation properties, not plain objects or raw PKs.

---

## rel() Helper — PK to Entity Reference

```ts
import { rel, Rel } from '@mikro-orm/core';

@ManyToOne({ entity: () => Author })
author: Rel<Author>;

constructor(dto: { title: string; author: number }) {
  this.title = dto.title;
  this.author = rel(Author, dto.author);
}
```

`rel()` creates unmanaged entity reference (equivalent to `em.getReference()` without EM). Becomes managed reference on persist.

---

## ref() Helper — With Reference Wrapper

```ts
import { ref, Ref } from '@mikro-orm/core';

@ManyToOne({ entity: () => Author, ref: true })
author: Ref<Author>;

constructor(dto: { title: string; author: number }) {
  this.title = dto.title;
  this.author = ref(Author, dto.author);
}
```

`defineEntity` equivalent:

```ts
author: () => p.manyToOne(AuthorSchema).ref(),
```

---

## LazyRef — Type Safety Without Wrapper

```ts
@ManyToOne({ entity: () => Author })
author: LazyRef<Author>;

constructor(dto: { title: string; author: number }) {
  this.title = dto.title;
  this.author = rel(Author, dto.author);
}
```

Runtime stays plain entity; compile-time restricts access until `Loaded<>` narrows.

---

## rel/ref Accept

Both accept PK, entity instance, or empty value:

```ts
book.author = ref(Author, null);
book.author = ref(Author, undefined);
book.author = ref(Author, 1);
book.author = ref(Author, author);
book.author = ref(author);
```

---

## defineEntity + extends Initializers

Property initializers from base class inherited via `super()`:

```ts
const BaseSchema = defineEntity({
  abstract: true,
  properties: {
    id: p.uuid().primary().defaultRaw('gen_random_uuid()'),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

// child entities get defaults when created via `new`
```

See [defineEntity extends](https://mikro-orm.io/docs/define-entity#extends-initializers).

---

## Native Private Properties

Default entity creation uses `Object.create()` — skips constructor. Enable:

```ts
forceEntityConstructor: true,
```

Required when using `#privateField` syntax in entities.
