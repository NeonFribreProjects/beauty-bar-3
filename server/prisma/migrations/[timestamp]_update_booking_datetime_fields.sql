-- First, add new columns
ALTER TABLE "Booking" ADD COLUMN "appointmentStart" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN "appointmentEnd" TIMESTAMP;

-- Update the new columns with converted data
UPDATE "Booking"
SET 
  "appointmentStart" = (date || ' ' || "startTime")::timestamp AT TIME ZONE 'America/Toronto',
  "appointmentEnd" = (date || ' ' || "endTime")::timestamp AT TIME ZONE 'America/Toronto';

-- Make the new columns required
ALTER TABLE "Booking" ALTER COLUMN "appointmentStart" SET NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "appointmentEnd" SET NOT NULL;

-- Drop old columns
ALTER TABLE "Booking" DROP COLUMN "date";
ALTER TABLE "Booking" DROP COLUMN "startTime";
ALTER TABLE "Booking" DROP COLUMN "endTime"; 