import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

// Known tables with dependencies - child tables first, then parent tables
// This ordering is used as a fallback and for verification
const KNOWN_TABLES_IN_DELETE_ORDER = [
  'NotificationPreference',
  'DailyHabit',
  'Injection',
  'WeighIn',
  'Session',
  'User',
  'BetaTester',
  'Item', // Example model from template
];

export async function connectToDatabase(connectionString: string): Promise<void> {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  // Test the connection
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
}

export async function disconnectFromDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function clearAllTables(): Promise<{ tablesCleared: number }> {
  if (!pool) {
    throw new Error('Not connected to database');
  }

  const client = await pool.connect();
  let tablesCleared = 0;

  try {
    // Get all tables from the database schema (excluding Prisma migration tables)
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name
    `);

    const allTables = tablesResult.rows.map((row) => row.table_name as string);

    // Check for any tables not in our known list (warn about potential missing tables)
    const unknownTables = allTables.filter(
      (t) => !KNOWN_TABLES_IN_DELETE_ORDER.includes(t)
    );
    if (unknownTables.length > 0) {
      console.log(
        `  Note: Found additional tables not in known list: ${unknownTables.join(', ')}`
      );
    }

    // Disable foreign key checks temporarily
    await client.query('SET session_replication_role = replica;');

    // Clear all tables found in the database
    for (const table of allTables) {
      try {
        await client.query(`DELETE FROM "${table}"`);
        tablesCleared++;
        console.log(`  Cleared table: ${table}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.log(`  Failed to clear table: ${table} - ${message}`);
      }
    }

    // Re-enable foreign key checks
    await client.query('SET session_replication_role = DEFAULT;');
  } finally {
    client.release();
  }

  return { tablesCleared };
}

export async function executeQuery(query: string, params?: unknown[]): Promise<pg.QueryResult> {
  if (!pool) {
    throw new Error('Not connected to database');
  }

  return pool.query(query, params);
}
