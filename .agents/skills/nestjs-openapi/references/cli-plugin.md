# CLI Plugin

Opt-in TypeScript compiler plugin that reduces `@ApiProperty` boilerplate via AST transforms.

## What It Auto-Generates

- `@ApiProperty` on DTO properties (unless `@ApiHideProperty`)
- `required` from optional `?` syntax
- `type` / `enum` from TypeScript types (including arrays)
- `default` from assigned defaults
- Validation rules from `class-validator` (when `classValidatorShim: true`)
- Response decorators on endpoints (status + type)
- Descriptions/examples from comments (when `introspectComments: true`)

**Filename suffixes analyzed**: `.dto.ts`, `.entity.ts` (configurable via `dtoFileNameSuffix`).

### Before / After

Manual:

```typescript
export class CreateUserDto {
  @ApiProperty()
  email: string;
  @ApiProperty({ required: false, default: true })
  isEnabled?: boolean = true;
}
```

With plugin:

```typescript
export class CreateUserDto {
  email: string;
  isEnabled?: boolean = true;
}
```

**Runtime validation still requires `class-validator` decorators** — plugin only affects OpenAPI metadata.

Override any auto-generated value by setting `@ApiProperty()` explicitly.

Import mapped types from `@nestjs/swagger` for plugin schema propagation.

## nest-cli.json

```json
{
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```

With options:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true,
          "skipAutoHttpCode": false,
          "esmCompatible": false,
          "dtoFileNameSuffix": [".dto.ts", ".entity.ts"],
          "controllerFileNameSuffix": ".controller.ts"
        }
      }
    ]
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `dtoFileNameSuffix` | `['.dto.ts', '.entity.ts']` | Files analyzed for DTOs |
| `controllerFileNameSuffix` | `.controller.ts` | Controller files |
| `classValidatorShim` | `true` | Map class-validator to schema |
| `dtoKeyOfComment` | `'description'` | Comment → ApiProperty key |
| `controllerKeyOfComment` | `'summary'` | Comment → ApiOperation key |
| `introspectComments` | `false` | JSDoc descriptions/examples |
| `skipAutoHttpCode` | `false` | Skip auto `@HttpCode()` |
| `esmCompatible` | `false` | Fix ESM (`"type": "module"`) issues |

Delete `/dist` and rebuild after changing plugin options.

## Comments Introspection

```typescript
/**
 * A list of user's roles
 * @example ['admin']
 */
roles: RoleEnum[] = [];
```

Controller comments become `@ApiOperation({ summary: '...' })`. Supports `@remarks`, `@deprecated`, `@throws` in JSDoc.

## Custom Webpack

```javascript
getCustomTransformers: (program) => ({
  before: [require('@nestjs/swagger/plugin').before({}, program)],
}),
```

## SWC Builder

Standard: `nest start -b swc --type-check`

Monorepo: generate metadata file, then load at runtime:

```typescript
import metadata from './metadata';

await SwaggerModule.loadPluginMetadata(metadata);
const document = SwaggerModule.createDocument(app, config);
```

Generate with `npx ts-node src/generate-metadata.ts`.

## Jest E2E (ts-jest)

ts-jest does not use Nest CLI plugins by default. Add AST transformer:

```javascript
// test/nestjs-swagger-transformer.js
const transformer = require('@nestjs/swagger/plugin');

module.exports.name = 'nestjs-swagger-transformer';
module.exports.version = 1;

module.exports.factory = (cs) =>
  transformer.before({}, cs.program);
```

**jest < 29** — `jest-e2e.json`:

```json
{
  "globals": {
    "ts-jest": {
      "astTransformers": { "before": ["<rootDir>/nestjs-swagger-transformer.js"] }
    }
  }
}
```

**jest >= 29**:

```json
{
  "transform": {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        "astTransformers": {
          "before": ["<rootDir>/nestjs-swagger-transformer.js"]
        }
      }
    ]
  }
}
```

Clear cache after config changes: `npx jest --clearCache`
