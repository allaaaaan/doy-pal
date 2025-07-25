-- Link All Existing Entities to Default Profile
-- Step 3: Update all existing records to use the default profile
-- REPLACE 'YOUR_PROFILE_ID_HERE' with the actual profile ID from step 2

-- Update events
UPDATE events 
SET profile_id = 'YOUR_PROFILE_ID_HERE'
WHERE profile_id IS NULL;

-- Update redemptions
UPDATE redemptions 
SET profile_id = 'YOUR_PROFILE_ID_HERE'
WHERE profile_id IS NULL;

-- Update templates
UPDATE templates 
SET profile_id = 'YOUR_PROFILE_ID_HERE'
WHERE profile_id IS NULL;

-- Update rewards
UPDATE rewards 
SET profile_id = 'YOUR_PROFILE_ID_HERE'
WHERE profile_id IS NULL;

-- Update template_analysis
UPDATE template_analysis 
SET profile_id = 'YOUR_PROFILE_ID_HERE'
WHERE profile_id IS NULL;

-- Verify the updates
SELECT 
  'events' as table_name, 
  COUNT(*) as total_records, 
  COUNT(profile_id) as records_with_profile
FROM events
UNION ALL
SELECT 
  'redemptions' as table_name, 
  COUNT(*) as total_records, 
  COUNT(profile_id) as records_with_profile
FROM redemptions
UNION ALL
SELECT 
  'templates' as table_name, 
  COUNT(*) as total_records, 
  COUNT(profile_id) as records_with_profile
FROM templates
UNION ALL
SELECT 
  'rewards' as table_name, 
  COUNT(*) as total_records, 
  COUNT(profile_id) as records_with_profile
FROM rewards
UNION ALL
SELECT 
  'template_analysis' as table_name, 
  COUNT(*) as total_records, 
  COUNT(profile_id) as records_with_profile
FROM template_analysis; 