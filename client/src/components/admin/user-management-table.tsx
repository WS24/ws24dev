import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Edit, 
  Calendar, 
  MapPin, 
  Phone, 
  DollarSign,
  Users,
  Shield
} from "lucide-react";

interface User {
  id: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  role: string;
  balance?: string;
  lastLogin?: string;
  ipAddress?: string;
  isActive?: boolean;
  clientNotes?: string;
  userGroups?: string;
  profileImageUrl?: string;
  createdAt?: string;
}

interface UserManagementTableProps {
  users: User[];
  isLoading: boolean;
}

export function UserManagementTable({ users, isLoading }: UserManagementTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<User> }) => {
      return await apiRequest("PUT", `/api/admin/users/${id}`, userData);
    },
    onSuccess: () => {
      toast({
        title: "Пользователь обновлен",
        description: "Данные пользователя успешно сохранены",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить пользователя",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        userData: editingUser
      });
    }
  };

  const updateEditingUser = (field: string, value: any) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [field]: value });
    }
  };

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.username) {
      return user.username;
    }
    return user.email || "Пользователь";
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Администратор</Badge>;
      case "specialist":
        return <Badge variant="secondary">Специалист</Badge>;
      case "client":
        return <Badge variant="outline">Заказчик</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Пользователь</TableHead>
            <TableHead>Email / Телефон</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Баланс</TableHead>
            <TableHead>Последний вход</TableHead>
            <TableHead>IP адрес</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.profileImageUrl} alt={getUserDisplayName(user)} />
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{getUserDisplayName(user)}</p>
                    <p className="text-sm text-gray-500">@{user.username || "username"}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{user.email || "Не указан"}</p>
                  {user.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {user.phone}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{user.balance || "0.00"} ₽</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-3 h-3" />
                  {user.lastLogin 
                    ? new Date(user.lastLogin).toLocaleDateString('ru-RU')
                    : "Никогда"
                  }
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-3 h-3" />
                  {user.ipAddress || "—"}
                </div>
              </TableCell>
              <TableCell>
                {user.isActive !== false ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Активен
                  </Badge>
                ) : (
                  <Badge variant="secondary">Неактивен</Badge>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditUser(user)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование пользователя</DialogTitle>
            <DialogDescription>
              Изменение данных пользователя {editingUser ? getUserDisplayName(editingUser) : ""}
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-6">
              {/* Основная информация */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Основная информация
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      value={editingUser.email || ""}
                      onChange={(e) => updateEditingUser("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-username">Имя пользователя</Label>
                    <Input
                      id="edit-username"
                      value={editingUser.username || ""}
                      onChange={(e) => updateEditingUser("username", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName">Имя</Label>
                    <Input
                      id="edit-firstName"
                      value={editingUser.firstName || ""}
                      onChange={(e) => updateEditingUser("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName">Фамилия</Label>
                    <Input
                      id="edit-lastName"
                      value={editingUser.lastName || ""}
                      onChange={(e) => updateEditingUser("lastName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Телефон</Label>
                    <Input
                      id="edit-phone"
                      value={editingUser.phone || ""}
                      onChange={(e) => updateEditingUser("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Роль пользователя</Label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(value) => updateEditingUser("role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Заказчик</SelectItem>
                        <SelectItem value="specialist">Специалист</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Финансовая информация */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Финансовая информация
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="edit-balance">Баланс</Label>
                  <Input
                    id="edit-balance"
                    value={editingUser.balance || ""}
                    onChange={(e) => updateEditingUser("balance", e.target.value)}
                  />
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Дополнительная информация
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-bio">Обо мне</Label>
                    <Textarea
                      id="edit-bio"
                      value={editingUser.bio || ""}
                      onChange={(e) => updateEditingUser("bio", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-userGroups">Группы пользователя</Label>
                    <Input
                      id="edit-userGroups"
                      value={editingUser.userGroups || ""}
                      onChange={(e) => updateEditingUser("userGroups", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-clientNotes">Клиентские заметки</Label>
                    <Textarea
                      id="edit-clientNotes"
                      value={editingUser.clientNotes || ""}
                      onChange={(e) => updateEditingUser("clientNotes", e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-isActive">Активировать пользователя</Label>
                    <Switch
                      id="edit-isActive"
                      checked={editingUser.isActive !== false}
                      onCheckedChange={(checked) => updateEditingUser("isActive", checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button
                  onClick={handleSaveUser}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}