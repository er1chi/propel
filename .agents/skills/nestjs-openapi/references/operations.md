# Operations

Paths are resources (`/users`); operations are HTTP methods on those paths.

## Tags

```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {}
```

### OpenAPI 3.2 tag hierarchy

Define tags in `DocumentBuilder` with `parent` and `kind`:

```typescript
const config = new DocumentBuilder()
  .setOpenAPIVersion('3.2.0')
  .addTag('Animals', 'Everything about animals', undefined, { kind: 'nav' })
  .addTag('Cats', 'Cat operations', undefined, { parent: 'Animals' })
  .build();
```

Requires `setOpenAPIVersion('3.2.0')` — otherwise validators reject `parent`/`kind`. Hierarchy is only via `DocumentBuilder.addTag()`, not `@ApiTags()`.

## Headers

```typescript
@ApiHeader({ name: 'X-MyHeader', description: 'Custom header' })
@Controller('cats')
export class CatsController {}
```

## Responses

```typescript
@Post()
@ApiCreatedResponse({ description: 'The record has been successfully created.' })
@ApiForbiddenResponse({ description: 'Forbidden.' })
async create(@Body() createCatDto: CreateCatDto) {}
```

### Shorthand decorators

`@ApiOkResponse`, `@ApiCreatedResponse`, `@ApiAcceptedResponse`, `@ApiNoContentResponse`, `@ApiBadRequestResponse`, `@ApiUnauthorizedResponse`, `@ApiNotFoundResponse`, `@ApiForbiddenResponse`, `@ApiInternalServerErrorResponse`, `@ApiDefaultResponse`, and others inherit from `@ApiResponse`.

### Response with model

```typescript
@ApiCreatedResponse({ description: 'Created.', type: Cat })
async create(@Body() dto: CreateCatDto): Promise<Cat> {}
```

Response class properties need `@ApiProperty()`.

### Global responses

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({ status: 500, description: 'Internal server error' })
  .build();
```

## File Upload

```typescript
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({ description: 'Upload', type: FileUploadDto })
uploadFile(@UploadedFile() file: Express.Multer.File) {}

class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
```

Multiple files:

```typescript
class FilesUploadDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: any[];
}
```

## Extensions

```typescript
@ApiExtension('x-foo', { hello: 'world' })
```

Extension names must start with `x-`.

## Generic Paginated Response

For `PaginatedDto<T>` with generic `results`:

```typescript
export class PaginatedDto<TData> {
  @ApiProperty() total: number;
  @ApiProperty() limit: number;
  @ApiProperty() offset: number;
  results: TData[]; // decorated via raw schema below
}

@Controller('cats')
@ApiExtraModels(PaginatedDto, CatDto)
export class CatsController {
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(CatDto) },
            },
          },
        },
      ],
    },
  })
  async findAll(): Promise<PaginatedDto<CatDto>> {}
}
```

### Reusable decorator

```typescript
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) =>
  applyDecorators(
    ApiExtraModels(PaginatedDto, model),
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf${model.name}`,
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
```

Use: `@ApiPaginatedResponse(CatDto)`. Add `title` for unambiguous client codegen.
