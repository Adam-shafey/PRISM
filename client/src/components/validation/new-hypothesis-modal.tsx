import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, FlaskConical } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Idea, Category, User } from "@shared/schema";

const hypothesisSchema = z.object({
  statement: z.string().min(10, "Hypothesis statement must be at least 10 characters"),
  assumptions: z.array(z.string()).optional(),
  validationMetrics: z.array(z.string()).optional(),
  experimentType: z.string().optional(),
});

type HypothesisFormData = z.infer<typeof hypothesisSchema>;

interface NewHypothesisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideas: (Idea & { category?: Category; owner?: User })[];
  selectedIdeaId: number | null;
  onIdeaSelect: (ideaId: number) => void;
  onSubmit: (data: HypothesisFormData & { ideaId: number }) => Promise<void>;
  isSubmitting: boolean;
}

export function NewHypothesisModal({
  open,
  onOpenChange,
  ideas,
  selectedIdeaId,
  onIdeaSelect,
  onSubmit,
  isSubmitting
}: NewHypothesisModalProps) {
  const [newAssumption, setNewAssumption] = useState("");
  const [newMetric, setNewMetric] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues
  } = useForm<HypothesisFormData>({
    resolver: zodResolver(hypothesisSchema),
    defaultValues: {
      statement: "",
      assumptions: [],
      validationMetrics: [],
      experimentType: ""
    }
  });

  const assumptions = watch("assumptions") || [];
  const validationMetrics = watch("validationMetrics") || [];

  const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);

  useEffect(() => {
    if (!open) {
      reset();
      setNewAssumption("");
      setNewMetric("");
    }
  }, [open, reset]);

  const addAssumption = () => {
    if (newAssumption.trim()) {
      setValue("assumptions", [...assumptions, newAssumption.trim()]);
      setNewAssumption("");
    }
  };

  const removeAssumption = (index: number) => {
    setValue("assumptions", assumptions.filter((_, i) => i !== index));
  };

  const addMetric = () => {
    if (newMetric.trim()) {
      setValue("validationMetrics", [...validationMetrics, newMetric.trim()]);
      setNewMetric("");
    }
  };

  const removeMetric = (index: number) => {
    setValue("validationMetrics", validationMetrics.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: HypothesisFormData) => {
    if (!selectedIdeaId) return;
    
    await onSubmit({
      ...data,
      ideaId: selectedIdeaId
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Create New Hypothesis
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Idea Selection */}
          <div className="space-y-3">
            <Label>Select Idea to Test</Label>
            {selectedIdea ? (
              <Card className="border-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{selectedIdea.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedIdea.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{selectedIdea.status}</Badge>
                        {selectedIdea.category && (
                          <Badge 
                            variant="secondary" 
                            style={{ backgroundColor: `${selectedIdea.category.color}20`, color: selectedIdea.category.color }}
                          >
                            {selectedIdea.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onIdeaSelect(0)}
                    >
                      Change
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ) : (
              <Select onValueChange={(value) => onIdeaSelect(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an idea to create hypothesis for..." />
                </SelectTrigger>
                <SelectContent>
                  {ideas.map((idea) => (
                    <SelectItem key={idea.id} value={idea.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{idea.title}</span>
                        {idea.category && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: idea.category.color }}
                          />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Hypothesis Statement */}
          <div className="space-y-2">
            <Label htmlFor="statement">Hypothesis Statement</Label>
            <Textarea
              id="statement"
              {...register("statement")}
              placeholder="We believe that [doing this] for [these people] will achieve [this outcome]. We will know this is true when we see [this measurable signal]."
              rows={4}
              className={errors.statement ? "border-destructive" : ""}
            />
            {errors.statement && (
              <p className="text-sm text-destructive">{errors.statement.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Tip: A good hypothesis includes what you're testing, who you're testing it with, what you expect to happen, and how you'll measure success.
            </p>
          </div>

          {/* Key Assumptions */}
          <div className="space-y-3">
            <Label>Key Assumptions</Label>
            <div className="flex gap-2">
              <Input
                value={newAssumption}
                onChange={(e) => setNewAssumption(e.target.value)}
                placeholder="Add an assumption..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAssumption();
                  }
                }}
              />
              <Button type="button" onClick={addAssumption} disabled={!newAssumption.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {assumptions.length > 0 && (
              <div className="space-y-2">
                {assumptions.map((assumption, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="flex-1 text-sm">{assumption}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAssumption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Success Metrics */}
          <div className="space-y-3">
            <Label>Success Metrics</Label>
            <div className="flex gap-2">
              <Input
                value={newMetric}
                onChange={(e) => setNewMetric(e.target.value)}
                placeholder="Add a success metric..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMetric();
                  }
                }}
              />
              <Button type="button" onClick={addMetric} disabled={!newMetric.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {validationMetrics.length > 0 && (
              <div className="space-y-2">
                {validationMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="flex-1 text-sm">{metric}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMetric(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experiment Type */}
          <div className="space-y-2">
            <Label htmlFor="experimentType">Experiment Type</Label>
            <Select onValueChange={(value) => setValue("experimentType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose experiment type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User Interview">User Interview</SelectItem>
                <SelectItem value="Survey">Survey</SelectItem>
                <SelectItem value="Prototype Test">Prototype Test</SelectItem>
                <SelectItem value="A/B Test">A/B Test</SelectItem>
                <SelectItem value="Data Analysis">Data Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedIdeaId}>
              {isSubmitting ? "Creating..." : "Create Hypothesis"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}