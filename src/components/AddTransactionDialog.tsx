import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Transaction {
  type: "income" | "expense" | "investment";
  amount: number;
  description: string;
  paymentMode: string;
  date: string;
}

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionType: "income" | "expense" | "investment";
  onAddTransaction: (transaction: Transaction) => void;
}

const paymentModes = [
  "Cash",
  "UPI",
  "PhonePe",
  "GPay",
  "Paytm",
  "Bank Transfer",
  "Card",
  "Cheque"
];

export function AddTransactionDialog({
  open,
  onOpenChange,
  transactionType,
  onAddTransaction
}: AddTransactionDialogProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !paymentMode) {
      return;
    }

    onAddTransaction({
      type: transactionType,
      amount: parseFloat(amount),
      description,
      paymentMode,
      date
    });

    // Reset form
    setAmount("");
    setDescription("");
    setPaymentMode("");
    setDate(new Date().toISOString().split('T')[0]);
  };

  const getTitle = () => {
    switch (transactionType) {
      case "income":
        return "Add Income";
      case "expense":
        return "Add Expense";
      case "investment":
        return "Add Investment";
      default:
        return "Add Transaction";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-mode">Payment Mode</Label>
            <Select value={paymentMode} onValueChange={setPaymentMode} required>
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                {paymentModes.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}