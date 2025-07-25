import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Book, 
  Plus, 
  Search, 
  Clock,
  User,
  Tag,
  ExternalLink,
  MessageSquare,
  GitBranch,
  Grid3X3,
  List
} from "lucide-react";
import { useFeatures, useFeature } from "@/lib/features";
import { FeaturesTable } from "@/components/features/features-table";
import { FeatureDetailModal } from "@/components/features/feature-detail-modal";

interface Feature {
  id: number;
  title: string;
  slug: string;
  status: string;
  problemStatement?: string | null;
  solutionOverview?: string | null;
  tags: string[];
  category?: string | null;
  createdBy?: { name: string; email: string };
  linkedIdea?: { title: string; id: number };
  createdAt: string;
  updatedAt: string;
  version: number;
}

export default function Wiki() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const { data: features = [], isLoading } = useFeatures(searchQuery);
  const { data: featureDetail } = useFeature(selectedFeature?.slug || "");

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Draft": return "secondary";
      case "Deprecated": return "outline";
      case "Archived": return "outline";
      default: return "secondary";
    }
  };

  const filteredFeatures = features.filter((feature: Feature) => {
    if (activeTab === "all") return true;
    return feature.status.toLowerCase() === activeTab;
  });

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Book className="h-5 w-5" />
                Features
              </h2>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {features.length} Features
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Feature
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All Features</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="deprecated">Deprecated</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredFeatures.length === 0 ? (
                  <div className="text-center py-12">
                    <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {searchQuery ? "No Features Found" : "No Features Yet"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? `No features match "${searchQuery}". Try a different search term.`
                        : "Create your first feature page to start building your knowledge base."
                      }
                    </p>
                    {!searchQuery && (
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Feature
                      </Button>
                    )}
                  </div>
                ) : viewMode === "table" ? (
                  <FeaturesTable 
                    features={filteredFeatures} 
                    onFeatureClick={handleFeatureClick}
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredFeatures.map((feature: Feature) => (
                      <Card key={feature.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base line-clamp-2">
                              {feature.title}
                            </CardTitle>
                            <Badge variant={getStatusBadgeVariant(feature.status)}>
                              {feature.status}
                            </Badge>
                          </div>
                          {feature.problemStatement && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {feature.problemStatement}
                            </p>
                          )}
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {/* Tags */}
                          {feature.tags && feature.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {feature.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {feature.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{feature.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Linked Idea */}
                          {feature.linkedIdea && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ExternalLink className="h-3 w-3" />
                              <span>Linked to: {feature.linkedIdea.title}</span>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {feature.createdBy?.name || "Unknown"}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                v{feature.version}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(feature.updatedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleFeatureClick(feature)}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Feature Detail Modal */}
      <FeatureDetailModal
        feature={featureDetail || selectedFeature}
        open={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
      />
    </div>
  );
}