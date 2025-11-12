# Hyperscaler Services

A bilingual (English/Spanish) comparison tool for AWS and Azure cloud services equivalents, built with Astro and Tailwind CSS v4.

## Features

- **SSR (Server-Side Rendering)** with Astro and Cloudflare adapter
- **Bilingual Support** - English and Spanish translations
- **Real-time Search** - Filter services by category, AWS name, Azure name, or description
- **Responsive Design** - Built with Tailwind CSS v4
- **Comprehensive Service Mappings** - Covers compute, storage, database, networking, security, monitoring, analytics, AI, messaging, and DevOps services

## Project Structure

```
src/
├── data/
│   └── services.ts           # AWS/Azure service mappings with bilingual content
├── layouts/
│   └── Layout.astro          # Main layout with meta tags and styling
├── pages/
│   └── index.astro           # Main page with search and table functionality
└── styles/
    └── global.css            # Tailwind CSS imports
```

## Getting Started

### Development

```bash
bun run dev
```

Visit `http://localhost:4321/` to see the application.

### Build

```bash
bun run build
```

### Preview

```bash
bun run preview
```

### Deploy

```bash
bun run deploy
```

## Usage

### Language Switching

Toggle between English and Spanish using the language buttons in the top-right corner:
- `/?lang=en` - English version
- `/?lang=es` - Spanish version

### Search

Use the search bar to filter services by:
- Category name
- AWS service name
- Azure service name
- Service description

The search is case-insensitive and updates in real-time.

## Adding New Services

Edit `public/services.json` and add new service mappings following the existing format:

```json
{
  category: "compute",
  categoryName: {
    en: "Compute",
    es: "Cómputo"
  },
  aws: "EC2",
  azure: "Virtual Machines",
  description: {
    en: "Virtual servers in the cloud",
    es: "Servidores virtuales en la nube"
  }
}
```
