import { IdeaCard } from "./idea-card";
import { Link } from "wouter";
import type { Idea, Category, User } from "@shared/schema";

interface IdeaGridProps {
  ideas: (Idea & { 
    category?: Category; 
    owner?: User; 
    hypothesesCount: number; 
    commentsCount: number;
  })[];
}

export function IdeaGrid({ ideas }: IdeaGridProps) {
  if (ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No ideas found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {ideas.map((idea) => (
        <Link key={idea.id} href={`/ideas/${idea.id}`}>
          <IdeaCard idea={idea} />
        </Link>
      ))}
    </div>
  );
}
