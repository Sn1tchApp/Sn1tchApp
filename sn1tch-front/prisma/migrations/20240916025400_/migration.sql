/*
  Warnings:

  - A unique constraint covering the columns `[emailVerified]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerified_key" ON "User"("emailVerified");
