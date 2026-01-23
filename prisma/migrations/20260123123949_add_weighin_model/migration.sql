-- CreateTable
CREATE TABLE "WeighIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeighIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeighIn_userId_date_idx" ON "WeighIn"("userId", "date");

-- AddForeignKey
ALTER TABLE "WeighIn" ADD CONSTRAINT "WeighIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
