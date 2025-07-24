import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Info, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Idea, Category, User } from "@shared/schema";

interface RiceScoreCalculatorProps {
  idea: Idea & { category?: Category; owner?: User };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScoreUpdate: (ideaId: number, scores: { 
    impactScore?: number; 
    effortScore?: number; 
    confidenceScore?: number; 
    riceScore?: number;
    reachEstimate?: number;
  }) => Promise<void>;
  isUpdating: boolean;
}

export function RiceScoreCalculator({ 
  idea, 
  open, 
  onOpenChange, 
  onScoreUpdate, 
  isUpdating 
}: RiceScoreCalculatorProps) {
  const { toast } = useToast();
  
  // RICE scoring values
  const [reach, setReach] = useState(idea.reachEstimate || 1000);
  const [impact, setImpact] = useState(idea.impactScore || 3);
  const [confidence, setConfidence] = useState(idea.confidenceScore || 80);
  const [effort, setEffort] = useState(idea.effortScore || 3);
  
  // Calculated RICE score
  const riceScore = effort > 0 ? Math.round((reach * impact * confidence) / (effort * 100)) : 0;

  const handleSave = async () => {
    try {
      await onScoreUpdate(idea.id, {
        impactScore: impact,
        effortScore: effort,
        confidenceScore: confidence,
        riceScore: riceScore,
        reachEstimate: reach
      });
      
      toast({
        title: "Success",
        description: "RICE scores updated successfully!"
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update scores. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getImpactLabel = (score: number) => {
    switch (score) {
      case 1: return "Minimal";
      case 2: return "Low";
      case 3: return "Medium";
      case 4: return "High";
      case 5: return "Massive";
      default: return "Medium";
    }
  };

  const getEffortLabel = (score: number) => {
    switch (score) {
      case 1: return "Minimal (< 1 week)";
      case 2: return "Low (1-2 weeks)";
      case 3: return "Medium (1 month)";
      case 4: return "High (1 quarter)";
      case 5: return "Massive (> 1 quarter)";
      default: return "Medium";
    }
  };

  const getRiceScoreLabel = (score: number) => {
    if (score >= 100) return { label: "Very High Priority", color: "bg-green-500" };
    if (score >= 50) return { label: "High Priority", color: "bg-blue-500" };
    if (score >= 25) return { label: "Medium Priority", color: "bg-yellow-500" };
    if (score >= 10) return { label: "Low Priority", color: "bg-orange-500" };
    return { label: "Very Low Priority", color: "bg-red-500" };
  };

  const scoreInfo = getRiceScoreLabel(riceScore);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            RICE Score Calculator
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Idea Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Idea Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm mt-1">{idea.title}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {idea.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{idea.status}</Badge>
                  {idea.category && (
                    <Badge variant="secondary" style={{ backgroundColor: `${idea.category.color}20`, color: idea.category.color }}>
                      {idea.category.name}
                    </Badge>
                  )}
                </div>
                
                {idea.owner && (
                  <div className="flex items-center gap-2">
                    {idea.owner.avatar && (
                      <img 
                        src={idea.owner.avatar} 
                        alt={idea.owner.name}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-sm text-muted-foreground">{idea.owner.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RICE Score Result */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  RICE Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold text-primary">{riceScore}</div>
                  <Badge className={`${scoreInfo.color} text-white`}>
                    {scoreInfo.label}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    ({reach} × {impact} × {confidence}%) ÷ {effort} = {riceScore}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle & Right Columns - RICE Parameters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reach */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Reach
                  <Info className="h-4 w-4 text-muted-foreground" title="How many people will this impact per period?" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label>Number of users/customers impacted per quarter</Label>
                  <Input
                    type="number"
                    value={reach}
                    onChange={(e) => setReach(Number(e.target.value) || 0)}
                    placeholder="e.g., 1000"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Estimate how many people will be impacted by this idea in a typical quarter.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Impact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Impact
                  <Info className="h-4 w-4 text-muted-foreground" title="How much will this impact each person?" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Impact per person</Label>
                    <Badge variant="outline">{getImpactLabel(impact)}</Badge>
                  </div>
                  <Slider
                    value={[impact]}
                    onValueChange={(value) => setImpact(value[0])}
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
                  <p className="text-xs text-muted-foreground">
                    How much will this improve the experience for each person affected?
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Confidence */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Confidence
                  <Info className="h-4 w-4 text-muted-foreground" title="How confident are you in your reach and impact estimates?" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Confidence level</Label>
                    <Badge variant="outline">{confidence}%</Badge>
                  </div>
                  <Slider
                    value={[confidence]}
                    onValueChange={(value) => setConfidence(value[0])}
                    max={100}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <div className="grid grid-cols-3 text-xs text-muted-foreground">
                    <span>Low (10%)</span>
                    <span>Medium (50%)</span>
                    <span>High (100%)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    How confident are you in your reach and impact estimates based on research and data?
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Effort */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Effort
                  <Info className="h-4 w-4 text-muted-foreground" title="How much work will this require?" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Development effort required</Label>
                    <Badge variant="outline">{getEffortLabel(effort)}</Badge>
                  </div>
                  <Slider
                    value={[effort]}
                    onValueChange={(value) => setEffort(value[0])}
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
                  <p className="text-xs text-muted-foreground">
                    Estimate the total amount of work required from all team members.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save RICE Scores"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}