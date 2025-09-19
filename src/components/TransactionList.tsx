import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Trash2, User } from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  amount: number;
  description: string;
  paymentMode: string;
  date: string;
  createdBy: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export function TransactionList({ transactions, onDeleteTransaction }: TransactionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return <TrendingUp className="h-5 w-5 text-success" />;
      case "expense":
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      case "investment":
        return <DollarSign className="h-5 w-5 text-primary" />;
      default:
        return null;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-success";
      case "expense":
        return "text-destructive";
      case "investment":
        return "text-primary";
      default:
        return "text-foreground";
    }
  };

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">
          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No transactions found</p>
          <p className="text-sm">Add your first transaction above</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <span className="text-sm text-muted-foreground">{transactions.length} entries</span>
      </div>

      {transactions.map((transaction) => (
        <div key={transaction.id} className="transaction-item">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              {getTransactionIcon(transaction.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground truncate">
                  {transaction.description}
                </p>
                <p className={`font-bold ${getAmountColor(transaction.type)}`}>
                  {transaction.type === "expense" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {transaction.paymentMode}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(transaction.date)}
                </span>
              </div>
              
              <div className="flex items-center gap-1 mt-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {transaction.createdBy}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => onDeleteTransaction(transaction.id)}
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}