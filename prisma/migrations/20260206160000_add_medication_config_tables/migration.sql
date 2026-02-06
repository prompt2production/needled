-- CreateTable
CREATE TABLE "MedicationConfig" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "supportsMicrodosing" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationDosage" (
    "id" TEXT NOT NULL,
    "medicationConfigId" TEXT NOT NULL,
    "dosageMg" DECIMAL(5,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationDosage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationPenStrength" (
    "id" TEXT NOT NULL,
    "medicationConfigId" TEXT NOT NULL,
    "strengthMg" DECIMAL(5,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationPenStrength_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicrodoseAmount" (
    "id" TEXT NOT NULL,
    "amountMg" DECIMAL(5,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MicrodoseAmount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicationConfig_code_key" ON "MedicationConfig"("code");

-- CreateIndex
CREATE INDEX "MedicationConfig_code_idx" ON "MedicationConfig"("code");

-- CreateIndex
CREATE INDEX "MedicationConfig_isActive_sortOrder_idx" ON "MedicationConfig"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "MedicationDosage_medicationConfigId_sortOrder_idx" ON "MedicationDosage"("medicationConfigId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MedicationDosage_medicationConfigId_dosageMg_key" ON "MedicationDosage"("medicationConfigId", "dosageMg");

-- CreateIndex
CREATE INDEX "MedicationPenStrength_medicationConfigId_sortOrder_idx" ON "MedicationPenStrength"("medicationConfigId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MedicationPenStrength_medicationConfigId_strengthMg_key" ON "MedicationPenStrength"("medicationConfigId", "strengthMg");

-- CreateIndex
CREATE UNIQUE INDEX "MicrodoseAmount_amountMg_key" ON "MicrodoseAmount"("amountMg");

-- CreateIndex
CREATE INDEX "MicrodoseAmount_isActive_sortOrder_idx" ON "MicrodoseAmount"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig"("key");

-- AddForeignKey
ALTER TABLE "MedicationDosage" ADD CONSTRAINT "MedicationDosage_medicationConfigId_fkey" FOREIGN KEY ("medicationConfigId") REFERENCES "MedicationConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationPenStrength" ADD CONSTRAINT "MedicationPenStrength_medicationConfigId_fkey" FOREIGN KEY ("medicationConfigId") REFERENCES "MedicationConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
