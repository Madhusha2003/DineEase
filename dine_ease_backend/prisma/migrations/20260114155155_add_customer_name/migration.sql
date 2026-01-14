/*
  Warnings:

  - You are about to drop the column `note` on the `orderitem` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `orderitem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orderitem` DROP COLUMN `note`,
    DROP COLUMN `size`;
