import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  FileText, 
  Plus, 
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
export default function BillingPayments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [invoiceData, setInvoiceData] = useState({
    amount: "",
    description: "",
    dueDate: "",
    companyName: "",
    companyAddress: "",
    companyTaxId: ""
  });
  // Fetch user balance and stats
  const { data: billingStats, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/billing/stats"],
    retry: false
  });
  // Fetch transaction history
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ["/api/billing/transactions"],
    retry: false
  });
  // Fetch invoices
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["/api/billing/invoices"],
    retry: false
  });
  // Top up balance mutation
  const topUpMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest("POST", "/api/billing/topup", { amount });
    },
    onSuccess: () => {
      toast({
        title: "Balance Top-up Successful",
        description: "Your balance has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/transactions"] });
      setShowTopUpDialog(false);
      setTopUpAmount("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Top-up Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  // Create manual invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: typeof invoiceData) => {
      return await apiRequest("POST", "/api/billing/invoices", data);
    },
    onSuccess: () => {
      toast({
        title: "Invoice Created",
        description: "The invoice has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/invoices"] });
      setShowInvoiceDialog(false);
      setInvoiceData({
        amount: "",
        description: "",
        dueDate: "",
        companyName: "",
        companyAddress: "",
        companyTaxId: ""
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Invoice Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'payment':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'payout':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-orange-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  if (loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Payments</h1>
        <p className="text-muted-foreground">Manage your balance, transactions, and invoices</p>
      </div>
      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billingStats?.balance || 0)}</div>
            <p className="text-xs text-muted-foreground">Available for services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billingStats?.totalSpent || 0)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingStats?.pendingInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(billingStats?.pendingAmount || 0)}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Button onClick={() => setShowTopUpDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Top Up Balance
        </Button>
        {user?.role === 'admin' && (
          <Button variant="outline" onClick={() => setShowInvoiceDialog(true)}>
            <Receipt className="h-4 w-4 mr-2" />
            Create Manual Invoice
          </Button>
        )}
      </div>
      {/* Tabs for Transactions and Invoices */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your financial transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <span className={transaction.toUserId === user?.id ? 'text-green-600' : 'text-red-600'}>
                            {transaction.toUserId === user?.id ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>View and download your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No invoices found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Top Up Dialog */}
      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top Up Balance</DialogTitle>
            <DialogDescription>
              Add funds to your account balance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="100.00"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => setTopUpAmount("50")}>
                $50
              </Button>
              <Button variant="outline" onClick={() => setTopUpAmount("100")}>
                $100
              </Button>
              <Button variant="outline" onClick={() => setTopUpAmount("500")}>
                $500
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopUpDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => topUpMutation.mutate(parseFloat(topUpAmount))}
              disabled={!topUpAmount || parseFloat(topUpAmount) <= 0 || topUpMutation.isPending}
            >
              {topUpMutation.isPending ? "Processing..." : "Top Up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Invoice Dialog (Admin Only) */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Manual Invoice</DialogTitle>
            <DialogDescription>
              Create a manual invoice for billing purposes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-amount">Amount (USD)</Label>
                <Input
                  id="invoice-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceData.amount}
                  onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Invoice description..."
                value={invoiceData.description}
                onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={invoiceData.companyName}
                onChange={(e) => setInvoiceData({ ...invoiceData, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company-address">Company Address</Label>
              <Textarea
                id="company-address"
                value={invoiceData.companyAddress}
                onChange={(e) => setInvoiceData({ ...invoiceData, companyAddress: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tax-id">Tax ID</Label>
              <Input
                id="tax-id"
                value={invoiceData.companyTaxId}
                onChange={(e) => setInvoiceData({ ...invoiceData, companyTaxId: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createInvoiceMutation.mutate(invoiceData)}
              disabled={!invoiceData.amount || parseFloat(invoiceData.amount) <= 0 || createInvoiceMutation.isPending}
            >
              {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}