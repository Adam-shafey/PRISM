import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  Users,
  FileText,
  Target
} from "lucide-react";
import { useIdeas, useHypotheses, useCreateHypothesis, useUpdateHypothesis } from "@/lib/api";
import { HypothesisCard } from "@/components/validation/hypothesis-card";
import { NewHypothesisModal } from "@/components/validation/new-hypothesis-modal";
import { ValidationProgress } from "@/components/validation/validation-progress";
import { ExperimentTracker } from "@/components/validation/experiment-tracker";
import type { Idea, Category, User, Hypothesis } from "@shared/schema";

export default function Validation() {
  const [activeTab, setActiveTab] = useState("hypotheses");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ideaFilter, setIdeaFilter] = useState<string>("all");
  const [isNewHypothesisOpen, setIsNewHypothesisOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);

  const { data: ideas = [], isLoading: ideasLoading } = useIdeas();
  const createHypothesisMutation = useCreateHypothesis();
  const updateHypothesisMutation = useUpdateHypothesis();

  // Get all hypotheses for all ideas
  const allHypotheses = useMemo(() => {
    const hypothesesData: (Hypothesis & { idea?: Idea & { category?: Category; owner?: User } })[] = [];
    
    ideas.forEach(idea => {
      // This would need to be implemented to fetch hypotheses for each idea
      // For now, we'll use a placeholder structure
    });
    
    return hypothesesData;
  }, [ideas]);

  // Filter hypotheses based on search and filters
  const filteredHypotheses = useMemo(() => {
    let filtered = allHypotheses;

    if (searchQuery) {
      filtered = filtered.filter(h => 
        h.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.idea?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(h => h.status === statusFilter);
    }

    if (ideaFilter !== "all") {
      filtered = filtered.filter(h => h.ideaId === parseInt(ideaFilter));
    }

    return filtered;
  }, [allHypotheses, searchQuery, statusFilter, ideaFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = allHypotheses.length;
    const validated = allHypotheses.filter(h => h.status === "Validated").length;
    const invalidated = allHypotheses.filter(h => h.status === "Invalidated").length;
    const inProgress = allHypotheses.filter(h => h.status === "Partially Validated").length;
    const unvalidated = allHypotheses.filter(h => h.status === "Unvalidated").length;

    return { total, validated, invalidated, inProgress, unvalidated };
  }, [allHypotheses]);

  const handleCreateHypothesis = async (data: any) => {
    if (!selectedIdea) return;
    
    try {
      await createHypothesisMutation.mutateAsync({
        ideaId: selectedIdea,
        data: {
          statement: data.statement,
          assumptions: data.assumptions || [],
          validationMetrics: data.validationMetrics || [],
          experimentType: data.experimentType,
          status: "Unvalidated"
        }
      });
      setIsNewHypothesisOpen(false);
      setSelectedIdea(null);
    } catch (error) {
      console.error("Failed to create hypothesis:", error);
    }
  };

  const handleUpdateHypothesis = async (id: number, data: any) => {
    try {
      await updateHypothesisMutation.mutateAsync({ id, data });
    } catch (error) {
      console.error("Failed to update hypothesis:", error);
    }
  };

  if (ideasLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading validation data...</p>
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
                <FlaskConical className="h-5 w-5" />
                Validation Hub
              </h2>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {stats.total} Hypotheses
              </Badge>
            </div>
            
            <Button onClick={() => setIsNewHypothesisOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Hypothesis
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
                <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Validated
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  In Progress
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.invalidated}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Invalidated
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.unvalidated}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Target className="h-3 w-3" />
                  Unvalidated
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-border">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hypotheses" className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Hypotheses
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="experiments" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Experiments
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 p-6">
              <TabsContent value="hypotheses" className="space-y-6 mt-0">
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search hypotheses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Unvalidated">Unvalidated</SelectItem>
                      <SelectItem value="Partially Validated">Partially Validated</SelectItem>
                      <SelectItem value="Validated">Validated</SelectItem>
                      <SelectItem value="Invalidated">Invalidated</SelectItem>
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

                {/* Hypotheses List */}
                <div className="space-y-4">
                  {filteredHypotheses.length === 0 ? (
                    <div className="text-center py-12">
                      <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Hypotheses Found</h3>
                      <p className="text-muted-foreground mb-4">
                        {allHypotheses.length === 0 
                          ? "Start validating your ideas by creating hypotheses."
                          : "Try adjusting your search or filters."
                        }
                      </p>
                      <Button onClick={() => setIsNewHypothesisOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Hypothesis
                      </Button>
                    </div>
                  ) : (
                    filteredHypotheses.map((hypothesis) => (
                      <HypothesisCard
                        key={hypothesis.id}
                        hypothesis={hypothesis}
                        onUpdate={handleUpdateHypothesis}
                        isUpdating={updateHypothesisMutation.isPending}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="progress" className="mt-0">
                <ValidationProgress 
                  ideas={ideas}
                  hypotheses={allHypotheses}
                />
              </TabsContent>

              <TabsContent value="experiments" className="mt-0">
                <ExperimentTracker 
                  hypotheses={allHypotheses}
                  onUpdate={handleUpdateHypothesis}
                />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>

      {/* New Hypothesis Modal */}
      <NewHypothesisModal
        open={isNewHypothesisOpen}
        onOpenChange={setIsNewHypothesisOpen}
        ideas={ideas}
        selectedIdeaId={selectedIdea}
        onIdeaSelect={setSelectedIdea}
        onSubmit={handleCreateHypothesis}
        isSubmitting={createHypothesisMutation.isPending}
      />
    </div>
  );
}