import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, Filter } from "lucide-react";
import { TransactionList } from "./TransactionList";
import { QuickActions } from "./QuickActions";
import { BalanceCard } from "./BalanceCard";

interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  amount: number;
  description: string;
  paymentMode: string;
  date: string;
  createdBy: string;
}

// Sample data - will be replaced with Supabase data
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    amount: 2500,
    description: "Customer payment",
    paymentMode: "UPI",
    date: "2024-01-15",
    createdBy: "Owner A"
  },
  {
    id: "2",
    type: "expense",
    amount: 800,
    description: "Office supplies",
    paymentMode: "Cash",
    date: "2024-01-14",
    createdBy: "Owner B"
  },
  {
    id: "3",
    type: "investment",
    amount: 5000,
    description: "Capital injection",
    paymentMode: "Bank Transfer",
    date: "2024-01-13",
    createdBy: "Owner A"
  }
];

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [filter, setFilter] = useState<"all" | "income" | "expense" | "investment">("all");

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
          <p className="text-muted-foreground">Shop Dashboard</p>
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
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
      <QuickActions onAddTransaction={(transaction) => {
        const newTransaction = {
          ...transaction,
          id: Date.now().toString(),
          createdBy: "Current User" // Will be replaced with actual user
        };
        setTransactions([newTransaction, ...transactions]);
      }} />

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
        onDeleteTransaction={(id) => {
          setTransactions(transactions.filter(t => t.id !== id));
        }}
      />
    </div>
  );
}