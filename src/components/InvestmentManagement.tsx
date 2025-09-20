import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { investmentAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function InvestmentManagement() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    payment_mode: 'cash',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      loadInvestments();
    }
  }, [user]);

  // Auto-refresh when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadInvestments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const loadInvestments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await investmentAPI.getAll(user.id);
      setInvestments(data);
    } catch (error) {
      console.error('Error loading investments:', error);
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const investmentData = {
        name: 'Investment',
        amount: parseFloat(formData.amount),
        description: formData.description,
        payment_mode: formData.payment_mode as "cash" | "card" | "upi" | "net_banking" | "wallet" | "other",
        date: formData.date
      };

      if (editingInvestment) {
        await investmentAPI.update(editingInvestment.id, investmentData);
        toast.success('Investment updated successfully');
      } else {
        await investmentAPI.create(user.id, investmentData);
        toast.success('Investment added successfully');
      }

      setIsDialogOpen(false);
      setEditingInvestment(null);
      setFormData({ amount: '', description: '', payment_mode: 'cash', date: new Date().toISOString().split('T')[0] });
      loadInvestments();
    } catch (error) {
      console.error('Error saving investment:', error);
      toast.error('Failed to save investment');
    }
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    setFormData({
      amount: investment.amount?.toString() || '',
      description: investment.description || '',
      payment_mode: investment.payment_mode || 'cash',
      date: investment.date || new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;

    try {
      await investmentAPI.delete(id);
      toast.success('Investment deleted successfully');
      loadInvestments();
    } catch (error) {
      console.error('Error deleting investment:', error);
      toast.error('Failed to delete investment');
    }
  };

  const openDialog = () => {
    setEditingInvestment(null);
    setFormData({ amount: '', description: '', payment_mode: 'cash', date: new Date().toISOString().split('T')[0] });
    setIsDialogOpen(true);
  };

  const totalAmount = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Investments</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Total: {totalAmount.toLocaleString()}</p>
        </div>
        <Button onClick={openDialog} size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Investment
        </Button>
      </div>

      {/* Investments List */}
      <div className="space-y-3">
        {investments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No investments yet</p>
              <p className="text-sm text-muted-foreground">Add your first investment to get started</p>
            </CardContent>
          </Card>
        ) : (
          investments.map((investment) => (
            <Card key={investment.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{investment.name}</h3>
                    <p className="text-sm text-muted-foreground">{investment.description}</p>
                    <p className="text-lg font-bold text-green-600">{investment.amount?.toLocaleString()}</p>
                    <div className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                      <p className="text-xs text-muted-foreground">Payment: {investment.payment_mode || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">Date: {investment.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(investment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(investment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingInvestment ? 'Edit Investment' : 'Add Investment'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="10000"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details..."
              />
            </div>
            <div>
              <Label htmlFor="payment_mode">Payment Mode</Label>
              <select
                id="payment_mode"
                value={formData.payment_mode}
                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="net_banking">Net Banking</option>
                <option value="wallet">Wallet</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingInvestment ? 'Update' : 'Add'} Investment
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}