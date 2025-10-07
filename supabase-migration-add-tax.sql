-- ============================================
-- Migration: Add 8.875% Sales Tax to Existing Orders
-- ============================================
-- This script updates all existing individual_orders to reflect
-- the new prices that include 8.875% sales tax.
--
-- Price increases:
-- - 3-Roll Combo: $12.00 → $13.07 (+$1.07)
-- - Single Roll: $5.00 → $5.44 (+$0.44)
-- - Beverage: $3.00 → $3.27 (+$0.27)
-- - Miso Soup: $2.00 → $2.18 (+$0.18)
--
-- IMPORTANT: Make a backup of your data before running this!
-- ============================================

-- Step 1: Preview what will be updated (RUN THIS FIRST)
-- This shows the current totals and what they will become
SELECT 
    id,
    name,
    CASE WHEN three_roll_combo IS NOT NULL THEN 'Yes' ELSE 'No' END as has_3_roll,
    CASE WHEN single_roll IS NOT NULL THEN 'Yes' ELSE 'No' END as has_single,
    CASE WHEN beverage IS NOT NULL THEN 'Yes' ELSE 'No' END as has_beverage,
    miso_soup,
    total as current_total,
    ROUND(
        total +
        CASE WHEN three_roll_combo IS NOT NULL THEN 1.07 ELSE 0 END +
        CASE WHEN single_roll IS NOT NULL THEN 0.44 ELSE 0 END +
        CASE WHEN beverage IS NOT NULL THEN 0.27 ELSE 0 END +
        CASE WHEN miso_soup = true THEN 0.18 ELSE 0 END
    , 2) as new_total,
    ROUND(
        CASE WHEN three_roll_combo IS NOT NULL THEN 1.07 ELSE 0 END +
        CASE WHEN single_roll IS NOT NULL THEN 0.44 ELSE 0 END +
        CASE WHEN beverage IS NOT NULL THEN 0.27 ELSE 0 END +
        CASE WHEN miso_soup = true THEN 0.18 ELSE 0 END
    , 2) as tax_added
FROM individual_orders
ORDER BY created_at DESC;

-- Step 2: Update all individual orders with tax (RUN THIS AFTER REVIEWING PREVIEW)
-- This adds the tax increase to each order based on what items they have
UPDATE individual_orders
SET total = ROUND(
    total +
    CASE WHEN three_roll_combo IS NOT NULL THEN 1.07 ELSE 0 END +
    CASE WHEN single_roll IS NOT NULL THEN 0.44 ELSE 0 END +
    CASE WHEN beverage IS NOT NULL THEN 0.27 ELSE 0 END +
    CASE WHEN miso_soup = true THEN 0.18 ELSE 0 END
, 2);

-- Step 3: Verify the update (RUN THIS AFTER UPDATE)
-- Shows a summary of updated totals
SELECT 
    COUNT(*) as total_orders_updated,
    SUM(
        CASE WHEN three_roll_combo IS NOT NULL THEN 1.07 ELSE 0 END +
        CASE WHEN single_roll IS NOT NULL THEN 0.44 ELSE 0 END +
        CASE WHEN beverage IS NOT NULL THEN 0.27 ELSE 0 END +
        CASE WHEN miso_soup = true THEN 0.18 ELSE 0 END
    ) as total_tax_added,
    SUM(total) as new_grand_total
FROM individual_orders;

-- ============================================
-- ROLLBACK OPTION (if needed)
-- ============================================
-- If you need to undo this migration, run this ONLY if you made a backup
-- or if you know the exact tax amounts added to each order:
--
-- UPDATE individual_orders
-- SET total = ROUND(
--     total -
--     CASE WHEN three_roll_combo IS NOT NULL THEN 1.07 ELSE 0 END -
--     CASE WHEN single_roll IS NOT NULL THEN 0.44 ELSE 0 END -
--     CASE WHEN beverage IS NOT NULL THEN 0.27 ELSE 0 END -
--     CASE WHEN miso_soup = true THEN 0.18 ELSE 0 END
-- , 2);
-- ============================================

-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard → SQL Editor
-- 2. Copy and paste Step 1 (preview query) and run it
-- 3. Review the results to confirm they look correct
-- 4. Copy and paste Step 2 (update query) and run it
-- 5. Copy and paste Step 3 (verification query) to confirm success
-- 6. Refresh your app to see the updated prices

