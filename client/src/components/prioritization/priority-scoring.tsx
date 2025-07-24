import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Idea, Category, User } from "@shared/schema";

interface PriorityScoringProps {
  ideas: (Idea & { category?: Category; owner?: User })[];
  onScoreUpdate: (ideaId: number, scores: { 
    impactScore?: number; 
    effortScore?: number; 
    confidenceScore?: number; 
    riceScore?: number;
    reachEstimate?: number;
  }) => Promise<void>;
  isUpdating: boolean;
}

interface IdeaScores {
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
}

export function PriorityScoring({ ideas, onScoreUpdate, isUpdating }: PriorityScoringProps) {
  const { toast } = useToast();
  const [editingIdea, setEditingIdea] = useState<number | null>(null);
  const [tempScores, setTempScores] = useState<Record<number, IdeaScores>>({});

  const getIdeaScores = (idea: Idea): IdeaScores => {
    return tempScores[idea.id] || {
      reach: idea.reachEstimate || 1000,
      impact: idea.impactScore || 3,
      confidence: idea.confidenceScore || 80,
      effort: idea.effortScore || 3,
    };
  };

  const updateTempScore = (ideaId: number, field: keyof IdeaScores, value: number) => {
    setTempScores(prev => ({
      ...prev,
      [ideaId]: {
        ...getIdeaScores(ideas.find(i => i.id === ideaId)!),
        [field]: value
      }
    }));
  };

  const calculateRiceScore = (scores: IdeaScores): number => {
    if (scores.effort === 0) return 0;
    return Math.round((scores.reach * scores.impact * scores.confidence) / (scores.effort * 100));
  };

  const handleSave = async (idea: Idea) => {
    const scores = getIdeaScores(idea);
    const riceScore = calculateRiceScore(scores);
    
    try {
      await onScoreUpdate(idea.id, {
        impactScore: scores.impact,
        effortScore: scores.effort,
        confidenceScore: scores.confidence,
        riceScore: riceScore,
        reachEstimate: scores.reach
      });
      
      setEditingIdea(null);
      setTempScores(prev => {
        const newScores = { ...prev };
        delete newScores[idea.id];
        return newScores;
      });
      
      toast({
        title: "Success",
        description: `Scores updated for "${idea.title}"`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update scores. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = (ideaId: number) => {
    setEditingIdea(null);
    setTempScores(prev => {
      const newScores = { ...prev };
      delete newScores[ideaId];
      return newScores;
    });
  };

  const getImpactLabel = (score: number) => {
    const labels = ["", "Minimal", "Low", "Medium", "High", "Massive"];
    return labels[score] || "Medium";
  };

  const getEffortLabel = (score: number) => {
    const labels = ["", "< 1 week", "1-2 weeks", "1 month", "1 quarter", "> 1 quarter"];
    return labels[score] || "1 month";
  };

  const getRiceScoreColor = (score: number) => {
    if (score >= 100) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-blue-600 dark:text-blue-400";
    if (score >= 25) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 10) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  if (ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Ideas to Score</h3>
        <p className="text-muted-foreground">Start by adding some ideas or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Bulk Scoring</h3>
        <p className="text-muted-foreground">Add or update RICE scores for your ideas</p>
      </div>

      <div className="grid gap-6">
        {ideas.map((idea) => {
          const isEditing = editingIdea === idea.id;
          const scores = getIdeaScores(idea);
          const riceScore = calculateRiceScore(scores);
          
          return (
            <Card key={idea.id} className={isEditing ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{idea.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {idea.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{idea.status}</Badge>
                      {idea.category && (
                        <Badge 
                          variant="secondary" 
                          style={{ backgroundColor: `${idea.category.color}20`, color: idea.category.color }}
                        >
                          {idea.category.name}
                        </Badge>
                      )}
                      {idea.owner && (
                        <span className="text-xs text-muted-foreground">by {idea.owner.name}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getRiceScoreColor(riceScore)}`}>
                      {riceScore}
                    </div>
                    <div className="text-xs text-muted-foreground">RICE Score</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {isEditing ? (
                  <div className="space-y-6">
                    {/* Reach */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Reach (users per quarter)</Label>
                      <Input
                        type="number"
                        value={scores.reach}
                        onChange={(e) => updateTempScore(idea.id, 'reach', Number(e.target.value) || 0)}
                        placeholder="e.g., 1000"
                        min="0"
                      />
                    </div>

                    {/* Impact */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Impact</Label>
                        <Badge variant="outline">{getImpactLabel(scores.impact)}</Badge>
                      </div>
                      <Slider
                        value={[scores.impact]}
                        onValueChange={(value) => updateTempScore(idea.id, 'impact', value[0])}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="grid grid-cols-5 text-xs text-muted-foreground">
                        <span>Minimal</span>
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                        <span>Massive</span>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Confidence</Label>
                        <Badge variant="outline">{scores.confidence}%</Badge>
                      </div>
                      <Slider
                        value={[scores.confidence]}
                        onValueChange={(value) => updateTempScore(idea.id, 'confidence', value[0])}
                        max={100}
                        min={10}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    {/* Effort */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Effort</Label>
                        <Badge variant="outline">{getEffortLabel(scores.effort)}</Badge>
                      </div>
                      <Slider
                        value={[scores.effort]}
                        onValueChange={(value) => updateTempScore(idea.id, 'effort', value[0])}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="grid grid-cols-5 text-xs text-muted-foreground">
                        <span>&lt; 1 week</span>
                        <span>1-2 weeks</span>
                        <span>1 month</span>
                        <span>1 quarter</span>
                        <span>&gt; 1 quarter</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCancel(idea.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleSave(idea)}
                        disabled={isUpdating}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {isUpdating ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Current Scores Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{scores.reach.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Reach</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{scores.impact}/5</div>
                        <div className="text-xs text-muted-foreground">Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{scores.confidence}%</div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{scores.effort}/5</div>
                        <div className="text-xs text-muted-foreground">Effort</div>
                      </div>
                    </div>

                    {/* Edit Button */}
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingIdea(idea.id)}
                      >
                        <Calculator className="h-4 w-4 mr-1" />
                        {idea.riceScore ? "Update Scores" : "Add Scores"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}