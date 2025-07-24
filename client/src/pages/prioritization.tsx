import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Calculator, Grid3X3, List, BarChart3, Filter } from "lucide-react";
import { useIdeas, useUpdateIdea } from "@/lib/api";
import { PriorityMatrix } from "@/components/prioritization/priority-matrix";
import { RiceScoreCalculator } from "@/components/prioritization/rice-score-calculator";
import { PriorityScoring } from "@/components/prioritization/priority-scoring";
import type { Idea, Category, User } from "@shared/schema";

export default function Prioritization() {
  const [view, setView] = useState<"list" | "matrix" | "scoring">("list");
  const [sortBy, setSortBy] = useState<"riceScore" | "impactScore" | "effortScore" | "title">("riceScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedIdea, setSelectedIdea] = useState<(Idea & { category?: Category; owner?: User }) | null>(null);

  const { data: ideas = [], isLoading } = useIdeas();
  const updateIdeaMutation = useUpdateIdea();

  // Filter and sort ideas
  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = ideas.filter((idea) => {
      if (filterStatus === "all") return true;
      return idea.status === filterStatus;
    });

    // Sort ideas
    filtered.sort((a, b) => {
      let aValue = 0;
      let bValue = 0;

      switch (sortBy) {
        case "riceScore":
          aValue = a.riceScore || 0;
          bValue = b.riceScore || 0;
          break;
        case "impactScore":
          aValue = a.impactScore || 0;
          bValue = b.impactScore || 0;
          break;
        case "effortScore":
          aValue = a.effortScore || 0;
          bValue = b.effortScore || 0;
          break;
        case "title":
          return sortOrder === "asc" 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [ideas, filterStatus, sortBy, sortOrder]);

  const handleScoreUpdate = async (ideaId: number, scores: { 
    impactScore?: number; 
    effortScore?: number; 
    confidenceScore?: number; 
    riceScore?: number 
  }) => {
    await updateIdeaMutation.mutateAsync({ id: ideaId, data: scores });
  };

  const calculateRiceScore = (reach: number, impact: number, confidence: number, effort: number): number => {
    if (effort === 0) return 0;
    return Math.round((reach * impact * confidence) / effort);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading prioritization data...</p>
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
              <h2 className="text-xl font-semibold">Prioritization</h2>
              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {filteredAndSortedIdeas.length} Ideas
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="In Discovery">In Discovery</SelectItem>
                    <SelectItem value="Validated">Validated</SelectItem>
                    <SelectItem value="Prioritized">Prioritized</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="riceScore">RICE Score</SelectItem>
                    <SelectItem value="impactScore">Impact Score</SelectItem>
                    <SelectItem value="effortScore">Effort Score</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1">
                <Button 
                  variant={view === "list" ? "default" : "ghost"} 
                  size="icon"
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={view === "matrix" ? "default" : "ghost"} 
                  size="icon"
                  onClick={() => setView("matrix")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={view === "scoring" ? "default" : "ghost"} 
                  size="icon"
                  onClick={() => setView("scoring")}
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {view === "list" && (
            <div className="space-y-4">
              {filteredAndSortedIdeas.map((idea) => (
                <Card key={idea.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedIdea(idea)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{idea.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{idea.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{idea.status}</Badge>
                          {idea.category && (
                            <Badge variant="secondary" style={{ backgroundColor: `${idea.category.color}20`, color: idea.category.color }}>
                              {idea.category.name}
                            </Badge>
                          )}
                          {idea.owner && (
                            <span className="text-xs text-muted-foreground">by {idea.owner.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {idea.riceScore && (
                          <div className="text-2xl font-bold text-primary">{idea.riceScore}</div>
                        )}
                        <div className="text-xs text-muted-foreground">RICE Score</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {idea.impactScore && (
                            <div>
                              <div className="font-medium">{idea.impactScore}</div>
                              <div className="text-muted-foreground">Impact</div>
                            </div>
                          )}
                          {idea.effortScore && (
                            <div>
                              <div className="font-medium">{idea.effortScore}</div>
                              <div className="text-muted-foreground">Effort</div>
                            </div>
                          )}
                          {idea.confidenceScore && (
                            <div>
                              <div className="font-medium">{idea.confidenceScore}%</div>
                              <div className="text-muted-foreground">Confidence</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              
              {filteredAndSortedIdeas.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Ideas to Prioritize</h3>
                  <p className="text-muted-foreground">Start by adding some ideas or adjust your filters.</p>
                </div>
              )}
            </div>
          )}

          {view === "matrix" && (
            <PriorityMatrix ideas={filteredAndSortedIdeas} onIdeaSelect={setSelectedIdea} />
          )}

          {view === "scoring" && (
            <PriorityScoring 
              ideas={filteredAndSortedIdeas} 
              onScoreUpdate={handleScoreUpdate}
              isUpdating={updateIdeaMutation.isPending}
            />
          )}
        </main>
      </div>

      {/* RICE Score Calculator Modal */}
      {selectedIdea && (
        <RiceScoreCalculator
          idea={selectedIdea}
          open={!!selectedIdea}
          onOpenChange={(open) => !open && setSelectedIdea(null)}
          onScoreUpdate={handleScoreUpdate}
          isUpdating={updateIdeaMutation.isPending}
        />
      )}
    </div>
  );
}