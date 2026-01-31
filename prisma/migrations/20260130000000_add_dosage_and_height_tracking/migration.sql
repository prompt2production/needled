-- AlterTable: Add dosage tracking fields to User
ALTER TABLE "User" ADD COLUMN "currentDosage" DECIMAL(4,2);
ALTER TABLE "User" ADD COLUMN "height" INTEGER;

-- AlterTable: Add dosageMg to Injection
ALTER TABLE "Injection" ADD COLUMN "dosageMg" DECIMAL(4,2);
