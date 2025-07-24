import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, CheckCircle, Search, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ideasApi } from "@/lib/api";

export function QuickStats() {
  const { data: ideas = [] } = useQuery({
    queryKey: ["/api/ideas"],
  });

  const totalIdeas = ideas.length;
  const validatedIdeas = ideas.filter((idea: any) => idea.status === "Validated").length;
  const inDiscovery = ideas.filter((idea: any) => idea.status === "In Discovery").length;
  const validationRate = totalIdeas > 0 ? Math.round((validatedIdeas / totalIdeas) * 100) : 0;

  const stats = [
    {
      title: "Total Ideas",
      value: totalIdeas.toString(),
      icon: Lightbulb,
      trend: { value: 12, isPositive: true },
      trendText: "from last month",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Validated",
      value: validatedIdeas.toString(),
      icon: CheckCircle,
      trend: { value: validationRate, isPositive: true },
      trendText: "validation rate",
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "In Discovery",
      value: inDiscovery.toString(),
      icon: Search,
      trend: null,
      trendText: "Active research",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Avg. Time to Validate",
      value: "14d",
      icon: Clock,
      trend: { value: 8, isPositive: false },
      trendText: "faster than target",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {stat.trend && (
                  <span className={`flex items-center ${
                    stat.trend.isPositive 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {stat.trend.isPositive ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {stat.trend.value}%
                  </span>
                )}
                <span className="text-muted-foreground ml-2">{stat.trendText}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
