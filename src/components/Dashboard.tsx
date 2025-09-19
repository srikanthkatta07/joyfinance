import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, Filter, LogOut } from "lucide-react";
import { TransactionList } from "./TransactionList";
import { QuickActions } from "./QuickActions";
import { BalanceCard } from "./BalanceCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  amount: number;
  description: string;
  payment_mode: string;
  date: string;
  created_by: string;
}

// Helper function to map database records to UI format
const mapTransactionFromDB = (dbTransaction: any): Transaction => ({
  id: dbTransaction.id,
  type: dbTransaction.type,
  amount: dbTransaction.amount,
  description: dbTransaction.description,
  payment_mode: dbTransaction.payment_mode,
  date: dbTransaction.date,
  created_by: dbTransaction.created_by,
});

// Sample data - will be replaced with Supabase data
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    amount: 2500,
    description: "Customer payment",
    payment_mode: "UPI",
    date: "2024-01-15",
    created_by: "Owner A"
  },
  {
    id: "2",
    type: "expense",
    amount: 800,
    description: "Office supplies",
    payment_mode: "Cash",
    date: "2024-01-14",
    created_by: "Owner B"
  },
  {
    id: "3",
    type: "investment",
    amount: 5000,
    description: "Capital injection",
    payment_mode: "Bank Transfer",
    date: "2024-01-13",
    created_by: "Owner A"
  }
];

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<"all" | "income" | "expense" | "investment">("all");
  const [loading, setLoading] = useState(true);
  const { user, profile, signOut } = useAuth();

  // Load transactions from Supabase
  useEffect(() => {
    if (!user) return;
    
    const loadTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading transactions:', error);
          toast.error('Failed to load transactions');
        } else {
          const mappedTransactions = (data || []).map(mapTransactionFromDB);
          setTransactions(mappedTransactions);
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();

    // Set up real-time subscription
    const channel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTransactions(prev => [mapTransactionFromDB(payload.new), ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setTransactions(prev => prev.map(t => 
              t.id === payload.new.id ? mapTransactionFromDB(payload.new) : t
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_by'>) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          payment_mode: transaction.payment_mode,
          date: transaction.date,
          created_by: profile.display_name || profile.username
        });

      if (error) {
        console.error('Error adding transaction:', error);
        toast.error('Failed to add transaction');
      } else {
        toast.success('Transaction added successfully');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Failed to delete transaction');
      } else {
        toast.success('Transaction deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate balance
  const totalInvestments = transactions
    .filter(t => t.type === "investment")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalInvestments + totalIncome - totalExpenses;

  const filteredTransactions = filter === "all" 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Money Manager</h1>
          <p className="text-muted-foreground">Welcome, {profile?.display_name || profile?.username}</p>
        </div>
        <Button variant="outline" size="icon" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Balance Card */}
      <BalanceCard 
        balance={currentBalance}
        income={totalIncome}
        expenses={totalExpenses}
        investments={totalInvestments}
      />

      {/* Quick Actions */}
      <QuickActions onAddTransaction={addTransaction} />

      {/* Filter Chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "income", "expense", "investment"].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption as any)}
            className={`filter-chip whitespace-nowrap ${
              filter === filterOption ? "active" : ""
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <TransactionList 
        transactions={filteredTransactions}
        onDeleteTransaction={deleteTransaction}
      />
    </div>
  );
}