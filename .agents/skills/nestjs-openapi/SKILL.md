---
name: nestjs-openapi
description: Generate and configure NestJS OpenAPI (Swagger) documentation using @nestjs/swagger. Use when adding Swagger to NestJS APIs, documenting DTOs with @ApiProperty, configuring operations/responses/security, using mapped types, the CLI plugin, or SwaggerModule setup.
---

# NestJS OpenAPI (Swagger)

Generate OpenAPI specs from NestJS decorators via `@nestjs/swagger`. Based on [NestJS OpenAPI docs](https://docs.nestjs.com/openapi/introduction).

## When to Apply

- Bootstrapping Swagger in `main.ts`
- Documenting DTOs, query/body/params, and response models
- Configuring tags, responses, file upload, or global responses
- Adding auth schemes (Bearer, OAuth2, cookie, basic)
- Using `PartialType` / `PickType` / `OmitType` for DTO variants
- Enabling the Swagger CLI plugin to reduce boilerplate
- Multiple specs, global parameters, or Swagger UI customization

## Quick Start

```bash
npm install --save @nestjs/swagger
```

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('resource')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

- Swagger UI: `http://localhost:3000/api`
- JSON spec: `http://localhost:3000/api-json` (or custom `jsonDocumentUrl`)

Use a document factory (lazy `createDocument`) so the spec is built on request, not at startup.

### Fastify + Helmet CSP

If Swagger UI breaks with Helmet, relax CSP or disable it:

```typescript
app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
      imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
      scriptSrc: [`'self'`, `https:`, `'unsafe-inline'`],
    },
  },
});
```

## Document Options

Pass as third argument to `SwaggerModule.createDocument(app, config, options)`:

| Option | Purpose |
|--------|---------|
| `include` | Modules to include (for multiple specs) |
| `extraModels` | Models not directly referenced by controllers |
| `ignoreGlobalPrefix` | Omit global prefix from paths |
| `deepScanRoutes` | Include routes from modules imported by `include` |
| `operationIdFactory` | Custom operationId (default: `controllerKey_methodKey`) |
| `linkNameFactory` | Custom link names in response links |
| `autoTagControllers` | Auto-tag from controller name (default: `true`) |

```typescript
const options: SwaggerDocumentOptions = {
  operationIdFactory: (_controllerKey, methodKey) => methodKey,
};
const documentFactory = () => SwaggerModule.createDocument(app, config, options);
```

## Setup Options

Fourth argument to `SwaggerModule.setup(path, app, document, options)`:

| Option | Default | Notes |
|--------|---------|-------|
| `ui` | `true` | Disable Swagger UI while keeping JSON/YAML |
| `raw` | `true` | `false` or `[]` disables spec endpoints; `['json']` for JSON only |
| `jsonDocumentUrl` | `<path>-json` | Custom JSON spec path |
| `yamlDocumentUrl` | `<path>-yaml` | Custom YAML spec path |
| `patchDocumentOnRequest` | — | Mutate document before serve |
| `explorer` | `false` | Multi-spec dropdown in UI |
| `swaggerOptions` | — | Passed to Swagger UI |
| `customCss` / `customCssUrl` / `customJs` | — | UI customization |

`ui` and `raw` are independent — disable one without affecting the other.

## Reference Guide

Load the page that matches the task:

| Topic | Reference | Load When |
|-------|-----------|-----------|
| Types & parameters | [references/types-and-parameters.md](references/types-and-parameters.md) | `@ApiProperty`, enums, arrays, extra models, raw schemas |
| Operations | [references/operations.md](references/operations.md) | Tags, responses, file upload, paginated/generic responses |
| Security | [references/security.md](references/security.md) | Bearer, basic, OAuth2, cookie auth in spec |
| Mapped types | [references/mapped-types.md](references/mapped-types.md) | `PartialType`, `PickType`, `OmitType`, `IntersectionType` |
| Decorators | [references/decorators.md](references/decorators.md) | Full decorator list and application level |
| CLI plugin | [references/cli-plugin.md](references/cli-plugin.md) | Auto `@ApiProperty`, `nest-cli.json`, SWC, Jest e2e |
| Other features | [references/other-features.md](references/other-features.md) | Global prefix/params/responses, multiple specs |

## Key Rules

1. **Import mapped types from `@nestjs/swagger`**, not `@nestjs/mapped-types`, so metadata and the CLI plugin work.
2. **DTO properties need `@ApiProperty()`** (manual or via CLI plugin) or schemas appear empty.
3. **Security requires two steps**: `DocumentBuilder.addBearerAuth()` (etc.) in `main.ts` **and** `@ApiBearerAuth()` on controller/method.
4. **Generics/interfaces** need explicit types (`@ApiBody({ type: [Dto] })`) — TypeScript erases them at runtime.
5. **Prefer CLI plugin** for large DTO sets; keep `class-validator` decorators for runtime validation.

## Example

Working sample: [nestjs/nest sample/11-swagger](https://github.com/nestjs/nest/tree/master/sample/11-swagger)
