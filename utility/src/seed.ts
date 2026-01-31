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

// Mounjaro dosage progression over 3 months
// Month 1: 1mg, Month 2: 2.5mg, Month 3: 5mg
const DOSAGE_BY_WEEK: Record<number, number> = {
  0: 1.0,
  1: 1.0,
  2: 1.0,
  3: 1.0,
  4: 2.5,
  5: 2.5,
  6: 2.5,
  7: 2.5,
  8: 5.0,
  9: 5.0,
  10: 5.0,
  11: 5.0,
  12: 5.0,
};

// Weight readings for 13 weeks (3 months) showing gradual loss with realistic fluctuation
// Mounjaro typically shows ~1-1.5kg per week loss in first 3 months
// Pattern: good loss, plateau, more loss, slight uptick, continued loss
const WEEKLY_WEIGHTS = [
  95.0, // Week 0 - Starting weight
  94.2, // Week 1 - Initial water weight loss
  93.5, // Week 2
  93.1, // Week 3
  92.8, // Week 4 - End of 1mg phase
  91.9, // Week 5 - Increased dosage to 2.5mg
  91.2, // Week 6
  90.8, // Week 7 - Small plateau
  90.1, // Week 8 - End of 2.5mg phase
  89.3, // Week 9 - Increased dosage to 5mg
  88.5, // Week 10
  88.0, // Week 11
  87.3, // Week 12 - Current week
];

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
  // Start the journey 13 weeks ago (3 months) from the Monday of the current week
  const thisMonday = getMondayOfWeek(now);
  const journeyStart = addDays(thisMonday, -91); // 13 weeks back

  // --- Create User ---
  // Using Mounjaro with current dosage at 5mg (after 3 months of titration)
  await executeQuery(
    `INSERT INTO "User" (id, name, email, "passwordHash", "startWeight", "goalWeight", "weightUnit", medication, "injectionDay", "currentDosage", height, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [userId, 'Sarah Mitchell', DEMO_EMAIL, passwordHash, 95.0, 75.0, 'kg', 'MOUNJARO', 1, 5.0, 170, journeyStart, now]
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
  // Mounjaro dosage progression: 1mg (month 1) → 2.5mg (month 2) → 5mg (month 3)
  let injectionsCreated = 0;

  for (let week = 0; week < 13; week++) {
    const injectionDate = addDays(journeyStart, week * 7 + 1); // +1 = Tuesday
    injectionDate.setHours(18, 0, 0, 0); // Evening injection

    if (injectionDate > now) break;

    const site = INJECTION_SITES[week % INJECTION_SITES.length];
    const doseNumber = (week % 4) + 1; // Cycle through doses 1-4 (pen doses)
    const dosageMg = DOSAGE_BY_WEEK[week] ?? 5.0; // Get dosage for this week

    await executeQuery(
      `INSERT INTO "Injection" (id, "userId", date, site, "doseNumber", "dosageMg", notes, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        randomUUID(),
        userId,
        injectionDate,
        site,
        doseNumber,
        dosageMg,
        week === 4 ? 'Increased to 2.5mg - feeling good!' : week === 8 ? 'Starting 5mg dose today' : null,
        injectionDate,
        injectionDate,
      ]
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
