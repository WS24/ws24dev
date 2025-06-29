import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Activity,
  Calendar,
  Download
} from "lucide-react";

const AnalyticsMenu = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => (
  <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
    <Button
      variant={activeTab === "overview" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("overview")}
      className="flex items-center gap-2"
    >
      <Activity className="h-4 w-4" />
      Overview
    </Button>
    <Button
      variant={activeTab === "tasks" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("tasks")}
      className="flex items-center gap-2"
    >
      <CheckCircle className="h-4 w-4" />
      Tasks
    </Button>
    <Button
      variant={activeTab === "revenue" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("revenue")}
      className="flex items-center gap-2"
    >
      <DollarSign className="h-4 w-4" />
      Revenue
    </Button>
    <Button
      variant={activeTab === "users" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("users")}
      className="flex items-center gap-2"
    >
      <Users className="h-4 w-4" />
      Users
    </Button>
    <Button
      variant={activeTab === "reports" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("reports")}
      className="flex items-center gap-2"
    >
      <FileText className="h-4 w-4" />
      Reports
    </Button>
  </div>
);

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("overview");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics", dateRange, reportType],
    retry: false,
  });

  const { data: taskMetrics, isLoading: taskMetricsLoading } = useQuery({
    queryKey: ["/api/analytics/tasks", dateRange],
    retry: false,
  });

  const { data: revenueMetrics, isLoading: revenueMetricsLoading } = useQuery({
    queryKey: ["/api/analytics/revenue", dateRange],
    retry: false,
  });

  const { data: userMetrics, isLoading: userMetricsLoading } = useQuery({
    queryKey: ["/api/analytics/users", dateRange],
    retry: false,
  });

  // Sample data for charts while API is being implemented
  const sampleTaskData = [
    { month: 'Jan', created: 12, completed: 8, inProgress: 4 },
    { month: 'Feb', created: 15, completed: 12, inProgress: 3 },
    { month: 'Mar', created: 18, completed: 15, inProgress: 6 },
    { month: 'Apr', created: 22, completed: 18, inProgress: 8 },
    { month: 'May', created: 25, completed: 20, inProgress: 10 },
    { month: 'Jun', created: 28, completed: 25, inProgress: 12 }
  ];

  const sampleRevenueData = [
    { month: 'Jan', revenue: 15420, costs: 8500 },
    { month: 'Feb', revenue: 18650, costs: 9200 },
    { month: 'Mar', revenue: 22340, costs: 10800 },
    { month: 'Apr', revenue: 28750, costs: 12400 },
    { month: 'May', revenue: 32100, costs: 14200 },
    { month: 'Jun', revenue: 38305, costs: 16800 }
  ];

  const sampleTaskStatusData = [
    { name: 'Completed', value: 45, color: '#10B981' },
    { name: 'In Progress', value: 25, color: '#3B82F6' },
    { name: 'Pending', value: 20, color: '#F59E0B' },
    { name: 'Cancelled', value: 10, color: '#EF4444' }
  ];

  const sampleUserActivityData = [
    { day: 'Mon', activeUsers: 24, newUsers: 3 },
    { day: 'Tue', activeUsers: 28, newUsers: 5 },
    { day: 'Wed', activeUsers: 32, newUsers: 2 },
    { day: 'Thu', activeUsers: 29, newUsers: 4 },
    { day: 'Fri', activeUsers: 35, newUsers: 6 },
    { day: 'Sat', activeUsers: 18, newUsers: 1 },
    { day: 'Sun', activeUsers: 15, newUsers: 2 }
  ];

  const exportReport = () => {
    // Implementation for report export
    console.log('Exporting report...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex">
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
                  <p className="text-gray-600">Comprehensive reporting and insights dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={exportReport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Analytics Menu */}
            <AnalyticsMenu activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold">$38,305</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm">+12.5% from last month</span>
                      </div>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Tasks</p>
                      <p className="text-2xl font-bold">28</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm">+8.2% from last month</span>
                      </div>
                    </div>
                    <FileText className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Active Users</p>
                      <p className="text-2xl font-bold">142</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm">+15.3% from last month</span>
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Completion Rate</p>
                      <p className="text-2xl font-bold">87.5%</p>
                      <div className="flex items-center mt-2">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        <span className="text-sm">-2.1% from last month</span>
                      </div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Tabs */}
            <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Task Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sampleTaskData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="created" fill="#3B82F6" name="Created" />
                          <Bar dataKey="completed" fill="#10B981" name="Completed" />
                          <Bar dataKey="inProgress" fill="#F59E0B" name="In Progress" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Task Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={sampleTaskStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {sampleTaskStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Revenue Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={sampleRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, '']} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stackId="1" 
                          stroke="#10B981" 
                          fill="#10B981" 
                          fillOpacity={0.6}
                          name="Revenue"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="costs" 
                          stackId="2" 
                          stroke="#EF4444" 
                          fill="#EF4444" 
                          fillOpacity={0.6}
                          name="Costs"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Average Completion Time</span>
                        <span className="font-semibold">3.2 days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Most Active Specialist</span>
                        <span className="font-semibold">John Smith</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Peak Activity Hours</span>
                        <span className="font-semibold">10AM - 2PM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Task Success Rate</span>
                        <span className="font-semibold text-green-600">94.7%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Task Creation Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={sampleTaskData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="created" stroke="#3B82F6" strokeWidth={2} />
                          <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Revenue Tab */}
              <TabsContent value="revenue" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={sampleRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, '']} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
                        <Line type="monotone" dataKey="costs" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Activity Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={sampleUserActivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="activeUsers" fill="#3B82F6" name="Active Users" />
                        <Bar dataKey="newUsers" fill="#10B981" name="New Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}