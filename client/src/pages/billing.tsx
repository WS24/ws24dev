import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  CreditCard, 
  Search, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("2018");
  const [recordsPerPage, setRecordsPerPage] = useState("100");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/billing/transactions", selectedYear],
    retry: false,
  });

  const { data: billingStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/billing/stats"],
    retry: false,
  });

  const getStatusBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'completed':
      case 'refund':
        return <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 text-xs">Cancelled</Badge>;
      case 'transfer':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Transfer</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{type}</Badge>;
    }
  };

  // Sample data matching your screenshot structure
  const billingData = [
    { id: 51, year: 2018, month: 7, day: 31, order: 0, info: "Balance top-up", type: "Completed", income: "14848.00", expense: "", user: "Anton" },
    { id: 52, year: 2018, month: 8, day: 2, order: 59, info: "Payment for order No 59", type: "Completed", income: "", expense: "2200.00", user: "Anton" },
    { id: 53, year: 2018, month: 8, day: 2, order: 59, info: "Payment for order No 59", type: "Completed", income: "2200.00", expense: "", user: "SystemAdmin" },
    { id: 68, year: 2018, month: 8, day: 3, order: 59, info: "Transfer of funds after completion of order No 59", type: "Transfer", income: "1100.00", expense: "", user: "SystemAdmin" },
    { id: 69, year: 2018, month: 8, day: 3, order: 59, info: "Completion of funds after completion of order No 59", type: "Completed", income: "1100.00", expense: "", user: "Programmer" },
    { id: 73, year: 2018, month: 8, day: 3, order: 61, info: "Order No61 for 08.18", type: "Completed", income: "7600.00", expense: "", user: "Kozha" },
    { id: 75, year: 2018, month: 8, day: 3, order: 61, info: "Payment for order No 61", type: "Completed", income: "", expense: "7600.00", user: "Kozha" },
    { id: 76, year: 2018, month: 8, day: 3, order: 61, info: "Payment for order No 61", type: "Completed", income: "7600.00", expense: "", user: "SystemAdmin" },
    { id: 85, year: 2018, month: 8, day: 8, order: 0, info: "Order No92 for 08.18", type: "Completed", income: "1600.00", expense: "", user: "Kozha" },
    { id: 86, year: 2018, month: 8, day: 8, order: 63, info: "Payment for order No 63", type: "Completed", income: "", expense: "1600.00", user: "Kozha" },
    { id: 87, year: 2018, month: 8, day: 8, order: 63, info: "Payment for order No 63", type: "Completed", income: "1600.00", expense: "", user: "SystemAdmin" },
    { id: 88, year: 2018, month: 8, day: 9, order: 0, info: "Bank card top-up TINPOFF BANK 5536914000000xxx", type: "Completed", income: "5.00", expense: "", user: "" },
    { id: 89, year: 2018, month: 8, day: 10, order: 0, info: "IT invoice E.G. received for 09.18", type: "Completed", income: "12000.00", expense: "", user: "Kirill" },
    { id: 90, year: 2018, month: 8, day: 10, order: 64, info: "Payment for order No 64", type: "Completed", income: "", expense: "12000.00", user: "Kirill" },
    { id: 91, year: 2018, month: 8, day: 10, order: 64, info: "Payment for order No 64", type: "Completed", income: "12000.00", expense: "", user: "SystemAdmin" },
    { id: 92, year: 2018, month: 8, day: 11, order: 0, info: "Bank card top-up TINPOFF BANK 5536914000000xxx", type: "Completed", income: "2.50", expense: "", user: "" },
    { id: 95, year: 2018, month: 8, day: 11, order: 0, info: "Bank card top-up TINPOFF BANK 5536914000000xxx", type: "Completed", income: "3.00", expense: "", user: "" },
    { id: 96, year: 2018, month: 8, day: 11, order: 0, info: "Bank card top-up 'YANDEX MONEY' NBCO LLC 5106013000000xxx", type: "Completed", income: "20.00", expense: "", user: "adminds" },
    { id: 101, year: 2018, month: 8, day: 11, order: 0, info: "Bank card replenishment JSC CB MindBank 4024979000000xxx", type: "Completed", income: "30.00", expense: "", user: "adminds" },
  ];

  // Use real transaction data from API, fallback to sample data if not available
  const transactionData = transactions || billingData;
  
  const filteredData = transactionData.filter((item: any) => {
    const searchText = searchTerm.toLowerCase();
    return (
      (item.description || item.info || '').toLowerCase().includes(searchText) ||
      (item.userId || item.user || '').toLowerCase().includes(searchText) ||
      (item.type || '').toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex pt-16">
        <Sidebar />
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              {/* Header with breadcrumb */}
              <div className="mb-8">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span>💰</span>
                  <span className="ml-2 font-semibold text-gray-900">Billing / Finance Dashboard</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total in Account</p>
                        {statsLoading ? (
                          <div className="h-8 bg-blue-300/20 rounded animate-pulse"></div>
                        ) : (
                          <p className="text-2xl font-bold">${billingStats?.totalInAccount || "0.00"}</p>
                        )}
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Income in Orders</p>
                        {statsLoading ? (
                          <div className="h-8 bg-green-300/20 rounded animate-pulse"></div>
                        ) : (
                          <p className="text-2xl font-bold">${billingStats?.incomeInOrders || "0.00"}</p>
                        )}
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm">Expenses in Orders</p>
                        {statsLoading ? (
                          <div className="h-8 bg-yellow-300/20 rounded animate-pulse"></div>
                        ) : (
                          <p className="text-2xl font-bold">${billingStats?.expensesInOrders || "0.00"}</p>
                        )}
                      </div>
                      <AlertTriangle className="w-8 h-8 text-yellow-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-400 to-red-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm">Monthly Revenue</p>
                        {statsLoading ? (
                          <div className="h-8 bg-red-300/20 rounded animate-pulse"></div>
                        ) : (
                          <p className="text-2xl font-bold">${billingStats?.monthlyRevenue || "0.00"}</p>
                        )}
                      </div>
                      <CheckCircle className="w-8 h-8 text-red-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Controls */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Show</span>
                        <Select value={recordsPerPage} onValueChange={setRecordsPerPage}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-600">records</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Search:</span>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search transactions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transactions Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-16">ID</TableHead>
                          <TableHead className="w-20">Year</TableHead>
                          <TableHead className="w-20">Month</TableHead>
                          <TableHead className="w-20">Day</TableHead>
                          <TableHead className="w-20">Order</TableHead>
                          <TableHead className="min-w-60">Payment Information</TableHead>
                          <TableHead className="w-32">Type</TableHead>
                          <TableHead className="w-32 text-right">Income</TableHead>
                          <TableHead className="w-32 text-right">Expense</TableHead>
                          <TableHead className="w-32">User</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded"></div>
                              </TableCell>
                              <TableCell className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded"></div>
                              </TableCell>
                              <TableCell className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded"></div>
                              </TableCell>
                              <TableCell className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded"></div>
                              </TableCell>
                              <TableCell className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded"></div>
                              </TableCell>
                              <TableCell className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                              </TableCell>
                              <TableCell className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded"></div>
                              </TableCell>
                              <TableCell className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded"></div>
                              </TableCell>
                              <TableCell className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded"></div>
                              </TableCell>
                              <TableCell className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded"></div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : filteredData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-8">
                              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No transactions found
                              </h3>
                              <p className="text-gray-600">
                                No billing records match your search criteria.
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredData.map((transaction: any) => (
                            <TableRow key={transaction.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{transaction.id}</TableCell>
                              <TableCell>{transaction.year}</TableCell>
                              <TableCell>{transaction.month}</TableCell>
                              <TableCell>{transaction.day}</TableCell>
                              <TableCell>{transaction.taskId || transaction.order || "-"}</TableCell>
                              <TableCell className="max-w-sm">
                                <div className="truncate" title={transaction.description || transaction.info}>
                                  {transaction.description || transaction.info}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(transaction.status || transaction.type)}
                              </TableCell>
                              <TableCell className="text-right">
                                {(transaction.type === 'payment' || transaction.income) && (
                                  <span className="text-green-600 font-medium">
                                    ${transaction.amount || transaction.income}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {(transaction.type === 'debit' || transaction.expense) && (
                                  <span className="text-red-600 font-medium">
                                    -${transaction.amount || transaction.expense}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-blue-600 hover:underline cursor-pointer">
                                  {transaction.userId || transaction.user || "-"}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}