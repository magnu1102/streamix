-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "verificationRequestCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verificationRequestStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
