-- Remove check constraint from expenses category to allow free text
-- This allows users to enter any category they want instead of being limited to predefined values

-- Remove the check constraint on expenses.category
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS check_expense_category;

-- The category column will now accept any text value
-- This makes the expense management more flexible for users
