-- Migration: Add partial payment functionality
-- Add fields to support partial payments and due amount tracking

-- Add partial payment fields to customer_payments table
ALTER TABLE public.customer_payments
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS due_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_partial_payment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parent_payment_id UUID DEFAULT NULL REFERENCES public.customer_payments(id) ON DELETE SET NULL;

-- Add constraints for partial payment fields
ALTER TABLE public.customer_payments
ADD CONSTRAINT check_total_amount_positive CHECK (total_amount IS NULL OR total_amount > 0),
ADD CONSTRAINT check_due_amount_non_negative CHECK (due_amount >= 0),
ADD CONSTRAINT check_amount_less_than_total CHECK (
  total_amount IS NULL OR amount <= total_amount
);

-- Add index for parent_payment_id for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_payments_parent_id ON public.customer_payments(parent_payment_id);

-- Add index for partial payments
CREATE INDEX IF NOT EXISTS idx_customer_payments_is_partial ON public.customer_payments(is_partial_payment);

-- Update existing records to have default values
UPDATE public.customer_payments 
SET total_amount = amount, due_amount = 0, is_partial_payment = FALSE
WHERE total_amount IS NULL;

-- Create function to calculate due amounts for a customer
CREATE OR REPLACE FUNCTION public.calculate_customer_due_amount(
  p_user_id UUID,
  p_customer_name TEXT
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_due DECIMAL(10,2) := 0;
BEGIN
  -- Calculate total due amount for the customer
  SELECT COALESCE(SUM(due_amount), 0)
  INTO total_due
  FROM public.customer_payments
  WHERE user_id = p_user_id 
    AND customer_name = p_customer_name
    AND due_amount > 0;
  
  RETURN total_due;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all customers with due amounts
CREATE OR REPLACE FUNCTION public.get_customers_with_due_amounts(
  p_user_id UUID
)
RETURNS TABLE(
  customer_name TEXT,
  total_due DECIMAL(10,2),
  payment_count INTEGER,
  last_payment_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.customer_name,
    COALESCE(SUM(cp.due_amount), 0) as total_due,
    COUNT(*)::INTEGER as payment_count,
    MAX(cp.date) as last_payment_date
  FROM public.customer_payments cp
  WHERE cp.user_id = p_user_id
    AND cp.due_amount > 0
  GROUP BY cp.customer_name
  ORDER BY total_due DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get overall due amount summary
CREATE OR REPLACE FUNCTION public.get_due_amount_summary(
  p_user_id UUID
)
RETURNS TABLE(
  total_due_amount DECIMAL(10,2),
  customers_with_due INTEGER,
  average_due_per_customer DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(cp.due_amount), 0) as total_due_amount,
    COUNT(DISTINCT cp.customer_name)::INTEGER as customers_with_due,
    CASE 
      WHEN COUNT(DISTINCT cp.customer_name) > 0 
      THEN COALESCE(SUM(cp.due_amount), 0) / COUNT(DISTINCT cp.customer_name)
      ELSE 0 
    END as average_due_per_customer
  FROM public.customer_payments cp
  WHERE cp.user_id = p_user_id
    AND cp.due_amount > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION public.calculate_customer_due_amount(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_customers_with_due_amounts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_due_amount_summary(UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN public.customer_payments.total_amount IS 'Total amount for the transaction (for partial payments)';
COMMENT ON COLUMN public.customer_payments.due_amount IS 'Amount still due after this payment';
COMMENT ON COLUMN public.customer_payments.is_partial_payment IS 'Whether this is a partial payment';
COMMENT ON COLUMN public.customer_payments.parent_payment_id IS 'Reference to the original payment for partial payments';
