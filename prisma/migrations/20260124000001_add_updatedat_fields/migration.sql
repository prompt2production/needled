-- AlterTable: Add updatedAt to WeighIn (with default for existing rows)
ALTER TABLE "WeighIn" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: Add updatedAt to Injection (with default for existing rows)
ALTER TABLE "Injection" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
