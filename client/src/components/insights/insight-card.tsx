import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Globe, 
  MessageSquare, 
  Download, 
  ExternalLink, 
  Eye, 
  Trash2,
  Calendar,
  User,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Insight, Idea, Category, User as UserType } from "@shared/schema";

interface InsightCardProps {
  insight: Insight & { idea?: Idea & { category?: Category; owner?: UserType }; createdByUser?: UserType };
  onDelete: (id: number) => Promise<void>;
  isDeleting: boolean;
}

export function InsightCard({ insight, onDelete, isDeleting }: InsightCardProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "file": return <FileText className="h-4 w-4 text-blue-600" />;
      case "url": return <Globe className="h-4 w-4 text-green-600" />;
      case "note": return <MessageSquare className="h-4 w-4 text-orange-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "file": return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "url": return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "note": return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      default: return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this insight?")) {
      try {
        await onDelete(insight.id);
        toast({
          title: "Success",
          description: "Insight deleted successfully!"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete insight. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileDownload = () => {
    if (insight.fileUrl) {
      window.open(insight.fileUrl, '_blank');
    }
  };

  const handleUrlOpen = () => {
    if (insight.url) {
      window.open(insight.url, '_blank');
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon(insight.type)}
              <Badge className={getTypeColor(insight.type)}>
                {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
              </Badge>
              {insight.summary && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  AI Summary
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-lg mb-2">{insight.title}</CardTitle>
            
            {insight.idea && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Linked to:</span>
                <Badge variant="secondary">{insight.idea.title}</Badge>
                {insight.idea.category && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: insight.idea.category.color }}
                    title={insight.idea.category.name}
                  />
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {insight.type === "file" && insight.fileUrl && (
              <Button 
                size="icon" 
                variant="ghost"
                onClick={handleFileDownload}
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {insight.type === "url" && insight.url && (
              <Button 
                size="icon" 
                variant="ghost"
                onClick={handleUrlOpen}
                title="Open URL"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button 
              size="icon" 
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete insight"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Content Preview */}
        {insight.content && (
          <div>
            <label className="text-sm font-medium mb-2 block">Content</label>
            <div className="text-sm bg-muted p-3 rounded-md">
              {isExpanded ? insight.content : truncateText(insight.content, 200)}
              {insight.content.length > 200 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-0 h-auto text-xs ml-2"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* URL Display */}
        {insight.type === "url" && insight.url && (
          <div>
            <label className="text-sm font-medium mb-2 block">URL</label>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                {insight.url}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleUrlOpen}
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Open
              </Button>
            </div>
          </div>
        )}

        {/* File Display */}
        {insight.type === "file" && insight.fileUrl && (
          <div>
            <label className="text-sm font-medium mb-2 block">File</label>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                {insight.fileUrl.split('/').pop() || insight.fileUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleFileDownload}
                className="flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Download
              </Button>
            </div>
          </div>
        )}

        {/* AI Summary */}
        {insight.summary && (
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              AI-Generated Summary
            </label>
            <div className="text-sm bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-md">
              {isExpanded ? insight.summary : truncateText(insight.summary, 150)}
              {insight.summary.length > 150 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-0 h-auto text-xs ml-2"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {insight.createdAt ? new Date(insight.createdAt).toLocaleDateString() : "Unknown"}
            </span>
            {insight.createdByUser && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {insight.createdByUser.name}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}