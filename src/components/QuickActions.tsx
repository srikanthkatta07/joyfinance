import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { AddTransactionDialog } from "./AddTransactionDialog";

interface Transaction {
  type: "income" | "expense" | "investment";
  amount: number;
  description: string;
  payment_mode: string;
  date: string;
}

interface QuickActionsProps {
  onAddTransaction: (transaction: Transaction) => void;
}

export function QuickActions({ onAddTransaction }: QuickActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"income" | "expense" | "investment">("income");

  const quickActions = [
    {
      type: "income" as const,
      label: "Add Income",
      icon: TrendingUp,
      color: "bg-success text-success-foreground",
      description: "Record customer payment"
    },
    {
      type: "expense" as const,
      label: "Add Expense",
      icon: TrendingDown,
      color: "bg-destructive text-destructive-foreground",
      description: "Record shop expense"
    },
    {
      type: "investment" as const,
      label: "Add Investment",
      icon: DollarSign,
      color: "quick-action-btn text-primary-foreground",
      description: "Record capital injection"
    }
  ];

  const handleQuickAction = (type: "income" | "expense" | "investment") => {
    setSelectedType(type);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {quickActions.map((action) => (
          <Button
            key={action.type}
            onClick={() => handleQuickAction(action.type)}
            className={`${action.color} flex items-center justify-between p-4 h-auto`}
            variant={action.type === "investment" ? "default" : "secondary"}
          >
            <div className="flex items-center gap-3">
              <action.icon className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">{action.label}</div>
                <div className="text-sm opacity-90">{action.description}</div>
              </div>
            </div>
            <Plus className="h-5 w-5" />
          </Button>
        ))}
      </div>

      <AddTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transactionType={selectedType}
        onAddTransaction={(transaction) => {
          onAddTransaction(transaction);
          setDialogOpen(false);
        }}
      />
    </>
  );
}