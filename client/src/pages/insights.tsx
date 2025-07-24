import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Plus, 
  Search, 
  Upload, 
  Link as LinkIcon, 
  Globe,
  MessageSquare,
  BarChart3,
  Calendar,
  User,
  Download,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useIdeas, useCreateInsight, useDeleteInsight } from "@/lib/api";
import { InsightCard } from "@/components/insights/insight-card";
import { NewInsightModal } from "@/components/insights/new-insight-modal";
import type { Idea, Category, User as UserType, Insight } from "@shared/schema";

export default function Insights() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [ideaFilter, setIdeaFilter] = useState<string>("all");
  const [isNewInsightOpen, setIsNewInsightOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);

  const { data: ideas = [], isLoading: ideasLoading } = useIdeas();
  const createInsightMutation = useCreateInsight();
  const deleteInsightMutation = useDeleteInsight();

  // Get all insights for all ideas
  const allInsights = useMemo(() => {
    const insightsData: (Insight & { idea?: Idea & { category?: Category; owner?: UserType }; createdByUser?: UserType })[] = [];
    
    ideas.forEach(idea => {
      // This would fetch insights for each idea in a real implementation
      // For now, using placeholder structure for the UI
    });
    
    return insightsData;
  }, [ideas]);

  // Filter insights based on search and filters
  const filteredInsights = useMemo(() => {
    let filtered = allInsights;

    if (searchQuery) {
      filtered = filtered.filter(insight => 
        insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.idea?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(insight => insight.type === typeFilter);
    }

    if (ideaFilter !== "all") {
      filtered = filtered.filter(insight => insight.ideaId === parseInt(ideaFilter));
    }

    return filtered;
  }, [allInsights, searchQuery, typeFilter, ideaFilter]);

  // Group insights by tab
  const insightsByTab = useMemo(() => {
    switch (activeTab) {
      case "files":
        return filteredInsights.filter(insight => insight.type === "file");
      case "urls":
        return filteredInsights.filter(insight => insight.type === "url");
      case "notes":
        return filteredInsights.filter(insight => insight.type === "note");
      default:
        return filteredInsights;
    }
  }, [filteredInsights, activeTab]);

  // Statistics
  const stats = useMemo(() => {
    const total = allInsights.length;
    const files = allInsights.filter(i => i.type === "file").length;
    const urls = allInsights.filter(i => i.type === "url").length;
    const notes = allInsights.filter(i => i.type === "note").length;
    const withSummaries = allInsights.filter(i => i.summary).length;

    return { total, files, urls, notes, withSummaries };
  }, [allInsights]);

  const handleCreateInsight = async (data: any) => {
    if (!selectedIdea) return;
    
    try {
      await createInsightMutation.mutateAsync({
        ideaId: selectedIdea,
        data: {
          type: data.type,
          title: data.title,
          content: data.content || null,
          url: data.url || null,
          fileUrl: data.fileUrl || null,
          summary: data.summary || null
        }
      });
      setIsNewInsightOpen(false);
      setSelectedIdea(null);
    } catch (error) {
      console.error("Failed to create insight:", error);
    }
  };

  const handleDeleteInsight = async (id: number) => {
    try {
      await deleteInsightMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete insight:", error);
    }
  };

  if (ideasLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Insights
              </h2>
              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {stats.total} Total
              </Badge>
            </div>
            
            <Button onClick={() => setIsNewInsightOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Insight
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="px-6 py-4 border-b border-border">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.files}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <FileText className="h-3 w-3" />
                  Files
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.urls}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Globe className="h-3 w-3" />
                  URLs
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.notes}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Notes
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.withSummaries}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  AI Summaries
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-border">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  All Insights
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="urls" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  URLs
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Notes
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 p-6">
              <TabsContent value={activeTab} className="space-y-6 mt-0">
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search insights, titles, content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="file">Files</SelectItem>
                      <SelectItem value="url">URLs</SelectItem>
                      <SelectItem value="note">Notes</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={ideaFilter} onValueChange={setIdeaFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by idea" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ideas</SelectItem>
                      {ideas.map((idea) => (
                        <SelectItem key={idea.id} value={idea.id.toString()}>
                          {idea.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Insights List */}
                <div className="space-y-4">
                  {insightsByTab.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Insights Found</h3>
                      <p className="text-muted-foreground mb-4">
                        {allInsights.length === 0 
                          ? "Start building your knowledge base by adding research insights."
                          : "Try adjusting your search or filters."
                        }
                      </p>
                      <Button onClick={() => setIsNewInsightOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Insight
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {insightsByTab.map((insight) => (
                        <InsightCard
                          key={insight.id}
                          insight={insight}
                          onDelete={handleDeleteInsight}
                          isDeleting={deleteInsightMutation.isPending}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>

      {/* New Insight Modal */}
      <NewInsightModal
        open={isNewInsightOpen}
        onOpenChange={setIsNewInsightOpen}
        ideas={ideas}
        selectedIdeaId={selectedIdea}
        onIdeaSelect={setSelectedIdea}
        onSubmit={handleCreateInsight}
        isSubmitting={createInsightMutation.isPending}
      />
    </div>
  );
}