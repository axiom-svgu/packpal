# Mock Data Seeding for PackPal API

This directory contains scripts to generate and seed mock data for the PackPal application.

## Structure

- `index.ts` - Main seeding logic and data generation functions
- `utils.ts` - Helper utilities for generating random data
- `seed.ts` - Script to run the seeding process

## Mock Data

The seeding process generates the following data:

- Users (including an admin user)
- Groups with members and varying roles
- Categories
- Items
- Item assignments
- Lists
- List items
- List item assignments

## Configuration

You can adjust the amount of mock data by modifying the `SEED_CONFIG` object in the `index.ts` file.

```typescript
const SEED_CONFIG = {
  USERS: 20,
  GROUPS: 8,
  MEMBERS_PER_GROUP: 4,
  CATEGORIES_PER_GROUP: 3,
  ITEMS_PER_CATEGORY: 5,
  ITEM_ASSIGNMENTS_PER_ITEM: 2,
  LISTS_PER_GROUP: 2,
  ITEMS_PER_LIST: 6,
  ASSIGNMENTS_PER_LIST_ITEM: 1,
};
```

## Running the Seed Script

To seed your database with mock data:

1. Ensure your database connection is configured correctly in the `.env` file
2. Run the following command from the project root:

```bash
bun run seed
```

This will connect to the database and populate it with realistic mock data.

## Admin User

The seeding process creates an admin user with the following credentials:

- Email: `admin@example.com`
- Password: `password123`

You can use this account to log in and test admin functionality.

## Regular Users

All regular users created by the seed script have the password `password123`.
