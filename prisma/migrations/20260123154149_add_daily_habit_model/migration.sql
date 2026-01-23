-- CreateTable
CREATE TABLE "DailyHabit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "water" BOOLEAN NOT NULL DEFAULT false,
    "nutrition" BOOLEAN NOT NULL DEFAULT false,
    "exercise" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyHabit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyHabit_userId_date_idx" ON "DailyHabit"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyHabit_userId_date_key" ON "DailyHabit"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyHabit" ADD CONSTRAINT "DailyHabit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
