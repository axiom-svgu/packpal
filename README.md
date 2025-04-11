# Scaffold

This monorepo contains three projects:

- **App**: A Vite + React application with React Router DOM, Tailwind, and ShadCN
- **Landing**: A Vite + React landing page using the same tech stack as the App
- **API**: A Bun + ElysiaJS backend with TypeORM

## Getting Started

```bash
# Install dependencies
bun install

# Run the app project
bun run app

# Run the landing page project
bun run landing

# Run the API project
bun run api
```

## Tech Stack

- Bun
- TypeScript
- Vite
- React
- React Router DOM
- Tailwind CSS
- ShadCN UI
- ElysiaJS
- TypeORM

# Express TypeORM API

A TypeScript-based REST API using Express.js, TypeORM, and Zod for validation.

## Setup

1. Make sure you have PostgreSQL installed and running
2. Create a database named `postgres`
3. Update database credentials in `index.ts` if needed
4. Install dependencies:

```bash
bun install
```

## Running the API

```bash
bun run index.ts
```

The server will start on port 3000 (or the port specified in the `PORT` environment variable).

## Deployment to Vercel

This API is configured for easy deployment to Vercel:

1. Set up your Vercel account and install the Vercel CLI:

   ```bash
   bun i -g vercel
   ```

2. Configure environment variables in Vercel:

   - `DB_HOST`: Your PostgreSQL host
   - `DB_PORT`: PostgreSQL port (default: 5432)
   - `DB_USERNAME`: Database username
   - `DB_PASSWORD`: Database password
   - `DB_NAME`: Database name

3. Deploy using Vercel CLI:
   ```bash
   vercel
   ```

## Development

This project uses:

- Express.js for the web server
- TypeORM for database management
- PostgreSQL as the database
- Zod for validation
- Bun as the JavaScript runtime
