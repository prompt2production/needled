-- CreateEnum
CREATE TYPE "BetaPlatform" AS ENUM ('IOS', 'ANDROID');

-- CreateEnum
CREATE TYPE "PushTokenPlatform" AS ENUM ('ios', 'android');

-- CreateTable
CREATE TABLE "BetaTester" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "platform" "BetaPlatform" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetaTester_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BetaTester_email_key" ON "BetaTester"("email");

-- CreateIndex
CREATE INDEX "BetaTester_platform_idx" ON "BetaTester"("platform");

-- AlterTable
ALTER TABLE "User" ADD COLUMN "expoPushToken" TEXT;
ALTER TABLE "User" ADD COLUMN "pushTokenPlatform" "PushTokenPlatform";
ALTER TABLE "User" ADD COLUMN "pushTokenUpdatedAt" TIMESTAMP(3);
