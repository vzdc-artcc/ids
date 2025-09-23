/*
  Warnings:

  - Added the required column `readyInMinutes` to the `ReleaseRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReleaseRequest" ADD COLUMN     "readyInMinutes" INTEGER NOT NULL,
ADD COLUMN     "released" BOOLEAN NOT NULL DEFAULT false;
