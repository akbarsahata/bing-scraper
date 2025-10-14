# Web

The user-facing web application for the Bing Scraper project, built with React and deployed on Cloudflare Pages with Workers for backend logic.

## Overview

This is a modern, full-stack web application that provides the interface for users to:
- Upload CSV files containing Bing search queries
- Monitor scraping task progress in real-time
- View and export search results
- Manage their account and authentication

The application uses a hybrid architecture combining:
- **Frontend**: React SPA with file-based routing
- **Backend**: Cloudflare Worker handling API requests via tRPC
- **Deployment**: Cloudflare Pages with Assets binding for static files

## Architecture

### Frontend (React SPA)
```
src/
├── components/          # Reusable React components
│   └── auth/           # Authentication components
│       └── client.ts   # Better Auth client
├── routes/             # File-based routing (TanStack Router)
│   ├── __root.tsx      # Root layout with providers
│   ├── index.tsx       # Public landing page
│   └── app/            # Authenticated application routes
│       ├── _authed.tsx # Auth layout wrapper
│       └── _authed/    # Protected dashboard pages
│           └── index.tsx
├── lib/                # Utility functions
│   └── utils.ts        # Helper functions (cn, formatRelativeTime, etc.)
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS with custom theme
├── utils/              # Type utilities
│   └── trpc-types.ts   # tRPC type definitions
├── main.tsx            # Application entry point
├── router.tsx          # Router configuration with tRPC integration
└── routeTree.gen.ts    # Auto-generated route tree
```

### Backend (Cloudflare Worker)
```
worker/
├── index.ts            # Worker entry point & request handler
└── trpc/               # tRPC API layer
    ├── context.ts      # Request context (user, env, etc.)
    ├── router.ts       # Main API router
    ├── trpc-instance.ts # tRPC initialization
    └── routers/        # API route modules
```

## Tech Stack

### Core Framework
- **React 19.1** - Modern UI library with latest features
- **TypeScript 5.8** - Type-safe development
- **Vite 6.3** - Fast build tool and dev server

### Routing & Data Fetching
- **TanStack Router 1.121** - Type-safe file-based routing with code splitting
- **TanStack Query 5.81** - Server state management and caching
- **tRPC 11.4** - End-to-end type-safe API layer

### Styling
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Radix UI** - Headless accessible UI primitives (14 components)
- **tw-animate-css** - Animation utilities
- **clsx + tailwind-merge** - Class name utilities

### Authentication
- **Better Auth 1.3** - Modern authentication library
- Configured for user management with secure session handling

### Cloudflare Integration
- **@cloudflare/vite-plugin** - Cloudflare-specific Vite integration
- **Wrangler 4.30** - Cloudflare CLI for deployment and local dev
- Remote bindings for D1, R2, and other Cloudflare services

### Development & Testing
- **Vitest 3.2** - Fast unit testing framework
- **Testing Library** - Component testing utilities
- **web-vitals** - Performance monitoring

## Important Scripts

```bash
# Development
pnpm dev              # Start dev server on port 3000 with Wrangler
pnpm start            # Alternative dev server command

# Building
pnpm build            # Build for production (Vite + TypeScript)
pnpm serve            # Preview production build locally

# Testing
pnpm test             # Run unit tests with Vitest

# Deployment
pnpm deploy           # Build and deploy to Cloudflare
pnpm cf-typegen       # Generate TypeScript types for Cloudflare bindings
```

## Configuration Files

### `vite.config.ts`
Vite configuration with plugins:
- **tsConfigPaths** - Path alias resolution (`@/`)
- **tanstackRouter** - Auto-generate route tree with code splitting
- **viteReact** - React Fast Refresh and JSX support
- **tailwindcss** - Tailwind CSS v4 integration
- **cloudflare** - Cloudflare-specific features (remote bindings)

### `wrangler.jsonc`
Cloudflare Worker configuration:
- Worker name: `web`
- Entry point: `worker/index.ts`
- Assets binding for SPA routing
- Observability enabled for monitoring

### `tsconfig.json`
TypeScript configuration:
- Target: ES2022
- Module: ESNext with bundler resolution
- Strict mode enabled
- Path aliases: `@/*` → `src/*`, `@/worker/*` → `worker/*`

### `components.json`
shadcn/ui configuration for component generation:
- Style: New York
- Base color: Neutral
- CSS variables enabled
- Icon library: Lucide (to be installed when needed)