# Agent Guidelines for Hyperscaler Services

## Commands
- **Build**: `bun run build` - Build for production
- **Dev**: `bun run dev` - Start development server
- **Lint**: `bun run lint` - Run Oxidize linter
- **Lint Fix**: `bun run lint:fix` - Auto-fix linting issues
- **Type Check**: `bun run typecheck` - Run TypeScript type checking
- **Format**: `bun run format` - Format code with Prettier

## Code Style
- **Imports**: Use `@/*` path aliases (e.g., `@/components/Button`)
- **Formatting**: Double quotes, no semicolons, 2-space indentation
- **Types**: Strict TypeScript enabled, always type function parameters and returns
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Error Handling**: Use try/catch blocks, provide meaningful error messages
- **JSDoc**: Document all public functions/classes with JSDoc comments
- **Astro Components**: Use TypeScript frontmatter, export interfaces for props

## Architecture
- **State Management**: Use custom singleton classes (see pagination-state.ts)
- **Components**: Place in `src/components/`, use Astro for UI, TypeScript for logic
- **Types**: Define interfaces in `src/types/client.ts`
- **Data**: Fetch from `public/services.json` via `src/data/services.ts`

## Testing
No test framework currently configured. Add tests before implementing new features.