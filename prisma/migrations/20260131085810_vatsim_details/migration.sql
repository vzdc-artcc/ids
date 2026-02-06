/*
  Warnings:

  - Added the required column `artcc` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cid` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `division` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "artcc" TEXT NOT NULL,
ADD COLUMN     "cid" TEXT NOT NULL,
ADD COLUMN     "division" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "rating" INTEGER NOT NULL;
