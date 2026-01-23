-- CreateEnum
CREATE TYPE "InjectionSite" AS ENUM ('ABDOMEN_LEFT', 'ABDOMEN_RIGHT', 'THIGH_LEFT', 'THIGH_RIGHT', 'UPPER_ARM_LEFT', 'UPPER_ARM_RIGHT');

-- CreateTable
CREATE TABLE "Injection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "site" "InjectionSite" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Injection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Injection_userId_date_idx" ON "Injection"("userId", "date");

-- AddForeignKey
ALTER TABLE "Injection" ADD CONSTRAINT "Injection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
