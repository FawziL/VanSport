# API Docs Module

## What it does
Provides interactive API documentation using Scalar, served at `GET /api-docs`. The OpenAPI specification is auto-generated from Swagger decorators on controllers and DTOs.

## How it works

### Swagger Setup
In `main.ts`, a `DocumentBuilder` configures the OpenAPI document with title, version, and bearer auth:

```typescript
const swaggerConfig = new DocumentBuilder()
  .setTitle('VanSport API')
  .setDescription('VanSport e-commerce API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup('api/openapi.json', app, document);
```

The generated JSON is available at `GET /api/openapi.json`.

### Scalar UI
**File:** `src/api-docs/api-docs.controller.ts`

The Scalar API reference UI is served as a CDN-loaded HTML page:

```typescript
@Get('api-docs')
getDocs(@Res() res: Response) {
  const html = `<!doctype html>
<html>
  <head>
    <title>VanSport API Reference</title>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </head>
  <body>
    <div id="app"></div>
    <script>
      Scalar.createApiReference('#app', {
        url: '/api/openapi.json',
        theme: 'purple',
      })
    </script>
  </body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}
```

### Swagger Decorators
Each endpoint is documented using `@nestjs/swagger` decorators:

```typescript
@Get(':id')
@ApiOperation({ summary: 'Get category by ID' })
@ApiParam({ name: 'id', type: Number })
@ApiResponse({ status: 200, description: 'Category found' })
@ApiResponse({ status: 404, description: 'Category not found' })
findOne(@Param('id', ParseIntPipe) id: number) { ... }
```

DTOs are also auto-documented via `@ApiProperty`:

```typescript
export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
```

## Available documentation URLs

| URL | Description |
|-----|-------------|
| `GET /api-docs` | Interactive Scalar UI |
| `GET /api/openapi.json` | Raw OpenAPI JSON |

## Why this design
- **CDN-based Scalar**: No server-side rendering or build steps — the Scalar UI is loaded from CDN, reducing bundle size and server load.
- **OpenAPI as source of truth**: All documentation is derived from code annotations. Endpoints, DTOs, and responses stay in sync automatically.
- **Scalar over Swagger UI**: Scalar provides a modern, clean interface with built-in API testing, dark mode, and better mobile responsiveness compared to the default Swagger UI.
- **Minimal module**: The api-docs module has no service — it's purely a controller with a single HTML response.
