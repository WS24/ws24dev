import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  BookOpen, 
  FileText, 
  Eye,
  Star,
  Code,
  Link,
  HelpCircle,
  CreditCard
} from "lucide-react";

export default function KnowledgeBase() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/knowledge/categories"],
    retry: false,
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<any[]>({
    queryKey: ["/api/knowledge/articles", selectedCategory],
    retry: false,
  });

  const getIconByName = (iconName: string) => {
    const icons: Record<string, any> = {
      "code": Code,
      "link": Link,
      "help-circle": HelpCircle,
      "credit-card": CreditCard,
    };
    return icons[iconName] || FileText;
  };

  const filteredArticles = (articles || []).filter((article: any) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
                <p className="text-gray-600 mt-1">
                  Documentation and guides for web development
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories Sidebar */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5" />
                        <span>Categories</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categoriesLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            variant={selectedCategory === null ? "default" : "ghost"}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setSelectedCategory(null)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Все статьи
                          </Button>
                          {(categories || []).map((category: any) => {
                            const IconComponent = getIconByName(category.icon);
                            return (
                              <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => setSelectedCategory(category.id)}
                              >
                                <IconComponent className="w-4 h-4 mr-2" />
                                {category.name}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Articles Content */}
                <div className="lg:col-span-3">
                  {/* Search */}
                  <Card className="mb-6">
                    <CardContent className="p-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Поиск по статьям..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Articles List */}
                  {articlesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="animate-pulse">
                              <div className="h-6 bg-gray-200 rounded mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredArticles.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Статьи не найдены
                        </h3>
                        <p className="text-gray-600">
                          Попробуйте изменить поисковый запрос или выбрать другую категорию.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {filteredArticles.map((article: any) => (
                        <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {article.title}
                                </h3>
                                <p className="text-gray-600 mb-4 line-clamp-2">
                                  {article.body.substring(0, 200)}...
                                </p>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Eye className="w-4 h-4" />
                                    <span>{article.views} просмотров</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4" />
                                    <span>{Number(article.rating).toFixed(1)}</span>
                                  </div>
                                  <span>
                                    {new Date(article.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              
                              <Button size="sm" variant="outline">
                                Читать
                              </Button>
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
      </div>
    </div>
  );
}