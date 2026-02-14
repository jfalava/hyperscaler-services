# AGENTS.md - Development Guidelines

## Build/Lint/Test Commands

```bash
# Development
bun run dev              # Start dev server (http://localhost:5173/)

# Build & Deploy
bun run build            # Full build (typecheck + lint + vite build)
bun run deploy           # Build and deploy to Cloudflare Workers
bun run preview          # Preview production build locally

# Code Quality
bun run typecheck        # TypeScript type checking (tsgo --noEmit)
bun run lint             # Run oxlint with type-aware checks
bun run lint:fix         # Run oxlint with auto-fix
bun run format           # Format code with oxfmt
bun run check            # Run all checks (types + lint + fix)
```

**Package Manager:** Use `bun` (not npm/yarn/pnpm)

## Code Style Guidelines

### Imports

- Use path aliases: `@/components`, `@/lib/utils`, `@/hooks`, `@/data`
- Import order is auto-sorted by oxfmt: side-effects → builtin → external → internal → relative
- Use `type` keyword for type-only imports: `import type { Foo } from "@/types"`

### Formatting (oxfmt)

- Print width: 100, Tab width: 2, Spaces (no tabs)
- Double quotes, trailing commas everywhere
- LF line endings, semicolons required
- Run `bun run format` before committing

### TypeScript

- Strict mode enabled
- **Never use `any`** - use `unknown` with type guards instead
- Explicit return types on exported functions
- Use interfaces for component props (not type aliases)
- JSDoc comments required for all exported functions/components

### Naming Conventions

- Components: PascalCase (e.g., `ServicesTable.tsx`)
- Functions/variables: camelCase (e.g., `getCellClasses`)
- Files: kebab-case for utilities (e.g., `use-theme.tsx`), PascalCase for components
- Props interfaces: `ComponentNameProps` (e.g., `ServicesTableProps`)

### React Components

- Functional components only
- Destructure props in parameter: `function Component({ prop1, prop2 }: Props)`
- Use `cn()` from `@/lib/utils` for conditional class merging
- Prefer composition over complex conditional rendering

### Error Handling

- Throw descriptive errors in hooks/contexts
- Use early returns for guard clauses
- No `console.log` allowed (use `console.warn` or `console.error`)

### CSS/Tailwind

- Tailwind v4 with CSS-first configuration
- Use CSS variables for theming (defined in `globals.css`)
- Use `cn()` for class merging (handles `clsx` + `tailwind-merge`)

## Architecture

**Framework:** TanStack Start + React 19 + Cloudflare Workers

**Project Structure:**

```
src/
  components/
    ui/           # shadcn/ui components
    *.tsx         # Feature components
  hooks/          # Custom React hooks (use-*)
  lib/            # Utilities (cn, helpers)
  routes/         # TanStack file-based routes
  styles/         # Global CSS
  types/          # TypeScript types
  data/           # Static data files
```

**Routing:** File-based with TanStack Router

- `__root.tsx` - Root layout with providers
- `index.tsx` - Home page

**Key Dependencies:**

- @tanstack/react-start (framework)
- @tanstack/react-router (routing)
- @tanstack/react-query (data fetching)
- Tailwind CSS v4 (styling)
- shadcn/ui components (base-mira style)

## Linting Rules (oxlint)

**Strict Rules:**

- `typescript/no-explicit-any`: error
- `no-console`: only allow warn/error
- `eqeqeq`: always use strict equality
- `curly`: always use braces
- `no-unused-vars`: underscore prefix allowed (`^_`)
- Complexity limits: max 12, max 40 statements

**Auto-fixable:** Run `bun run lint:fix` to auto-fix issues
