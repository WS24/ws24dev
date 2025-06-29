import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "yellow" | "purple" | "red";
  loading?: boolean;
  subtitle?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  loading = false,
  subtitle 
}: StatsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-100",
          text: "text-blue-600",
          icon: "text-blue-600"
        };
      case "green":
        return {
          bg: "bg-green-100",
          text: "text-green-600",
          icon: "text-green-600"
        };
      case "yellow":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-600",
          icon: "text-yellow-600"
        };
      case "purple":
        return {
          bg: "bg-purple-100",
          text: "text-purple-600",
          icon: "text-purple-600"
        };
      case "red":
        return {
          bg: "bg-red-100",
          text: "text-red-600",
          icon: "text-red-600"
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          icon: "text-gray-600"
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={cn("p-3 rounded-lg", colorClasses.bg)}>
            <Icon className={cn("w-6 h-6", colorClasses.icon)} />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {loading ? (
              <div className="mt-1">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
