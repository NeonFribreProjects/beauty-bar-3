-- First create a temporary column
ALTER TABLE "Service" ADD COLUMN "duration_int" INTEGER;

-- Convert existing duration values to integers with a default of 60 minutes for nulls
UPDATE "Service" 
SET "duration_int" = CASE 
    WHEN duration IS NULL THEN 60
    WHEN duration LIKE '%hr, %mins' THEN 
        (CAST(SPLIT_PART(duration, 'hr, ', 1) AS INTEGER) * 60) + 
        CAST(SPLIT_PART(SPLIT_PART(duration, 'hr, ', 2), ' ', 1) AS INTEGER)
    WHEN duration LIKE '%mins' THEN 
        CAST(SPLIT_PART(duration, ' ', 1) AS INTEGER)
    ELSE 60 -- Default to 60 minutes for any other cases
END;

-- Drop the old column and rename the new one
ALTER TABLE "Service" DROP COLUMN "duration";
ALTER TABLE "Service" RENAME COLUMN "duration_int" TO "duration";

-- Make the column required
ALTER TABLE "Service" ALTER COLUMN "duration" SET NOT NULL; 