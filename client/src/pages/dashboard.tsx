import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { FilterBar } from "@/components/ideas/filter-bar";
import { IdeaGrid } from "@/components/ideas/idea-grid";
import { IdeasTable } from "@/components/ideas/ideas-table";
import { QuickStats } from "@/components/stats/quick-stats";
import { NewIdeaModal } from "@/components/ideas/new-idea-modal";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import { useIdeas, useCategories, useUsers } from "@/lib/api";
import { useLocation } from "wouter";
import type { IdeaFilters } from "@/types";

export default function Dashboard() {
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);
  const [filters, setFilters] = useState<IdeaFilters>({});
  const [view, setView] = useState<"grid" | "table">("grid");
  const [, setLocation] = useLocation();

  const { data: ideas = [], isLoading } = useIdeas();
  const { data: categories = [] } = useCategories();
  const { data: users = [] } = useUsers();

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (filters.status && idea.status !== filters.status) return false;
      if (filters.categoryId && idea.categoryId !== filters.categoryId) return false;
      if (filters.ownerId && idea.ownerId !== filters.ownerId) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          idea.title.toLowerCase().includes(searchLower) ||
          idea.description.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [ideas, filters]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading ideas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onNewIdea={() => setShowNewIdeaModal(true)} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Quick Stats */}
            <QuickStats ideas={filteredIdeas} />
            
            {/* Filter Bar with View Toggle */}
            <div className="flex items-center justify-between">
              <FilterBar 
                filters={filters} 
                onFiltersChange={setFilters}
                onNewIdea={() => setShowNewIdeaModal(true)}
              />
              
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Button
                  size="sm"
                  variant={view === "grid" ? "default" : "ghost"}
                  onClick={() => setView("grid")}
                  className="h-8 px-3"
                >
                  <Grid className="h-4 w-4 mr-1" />
                  Grid
                </Button>
                <Button
                  size="sm"
                  variant={view === "table" ? "default" : "ghost"}
                  onClick={() => setView("table")}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4 mr-1" />
                  Table
                </Button>
              </div>
            </div>
            
            {/* Content based on view */}
            {view === "grid" ? (
              <IdeaGrid ideas={filteredIdeas} />
            ) : (
              <IdeasTable 
                ideas={filteredIdeas}
                categories={categories}
                users={users}
                onIdeaClick={(idea) => setLocation(`/ideas/${idea.id}`)}
              />
            )}
          </div>
        </main>
      </div>

      <NewIdeaModal 
        open={showNewIdeaModal} 
        onOpenChange={setShowNewIdeaModal} 
      />
    </div>
  );
}
