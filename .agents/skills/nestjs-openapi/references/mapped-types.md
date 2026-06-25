# Mapped Types

Utility functions for CRUD DTO variants. **Always import from `@nestjs/swagger`**, not `@nestjs/mapped-types`, so OpenAPI metadata and the CLI plugin work.

## PartialType

All properties optional — typical for update DTOs:

```typescript
import { PartialType } from '@nestjs/swagger';

export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

Base class properties need `@ApiProperty()` (or CLI plugin).

## PickType

Subset of properties:

```typescript
import { PickType } from '@nestjs/swagger';

export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```

## OmitType

All properties except selected keys:

```typescript
import { OmitType } from '@nestjs/swagger';

export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

## IntersectionType

Merge two types:

```typescript
import { IntersectionType } from '@nestjs/swagger';

export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}
```

## Composition

Utilities compose:

```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}
```

Produces optional fields excluding `name`.
