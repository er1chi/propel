# Types and Parameters

`SwaggerModule` scans `@Body()`, `@Query()`, and `@Param()` in route handlers and builds model definitions from reflection.

## Basic DTO Properties

Without `@ApiProperty()`, reflected models are empty. Annotate each property or use the [CLI plugin](cli-plugin.md).

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

Use `@ApiBody()` to override body definition explicitly.

## @ApiProperty Options

```typescript
@ApiProperty({
  description: 'The age of a cat',
  minimum: 1,
  default: 1,
  type: Number,
})
age: number;
```

- Optional fields: `@ApiPropertyOptional()` instead of `@ApiProperty({ required: false })`
- Supports all [OpenAPI Schema Object](https://swagger.io/specification/#schemaObject) keys

## Arrays

```typescript
@ApiProperty({ type: [String] })
names: string[];
```

Also set `isArray: true` or put the element type as the first array element. CLI plugin auto-detects arrays.

## Circular Dependencies

Use a lazy type function:

```typescript
@ApiProperty({ type: () => Node })
node: Node;
```

## Generics and Interfaces

TypeScript erases generics/interfaces at runtime. Set type explicitly:

```typescript
@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[]) {}
```

## Enums

Inline values:

```typescript
@ApiProperty({ enum: ['Admin', 'Moderator', 'User'] })
role: UserRole;
```

TypeScript enum:

```typescript
export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
}

@ApiQuery({ name: 'role', enum: UserRole })
async filterByRole(@Query('role') role: UserRole = UserRole.User) {}
```

Use `isArray: true` on `@ApiQuery` for multi-select enums.

### Reusable enum schemas

Avoid duplicated client enums with `enumName`:

```typescript
@ApiProperty({ enum: CatBreed, enumName: 'CatBreed' })
breed: CatBreed;
```

Creates a `#/components/schemas/CatBreed` ref. Any decorator accepting `enum` also accepts `enumName`.

## Examples

Single:

```typescript
@ApiProperty({ example: 'persian' })
breed: string;
```

Multiple:

```typescript
@ApiProperty({
  examples: {
    Persian: { value: 'persian' },
    Tabby: { value: 'tabby' },
  },
})
breed: string;
```

## Raw Definitions

For nested arrays, matrices, or complex shapes:

```typescript
@ApiProperty({
  type: 'array',
  items: {
    type: 'array',
    items: { type: 'number' },
  },
})
coords: number[][];

@ApiProperty({
  type: 'object',
  properties: {
    name: { type: 'string', example: 'Error' },
    status: { type: 'number', example: 400 },
  },
  required: ['name', 'status'],
})
rawDefinition: Record<string, any>;
```

Controller-level raw body:

```typescript
@ApiBody({
  schema: {
    type: 'array',
    items: { type: 'array', items: { type: 'number' } },
  },
})
async create(@Body() coords: number[][]) {}
```

## Extra Models

For models not directly referenced by controllers:

```typescript
@ApiExtraModels(ExtraModel)
export class CreateCatDto {}
```

Or at document creation:

```typescript
SwaggerModule.createDocument(app, options, { extraModels: [ExtraModel] });
```

Reference with `getSchemaPath` (from `@nestjs/swagger`):

```typescript
schema: { $ref: getSchemaPath(ExtraModel) }
```

Register each extra model once.

## oneOf / anyOf / allOf

```typescript
@ApiProperty({
  oneOf: [
    { $ref: getSchemaPath(Cat) },
    { $ref: getSchemaPath(Dog) },
  ],
})
pet: Cat | Dog;
```

Polymorphic arrays need raw definitions:

```typescript
@ApiProperty({
  type: 'array',
  items: {
    oneOf: [
      { $ref: getSchemaPath(Cat) },
      { $ref: getSchemaPath(Dog) },
    ],
  },
})
pets: Pet[];
```

Both `Cat` and `Dog` must be `@ApiExtraModels()`.

## Schema Name and Description

```typescript
@ApiSchema({ name: 'CreateCatRequest', description: 'Create cat payload' })
class CreateCatDto {}
```

Renames generated schema from class name.
