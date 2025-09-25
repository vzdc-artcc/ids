/*
  Warnings:

  - You are about to drop the column `readyInMinutes` on the `ReleaseRequest` table. All the data in the column will be lost.
  - Added the required column `condition` to the `ReleaseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initState` to the `ReleaseRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReleaseRequest" DROP COLUMN "readyInMinutes",
ADD COLUMN     "condition" TEXT NOT NULL,
ADD COLUMN     "initState" TEXT NOT NULL;
