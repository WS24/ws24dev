import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, FileUp, Users, Edit, Lock, Star, Mail, Database, Cog } from "lucide-react";

const ticketSettingsSchema = z.object({
  // General Ticket Settings
  allowFileUpload: z.boolean().default(true),
  allowGuestTickets: z.boolean().default(false),
  allowTicketEdit: z.boolean().default(true),
  requireLogin: z.boolean().default(false),
  allowTicketRating: z.boolean().default(true),
  preventRepliesAfterClose: z.boolean().default(true),
  
  // Auto Status Settings
  staffReplyAction: z.string().default("nothing"),
  clientReplyAction: z.string().default("nothing"),
  
  // IMAP Settings
  imapProtocol: z.string().default("imap"),
  imapHost: z.string().default("imap.timeweb.ru:993"),
  imapSsl: z.boolean().default(true),
  imapSkipCertValidation: z.boolean().default(false),
  imapEmail: z.string().email().default("ticket@ws24.pro"),
  imapPassword: z.string().min(1),
  
  // Default Settings
  ticketTitle: z.string().default("Support Ticket"),
  defaultCategory: z.string().default("general"),
  defaultStatus: z.string().default("new"),
  
  // IMAP String Settings
  imapTicketString: z.string().default("## Номер заявки:"),
  imapReplyString: z.string().default("##- Введите свой ответ над этой строкой -##"),
});

type TicketSettings = z.infer<typeof ticketSettingsSchema>;

export default function TicketSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/ticket-settings"],
    staleTime: 5 * 60 * 1000,
  });

  const form = useForm<TicketSettings>({
    resolver: zodResolver(ticketSettingsSchema),
    defaultValues: settings || {
      allowFileUpload: true,
      allowGuestTickets: false,
      allowTicketEdit: true,
      requireLogin: false,
      allowTicketRating: true,
      preventRepliesAfterClose: true,
      staffReplyAction: "nothing",
      clientReplyAction: "nothing",
      imapProtocol: "imap",
      imapHost: "imap.timeweb.ru:993",
      imapSsl: true,
      imapSkipCertValidation: false,
      imapEmail: "ticket@ws24.pro",
      imapPassword: "",
      ticketTitle: "Support Ticket",
      defaultCategory: "general",
      defaultStatus: "new",
      imapTicketString: "## Номер заявки:",
      imapReplyString: "##- Введите свой ответ над этой строкой -##",
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: TicketSettings) => {
      const response = await apiRequest("PUT", "/api/ticket-settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Ticket settings have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ticket-settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TicketSettings) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Ticket Settings</h1>
                <p className="text-gray-600">Configure ticket system preferences and IMAP settings</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* General Ticket Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Настройки заявок
                    </CardTitle>
                    <CardDescription>
                      Основные настройки системы заявок
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="allowFileUpload"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Разрешить загрузку файлов</FormLabel>
                            <FormDescription>
                              Позволяет пользователям прикреплять и загружать файлы к своим заявкам.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowGuestTickets"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Разрешить гостевые заявки</FormLabel>
                            <FormDescription>
                              Позволяет пользователям, у которых нет учетной записи, создавать заявки с созданием аккаунта и отправкой пароля на почту.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowTicketEdit"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Разрешить редактирование заявки</FormLabel>
                            <FormDescription>
                              Позволяет пользователям изменять свою собственную заявку (название, категорию, тело) после создания.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requireLogin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Требовать логин</FormLabel>
                            <FormDescription>
                              Требует, чтобы пользователь вошел в свою учетную запись для доступа к клиентской области (гостевые заявки не разрешены).
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowTicketRating"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Разрешить рейтинг заявок</FormLabel>
                            <FormDescription>
                              Позволяет пользователю оценить заявку в клиентской области.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preventRepliesAfterClose"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Запретить ответы после закрытия заявки</FormLabel>
                            <FormDescription>
                              Клиенты не смогут ответить на билет, как только его статус будет установлен в закрытый.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Auto Status Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cog className="w-5 h-5" />
                      Авто-установка статуса заявки
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="staffReplyAction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Когда сотрудники отвечают</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nothing">ничего не делать</SelectItem>
                                <SelectItem value="open">открыть заявку</SelectItem>
                                <SelectItem value="pending">ожидание ответа</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientReplyAction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Когда клиент отвечает</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nothing">ничего не делать</SelectItem>
                                <SelectItem value="open">открыть заявку</SelectItem>
                                <SelectItem value="answered">отвечено</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* IMAP Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Настройки IMAP
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="imapProtocol"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Протокол</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="imap">IMAP</SelectItem>
                                <SelectItem value="pop3">POP3</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="imapHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Хост протокола: порт</FormLabel>
                            <FormControl>
                              <Input placeholder="imap.timeweb.ru:993" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="imapSsl"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Протокол SSL</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="imapSkipCertValidation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Отменить проверку сертификата</FormLabel>
                              <FormDescription>
                                Disabling Certificate Validation can leave your emails to man-in-the-middle attacks.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="imapEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Электронная почта протокола</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="ticket@ws24.pro" {...field} />
                          </FormControl>
                          <FormDescription>
                            Не забудьте установить адрес электронной почты сайта на этот же адрес (в глобальных настройках).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imapPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Пароль протокола</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="•••••••••••••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Default Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Настройки по умолчанию
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="ticketTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название заявки</FormLabel>
                          <FormControl>
                            <Input placeholder="Support Ticket" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="defaultCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Категория по умолчанию</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">Назначает исполнитель</SelectItem>
                                <SelectItem value="technical">Техническая поддержка</SelectItem>
                                <SelectItem value="billing">Биллинг</SelectItem>
                                <SelectItem value="sales">Продажи</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Категория по умолчанию, в которую попадают вновь созданные тикеты.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defaultStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Статус по умолчанию</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="new">Новая</SelectItem>
                                <SelectItem value="open">Открыта</SelectItem>
                                <SelectItem value="pending">В ожидании</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Статус по умолчанию, который получает заявка при создании.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* IMAP String Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Настройки IMAP строк
                    </CardTitle>
                    <CardDescription>
                      Эти строки должны находиться внутри шаблонов электронной почты, чтобы Cron мог получить необходимую информацию.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="imapTicketString"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMAP Ticket String</FormLabel>
                          <FormControl>
                            <Input placeholder="## Номер заявки:" {...field} />
                          </FormControl>
                          <FormDescription>
                            Эта строка используется для получения идентификатора заявки из сообщения электронной почты.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imapReplyString"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMAP Ticket Reply String</FormLabel>
                          <FormControl>
                            <Input placeholder="##- Введите свой ответ над этой строкой -##" {...field} />
                          </FormControl>
                          <FormDescription>
                            Строка, используемая для определения конца ответа. Это должна быть полная линия.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Cron Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cog className="w-5 h-5" />
                      Cron задачи
                    </CardTitle>
                    <CardDescription>
                      Команды для автоматической обработки заявок
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Получение ответов на заявки</Label>
                      <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                        wget https://ws24.pro/cron/ticket_replies
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Получение новых заявок (создание)</Label>
                      <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                        wget https://ws24.pro/cron/ticket_create
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline">
                    Reset
                  </Button>
                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}