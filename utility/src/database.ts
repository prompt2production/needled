import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

// Tables in order for deletion (respecting foreign key constraints)
// Child tables first, then parent tables
const TABLES_IN_DELETE_ORDER = [
  'NotificationPreference',
  'DailyHabit',
  'Injection',
  'WeighIn',
  'Session',
  'User',
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
    // Disable foreign key checks temporarily
    await client.query('SET session_replication_role = replica;');

    for (const table of TABLES_IN_DELETE_ORDER) {
      try {
        // Check if table exists
        const tableExists = await client.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          )`,
          [table]
        );

        if (tableExists.rows[0].exists) {
          await client.query(`DELETE FROM "${table}"`);
          tablesCleared++;
          console.log(`  Cleared table: ${table}`);
        }
      } catch (error) {
        // Table might not exist, skip it
        console.log(`  Skipped table: ${table} (may not exist)`);
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
