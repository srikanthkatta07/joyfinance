import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, BarChart3, PieChart, Users, Receipt, TrendingUp, DollarSign, Home, CreditCard, Smartphone } from "lucide-react";
import { BalanceCard } from "./BalanceCard";
import { InvestmentManagement } from "./InvestmentManagement";
import { ExpenseManagement } from "./ExpenseManagement";
import { CustomerPaymentManagement } from "./CustomerPaymentManagement";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { investmentAPI, expenseAPI, customerPaymentAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function Dashboard() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  // Load data from new tables
  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load investments, expenses, and payments
        const [investmentsData, expensesData, paymentsData] = await Promise.all([
          investmentAPI.getAll(user.id),
          expenseAPI.getAll(user.id),
          customerPaymentAPI.getAll(user.id)
        ]);
        
        setInvestments(investmentsData);
        setExpenses(expensesData);
        setPayments(paymentsData);
        
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  // Calculate balance from new data sources
  const totalInvestments = investments.reduce((sum, inv) => {
    const currentValue = inv.current_price && inv.quantity 
      ? inv.current_price * inv.quantity 
      : inv.amount;
    return sum + currentValue;
  }, 0);
  
  const totalIncome = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentBalance = totalInvestments + totalIncome - totalExpenses;

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


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">JoyFinance</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.display_name || user?.username}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Dashboard with Tabs */}
      <div className="p-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
            <TabsTrigger value="overview" className="flex flex-col items-center space-y-1 p-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex flex-col items-center space-y-1 p-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Investments</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex flex-col items-center space-y-1 p-2">
              <Receipt className="h-4 w-4" />
              <span className="text-xs">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex flex-col items-center space-y-1 p-2">
              <Users className="h-4 w-4" />
              <span className="text-xs">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex flex-col items-center space-y-1 p-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col items-center space-y-1 p-2">
              <PieChart className="h-4 w-4" />
              <span className="text-xs">Analytics</span>
            </TabsTrigger>
          </TabsList>


        <TabsContent value="overview" className="space-y-6">
          {/* Balance Card */}
          <BalanceCard 
            balance={currentBalance}
            income={totalIncome}
            expenses={totalExpenses}
            investments={totalInvestments}
          />

          {/* Income Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Income
              </CardTitle>
              <CardDescription>Customer payments and income sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Total Income */}
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Income</div>
                </div>
                
                {/* Payment Type Segregation */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {payments.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Cash
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {payments.filter(p => p.payment_method === 'upi').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      UPI
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {payments.filter(p => !['cash', 'upi'].includes(p.payment_method)).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Other
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-red-600" />
                Expenses
              </CardTitle>
              <CardDescription>Your spending breakdown by category and payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Total Expenses */}
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                </div>
                
                {/* Payment Type Segregation */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-red-600">
                      {expenses.filter(e => e.payment_method === 'cash').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Cash
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-red-600">
                      {expenses.filter(e => e.payment_method === 'upi').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      UPI
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-red-600">
                      {expenses.filter(e => !['cash', 'upi'].includes(e.payment_method)).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Other
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="investments">
          <InvestmentManagement />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseManagement />
        </TabsContent>

        <TabsContent value="payments">
          <CustomerPaymentManagement />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
              <CardDescription>Overview of all your financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xl font-bold text-green-600">{investments.length}</div>
                  <div className="text-xs text-muted-foreground">Investments</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xl font-bold text-red-600">{expenses.length}</div>
                  <div className="text-xs text-muted-foreground">Expenses</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{payments.length}</div>
                  <div className="text-xs text-muted-foreground">Customer Payments</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}