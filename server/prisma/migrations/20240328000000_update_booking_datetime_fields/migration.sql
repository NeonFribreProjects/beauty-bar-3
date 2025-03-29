-- CreateMigration
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "appointmentStart" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "appointmentEnd" TIMESTAMP;

-- Convert existing data
UPDATE "Booking"
SET 
  "appointmentStart" = (date || ' ' || "startTime")::timestamp AT TIME ZONE 'America/Toronto',
  "appointmentEnd" = (date || ' ' || "endTime")::timestamp AT TIME ZONE 'America/Toronto'
WHERE "appointmentStart" IS NULL;

-- Make new columns required
ALTER TABLE "Booking" ALTER COLUMN "appointmentStart" SET NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "appointmentEnd" SET NOT NULL;

-- Drop old columns
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "date";
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "startTime";
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "endTime";

-- Add indexes
CREATE INDEX IF NOT EXISTS "booking_service_id_idx" ON "Booking"("serviceId");
CREATE INDEX IF NOT EXISTS "booking_appointment_time_idx" ON "Booking"("appointmentStart", "appointmentEnd"); 