-- Migration: Simplify tables to match frontend requirements
-- Remove unnecessary columns and keep only essential fields

-- Drop unnecessary columns from investments table
ALTER TABLE public.investments 
DROP COLUMN IF EXISTS symbol,
DROP COLUMN IF EXISTS quantity,
DROP COLUMN IF EXISTS purchase_price,
DROP COLUMN IF EXISTS current_price,
DROP COLUMN IF EXISTS purchase_date,
DROP COLUMN IF EXISTS investment_type;

-- Drop unnecessary columns from expenses table
ALTER TABLE public.expenses
DROP COLUMN IF EXISTS vendor,
DROP COLUMN IF EXISTS receipt_number,
DROP COLUMN IF EXISTS expense_date;

-- Drop unnecessary columns from customer_payments table
ALTER TABLE public.customer_payments
DROP COLUMN IF EXISTS customer_phone,
DROP COLUMN IF EXISTS customer_email,
DROP COLUMN IF EXISTS payment_type,
DROP COLUMN IF EXISTS invoice_number,
DROP COLUMN IF EXISTS payment_date,
DROP COLUMN IF EXISTS due_date,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS notes;

-- Add essential fields that frontend needs
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

ALTER TABLE public.customer_payments
ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

-- Update existing records to have default values
UPDATE public.investments 
SET payment_mode = 'cash', date = CURRENT_DATE
WHERE payment_mode IS NULL OR date IS NULL;

UPDATE public.expenses 
SET payment_mode = 'cash', date = CURRENT_DATE
WHERE payment_mode IS NULL OR date IS NULL;

UPDATE public.customer_payments 
SET payment_mode = 'cash', date = CURRENT_DATE
WHERE payment_mode IS NULL OR date IS NULL;

-- Add constraints for essential fields only
ALTER TABLE public.investments 
ADD CONSTRAINT check_investment_payment_mode 
CHECK (payment_mode IN ('cash', 'card', 'upi', 'net_banking', 'wallet', 'other'));

ALTER TABLE public.expenses 
ADD CONSTRAINT check_expense_payment_mode 
CHECK (payment_mode IN ('cash', 'card', 'upi', 'net_banking', 'wallet', 'other'));

ALTER TABLE public.customer_payments 
ADD CONSTRAINT check_customer_payment_mode 
CHECK (payment_mode IN ('cash', 'card', 'upi', 'net_banking', 'wallet', 'other'));

-- Ensure expenses table has proper category constraint
ALTER TABLE public.expenses 
DROP CONSTRAINT IF EXISTS check_expense_category;

ALTER TABLE public.expenses 
ADD CONSTRAINT check_expense_category 
CHECK (category IN ('food', 'transport', 'utilities', 'entertainment', 'healthcare', 'education', 'shopping', 'travel', 'other'));

-- Make essential fields NOT NULL
ALTER TABLE public.investments 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN payment_mode SET NOT NULL,
ALTER COLUMN date SET NOT NULL;

ALTER TABLE public.expenses 
ALTER COLUMN payment_mode SET NOT NULL,
ALTER COLUMN date SET NOT NULL;

ALTER TABLE public.customer_payments 
ALTER COLUMN payment_mode SET NOT NULL,
ALTER COLUMN date SET NOT NULL;

-- Drop unnecessary indexes
DROP INDEX IF EXISTS idx_investments_symbol;
DROP INDEX IF EXISTS idx_investments_purchase_date;
DROP INDEX IF EXISTS idx_expenses_vendor;
DROP INDEX IF EXISTS idx_expenses_expense_date;
DROP INDEX IF EXISTS idx_customer_payments_customer_phone;
DROP INDEX IF EXISTS idx_customer_payments_payment_date;

