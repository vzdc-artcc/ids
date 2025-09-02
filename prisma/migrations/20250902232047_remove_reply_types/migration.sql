/*
  Warnings:

  - You are about to drop the column `lastReplyById` on the `ReleaseRequest` table. All the data in the column will be lost.
  - You are about to drop the column `replyTextHistory` on the `ReleaseRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReleaseRequest" DROP CONSTRAINT "ReleaseRequest_lastReplyById_fkey";

-- AlterTable
ALTER TABLE "ReleaseRequest" DROP COLUMN "lastReplyById",
DROP COLUMN "replyTextHistory";
