import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users, Filter } from 'lucide-react';
import { customerPaymentAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function CustomerPaymentManagement() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    customer_name: '',
    amount: '',
    payment_mode: 'cash',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user]);

  const loadPayments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await customerPaymentAPI.getAll(user.id);
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const paymentData = {
        customer_name: formData.customer_name,
        amount: parseFloat(formData.amount),
        description: formData.description,
        payment_method: formData.payment_mode as "cash" | "card" | "upi" | "net_banking" | "wallet" | "cheque" | "other",
        payment_mode: formData.payment_mode as "cash" | "card" | "upi" | "net_banking" | "wallet" | "other",
        date: formData.date
      };

      if (editingPayment) {
        await customerPaymentAPI.update(editingPayment.id, paymentData);
        toast.success('Payment updated successfully');
      } else {
        await customerPaymentAPI.create(user.id, paymentData);
        toast.success('Payment added successfully');
      }

      setIsDialogOpen(false);
      setEditingPayment(null);
      setFormData({ 
        customer_name: '', 
        amount: '', 
        payment_mode: 'cash', 
        description: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      loadPayments();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.error('Failed to save payment');
    }
  };

  const handleEdit = (payment: any) => {
    setEditingPayment(payment);
    setFormData({
      customer_name: payment.customer_name || '',
      amount: payment.amount?.toString() || '',
      payment_mode: payment.payment_method || 'cash',
      description: payment.description || '',
      date: payment.date || new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      await customerPaymentAPI.delete(id);
      toast.success('Payment deleted successfully');
      loadPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
    }
  };

  const openDialog = () => {
    setEditingPayment(null);
    setFormData({ 
      customer_name: '', 
      amount: '', 
      payment_mode: 'cash', 
      description: '', 
      date: new Date().toISOString().split('T')[0] 
    });
    setIsDialogOpen(true);
  };

  // Filter payments by payment method
  const filteredPayments = paymentFilter === 'all' 
    ? payments 
    : payments.filter(payment => payment.payment_method === paymentFilter);

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  // Get payment method counts
  const paymentCounts = payments.reduce((acc, payment) => {
    const method = payment.payment_method || 'cash';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Payments</h2>
          <p className="text-muted-foreground">Total: {totalAmount.toLocaleString()}</p>
        </div>
        <Button onClick={openDialog} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      {/* Payment Method Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter by Payment Method:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={paymentFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPaymentFilter('all')}
          >
            All ({payments.length})
          </Button>
          {Object.entries(paymentCounts).map(([method, count]) => (
            <Button
              key={method}
              variant={paymentFilter === method ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentFilter(method)}
            >
              {method.charAt(0).toUpperCase() + method.slice(1)} ({count as number})
            </Button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No payments yet</p>
              <p className="text-sm text-muted-foreground">Add your first customer payment to get started</p>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{payment.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">{payment.description}</p>
                    <p className="text-lg font-bold text-green-600">{payment.amount?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Payment: {payment.payment_method}</p>
                    <p className="text-xs text-muted-foreground">Date: {payment.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(payment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(payment.id)}
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
              {editingPayment ? 'Edit Payment' : 'Add Payment'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Customer name"
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1000"
                required
              />
            </div>
            <div>
              <Label htmlFor="payment_mode">Payment Method</Label>
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
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Payment description..."
              />
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
                {editingPayment ? 'Update' : 'Add'} Payment
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