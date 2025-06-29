import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Megaphone, 
  Calendar,
  AlertCircle,
  Info,
  CheckCircle
} from "lucide-react";

export default function Announcements() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["/api/announcements"],
    retry: false,
  });

  const getAnnouncementIcon = (status: number) => {
    switch (status) {
      case 1:
        return <Info className="w-5 h-5 text-blue-500" />;
      case 2:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 3:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAnnouncementBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge className="bg-blue-100 text-blue-800">Информация</Badge>;
      case 2:
        return <Badge className="bg-yellow-100 text-yellow-800">Важное</Badge>;
      case 3:
        return <Badge className="bg-green-100 text-green-800">Обновление</Badge>;
      default:
        return <Badge variant="outline">Объявление</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex pt-16">
        <Sidebar />
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3">
                  <Megaphone className="w-8 h-8 text-primary" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-600 mt-1">
                      Latest news and service updates
                    </p>
                  </div>
                </div>
              </div>

              {/* Announcements List */}
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-5 h-5 bg-gray-200 rounded"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !announcements || announcements.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Нет объявлений
                    </h3>
                    <p className="text-gray-600">
                      В настоящее время нет активных объявлений.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {announcements.map((announcement: any) => (
                    <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {getAnnouncementIcon(announcement.status)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {announcement.title}
                              </h3>
                              <div className="flex items-center space-x-3">
                                {getAnnouncementBadge(announcement.status)}
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(announcement.createdAt).toLocaleDateString('ru-RU')}
                                </div>
                              </div>
                            </div>
                            
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <div dangerouslySetInnerHTML={{ __html: announcement.body.replace(/\n/g, '<br>') }} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}