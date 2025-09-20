import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Users, Filter, AlertCircle } from 'lucide-react';
import { customerPaymentAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function CustomerPaymentManagement() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [customersWithDue, setCustomersWithDue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    customer_name: '',
    amount: '',
    payment_mode: 'cash',
    description: '',
    date: new Date().toISOString().split('T')[0],
    total_amount: '',
    due_amount: '',
    is_partial_payment: false
  });

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user]);

  // Auto-refresh when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadPayments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const loadPayments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [paymentsData, customersWithDueData] = await Promise.all([
        customerPaymentAPI.getAll(user.id),
        customerPaymentAPI.getCustomersWithDueAmounts(user.id)
      ]);
      setPayments(paymentsData);
      setCustomersWithDue(customersWithDueData);
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

    // Validate payment amount
    if (formData.is_partial_payment && formData.total_amount && formData.amount) {
      const paymentAmount = parseFloat(formData.amount);
      const totalAmount = parseFloat(formData.total_amount);
      
      if (paymentAmount > totalAmount) {
        toast.error('Payment amount cannot exceed total amount');
        return;
      }
    }

    try {
      const paymentData = {
        customer_name: formData.customer_name,
        amount: parseFloat(formData.amount),
        description: formData.description,
        payment_method: formData.payment_mode as "cash" | "card" | "upi" | "net_banking" | "wallet" | "cheque" | "other",
        payment_mode: formData.payment_mode as "cash" | "card" | "upi" | "net_banking" | "wallet" | "other",
        date: formData.date,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : undefined,
        due_amount: formData.due_amount ? parseFloat(formData.due_amount) : undefined,
        is_partial_payment: formData.is_partial_payment
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
        date: new Date().toISOString().split('T')[0],
        total_amount: '',
        due_amount: '',
        is_partial_payment: false
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
      date: payment.date || new Date().toISOString().split('T')[0],
      total_amount: payment.total_amount?.toString() || '',
      due_amount: payment.due_amount?.toString() || '',
      is_partial_payment: payment.is_partial_payment || false
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
      date: new Date().toISOString().split('T')[0],
      total_amount: '',
      due_amount: '',
      is_partial_payment: false
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

      {/* Due Amounts Section */}
      {customersWithDue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Customers with Outstanding Due Amounts
            </CardTitle>
            <CardDescription>Customers who still have pending payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customersWithDue.map((customer) => (
                <div key={customer.customer_name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{customer.customer_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {customer.payment_count} payment(s) • Last payment: {customer.last_payment_date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">
                        {customer.total_due.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Due Amount</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        // For follow-up payments, the total amount is the remaining due amount
                        // The payment amount will be what they're paying now
                        setFormData({
                          customer_name: customer.customer_name,
                          amount: '',
                          payment_mode: 'upi', // Default to UPI for follow-up payments
                          description: `Follow-up payment for ${customer.customer_name}`,
                          date: new Date().toISOString().split('T')[0],
                          total_amount: customer.total_due.toString(), // This is the remaining amount to be paid
                          due_amount: '',
                          is_partial_payment: true
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Payment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{payment.customer_name}</h3>
                      {payment.is_partial_payment && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                          Partial
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{payment.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-green-600">{payment.amount?.toLocaleString()}</p>
                      {payment.is_partial_payment && payment.total_amount && (
                        <p className="text-sm text-muted-foreground">
                          / {payment.total_amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    {payment.due_amount > 0 && (
                      <p className="text-sm text-red-600 font-medium">
                        Due: {payment.due_amount.toLocaleString()}
                      </p>
                    )}
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
              {editingPayment ? 'Edit Payment' : 
               formData.description?.includes('Follow-up payment') ? 'Add Follow-up Payment' : 'Add Payment'}
            </DialogTitle>
            {formData.description?.includes('Follow-up payment') && (
              <p className="text-sm text-orange-600 mt-1">
                Adding payment for customer with outstanding dues
              </p>
            )}
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
            {/* Partial Payment Section */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_partial_payment"
                  checked={formData.is_partial_payment}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_partial_payment: checked as boolean })}
                />
                <Label htmlFor="is_partial_payment" className="text-sm font-medium">
                  This is a partial payment
                </Label>
              </div>
              
              {formData.is_partial_payment ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="total_amount">
                      {formData.description?.includes('Follow-up payment') 
                        ? 'Remaining Amount to Pay' 
                        : 'Total Transaction Amount'}
                    </Label>
                    <Input
                      id="total_amount"
                      type="number"
                      value={formData.total_amount}
                      onChange={formData.description?.includes('Follow-up payment') ? undefined : (e) => {
                        const totalAmount = e.target.value;
                        const paymentAmount = formData.amount;
                        const dueAmount = totalAmount && paymentAmount 
                          ? (parseFloat(totalAmount) - parseFloat(paymentAmount)).toString()
                          : '';
                        setFormData({ 
                          ...formData, 
                          total_amount: totalAmount,
                          due_amount: dueAmount
                        });
                      }}
                      placeholder={formData.description?.includes('Follow-up payment') 
                        ? "Remaining amount to be paid" 
                        : "Total amount for this transaction"}
                      required
                      readOnly={formData.description?.includes('Follow-up payment')}
                      className={formData.description?.includes('Follow-up payment') ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                    {formData.description?.includes('Follow-up payment') && (
                      <p className="text-xs text-muted-foreground mt-1">
                        This is the remaining amount the customer needs to pay
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="amount">
                      {formData.description?.includes('Follow-up payment') 
                        ? 'Amount Being Paid Now' 
                        : 'Payment Amount (Being Paid Now)'}
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => {
                        const paymentAmount = e.target.value;
                        const totalAmount = formData.total_amount;
                        
                        // Validate payment amount
                        if (totalAmount && paymentAmount && parseFloat(paymentAmount) > parseFloat(totalAmount)) {
                          // Don't update if payment exceeds total
                          return;
                        }
                        
                        const dueAmount = totalAmount && paymentAmount 
                          ? Math.max(0, parseFloat(totalAmount) - parseFloat(paymentAmount)).toString()
                          : '';
                        setFormData({ 
                          ...formData, 
                          amount: paymentAmount,
                          due_amount: dueAmount
                        });
                      }}
                      placeholder={formData.description?.includes('Follow-up payment') 
                        ? "How much is the customer paying now?" 
                        : "Amount being paid now"}
                      required
                    />
                    {formData.total_amount && formData.amount && parseFloat(formData.amount) > parseFloat(formData.total_amount) && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ Payment amount cannot exceed total amount
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="due_amount">
                      {formData.description?.includes('Follow-up payment') 
                        ? 'Still Due After This Payment' 
                        : 'Remaining Due Amount'}
                    </Label>
                    <Input
                      id="due_amount"
                      type="number"
                      value={formData.due_amount}
                      readOnly
                      placeholder="Amount still due after this payment"
                      className="bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.description?.includes('Follow-up payment') 
                        ? 'This shows how much will still be owed after this payment'
                        : 'This is calculated automatically based on total amount and payment amount'}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="amount">Payment Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="1000"
                    required
                  />
                </div>
              )}
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