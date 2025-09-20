import { supabase } from '@/integrations/supabase/client';

// Investment API functions
export interface Investment {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  description?: string;
  status: 'active' | 'sold' | 'matured';
  payment_mode: 'cash' | 'card' | 'upi' | 'net_banking' | 'wallet' | 'other';
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestmentData {
  name: string;
  amount: number;
  description?: string;
  status?: Investment['status'];
  payment_mode: Investment['payment_mode'];
  date?: string;
}

export const investmentAPI = {
  // Create a new investment
  async create(userId: string, data: CreateInvestmentData) {
    const { data: result, error } = await supabase
      .from('investments')
      .insert({
        user_id: userId,
        ...data
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Get all investments for a user
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get investment by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update investment
  async update(id: string, updates: Partial<CreateInvestmentData>) {
    const { data, error } = await supabase
      .from('investments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete investment
  async delete(id: string) {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Expense API functions
export interface Expense {
  id: string;
  user_id: string;
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  payment_method: 'cash' | 'card' | 'upi' | 'net_banking' | 'wallet' | 'other';
  location?: string;
  receipt_url?: string;
  tags?: string[];
  payment_mode: 'cash' | 'card' | 'upi' | 'net_banking' | 'wallet' | 'other';
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  payment_method: Expense['payment_method'];
  location?: string;
  receipt_url?: string;
  tags?: string[];
  payment_mode: Expense['payment_mode'];
  date?: string;
}

export const expenseAPI = {
  // Create a new expense
  async create(userId: string, data: CreateExpenseData) {
    const { data: result, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        ...data
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Get all expenses for a user
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get expenses by category
  async getByCategory(userId: string, category: Expense['category']) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get expense by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update expense
  async update(id: string, updates: Partial<CreateExpenseData>) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete expense
  async delete(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Customer Payment API functions
export interface CustomerPayment {
  id: string;
  user_id: string;
  customer_name: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'net_banking' | 'wallet' | 'cheque' | 'other';
  description?: string;
  payment_mode: 'cash' | 'card' | 'upi' | 'net_banking' | 'wallet' | 'other';
  date: string;
  created_at: string;
  updated_at: string;
  total_amount?: number;
  due_amount?: number;
  is_partial_payment?: boolean;
  parent_payment_id?: string;
}

export interface CreateCustomerPaymentData {
  customer_name: string;
  amount: number;
  payment_method: CustomerPayment['payment_method'];
  description?: string;
  payment_mode: CustomerPayment['payment_mode'];
  date?: string;
  total_amount?: number;
  due_amount?: number;
  is_partial_payment?: boolean;
  parent_payment_id?: string;
}

export const customerPaymentAPI = {
  // Create a new customer payment
  async create(userId: string, data: CreateCustomerPaymentData) {
    const { data: result, error } = await supabase
      .from('customer_payments')
      .insert({
        user_id: userId,
        ...data
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Get all customer payments for a user
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('customer_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get customer payment by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('customer_payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update customer payment
  async update(id: string, updates: Partial<CreateCustomerPaymentData>) {
    const { data, error } = await supabase
      .from('customer_payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete customer payment
  async delete(id: string) {
    const { error } = await supabase
      .from('customer_payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get customers with due amounts
  async getCustomersWithDueAmounts(userId: string) {
    // Get all payments and calculate due amounts on frontend
    const { data: payments, error } = await supabase
      .from('customer_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Group payments by customer and calculate due amounts
    const customerMap = new Map();
    
    // First, group all payments by customer
    payments?.forEach((payment: any) => {
      const customerName = payment.customer_name;
      if (!customerMap.has(customerName)) {
        customerMap.set(customerName, {
          customer_name: customerName,
          payments: [],
          total_due: 0,
          payment_count: 0,
          last_payment_date: payment.date
        });
      }
      
      const customer = customerMap.get(customerName);
      customer.payments.push(payment);
      customer.payment_count++;
      
      // Update last payment date
      if (new Date(payment.date) > new Date(customer.last_payment_date)) {
        customer.last_payment_date = payment.date;
      }
    });
    
    // Now calculate due amounts for each customer
    customerMap.forEach((customer) => {
      // Sort payments by created_at (most recent first)
      customer.payments.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // Get the most recent payment (first in sorted array)
      const mostRecentPayment = customer.payments[0];
      
      // Check if the most recent payment has a due amount > 0
      if (mostRecentPayment && mostRecentPayment.due_amount && mostRecentPayment.due_amount > 0) {
        customer.total_due = mostRecentPayment.due_amount;
      } else {
        customer.total_due = 0;
      }
    });
    
    // Return only customers with due amounts > 0
    const result = Array.from(customerMap.values())
      .filter(customer => customer.total_due > 0)
      .sort((a, b) => b.total_due - a.total_due);
    
    console.log('All customers:', Array.from(customerMap.values()));
    console.log('Customers with due amounts:', result);
    return result;
  },

  // Get due amount summary
  async getDueAmountSummary(userId: string) {
    const customersWithDue = await this.getCustomersWithDueAmounts(userId);
    
    const totalDueAmount = customersWithDue.reduce((sum, customer) => sum + customer.total_due, 0);
    const customersWithDueCount = customersWithDue.length;
    const averageDuePerCustomer = customersWithDueCount > 0 ? totalDueAmount / customersWithDueCount : 0;
    
    return {
      total_due_amount: totalDueAmount,
      customers_with_due: customersWithDueCount,
      average_due_per_customer: averageDuePerCustomer
    };
  },

  // Calculate customer due amount
  async calculateCustomerDueAmount(userId: string, customerName: string) {
    const customersWithDue = await this.getCustomersWithDueAmounts(userId);
    const customer = customersWithDue.find(c => c.customer_name === customerName);
    return customer ? customer.total_due : 0;
  }
};

// Analytics API functions
export interface FinancialSummary {
  total_investments: number;
  total_expenses: number;
  total_customer_payments: number;
  net_worth: number;
  monthly_expenses: number;
  monthly_income: number;
}

export const analyticsAPI = {
  // Get financial summary for a user
  async getFinancialSummary(userId: string): Promise<FinancialSummary> {
    // Get totals from each table
    const [investments, expenses, payments] = await Promise.all([
      supabase.from('investments').select('amount').eq('user_id', userId),
      supabase.from('expenses').select('amount').eq('user_id', userId),
      supabase.from('customer_payments').select('amount').eq('user_id', userId)
    ]);

    const totalInvestments = investments.data?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    const totalExpenses = expenses.data?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
    const totalPayments = payments.data?.reduce((sum, pay) => sum + pay.amount, 0) || 0;

    return {
      total_investments: totalInvestments,
      total_expenses: totalExpenses,
      total_customer_payments: totalPayments,
      net_worth: totalInvestments + totalPayments - totalExpenses,
      monthly_expenses: totalExpenses, // Simplified - you can add date filtering later
      monthly_income: totalPayments
    };
  },

  // Get monthly expense trends
  async getMonthlyExpenseTrends(userId: string, months: number = 12) {
    const { data, error } = await supabase
      .from('expenses')
      .select('date, amount, category')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get monthly income trends
  async getMonthlyIncomeTrends(userId: string, months: number = 12) {
    const { data, error } = await supabase
      .from('customer_payments')
      .select('date, amount')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get expense breakdown by category
  async getExpenseBreakdown(userId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('category, amount')
      .eq('user_id', userId);

    if (error) throw error;
    
    // Group by category and sum amounts
    const breakdown = data.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return breakdown;
  }
};