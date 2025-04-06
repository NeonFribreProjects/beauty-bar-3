-- Delete existing bookings
DELETE FROM "Booking";

-- Add new required columns
ALTER TABLE "Booking" 
ADD COLUMN "customerName" TEXT NOT NULL,
ADD COLUMN "customerEmail" TEXT NOT NULL,
ADD COLUMN "customerPhone" TEXT NOT NULL; 