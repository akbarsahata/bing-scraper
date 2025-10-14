# Bing Scraper

This is a project to create a full fledge web application that scrapes Bing search results and displays them in a user-friendly manner. The project consists of user facing web app which allows users to upload csv files with search queries and displays the results, and scraper which will be responsible for scraping the Bing search results asynchronously and storing them in a database.

## Requirements

The system will be built using the following Cloudflare technologies:

### Web

- **Cloudflare Pages**: For hosting the user-facing web application.
- **Cloudflare Workers**: For handling backend logic and API requests.
- **Cloudflare D1**: For storing structured data and search results.
- **Cloudflare R2**: For storing uploaded CSV files and scraped data.

### Scraper

- **Cloudflare Queues**: For managing and processing scraping tasks asynchronously.
- **Cloudflare Workflows + Browser Rendering**: For executing the scraping logic and interacting with Bing.
- **Cloudflare KV**: For storing metadata and state information.
- **Cloudflare Durable Objects**: For managing stateful operations and coordinating scraping tasks.

### Additional Tools
- **Cloudflare Wrangler**: For deploying and managing Cloudflare Workers and other resources.
- **GitHub Actions**: For CI/CD and automating deployment processes.
- **TypeScript**: For writing type-safe code for both frontend and backend components.
- **React**: For building the user interface of the web application.
- **Vite**: For bundling and optimizing the frontend code.
- **tRPC**: For type-safe API communication between the frontend and backend.
- **Zod**: For schema validation and data parsing.
- **Drizzle ORM**: For interacting with the D1 database.
- **ESLint & Prettier**: For maintaining code quality and consistency.
- **Vitest**: For unit and integration testing.
- **Playwright**: For end-to-end testing of the web application.
- **Tailwind CSS**: For styling the web application.
- **Papaparse**: For parsing CSV files on the frontend.
- **Better-auth**: For handling user authentication and authorization.

## Project Structure

The project will be organized into the following directories:
- `apps/web/`: Contains the code for the user-facing web application.
- `apps/scraper/`: Contains the code for the scraping logic and backend services.
- `packages/database/`: Contains database schema and migration scripts.

## Tasks Breakdown

### Web Application
1. Set up Cloudflare Pages for hosting the web application.
2. Create a user interface using React and Tailwind CSS.
3. Implement file upload functionality to accept CSV files.
4. Set up API routes using Cloudflare Workers and tRPC.
5. Integrate with Cloudflare D1 and R2 for data storage.
6. Implement user authentication using better-auth.
7. Add error handling and notifications for user actions.
8. Write unit and integration tests using Vitest and Playwright.

### Scraper
1. Set up Cloudflare Queues for managing scraping tasks.
2. Implement scraping logic using Cloudflare Workflows and Browser Rendering.
3. Store scraped data in Cloudflare D1 and R2.
4. Use Cloudflare KV for storing metadata and state information.
5. Implement stateful operations using Cloudflare Durable Objects.
6. Write unit and integration tests for the scraper.

### Deployment
1. Set up CI/CD pipelines using GitHub Actions for automated deployment.
2. Configure Cloudflare Wrangler for deploying Workers and other resources.
3. Set up environment variables and secrets management.
4. Create deployment scripts for both web and scraper applications.

