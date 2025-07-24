import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  FlaskConical,
  Users,
  BarChart3,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Hypothesis, Idea, Category, User } from "@shared/schema";

interface HypothesisCardProps {
  hypothesis: Hypothesis & { idea?: Idea & { category?: Category; owner?: User } };
  onUpdate: (id: number, data: Partial<Hypothesis>) => Promise<void>;
  isUpdating: boolean;
}

export function HypothesisCard({ hypothesis, onUpdate, isUpdating }: HypothesisCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    statement: hypothesis.statement,
    results: hypothesis.results || "",
    status: hypothesis.status
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Validated": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Invalidated": return <XCircle className="h-4 w-4 text-red-600" />;
      case "Partially Validated": return <Clock className="h-4 w-4 text-orange-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Validated": return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "Invalidated": return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "Partially Validated": return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      default: return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  const getExperimentIcon = (experimentType: string | null) => {
    switch (experimentType) {
      case "User Interview": return <Users className="h-4 w-4" />;
      case "Survey": return <FileText className="h-4 w-4" />;
      case "Prototype Test": return <FlaskConical className="h-4 w-4" />;
      case "A/B Test": return <BarChart3 className="h-4 w-4" />;
      case "Data Analysis": return <BarChart3 className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const handleSave = async () => {
    try {
      await onUpdate(hypothesis.id, editData);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Hypothesis updated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update hypothesis. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditData({
      statement: hypothesis.statement,
      results: hypothesis.results || "",
      status: hypothesis.status
    });
    setIsEditing(false);
  };

  return (
    <Card className={isEditing ? "ring-2 ring-primary" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(hypothesis.status)}
              <Badge className={getStatusColor(hypothesis.status)}>
                {hypothesis.status}
              </Badge>
              {hypothesis.experimentType && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {getExperimentIcon(hypothesis.experimentType)}
                  {hypothesis.experimentType}
                </Badge>
              )}
            </div>
            
            {hypothesis.idea && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">For idea:</span>
                <Badge variant="secondary">{hypothesis.idea.title}</Badge>
                {hypothesis.idea.category && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: hypothesis.idea.category.color }}
                    title={hypothesis.idea.category.name}
                  />
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hypothesis Statement */}
        <div>
          <label className="text-sm font-medium mb-2 block">Hypothesis Statement</label>
          {isEditing ? (
            <Textarea
              value={editData.statement}
              onChange={(e) => setEditData(prev => ({ ...prev, statement: e.target.value }))}
              placeholder="We believe that..."
              rows={3}
            />
          ) : (
            <p className="text-sm bg-muted p-3 rounded-md">{hypothesis.statement}</p>
          )}
        </div>

        {/* Assumptions */}
        {hypothesis.assumptions && hypothesis.assumptions.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Key Assumptions</label>
            <ul className="text-sm space-y-1">
              {hypothesis.assumptions.map((assumption, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Validation Metrics */}
        {hypothesis.validationMetrics && hypothesis.validationMetrics.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Success Metrics</label>
            <ul className="text-sm space-y-1">
              {hypothesis.validationMetrics.map((metric, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{metric}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Results */}
        <div>
          <label className="text-sm font-medium mb-2 block">Results & Findings</label>
          {isEditing ? (
            <Textarea
              value={editData.results}
              onChange={(e) => setEditData(prev => ({ ...prev, results: e.target.value }))}
              placeholder="Document your experiment results and key findings..."
              rows={4}
            />
          ) : hypothesis.results ? (
            <p className="text-sm bg-muted p-3 rounded-md">{hypothesis.results}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No results documented yet.</p>
          )}
        </div>

        {/* Status Update */}
        {isEditing && (
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={editData.status}
              onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unvalidated">Unvalidated</SelectItem>
                <SelectItem value="Partially Validated">Partially Validated</SelectItem>
                <SelectItem value="Validated">Validated</SelectItem>
                <SelectItem value="Invalidated">Invalidated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>
            Created: {hypothesis.createdAt ? new Date(hypothesis.createdAt).toLocaleDateString() : "Unknown"}
          </span>
          {hypothesis.updatedAt && hypothesis.updatedAt !== hypothesis.createdAt && (
            <span>
              Updated: {new Date(hypothesis.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}