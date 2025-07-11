import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Users, 
  CheckSquare, 
  DollarSign, 
  TrendingUp,
  Eye,
  Edit,
  MessageSquare
} from "lucide-react";
export default function AdminDemo() {
  const [demoData, setDemoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  useEffect(() => {
    fetch("/api/admin/demo")
      .then(res => res.json())
      .then(data => {
        setDemoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading demo data:", err);
        setLoading(false);
      });
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }
  if (!demoData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load admin data</p>
        </div>
      </div>
    );
  }
  // Filter tasks
  const filteredTasks = (demoData.tasks || []).filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      created: { label: "Новый", className: "bg-blue-100 text-blue-800" },
      evaluating: { label: "Оценка", className: "bg-yellow-100 text-yellow-800" },
      evaluated: { label: "Оценен", className: "bg-orange-100 text-orange-800" },
      paid: { label: "Оплачен", className: "bg-purple-100 text-purple-800" },
      in_progress: { label: "В работе", className: "bg-green-100 text-green-800" },
      completed: { label: "Завершен", className: "bg-gray-100 text-gray-800" },
    };
    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };
  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; className: string }> = {
      high: { label: "Высокий", className: "bg-red-100 text-red-800" },
      medium: { label: "Средний", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Низкий", className: "bg-green-100 text-green-800" },
    };
    const config = priorityConfig[priority] || { label: priority, className: "bg-gray-100 text-gray-800" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount) || 0);
  };
  const getUserDisplayName = (task: any) => {
    if (task.clientFirstName && task.clientLastName) {
      return `${task.clientFirstName} ${task.clientLastName}`;
    }
    if (task.clientFirstName) {
      return task.clientFirstName;
    }
    return task.clientEmail || "Unknown";
  };
  const getUserInitials = (task: any) => {
    if (task.clientFirstName && task.clientLastName) {
      return `${task.clientFirstName.charAt(0)}${task.clientLastName.charAt(0)}`;
    }
    if (task.clientEmail) {
      return task.clientEmail.charAt(0).toUpperCase();
    }
    return "?";
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ws24 Админ панель</h1>
            <p className="text-gray-600 mt-1">
              Управление заявками и пользователями системы
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button size="sm" className="bg-primary hover:bg-blue-700">
              Добавить новую заявку
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CheckSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего заявок</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {demoData.stats?.totalTasks || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Пользователи</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {demoData.stats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Активные</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {demoData.stats?.activeTasks || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Доход</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(demoData.stats?.totalRevenue || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5" />
                <span>Заявки</span>
              </CardTitle>
            </div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск заявок..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="created">Новый</SelectItem>
                  <SelectItem value="evaluating">Оценка</SelectItem>
                  <SelectItem value="evaluated">Оценен</SelectItem>
                  <SelectItem value="paid">Оплачен</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="completed">Завершен</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Назначен</TableHead>
                    <TableHead>Последний ответ</TableHead>
                    <TableHead className="text-right">Опции</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task: any) => (
                    <TableRow key={task.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{task.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {task.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={task.clientProfileImageUrl} />
                            <AvatarFallback className="text-xs">
                              {getUserInitials(task)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{getUserDisplayName(task)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.specialistId ? (
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-green-100 text-green-700">
                                S
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">Specialist</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Не назначен</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(task.updatedAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}