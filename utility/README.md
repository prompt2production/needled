# Needled Database Utility

A standalone Node.js terminal application for database maintenance and data seeding.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment template and configure connection strings:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your actual database connection strings.

## Usage

Run the utility:
```bash
npm start
```

You will be prompted to:
1. Select which database to connect to (local, testing, or production)
2. Choose a maintenance operation

## Available Operations

- **Clear all data in all tables** - Deletes all data from all tables (with confirmation)

## Production Safety

When connecting to the production database, destructive operations require:
1. An initial confirmation prompt
2. Typing "DELETE PRODUCTION" to confirm

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL_LOCAL` | Connection string for local development database |
| `DATABASE_URL_TESTING` | Connection string for testing database |
| `DATABASE_URL_PRODUCTION` | Connection string for production database |
