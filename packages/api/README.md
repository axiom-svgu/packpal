# Scaffold API

This is the API backend for the Scaffold project built with Bun, Elysia and TypeORM.

## Setup

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Start production server
bun run start
```

## Environment Variables

Create a `.env` file in the root of the API package with the following variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
PORT=3000
```
