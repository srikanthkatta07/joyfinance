-- Enhanced Backend Implementation for JoyFinance
-- Investment, Expense, and Customer Payment Management

-- Create investments table
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES custom_users(id) ON DELETE CASCADE,
  investment_type TEXT NOT NULL CHECK (investment_type IN ('stocks', 'bonds', 'mutual_funds', 'real_estate', 'crypto', 'gold', 'other')),
  name TEXT NOT NULL,
  symbol TEXT, -- For stocks/crypto
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  quantity DECIMAL(12,4), -- Number of shares/units
  purchase_price DECIMAL(12,2), -- Price per unit
  current_price DECIMAL(12,2), -- Current market price
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'matured')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES custom_users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('food', 'transport', 'utilities', 'entertainment', 'healthcare', 'education', 'shopping', 'travel', 'other')),
  subcategory TEXT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'net_banking', 'wallet', 'other')),
  vendor TEXT, -- Store/merchant name
  location TEXT, -- Where the expense occurred
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT, -- URL to receipt image
  tags TEXT[], -- Array of tags for better categorization
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer payments table
CREATE TABLE public.customer_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES custom_users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'net_banking', 'wallet', 'cheque', 'other')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('sale', 'service', 'subscription', 'refund', 'other')),
  description TEXT,
  invoice_number TEXT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE, -- For future payments
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update transactions table to work with custom_users (if it exists)
-- Note: We're not using the old transactions table anymore, but keeping this for reference

-- Enable Row Level Security
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

-- Investments policies
CREATE POLICY "Users can view all investments" 
ON public.investments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own investments" 
ON public.investments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own investments" 
ON public.investments 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own investments" 
ON public.investments 
FOR DELETE 
USING (true);

-- Expenses policies
CREATE POLICY "Users can view all expenses" 
ON public.expenses 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses 
FOR DELETE 
USING (true);

-- Customer payments policies
CREATE POLICY "Users can view all customer payments" 
ON public.customer_payments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own customer payments" 
ON public.customer_payments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own customer payments" 
ON public.customer_payments 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own customer payments" 
ON public.customer_payments 
FOR DELETE 
USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON public.investments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_payments_updated_at
  BEFORE UPDATE ON public.customer_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_investments_user_id ON public.investments(user_id);
CREATE INDEX idx_investments_type ON public.investments(investment_type);
CREATE INDEX idx_investments_date ON public.investments(purchase_date);
CREATE INDEX idx_investments_status ON public.investments(status);

CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX idx_expenses_payment_method ON public.expenses(payment_method);

CREATE INDEX idx_customer_payments_user_id ON public.customer_payments(user_id);
CREATE INDEX idx_customer_payments_customer ON public.customer_payments(customer_name);
CREATE INDEX idx_customer_payments_date ON public.customer_payments(payment_date);
CREATE INDEX idx_customer_payments_status ON public.customer_payments(status);

-- Create API functions for CRUD operations