-- Keep only essential indexes
CREATE INDEX IF NOT EXISTS idx_investments_payment_mode ON public.investments(payment_mode);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_mode ON public.expenses(payment_mode);
CREATE INDEX IF NOT EXISTS idx_customer_payments_payment_mode ON public.customer_payments(payment_mode);
CREATE INDEX IF NOT EXISTS idx_investments_date ON public.investments(date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_customer_payments_date ON public.customer_payments(date);

-- Update RLS policies to work with custom_users
DROP POLICY IF EXISTS "Investments are viewable by owner" ON public.investments;
DROP POLICY IF EXISTS "Users can insert their own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can delete their own investments" ON public.investments;

DROP POLICY IF EXISTS "Expenses are viewable by owner" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;

DROP POLICY IF EXISTS "Customer payments are viewable by owner" ON public.customer_payments;
DROP POLICY IF EXISTS "Users can insert their own customer payments" ON public.customer_payments;
DROP POLICY IF EXISTS "Users can update their own customer payments" ON public.customer_payments;
DROP POLICY IF EXISTS "Users can delete their own customer payments" ON public.customer_payments;

-- Recreate simplified policies
CREATE POLICY "Investments are viewable by owner"
ON public.investments
FOR SELECT
USING (user_id IN (SELECT id FROM custom_users));

CREATE POLICY "Users can insert their own investments"
ON public.investments
FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM custom_users));

CREATE POLICY "Users can update their own investments"
ON public.investments
FOR UPDATE
USING (user_id IN (SELECT id FROM custom_users));

CREATE POLICY "Users can delete their own investments"
ON public.investments
FOR DELETE
USING (user_id IN (SELECT id FROM custom_users));

CREATE POLICY "Expenses are viewable by owner"
ON public.expenses
FOR SELECT
USING (user_id IN (SELECT id FROM custom_users));

CREATE POLICY "Users can insert their own expenses"
ON public.expenses
FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM custom_users));

CREATE POLICY "Users can update their own expenses"
ON public.expenses
FOR UPDATE
USING (user_id IN (SELECT id FROM custom_users));

CREATE POLICY "Users can delete their own expenses"
ON public.expenses
FOR DELETE
USING (user_id IN (SELECT id FROM custom_users));

CREATE POLICY "Customer payments are viewable by owner"
ON public.customer_payments
FOR SELECT
USING (user_id IN (SELECT id FROM custom_users));

CREATE POLICY "Users can insert their own customer payments"
ON public.customer_payments
FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM custom_users));

CREATE POLICY "Users can update their own customer payments"
ON public.customer_payments
FOR UPDATE
USING (user_id IN (SELECT id FROM custom_users));

CREATE POLICY "Users can delete their own customer payments"
ON public.customer_payments
FOR DELETE
USING (user_id IN (SELECT id FROM custom_users));

-- Add comments for documentation
COMMENT ON COLUMN public.investments.name IS 'Investment name/description';
COMMENT ON COLUMN public.investments.payment_mode IS 'Payment method used';
COMMENT ON COLUMN public.investments.date IS 'Investment date';

COMMENT ON COLUMN public.expenses.payment_mode IS 'Payment method used';
COMMENT ON COLUMN public.expenses.date IS 'Expense date';

COMMENT ON COLUMN public.customer_payments.payment_mode IS 'Payment method used';
COMMENT ON COLUMN public.customer_payments.date IS 'Payment date';

-- Create simplified view for reporting
CREATE OR REPLACE VIEW public.financial_summary AS
SELECT 
    'investment' as type,
    user_id,
    SUM(amount) as total_amount,
    COUNT(*) as count,
    payment_mode,
    DATE_TRUNC('month', date) as month
FROM public.investments
GROUP BY user_id, payment_mode, DATE_TRUNC('month', date)

UNION ALL

SELECT 
    'expense' as type,
    user_id,
    SUM(amount) as total_amount,
    COUNT(*) as count,
    payment_mode,
    DATE_TRUNC('month', date) as month
FROM public.expenses
GROUP BY user_id, payment_mode, DATE_TRUNC('month', date)

UNION ALL

SELECT 
    'customer_payment' as type,
    user_id,
    SUM(amount) as total_amount,
    COUNT(*) as count,
    payment_mode,
    DATE_TRUNC('month', date) as month
FROM public.customer_payments
GROUP BY user_id, payment_mode, DATE_TRUNC('month', date);

-- Grant access to the view
GRANT SELECT ON public.financial_summary TO authenticated;
GRANT SELECT ON public.financial_summary TO anon;
