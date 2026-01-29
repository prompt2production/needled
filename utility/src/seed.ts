import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { executeQuery } from './database.js';

const BCRYPT_COST_FACTOR = 12;

const DEMO_EMAIL = 'demo@needled.app';
const DEMO_PASSWORD = 'Demo1234!';

const INJECTION_SITES = [
  'ABDOMEN_LEFT',
  'THIGH_RIGHT',
  'ABDOMEN_RIGHT',
  'UPPER_ARM_LEFT',
  'THIGH_LEFT',
  'UPPER_ARM_RIGHT',
];

// Weight readings showing gradual loss with realistic fluctuation
// ~0.5-0.8kg per week average, occasional plateau or slight uptick
const WEEKLY_WEIGHTS = [95.0, 94.2, 93.8, 93.1, 93.3, 92.5, 91.8];

interface SeedResult {
  weighInsCreated: number;
  injectionsCreated: number;
  habitsCreated: number;
}

/**
 * Simple seeded pseudo-random number generator for deterministic demo data.
 * Returns values between 0 and 1.
 */
function createRng(initial: number) {
  let state = initial;
  return function next(): number {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Returns the most recent Monday at 8am relative to the given date.
 */
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(8, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function checkDemoUserExists(): Promise<boolean> {
  const result = await executeQuery(
    `SELECT EXISTS (SELECT 1 FROM "User" WHERE email = $1)`,
    [DEMO_EMAIL]
  );
  return result.rows[0].exists;
}

export async function seedDemoData(): Promise<SeedResult> {
  const userId = randomUUID();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_COST_FACTOR);
  const rng = createRng(42);

  const now = new Date();
  // Start the journey 6 weeks ago from the Monday of the current week
  const thisMonday = getMondayOfWeek(now);
  const journeyStart = addDays(thisMonday, -42); // 6 weeks back

  // --- Create User ---
  await executeQuery(
    `INSERT INTO "User" (id, name, email, "passwordHash", "startWeight", "goalWeight", "weightUnit", medication, "injectionDay", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [userId, 'Sarah Mitchell', DEMO_EMAIL, passwordHash, 95.0, 75.0, 'kg', 'OZEMPIC', 1, journeyStart, now]
  );

  // --- Create Notification Preferences ---
  await executeQuery(
    `INSERT INTO "NotificationPreference" (id, "userId", "injectionReminder", "weighInReminder", "habitReminder", "reminderTime", "habitReminderTime", timezone, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [randomUUID(), userId, true, true, true, '09:00', '20:00', 'Europe/London', now, now]
  );

  // --- Create Session ---
  const sessionExpiry = addDays(now, 30);
  await executeQuery(
    `INSERT INTO "Session" (id, token, "userId", "expiresAt", "createdAt")
     VALUES ($1, $2, $3, $4, $5)`,
    [randomUUID(), randomUUID(), userId, sessionExpiry, now]
  );

  // --- Create Weekly Weigh-Ins ---
  // Weigh-ins on Mondays (the day before injection day Tuesday)
  let weighInsCreated = 0;

  for (let week = 0; week < WEEKLY_WEIGHTS.length; week++) {
    const weighInDate = addDays(journeyStart, week * 7);
    // Add a bit of time variation - weigh-in between 7am and 9am
    weighInDate.setHours(7 + Math.floor(rng() * 2), Math.floor(rng() * 60), 0, 0);

    if (weighInDate > now) break;

    await executeQuery(
      `INSERT INTO "WeighIn" (id, "userId", weight, date, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), userId, WEEKLY_WEIGHTS[week], weighInDate, weighInDate, weighInDate]
    );
    weighInsCreated++;
  }

  // --- Create Weekly Injections ---
  // Injections on Tuesdays (injectionDay = 1, so Monday + 1 = Tuesday)
  let injectionsCreated = 0;

  for (let week = 0; week < 6; week++) {
    const injectionDate = addDays(journeyStart, week * 7 + 1); // +1 = Tuesday
    injectionDate.setHours(18, 0, 0, 0); // Evening injection

    if (injectionDate > now) break;

    const site = INJECTION_SITES[week % INJECTION_SITES.length];
    const doseNumber = (week % 4) + 1; // Cycle through doses 1-4

    await executeQuery(
      `INSERT INTO "Injection" (id, "userId", date, site, "doseNumber", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [randomUUID(), userId, injectionDate, site, doseNumber, injectionDate, injectionDate]
    );
    injectionsCreated++;
  }

  // --- Create Daily Habits ---
  // Realistic patterns: improving over time, weekdays better than weekends,
  // occasional complete misses, exercise hardest to maintain
  let habitsCreated = 0;
  const totalDays = Math.floor((now.getTime() - journeyStart.getTime()) / (1000 * 60 * 60 * 24));

  for (let day = 0; day <= totalDays; day++) {
    const habitDate = addDays(journeyStart, day);
    if (habitDate > now) break;

    const dayOfWeek = habitDate.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekNumber = Math.floor(day / 7);

    // Skip some days entirely (~8% miss rate, decreasing over time)
    const missRate = Math.max(0.03, 0.10 - weekNumber * 0.01);
    if (rng() < missRate) continue;

    // Base completion probability, improving over time
    // Week 0-1: ~65%, Week 2-3: ~75%, Week 4-5: ~85%
    const baseProb = Math.min(0.90, 0.65 + weekNumber * 0.04);
    const weekendPenalty = isWeekend ? 0.15 : 0;

    const water = rng() < (baseProb - weekendPenalty);
    const nutrition = rng() < (baseProb - weekendPenalty);
    // Exercise is harder to maintain, especially on weekends
    const exercise = rng() < (baseProb - weekendPenalty - 0.10);

    await executeQuery(
      `INSERT INTO "DailyHabit" (id, "userId", date, water, nutrition, exercise, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [randomUUID(), userId, formatDateOnly(habitDate), water, nutrition, exercise, habitDate, habitDate]
    );
    habitsCreated++;
  }

  return { weighInsCreated, injectionsCreated, habitsCreated };
}

export { DEMO_EMAIL, DEMO_PASSWORD };
