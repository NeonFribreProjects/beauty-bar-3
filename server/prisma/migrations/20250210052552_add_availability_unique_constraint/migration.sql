/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,dayOfWeek]` on the table `AdminAvailability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AdminAvailability_categoryId_dayOfWeek_key" ON "AdminAvailability"("categoryId", "dayOfWeek");
