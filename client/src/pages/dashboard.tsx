import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { FilterBar } from "@/components/ideas/filter-bar";
import { IdeaGrid } from "@/components/ideas/idea-grid";
import { QuickStats } from "@/components/stats/quick-stats";
import { NewIdeaModal } from "@/components/ideas/new-idea-modal";
import { ideasApi } from "@/lib/api";
import type { IdeaFilters } from "@/types";

export default function Dashboard() {
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);
  const [filters, setFilters] = useState<IdeaFilters>({});
  const [view, setView] = useState<"grid" | "list" | "matrix">("grid");

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ["/api/ideas"],
  });

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea: any) => {
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
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              view={view}
              onViewChange={setView}
            />

            <IdeaGrid ideas={filteredIdeas} />

            <div className="mt-8">
              <QuickStats />
            </div>
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
