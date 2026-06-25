# Other Features

## Global Prefix

Ignore `setGlobalPrefix()` in Swagger paths:

```typescript
SwaggerModule.createDocument(app, options, { ignoreGlobalPrefix: true });
```

Or include prefix in Swagger UI paths via setup option `useGlobalPrefix: true`.

## Global Parameters

Apply to all routes:

```typescript
const config = new DocumentBuilder()
  .addGlobalParameters({ name: 'tenantId', in: 'header' })
  .build();
```

## Global Responses

Shared error responses (e.g. 401, 500):

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({ status: 500, description: 'Internal server error' })
  .build();
```

Also available per-endpoint via `@ApiResponse` — see [operations.md](operations.md).

## Multiple Specifications

Serve different docs on different endpoints using modular `include`:

```typescript
const catDocumentFactory = () =>
  SwaggerModule.createDocument(app, catOptions, { include: [CatsModule] });
SwaggerModule.setup('api/cats', app, catDocumentFactory);

const dogDocumentFactory = () =>
  SwaggerModule.createDocument(app, dogOptions, { include: [DogsModule] });
SwaggerModule.setup('api/dogs', app, dogDocumentFactory);
```

Each module gets its own `DocumentBuilder`, path, and UI.

## Explorer Dropdown (Multi-Spec UI)

Enable spec switcher in one Swagger UI:

```typescript
SwaggerModule.setup('api', app, document, {
  explorer: true,
  swaggerOptions: {
    urls: [
      { name: '1. API', url: 'api/swagger.json' },
      { name: '2. Cats API', url: 'api/cats/swagger.json' },
    ],
  },
  jsonDocumentUrl: '/api/swagger.json',
});

// Per-module setups also need jsonDocumentUrl
SwaggerModule.setup('api/cats', app, catDocument, {
  jsonDocumentUrl: '/api/cats/swagger.json',
});
```

`swaggerOptions.urls` must point to **JSON** spec URLs.
