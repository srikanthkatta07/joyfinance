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
    <Card className="mb-4">
      <div className="p-4">
        <div className="text-center mb-4">
          <p className="text-muted-foreground text-sm mb-1">Current Balance</p>
          <div className={`text-2xl font-bold ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(balance)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-sm font-semibold text-green-600">{formatCurrency(income)}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mx-auto mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-sm font-semibold text-red-600">{formatCurrency(expenses)}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground">Investment</p>
            <p className="text-sm font-semibold text-blue-600">{formatCurrency(investments)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}