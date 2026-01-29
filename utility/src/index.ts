import 'dotenv/config';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { connectToDatabase, disconnectFromDatabase, clearAllTables } from './database.js';
import { seedDemoData, checkDemoUserExists, DEMO_EMAIL, DEMO_PASSWORD } from './seed.js';

type Environment = 'local' | 'testing' | 'production';

interface DatabaseChoice {
  name: string;
  value: Environment;
}

interface MainMenuChoice {
  name: string;
  value: string;
}

const databases: DatabaseChoice[] = [
  { name: 'Local', value: 'local' },
  { name: 'Testing', value: 'testing' },
  { name: 'Production', value: 'production' },
];

const mainMenuOptions: MainMenuChoice[] = [
  { name: 'Clear all data in all tables', value: 'clear-all' },
  { name: 'Seed demo data', value: 'seed-demo' },
  { name: 'Exit', value: 'exit' },
];

function getConnectionString(env: Environment): string | undefined {
  switch (env) {
    case 'local':
      return process.env.DATABASE_URL_LOCAL;
    case 'testing':
      return process.env.DATABASE_URL_TESTING;
    case 'production':
      return process.env.DATABASE_URL_PRODUCTION;
  }
}

async function selectDatabase(): Promise<Environment> {
  console.log(chalk.cyan('\n╔════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.bold.white('     Needled Database Utility          ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));

  const { database } = await inquirer.prompt<{ database: Environment }>([
    {
      type: 'list',
      name: 'database',
      message: 'Select database to connect to:',
      choices: databases,
    },
  ]);

  return database;
}

async function showMainMenu(): Promise<string> {
  const { action } = await inquirer.prompt<{ action: string }>([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: mainMenuOptions,
    },
  ]);

  return action;
}

async function confirmDestructiveAction(message: string): Promise<boolean> {
  const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
    {
      type: 'confirm',
      name: 'confirmed',
      message: chalk.red(message),
      default: false,
    },
  ]);

  return confirmed;
}

async function handleClearAll(env: Environment): Promise<void> {
  const warningMessage = env === 'production'
    ? '⚠️  WARNING: You are about to delete ALL data from PRODUCTION. This cannot be undone! Are you sure?'
    : 'This will delete ALL data from all tables. Are you sure?';

  const confirmed = await confirmDestructiveAction(warningMessage);

  if (!confirmed) {
    console.log(chalk.yellow('\nOperation cancelled.'));
    return;
  }

  if (env === 'production') {
    const { confirmText } = await inquirer.prompt<{ confirmText: string }>([
      {
        type: 'input',
        name: 'confirmText',
        message: 'Type "DELETE PRODUCTION" to confirm:',
      },
    ]);

    if (confirmText !== 'DELETE PRODUCTION') {
      console.log(chalk.yellow('\nConfirmation text did not match. Operation cancelled.'));
      return;
    }
  }

  console.log(chalk.yellow('\nClearing all tables...'));

  try {
    const result = await clearAllTables();
    console.log(chalk.green(`\n✓ Successfully cleared ${result.tablesCleared} tables.`));
  } catch (error) {
    console.error(chalk.red('\n✗ Failed to clear tables:'), error);
  }
}

async function handleSeedDemo(env: Environment): Promise<void> {
  // Check if demo user already exists
  const exists = await checkDemoUserExists();
  if (exists) {
    console.log(chalk.yellow(`\nDemo user (${DEMO_EMAIL}) already exists in the database.`));

    const { overwrite } = await inquirer.prompt<{ overwrite: boolean }>([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Clear all data and re-seed? This will delete ALL existing data.',
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.yellow('Operation cancelled.'));
      return;
    }

    console.log(chalk.yellow('\nClearing existing data first...'));
    await clearAllTables();
    console.log(chalk.green('✓ Existing data cleared.'));
  }

  if (env === 'production') {
    const confirmed = await confirmDestructiveAction(
      '⚠️  You are about to seed demo data into PRODUCTION. Are you sure?'
    );
    if (!confirmed) {
      console.log(chalk.yellow('\nOperation cancelled.'));
      return;
    }
  }

  console.log(chalk.cyan('\nSeeding demo data (this may take a moment)...'));

  try {
    const result = await seedDemoData();
    console.log(chalk.green('\n✓ Demo data seeded successfully:'));
    console.log(chalk.white(`  • 1 user created`));
    console.log(chalk.white(`  • ${result.weighInsCreated} weigh-ins`));
    console.log(chalk.white(`  • ${result.injectionsCreated} injections`));
    console.log(chalk.white(`  • ${result.habitsCreated} daily habit entries`));
    console.log(chalk.white(`  • Notification preferences configured`));
    console.log(chalk.white(`  • Active session created`));
    console.log('');
    console.log(chalk.cyan('  Login credentials:'));
    console.log(chalk.white(`  Email:    ${DEMO_EMAIL}`));
    console.log(chalk.white(`  Password: ${DEMO_PASSWORD}`));
  } catch (error) {
    console.error(chalk.red('\n✗ Failed to seed demo data:'), error);
  }
}

async function main(): Promise<void> {
  try {
    const env = await selectDatabase();
    const connectionString = getConnectionString(env);

    if (!connectionString) {
      console.error(chalk.red(`\n✗ No connection string found for ${env} database.`));
      console.log(chalk.yellow('Please check your .env file contains DATABASE_URL_' + env.toUpperCase()));
      process.exit(1);
    }

    console.log(chalk.gray(`\nConnecting to ${env} database...`));
    await connectToDatabase(connectionString);
    console.log(chalk.green(`✓ Connected to ${env} database.\n`));

    let running = true;
    while (running) {
      const action = await showMainMenu();

      switch (action) {
        case 'clear-all':
          await handleClearAll(env);
          break;
        case 'seed-demo':
          await handleSeedDemo(env);
          break;
        case 'exit':
          running = false;
          break;
      }
    }

    await disconnectFromDatabase();
    console.log(chalk.gray('\nDisconnected from database. Goodbye!'));
  } catch (error) {
    console.error(chalk.red('\nAn error occurred:'), error);
    process.exit(1);
  }
}

main();
