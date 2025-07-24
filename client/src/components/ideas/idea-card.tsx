import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FlaskConical, TrendingUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Idea, Category, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface IdeaCardProps {
  idea: Idea & { 
    category?: Category; 
    owner?: User; 
    hypothesesCount: number; 
    commentsCount: number;
  };
  onClick?: () => void;
}

const statusColors = {
  "New": "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
  "In Discovery": "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  "Validated": "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  "Prioritized": "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
  "Rejected": "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  "In Planning": "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
};

const categoryColors = {
  "Growth": "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
  "Retention": "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
  "UX Improvement": "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  "New Market": "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
};

const impactColors = {
  high: "text-green-600 dark:text-green-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-gray-600 dark:text-gray-400",
};

export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const getImpactLevel = (score?: number | null) => {
    if (!score) return "medium";
    if (score >= 4) return "high";
    if (score >= 3) return "medium";
    return "low";
  };

  const impactLevel = getImpactLevel(idea.impactScore);
  const impactText = impactLevel.charAt(0).toUpperCase() + impactLevel.slice(1) + " Impact";

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer" 
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn(statusColors[idea.status as keyof typeof statusColors])}
            >
              {idea.status}
            </Badge>
            {idea.category && (
              <Badge 
                variant="secondary" 
                className={cn(categoryColors[idea.category.name as keyof typeof categoryColors])}
              >
                {idea.category.name}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <h3 className="font-semibold text-lg mb-2">{idea.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {idea.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            {idea.owner?.avatar && (
              <img 
                src={idea.owner.avatar} 
                alt="Owner avatar" 
                className="w-6 h-6 rounded-full"
              />
            )}
            <span>{idea.owner?.name}</span>
          </div>
          <span>
            {idea.updatedAt ? formatDistanceToNow(new Date(idea.updatedAt), { addSuffix: true }) : "Unknown"}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <FlaskConical className="h-3 w-3" />
            <span>{idea.hypothesesCount} hypotheses</span>
          </div>
          <div className={cn("flex items-center gap-1", impactColors[impactLevel])}>
            <TrendingUp className="h-3 w-3" />
            <span>{impactText}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            <span>{idea.commentsCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
