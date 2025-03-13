-- Delete duplicate categories keeping only the ones referenced by services
WITH DuplicateCategories AS (
  SELECT name, 
         id,
         ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rn
  FROM "Category"
)
DELETE FROM "Category"
WHERE id IN (
  SELECT id 
  FROM DuplicateCategories 
  WHERE rn > 1
); 
