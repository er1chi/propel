# Decorators

All OpenAPI decorators use the `Api` prefix. Application level indicates where the decorator may be used.

| Decorator | Level |
|-----------|-------|
| `@ApiBasicAuth()` | Method / Controller |
| `@ApiBearerAuth()` | Method / Controller |
| `@ApiBody()` | Method |
| `@ApiConsumes()` | Method / Controller |
| `@ApiCookieAuth()` | Method / Controller |
| `@ApiExcludeController()` | Controller |
| `@ApiExcludeEndpoint()` | Method |
| `@ApiExtension()` | Method |
| `@ApiExtraModels()` | Method / Controller |
| `@ApiHeader()` | Method / Controller |
| `@ApiHideProperty()` | Model |
| `@ApiOAuth2()` | Method / Controller |
| `@ApiOperation()` | Method |
| `@ApiParam()` | Method / Controller |
| `@ApiProduces()` | Method / Controller |
| `@ApiSchema()` | Model |
| `@ApiProperty()` | Model |
| `@ApiPropertyOptional()` | Model |
| `@ApiQuery()` | Method / Controller |
| `@ApiResponse()` | Method / Controller |
| `@ApiSecurity()` | Method / Controller |
| `@ApiTags()` | Method / Controller |
| `@ApiCallbacks()` | Method / Controller |

## Common Uses

- **Exclude from spec**: `@ApiExcludeController()`, `@ApiExcludeEndpoint()`
- **Hide model field**: `@ApiHideProperty()` (CLI plugin skips unless this is set)
- **Operation metadata**: `@ApiOperation({ summary, description })`
- **Query/param docs**: `@ApiQuery()`, `@ApiParam()`
- **Content type**: `@ApiConsumes()`, `@ApiProduces()`

Shorthand response decorators (`@ApiOkResponse`, etc.) inherit from `@ApiResponse` — see [operations.md](operations.md).
