-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('kg', 'lbs');

-- CreateEnum
CREATE TYPE "Medication" AS ENUM ('OZEMPIC', 'WEGOVY', 'MOUNJARO', 'ZEPBOUND', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startWeight" DOUBLE PRECISION NOT NULL,
    "goalWeight" DOUBLE PRECISION,
    "weightUnit" "WeightUnit" NOT NULL,
    "medication" "Medication" NOT NULL,
    "injectionDay" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
