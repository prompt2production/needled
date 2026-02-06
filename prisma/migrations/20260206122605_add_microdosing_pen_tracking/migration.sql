-- CreateEnum
CREATE TYPE "DosingMode" AS ENUM ('STANDARD', 'MICRODOSE');

-- AlterTable
ALTER TABLE "Injection" ADD COLUMN     "isGoldenDose" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentDoseInPen" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "doseAmountMg" DECIMAL(5,2),
ADD COLUMN     "dosesPerPen" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "dosingMode" "DosingMode" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "penStrengthMg" DECIMAL(5,2),
ADD COLUMN     "tracksGoldenDose" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WeighIn" ALTER COLUMN "updatedAt" DROP DEFAULT;
