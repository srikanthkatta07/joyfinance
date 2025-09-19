import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
  investments: number;
}

export function BalanceCard({ balance, income, expenses, investments }: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="money-card mb-6">
      <div className="text-center mb-4">
        <p className="text-muted-foreground text-sm mb-1">Current Balance</p>
        <div className={`balance-display ${balance < 0 ? 'text-destructive' : ''}`}>
          {formatCurrency(balance)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-full mx-auto mb-2">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="font-semibold text-success">{formatCurrency(income)}</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-destructive/10 rounded-full mx-auto mb-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-xs text-muted-foreground">Expenses</p>
          <p className="font-semibold text-destructive">{formatCurrency(expenses)}</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Investment</p>
          <p className="font-semibold text-primary">{formatCurrency(investments)}</p>
        </div>
      </div>
    </div>
  );
}