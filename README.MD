# Bing Scraper

A full-stack web application for scraping Bing search results with a modern, scalable architecture built on Cloudflare's edge platform.

## Overview

This project provides a comprehensive solution for uploading CSV files containing search queries, automatically scraping Bing search results, and displaying the data in a user-friendly interface. The application leverages Cloudflare's edge computing ecosystem for high performance, global availability, and cost-effective scalability.

## Features

- **CSV Upload & Processing**: Upload CSV files with search queries for batch processing
- **Asynchronous Scraping**: Background job processing with Cloudflare Queues and Workflows
- **Real-time Updates**: Track scraping progress and view results in real-time
- **User Authentication**: Secure authentication system powered by Better Auth
- **Data Storage**: Efficient storage using Cloudflare D1 (database) and R2 (file storage)
- **Responsive UI**: Modern, accessible interface built with React and Tailwind CSS
- **Type-Safe API**: Full type safety across the stack with tRPC and TypeScript

## Architecture

### Tech Stack

#### Frontend
- **React 19** - UI library
- **TanStack Router** - Type-safe routing with file-based routing
- **TanStack Query** - Server state management
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Vite** - Build tool and dev server

#### Backend
- **Cloudflare Workers** - Edge compute platform
- **tRPC** - End-to-end type-safe APIs
- **Hono** - Lightweight web framework
- **Better Auth** - Authentication system
- **Zod** - Schema validation

#### Infrastructure (Cloudflare)
- **Pages** - Static site hosting
- **Workers** - Serverless compute
- **D1** - SQL database
- **R2** - Object storage
- **Queues** - Message queue for async tasks
- **Workflows** - Orchestration for scraping jobs
- **Browser Rendering** - Headless browser for scraping
- **KV** - Key-value store for metadata
- **Durable Objects** - Stateful coordination

#### Development Tools
- **TypeScript** - Type safety
- **pnpm** - Package manager
- **Wrangler** - Cloudflare deployment CLI
- **Vitest** - Unit testing
- **ESLint & Prettier** - Code quality

## Project Structure

```
bing-scraper/
├── apps/
│   ├── web/                      # Main web application
│   │   ├── src/
│   │   │   ├── components/       # React components
│   │   │   │   └── auth/         # Authentication components
│   │   │   ├── routes/           # File-based routing
│   │   │   │   ├── __root.tsx    # Root layout
│   │   │   │   ├── index.tsx     # Landing page
│   │   │   │   └── app/          # Authenticated routes
│   │   │   │       └── _authed/  # Protected dashboard
│   │   │   ├── styles/           # Global styles
│   │   │   ├── utils/            # Utility functions
│   │   │   ├── main.tsx          # Application entry point
│   │   │   └── router.tsx        # Router configuration
│   │   ├── worker/               # Cloudflare Worker backend
│   │   │   ├── index.ts          # Worker entry point
│   │   │   └── trpc/             # tRPC API
│   │   │       ├── router.ts     # Main router
│   │   │       ├── context.ts    # Request context
│   │   │       ├── trpc-instance.ts
│   │   │       └── routers/      # API route handlers
│   │   ├── wrangler.jsonc        # Cloudflare Worker config
│   │   ├── vite.config.ts        # Vite configuration
│   │   └── package.json
│   └── scraper/                  # Scraping service (to be implemented)
│       └── (Background jobs, workflows, browser automation)
└── packages/                     # Shared packages (to be implemented)
    └── database/                 # Database schema & migrations
```