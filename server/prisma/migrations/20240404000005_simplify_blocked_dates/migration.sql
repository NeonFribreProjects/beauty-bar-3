/*
  Warnings:

  - You are about to drop the column `affectedServices` on the `BlockedDate` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `BlockedDate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BlockedDate" DROP COLUMN "affectedServices",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "startTime" TEXT;

-- AddForeignKey
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
