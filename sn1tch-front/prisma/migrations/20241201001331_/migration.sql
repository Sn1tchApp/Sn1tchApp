/*
  Warnings:

  - Added the required column `driveUrl` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "driveUrl" TEXT NOT NULL;
