-- CreateTable
CREATE TABLE "AdminAvailability" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "maxBookings" INTEGER NOT NULL DEFAULT 8,
    "breakTime" INTEGER NOT NULL DEFAULT 15,

    CONSTRAINT "AdminAvailability_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminAvailability" ADD CONSTRAINT "AdminAvailability_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
