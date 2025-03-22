-- AlterTable
ALTER TABLE "AdminAvailability" ALTER COLUMN "dayOfWeek" SET DATA TYPE TEXT;

-- Update existing records
UPDATE "AdminAvailability" 
SET "dayOfWeek" = CASE "dayOfWeek"
  WHEN '0' THEN 'Sunday'
  WHEN '1' THEN 'Monday'
  WHEN '2' THEN 'Tuesday'
  WHEN '3' THEN 'Wednesday'
  WHEN '4' THEN 'Thursday'
  WHEN '5' THEN 'Friday'
  WHEN '6' THEN 'Saturday'
END; 