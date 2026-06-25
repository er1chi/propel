# NestJS Integration

Extracted from [Usage with NestJS](https://mikro-orm.io/docs/usage-with-nestjs) (v7.1), PostgreSQL-focused.

---

## Installation

```bash
npm install @mikro-orm/core @mikro-orm/nestjs @mikro-orm/postgresql
```

---

## Module Setup

```ts
import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from './mikro-orm.config';

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
  ],
})
export class AppModule {}
```

**v7 breaking change:** `forRoot()` requires explicit config — no empty `forRoot()`.

`forRoot()` accepts same options as `MikroORM.init()`. See [Configuration](https://mikro-orm.io/docs/configuration).

### PostgreSQL Config Example

```ts
import { defineConfig } from '@mikro-orm/postgresql';

export default defineConfig({
  dbName: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  migrations: { path: './dist/migrations', pathTs: './src/migrations' },
  extensions: [Migrator],
});
```

---

## Injecting EntityManager

Available globally after `forRoot()`:

```ts
import { MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';

@Injectable()
export class MyService {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}
}
```

Import `EntityManager` from `@mikro-orm/postgresql` (driver package), not `@mikro-orm/core`.

---

## Feature Modules & Repositories

```ts
@Module({
  imports: [MikroOrmModule.forFeature([PhotoSchema])],
  providers: [PhotoService],
})
export class PhotoModule {}

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(PhotoSchema)
    private readonly photoRepo: EntityRepository<IPhoto>,
  ) {}
}
```

Do **not** register base/abstract entities via `forFeature()` — only concrete entities with repositories.

---

## Custom Repositories (Auto DI)

Name repository `{EntityName}Repository` to skip `@InjectRepository()`:

```ts
@Entity({ repository: () => AuthorRepository })
export class Author {
  [EntityRepositoryType]?: AuthorRepository;
}

export class AuthorRepository extends EntityRepository<Author> {}

@Injectable()
export class MyService {
  constructor(private readonly repo: AuthorRepository) {}
}
```

Convention: `getRepositoryToken()` returns `${EntityName}Repository`.

---

## Auto-Load Entities

For webpack/monorepo builds where globs fail:

```ts
MikroOrmModule.forRoot({
  ...config,
  autoLoadEntities: true,
}),
```

Entities from `forFeature()` auto-register. Does **not** affect CLI — keep full entity list in CLI config.

Alternative — barrel file via CLI:

```bash
npx mikro-orm discovery:export
```

```ts
import { entities } from './entities.generated';

MikroOrmModule.forRoot({ entities, ...config }),
```

---

## Request Context

NestJS module registers `RequestContext` middleware automatically. For queue/cron handlers outside HTTP:

### @CreateRequestContext()

```ts
import { CreateRequestContext } from '@mikro-orm/core';

@Injectable()
export class MyService {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async processJob() {
    // runs in forked EM context
  }
}
```

- Requires `MikroORM` injected in same class
- Use only on top-level methods — do not nest
- With Bull: extract MikroORM work to separate `@CreateRequestContext()` method

### @EnsureRequestContext()

Reuses existing context if available; creates new one only when missing.

---

## GraphQL + Body Parser

Register MikroORM middleware **after** body parser. Disable NestJS default body parser:

```ts
// main.ts
const app = await NestFactory.create(AppModule, { bodyParser: false });
app.use(express.json());

// GraphQL module
GraphQLModule.forRoot({ bodyParserConfig: false }),
```

---

## App Shutdown

```ts
const app = await NestFactory.create(AppModule);
app.enableShutdownHooks(); // required for MikroORM connection cleanup
await app.listen(3000);
```

Without this, PostgreSQL connections may leak on SIGTERM.

---

## Multiple Database Connections

```ts
@Module({
  imports: [
    MikroOrmModule.forRoot({
      contextName: 'db1',
      registerRequestContext: false,
      dbName: 'primary',
      ...
    }),
    MikroOrmModule.forRoot({
      contextName: 'db2',
      registerRequestContext: false,
      dbName: 'analytics',
      ...
    }),
    MikroOrmModule.forMiddleware(),
  ],
})
export class AppModule {}
```

Inject with context name:

```ts
constructor(
  @InjectMikroORM('db1') private readonly orm1: MikroORM,
  @InjectEntityManager('db1') private readonly em1: EntityManager,
  @InjectRepository(PhotoSchema, 'db1') private readonly photos: EntityRepository<Photo>,
) {}
```

`forFeature([PhotoSchema], 'db1')` registers against specific connection.

---

## Serialization Caveat

NestJS `ClassSerializerInterceptor` + class-transformer **does not serialize** `Reference` or `Collection` wrappers. Use MikroORM serialization:

```ts
@Property({ hidden: true })
password: string;

@Property({ persist: false })
count?: number;

@ManyToOne({ serializer: v => v.name, serializedName: 'authorName' })
author: Author;
```

Or manually: `wrap(entity).serialize({ groups: ['public'] })`.

---

## Testing

Mock repositories:

```ts
import { getRepositoryToken } from '@mikro-orm/nestjs';

@Module({
  providers: [
    PhotoService,
    { provide: getRepositoryToken(PhotoSchema), useValue: mockRepo },
    { provide: PhotoRepository, useValue: mockRepo },
  ],
})
export class PhotoModule {}
```

Use `@InjectRepository` when providing via `getRepositoryToken()` only.

---

## EventSubscriber with DI

Register subscribers in constructor instead of ORM config for DI access:

```ts
@Injectable()
export class AuthorSubscriber implements EventSubscriber<Author> {
  constructor(private readonly em: EntityManager) {
    em.getEventManager().registerSubscriber(this);
  }

  getSubscribedEntities(): EntityName<Author>[] {
    return [AuthorSchema];
  }

  async afterCreate(args: EventArgs<Author>) { /* use injected services */ }
}
```

Add subscriber to module `providers`.

---

## GraphQL Dataloaders

```ts
@Resolver(() => Book)
export class BookResolver {
  @ResolveField(() => Author)
  async author(@Parent() book: Book) {
    return book.author.load({ dataloader: true });
  }
}
```

---

## Example App

Real-world NestJS + MikroORM: [nestjs-realworld-example-app](https://github.com/mikro-orm/nestjs-realworld-example-app)

See also [example-integrations.md](example-integrations.md).
