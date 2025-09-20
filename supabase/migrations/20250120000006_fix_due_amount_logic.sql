-- Migration: Fix due amount calculation logic
-- The issue is that we're summing due_amount from all payments instead of tracking the current due amount

-- Create a new function to get the current due amount for a customer
-- This should only consider the latest payment with due_amount > 0
CREATE OR REPLACE FUNCTION public.get_customers_with_due_amounts_fixed(
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
    cp.due_amount as total_due,
    COUNT(*)::INTEGER as payment_count,
    MAX(cp.date) as last_payment_date
  FROM public.customer_payments cp
  WHERE cp.user_id = p_user_id
    AND cp.due_amount > 0
    AND cp.id = (
      SELECT id 
      FROM public.customer_payments cp2 
      WHERE cp2.user_id = p_user_id 
        AND cp2.customer_name = cp.customer_name
        AND cp2.due_amount > 0
      ORDER BY cp2.created_at DESC 
      LIMIT 1
    )
  ORDER BY total_due DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new function to get due amount summary (fixed)
CREATE OR REPLACE FUNCTION public.get_due_amount_summary_fixed(
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
    AND cp.due_amount > 0
    AND cp.id = (
      SELECT id 
      FROM public.customer_payments cp2 
      WHERE cp2.user_id = p_user_id 
        AND cp2.customer_name = cp.customer_name
        AND cp2.due_amount > 0
      ORDER BY cp2.created_at DESC 
      LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to calculate customer due amount (fixed)
CREATE OR REPLACE FUNCTION public.calculate_customer_due_amount_fixed(
  p_user_id UUID,
  p_customer_name TEXT
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  current_due DECIMAL(10,2) := 0;
BEGIN
  -- Get the due amount from the latest payment record for this customer
  SELECT COALESCE(cp.due_amount, 0)
  INTO current_due
  FROM public.customer_payments cp
  WHERE cp.user_id = p_user_id 
    AND cp.customer_name = p_customer_name
    AND cp.due_amount > 0
  ORDER BY cp.created_at DESC
  LIMIT 1;
  
  RETURN current_due;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION public.get_customers_with_due_amounts_fixed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_due_amount_summary_fixed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_customer_due_amount_fixed(UUID, TEXT) TO authenticated;
