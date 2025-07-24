import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Idea, Category, User } from "@shared/schema";

interface PriorityMatrixProps {
  ideas: (Idea & { category?: Category; owner?: User })[];
  onIdeaSelect: (idea: Idea & { category?: Category; owner?: User }) => void;
}

export function PriorityMatrix({ ideas, onIdeaSelect }: PriorityMatrixProps) {
  // Filter ideas that have both impact and effort scores
  const scoredIdeas = ideas.filter(idea => idea.impactScore && idea.effortScore);

  // Categorize ideas by quadrant
  const getQuadrant = (impact: number, effort: number) => {
    const isHighImpact = impact >= 4;
    const isLowEffort = effort <= 2;

    if (isHighImpact && isLowEffort) return 'quick-wins';
    if (isHighImpact && !isLowEffort) return 'major-projects';
    if (!isHighImpact && isLowEffort) return 'fill-ins';
    return 'money-pit';
  };

  const quadrants = {
    'quick-wins': scoredIdeas.filter(idea => getQuadrant(idea.impactScore!, idea.effortScore!) === 'quick-wins'),
    'major-projects': scoredIdeas.filter(idea => getQuadrant(idea.impactScore!, idea.effortScore!) === 'major-projects'),
    'fill-ins': scoredIdeas.filter(idea => getQuadrant(idea.impactScore!, idea.effortScore!) === 'fill-ins'),
    'money-pit': scoredIdeas.filter(idea => getQuadrant(idea.impactScore!, idea.effortScore!) === 'money-pit'),
  };

  const quadrantConfig = {
    'quick-wins': {
      title: 'Quick Wins',
      description: 'High Impact, Low Effort',
      color: 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700',
      textColor: 'text-green-800 dark:text-green-200',
      priority: 1
    },
    'major-projects': {
      title: 'Major Projects',
      description: 'High Impact, High Effort',
      color: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700',
      textColor: 'text-blue-800 dark:text-blue-200',
      priority: 2
    },
    'fill-ins': {
      title: 'Fill-ins',
      description: 'Low Impact, Low Effort',
      color: 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      priority: 3
    },
    'money-pit': {
      title: 'Money Pit',
      description: 'Low Impact, High Effort',
      color: 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700',
      textColor: 'text-red-800 dark:text-red-200',
      priority: 4
    }
  };

  if (scoredIdeas.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Priority Matrix</h3>
        <p className="text-muted-foreground mb-4">Ideas need Impact and Effort scores to appear in the matrix.</p>
        <p className="text-sm text-muted-foreground">Switch to Scoring view to add scores to your ideas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Priority Matrix</h3>
        <p className="text-muted-foreground">Ideas plotted by Impact vs Effort scores</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(quadrants).map(([key, quadrantIdeas]) => {
          const config = quadrantConfig[key as keyof typeof quadrantConfig];
          
          return (
            <Card key={key} className={`${config.color} border-2`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`text-lg ${config.textColor}`}>
                      {config.title}
                    </CardTitle>
                    <p className={`text-sm ${config.textColor} opacity-80`}>
                      {config.description}
                    </p>
                  </div>
                  <Badge variant="outline" className={config.textColor}>
                    {quadrantIdeas.length} ideas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {quadrantIdeas.length === 0 ? (
                  <p className={`text-sm ${config.textColor} opacity-60 text-center py-4`}>
                    No ideas in this quadrant
                  </p>
                ) : (
                  quadrantIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="bg-card rounded-lg p-3 border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onIdeaSelect(idea)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-1">{idea.title}</h4>
                        {idea.riceScore && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {idea.riceScore}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {idea.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{idea.status}</Badge>
                          {idea.category && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: idea.category.color }}
                              title={idea.category.name}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span>Impact: {idea.impactScore}</span>
                          <span>•</span>
                          <span>Effort: {idea.effortScore}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Matrix Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Priority Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Quick Wins (Priority 1)</h4>
              <p className="text-muted-foreground">Execute immediately. High value with minimal resource investment.</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Major Projects (Priority 2)</h4>
              <p className="text-muted-foreground">Plan carefully. High value but requires significant resources.</p>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Fill-ins (Priority 3)</h4>
              <p className="text-muted-foreground">Consider when you have spare capacity. Low hanging fruit.</p>
            </div>
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Money Pit (Priority 4)</h4>
              <p className="text-muted-foreground">Avoid or reconsider. High effort with questionable returns.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}