import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, DollarSign, Users, MapPin, Calendar, Shield } from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    role: "client",
    balance: "0.00",
    isActive: true,
    clientNotes: "",
    userGroups: "Пользователи",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        bio: user.bio || "",
        role: user.role || "client",
        balance: user.balance || "0.00",
        isActive: user.isActive !== false,
        clientNotes: user.clientNotes || "",
        userGroups: user.userGroups || "Пользователи",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PUT", "/api/users/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить профиль",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Пользователь не найден</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Профиль пользователя</h1>
        <p className="text-muted-foreground">Управление личными данными и настройками аккаунта</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Основная информация
            </CardTitle>
            <CardDescription>
              Базовые данные вашего профиля
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="flex items-center gap-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="a2media"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Андрей"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Захарченко"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+7 (xxx) xxx-xx-xx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Роль пользователя</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
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

            <div className="space-y-2">
              <Label htmlFor="bio">Обо мне</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={3}
                placeholder="Расскажите о себе..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Финансовая информация */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Финансовая информация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="balance">Баланс</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="balance"
                  value={formData.balance}
                  onChange={(e) => handleInputChange("balance", e.target.value)}
                  placeholder="0.00"
                />
                <Badge variant="secondary">₽</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Системная информация */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Системная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IP адрес</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{user.ipAddress || "172.68.244.5"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Зарегистрирован</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : "04/07/2018 17:12"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Последний вход</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ru-RU') : "02/06/2025 13:04"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userGroups">Группы пользователя</Label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <Input
                    id="userGroups"
                    value={formData.userGroups}
                    onChange={(e) => handleInputChange("userGroups", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Label htmlFor="isActive">Активировать пользователя</Label>
                <p className="text-sm text-muted-foreground">
                  Включение/отключение доступа к системе
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Клиентские заметки */}
        <Card>
          <CardHeader>
            <CardTitle>Клиентские доступы и заметки</CardTitle>
            <CardDescription>
              Специальные инструкции для работы с проектами
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="clientNotes">Заметки</Label>
              <Textarea
                id="clientNotes"
                value={formData.clientNotes}
                onChange={(e) => handleInputChange("clientNotes", e.target.value)}
                rows={4}
                placeholder="ВСЕГДА КОММЕНТИРОВАТЬ КОД!! ПРИМЕР&#10;{% comment %}WS24 Задача: №3179 Дата...{% endcomment %}&#10;/*WS24 Задача: №3179 Дата...*/"
              />
            </div>
          </CardContent>
        </Card>

        {/* Кнопка сохранения */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="min-w-32"
          >
            {updateProfileMutation.isPending ? "Сохранение..." : "Сохранить профиль"}
          </Button>
        </div>
      </form>
    </div>
  );
}