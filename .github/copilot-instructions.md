# Copilot Instructions for Adonis Starter

## Overview

This is an AdonisJS v6 application (important note) with a hybrid architecture combining traditional server-side rendering with modern progressive enhancement via Hotwire Turbo. The app demonstrates a multi-modal content strategy where some models (like Articles) are file-based while others use PostgreSQL.

## Development Workflow

- **Start dev server**: `npm run dev` (uses node ace serve --watch)
- **Build for production**: `npm run build`
- **Run tests**: `npm test` (uses node ace test with Japa)
- **Database migrations**: `node ace migration:run`
- **Database seeding**: `node ace db:seed`

## Import Path Conventions

This project uses TypeScript path aliases extensively. Always use the `#` prefix imports:

```typescript
import Employee from '#models/employee'
import { employeeValidator } from '#validators/employee'
import ArticlesService from '#services/articles_service'
```

## Architecture Patterns

### Turbo Frame Integration

Controllers must handle both regular HTTP requests and Turbo Frame requests:

```typescript
async index(ctx: HttpContext) {
  const data = await Model.query().datatable(ctx.request.all(), tableConfig)

  if (turboFrame.isTurboFrame()) {
    return turboFrame.render('pages/model/index', { data })
  }
  return view.render('pages/model/index', { data })
}
```

### DataTable Pattern

Use the custom datatable provider for paginated, sortable, filterable tables:

```typescript
const tableConfig = {
  defaultSortKey: 'created_at',
  baseUrl: '/employees',
  pagination: { perPage: 10 },
  filterable: { city: 'city', name: 'name' },
  sortable: { name: 'name', created_at: 'created_at' },
  searchable: ['name', 'city', 'position'],
}
```

### Hybrid Content Models

- **Database models**: Use Lucid ORM (User, Employee, Todo, etc.)
- **File-based models**: Articles are markdown files in `public/articles/` processed by `MarkdownFileService`

## Key File Locations

- **Controllers**: `app/controllers/` - HTTP request handlers
- **Services**: `app/services/` - Business logic abstraction (e.g., `ArticlesService` for file-based article operations)
- **Models**: `app/models/` - Data models (mix of Lucid ORM and custom classes)
- **Validators**: `app/validators/` - VineJS validation schemas
- **Middleware**: `app/middleware/` - Request processing pipeline
- **Providers**: `providers/` - Framework extensions (custom Turbo and DataTable providers)
- **Views**: `resources/views/` - Edge templates
- **Frontend**: `resources/js/` - TypeScript/Stimulus controllers
- **Database**: `database/migrations/`, `database/factories/`, `database/seeders/`

## Database & Factories

- Uses PostgreSQL with Lucid ORM
- UUID primary keys for some tables (forms, feeds)
- Factories use Faker.js: `EmployeeFactory.createMany(900)`
- Migrations follow timestamp naming: `YYYYMMDDHHMMSS_description.ts`

## Frontend Architecture

### Stimulus Controllers

Register new controllers in `resources/js/app.ts`:

```typescript
import TurboValidationErrorController from './controllers/turbo_validation_errors.js'
window.Stimulus.register('turbo-validation', TurboValidationErrorController)
```

### Turbo Integration Specifics

- Custom `TurboFrame` and `TurboStream` classes in `providers/turbo/`
- Validation errors are embedded as JSON and processed by Stimulus controllers
- Use `turbo_frame.edge` component for frame rendering with error handling
- Check for `turbo-frame` header to detect frame requests

## Validation Strategy

- Server-side: VineJS validators in `app/validators/`
- Client-side: Stimulus controllers with real-time validation
- TODO: make client side validation work on server side errors

## Code Quality Guidelines

- Extract business logic into Services when controllers get complex
- Keep models clean - implementation details go in Services
- Use the datatable provider for any paginated/filterable listings
- Prefer composition over inheritance
- Follow SOLID principles but avoid over-engineering

## Essential Commands

```bash
# Development
npm run dev              # Start with hot reload
node ace make:controller # Generate new controller
node ace make:model      # Generate model + migration
node ace make:validator  # Generate VineJS validator

# Database
node ace migration:run   # Apply migrations
node ace migration:rollback # Rollback last batch
node ace db:seed        # Run seeders
```
