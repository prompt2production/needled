import { executeQuery } from './database.js';

// Medication configuration data to seed
const MEDICATIONS = [
  {
    code: 'OZEMPIC',
    name: 'Ozempic',
    manufacturer: 'Novo Nordisk',
    supportsMicrodosing: true,
    sortOrder: 1,
    dosages: [0.25, 0.5, 1, 2],
    penStrengths: [2, 4, 8],
  },
  {
    code: 'WEGOVY',
    name: 'Wegovy',
    manufacturer: 'Novo Nordisk',
    supportsMicrodosing: true,
    sortOrder: 2,
    dosages: [0.25, 0.5, 1, 1.7, 2.4],
    penStrengths: [2.4, 4, 6.8, 10, 17],
  },
  {
    code: 'MOUNJARO',
    name: 'Mounjaro',
    manufacturer: 'Eli Lilly',
    supportsMicrodosing: true,
    sortOrder: 3,
    dosages: [2.5, 5, 7.5, 10, 12.5, 15],
    penStrengths: [5, 10, 15, 20, 25, 30],
  },
  {
    code: 'ZEPBOUND',
    name: 'Zepbound',
    manufacturer: 'Eli Lilly',
    supportsMicrodosing: true,
    sortOrder: 4,
    dosages: [2.5, 5, 7.5, 10, 12.5, 15],
    penStrengths: [5, 10, 15, 20, 25, 30],
  },
  {
    code: 'OTHER',
    name: 'Other',
    manufacturer: null,
    supportsMicrodosing: false,
    sortOrder: 99,
    dosages: [],
    penStrengths: [],
  },
];

const MICRODOSE_AMOUNTS = [0.25, 0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.75, 5, 6.25, 7.5];

const SYSTEM_CONFIG = {
  defaultDosesPerPen: '4',
};

export interface SeedMedicationConfigResult {
  medicationsCreated: number;
  dosagesCreated: number;
  penStrengthsCreated: number;
  microdoseAmountsCreated: number;
  systemConfigCreated: number;
}

function generateCuid(): string {
  // Simple cuid-like generator for seeding
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `c${timestamp}${random}`;
}

export async function clearMedicationConfigTables(): Promise<void> {
  // Clear in order: child tables first, then parent tables
  await executeQuery('DELETE FROM "MedicationDosage"');
  await executeQuery('DELETE FROM "MedicationPenStrength"');
  await executeQuery('DELETE FROM "MedicationConfig"');
  await executeQuery('DELETE FROM "MicrodoseAmount"');
  await executeQuery('DELETE FROM "SystemConfig" WHERE "key" = $1', ['defaultDosesPerPen']);
}

export async function checkMedicationConfigExists(): Promise<boolean> {
  const result = await executeQuery('SELECT COUNT(*) as count FROM "MedicationConfig"');
  return parseInt(result.rows[0].count, 10) > 0;
}

export async function seedMedicationConfig(): Promise<SeedMedicationConfigResult> {
  const result: SeedMedicationConfigResult = {
    medicationsCreated: 0,
    dosagesCreated: 0,
    penStrengthsCreated: 0,
    microdoseAmountsCreated: 0,
    systemConfigCreated: 0,
  };

  const now = new Date().toISOString();

  // Seed medications with their dosages and pen strengths
  for (const med of MEDICATIONS) {
    const medId = generateCuid();

    // Insert medication config
    await executeQuery(
      `INSERT INTO "MedicationConfig"
       ("id", "code", "name", "manufacturer", "supportsMicrodosing", "sortOrder", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [medId, med.code, med.name, med.manufacturer, med.supportsMicrodosing, med.sortOrder, true, now, now]
    );
    result.medicationsCreated++;

    // Insert dosages
    for (let i = 0; i < med.dosages.length; i++) {
      await executeQuery(
        `INSERT INTO "MedicationDosage"
         ("id", "medicationConfigId", "dosageMg", "sortOrder", "createdAt")
         VALUES ($1, $2, $3, $4, $5)`,
        [generateCuid(), medId, med.dosages[i], i + 1, now]
      );
      result.dosagesCreated++;
    }

    // Insert pen strengths
    for (let i = 0; i < med.penStrengths.length; i++) {
      await executeQuery(
        `INSERT INTO "MedicationPenStrength"
         ("id", "medicationConfigId", "strengthMg", "sortOrder", "createdAt")
         VALUES ($1, $2, $3, $4, $5)`,
        [generateCuid(), medId, med.penStrengths[i], i + 1, now]
      );
      result.penStrengthsCreated++;
    }
  }

  // Seed microdose amounts
  for (let i = 0; i < MICRODOSE_AMOUNTS.length; i++) {
    await executeQuery(
      `INSERT INTO "MicrodoseAmount"
       ("id", "amountMg", "sortOrder", "isActive", "createdAt")
       VALUES ($1, $2, $3, $4, $5)`,
      [generateCuid(), MICRODOSE_AMOUNTS[i], i + 1, true, now]
    );
    result.microdoseAmountsCreated++;
  }

  // Seed system config
  await executeQuery(
    `INSERT INTO "SystemConfig"
     ("id", "key", "value", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT ("key") DO UPDATE SET "value" = $3, "updatedAt" = $5`,
    [generateCuid(), 'defaultDosesPerPen', SYSTEM_CONFIG.defaultDosesPerPen, now, now]
  );
  result.systemConfigCreated++;

  return result;
}
