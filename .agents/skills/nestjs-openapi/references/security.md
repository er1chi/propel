# Security

Security in OpenAPI is two-step: define the scheme in `DocumentBuilder`, then apply a decorator on controller or method.

## Generic @ApiSecurity

```typescript
// main.ts
const config = new DocumentBuilder()
  .addSecurity('basic', { type: 'http', scheme: 'basic' })
  .build();

// controller
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}
```

## Built-in Schemes

Popular schemes have shorthand helpers — use matching pairs of `DocumentBuilder` + decorator.

### Basic

```typescript
// DocumentBuilder
.addBasicAuth()

// Controller
@ApiBasicAuth()
```

### Bearer (JWT)

```typescript
.addBearerAuth()

@ApiBearerAuth()
```

### OAuth2

```typescript
.addOAuth2()

@ApiOAuth2(['pets:write'])
```

Pass required scopes as decorator argument.

### Cookie

```typescript
.addCookieAuth('optional-session-id')

@ApiCookieAuth()
```

## Application Level

All `@Api*Auth()` and `@ApiSecurity()` decorators apply at **Method** or **Controller** level. Method-level overrides controller-level.

See [decorators.md](decorators.md) for the full list.
