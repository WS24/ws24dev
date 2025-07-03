import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff, Check, Clock, MessageSquare, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
interface Notification {
  id: number;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedId?: number;
  relatedType?: string;
}
export default function NotificationsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/read-all");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    return notification.type === activeTab;
  });
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_created":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case "task_assigned":
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case "evaluation_submitted":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "payment_received":
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case "task_completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    // Navigate to related content if applicable
    if (notification.relatedType === "task" && notification.relatedId) {
      window.location.href = `/tasks/${notification.relatedId}`;
    }
  };
  return (
      <div className="flex">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    <span>Your Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive">{unreadCount} new</Badge>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="task_created">Tasks</TabsTrigger>
                    <TabsTrigger value="evaluation_submitted">Evaluations</TabsTrigger>
                    <TabsTrigger value="payment_received">Payments</TabsTrigger>
                  </TabsList>
                  <TabsContent value={activeTab} className="mt-6">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : filteredNotifications.length === 0 ? (
                      <div className="text-center py-12">
                        <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No notifications to display</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                              notification.isRead 
                                ? "bg-white border-gray-200" 
                                : "bg-blue-50 border-blue-200"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className={`font-semibold ${
                                      notification.isRead ? "text-gray-900" : "text-blue-900"
                                    }`}>
                                      {notification.title}
                                    </h3>
                                    <p className={`mt-1 ${
                                      notification.isRead ? "text-gray-600" : "text-blue-700"
                                    }`}>
                                      {notification.message}
                                    </p>
                                  </div>
                                  {!notification.isRead && (
                                    <Badge variant="default" className="ml-2">New</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                  {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}