-- Investment functions
CREATE OR REPLACE FUNCTION public.create_investment(
  p_user_id UUID,
  p_investment_type TEXT,
  p_name TEXT,
  p_amount DECIMAL,
  p_symbol TEXT DEFAULT NULL,
  p_quantity DECIMAL DEFAULT NULL,
  p_purchase_price DECIMAL DEFAULT NULL,
  p_current_price DECIMAL DEFAULT NULL,
  p_purchase_date DATE DEFAULT CURRENT_DATE,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  investment_type TEXT,
  name TEXT,
  symbol TEXT,
  amount DECIMAL,
  quantity DECIMAL,
  purchase_price DECIMAL,
  current_price DECIMAL,
  purchase_date DATE,
  description TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.investments (
    user_id, investment_type, name, symbol, amount, quantity,
    purchase_price, current_price, purchase_date, description
  )
  VALUES (
    p_user_id, p_investment_type, p_name, p_symbol, p_amount, p_quantity,
    p_purchase_price, p_current_price, p_purchase_date, p_description
  )
  RETURNING 
    investments.id, investments.investment_type, investments.name, investments.symbol,
    investments.amount, investments.quantity, investments.purchase_price, investments.current_price,
    investments.purchase_date, investments.description, investments.status, investments.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expense functions
CREATE OR REPLACE FUNCTION public.create_expense(
  p_user_id UUID,
  p_category TEXT,
  p_amount DECIMAL,
  p_description TEXT,
  p_payment_method TEXT,
  p_subcategory TEXT DEFAULT NULL,
  p_vendor TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_expense_date DATE DEFAULT CURRENT_DATE,
  p_receipt_url TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  category TEXT,
  subcategory TEXT,
  amount DECIMAL,
  description TEXT,
  payment_method TEXT,
  vendor TEXT,
  location TEXT,
  expense_date DATE,
  receipt_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.expenses (
    user_id, category, subcategory, amount, description, payment_method,
    vendor, location, expense_date, receipt_url, tags
  )
  VALUES (
    p_user_id, p_category, p_subcategory, p_amount, p_description, p_payment_method,
    p_vendor, p_location, p_expense_date, p_receipt_url, p_tags
  )
  RETURNING 
    expenses.id, expenses.category, expenses.subcategory, expenses.amount, expenses.description,
    expenses.payment_method, expenses.vendor, expenses.location, expenses.expense_date,
    expenses.receipt_url, expenses.tags, expenses.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Customer payment functions
CREATE OR REPLACE FUNCTION public.create_customer_payment(
  p_user_id UUID,
  p_customer_name TEXT,
  p_amount DECIMAL,
  p_payment_method TEXT,
  p_payment_type TEXT,
  p_customer_phone TEXT DEFAULT NULL,
  p_customer_email TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_invoice_number TEXT DEFAULT NULL,
  p_payment_date DATE DEFAULT CURRENT_DATE,
  p_due_date DATE DEFAULT NULL,
  p_status TEXT DEFAULT 'completed',
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  amount DECIMAL,
  payment_method TEXT,
  payment_type TEXT,
  description TEXT,
  invoice_number TEXT,
  payment_date DATE,
  due_date DATE,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.customer_payments (
    user_id, customer_name, customer_phone, customer_email, amount, payment_method,
    payment_type, description, invoice_number, payment_date, due_date, status, notes
  )
  VALUES (
    p_user_id, p_customer_name, p_customer_phone, p_customer_email, p_amount, p_payment_method,
    p_payment_type, p_description, p_invoice_number, p_payment_date, p_due_date, p_status, p_notes
  )
  RETURNING 
    customer_payments.id, customer_payments.customer_name, customer_payments.customer_phone,
    customer_payments.customer_email, customer_payments.amount, customer_payments.payment_method,
    customer_payments.payment_type, customer_payments.description, customer_payments.invoice_number,
    customer_payments.payment_date, customer_payments.due_date, customer_payments.status,
    customer_payments.notes, customer_payments.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Analytics functions
CREATE OR REPLACE FUNCTION public.get_financial_summary(p_user_id UUID)
RETURNS TABLE(
  total_investments DECIMAL,
  total_expenses DECIMAL,
  total_customer_payments DECIMAL,
  net_worth DECIMAL,
  monthly_expenses DECIMAL,
  monthly_income DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(inv.amount), 0) as total_investments,
    COALESCE(SUM(exp.amount), 0) as total_expenses,
    COALESCE(SUM(cp.amount), 0) as total_customer_payments,
    COALESCE(SUM(inv.amount), 0) + COALESCE(SUM(cp.amount), 0) - COALESCE(SUM(exp.amount), 0) as net_worth,
    COALESCE(SUM(CASE WHEN exp.expense_date >= CURRENT_DATE - INTERVAL '30 days' THEN exp.amount ELSE 0 END), 0) as monthly_expenses,
    COALESCE(SUM(CASE WHEN cp.payment_date >= CURRENT_DATE - INTERVAL '30 days' THEN cp.amount ELSE 0 END), 0) as monthly_income
  FROM 
    (SELECT amount FROM public.investments WHERE user_id = p_user_id) inv
    CROSS JOIN 
    (SELECT amount FROM public.expenses WHERE user_id = p_user_id) exp
    CROSS JOIN 
    (SELECT amount FROM public.customer_payments WHERE user_id = p_user_id) cp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
