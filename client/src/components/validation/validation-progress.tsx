import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  FlaskConical
} from "lucide-react";
import type { Idea, Category, User, Hypothesis } from "@shared/schema";

interface ValidationProgressProps {
  ideas: (Idea & { category?: Category; owner?: User })[];
  hypotheses: (Hypothesis & { idea?: Idea & { category?: Category; owner?: User } })[];
}

export function ValidationProgress({ ideas, hypotheses }: ValidationProgressProps) {
  const progressData = useMemo(() => {
    // Calculate validation progress for each idea
    const ideaProgress = ideas.map(idea => {
      const ideaHypotheses = hypotheses.filter(h => h.ideaId === idea.id);
      const total = ideaHypotheses.length;
      const validated = ideaHypotheses.filter(h => h.status === "Validated").length;
      const invalidated = ideaHypotheses.filter(h => h.status === "Invalidated").length;
      const inProgress = ideaHypotheses.filter(h => h.status === "Partially Validated").length;
      const unvalidated = ideaHypotheses.filter(h => h.status === "Unvalidated").length;
      
      const validationRate = total > 0 ? Math.round(((validated + invalidated) / total) * 100) : 0;
      const successRate = total > 0 ? Math.round((validated / total) * 100) : 0;
      
      return {
        idea,
        total,
        validated,
        invalidated,
        inProgress,
        unvalidated,
        validationRate,
        successRate
      };
    });

    // Overall statistics
    const totalHypotheses = hypotheses.length;
    const totalValidated = hypotheses.filter(h => h.status === "Validated").length;
    const totalInvalidated = hypotheses.filter(h => h.status === "Invalidated").length;
    const totalInProgress = hypotheses.filter(h => h.status === "Partially Validated").length;
    const totalUnvalidated = hypotheses.filter(h => h.status === "Unvalidated").length;
    
    const overallValidationRate = totalHypotheses > 0 ? 
      Math.round(((totalValidated + totalInvalidated) / totalHypotheses) * 100) : 0;
    const overallSuccessRate = totalHypotheses > 0 ? 
      Math.round((totalValidated / totalHypotheses) * 100) : 0;

    return {
      ideaProgress: ideaProgress.sort((a, b) => b.validationRate - a.validationRate),
      overall: {
        totalHypotheses,
        totalValidated,
        totalInvalidated,
        totalInProgress,
        totalUnvalidated,
        overallValidationRate,
        overallSuccessRate
      }
    };
  }, [ideas, hypotheses]);

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-blue-600";
    if (rate >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getValidationStatus = (idea: any) => {
    if (idea.total === 0) return { status: "No Hypotheses", color: "bg-gray-100 text-gray-700" };
    if (idea.validationRate >= 80) return { status: "Well Validated", color: "bg-green-100 text-green-700" };
    if (idea.validationRate >= 60) return { status: "Partially Validated", color: "bg-blue-100 text-blue-700" };
    if (idea.validationRate >= 40) return { status: "In Progress", color: "bg-orange-100 text-orange-700" };
    return { status: "Needs Validation", color: "bg-red-100 text-red-700" };
  };

  if (ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Ideas to Track</h3>
        <p className="text-muted-foreground">Create some ideas first to see validation progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overall Validation Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{progressData.overall.totalHypotheses}</div>
              <div className="text-sm text-muted-foreground">Total Hypotheses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getProgressColor(progressData.overall.overallValidationRate)}`}>
                {progressData.overall.overallValidationRate}%
              </div>
              <div className="text-sm text-muted-foreground">Validation Rate</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getProgressColor(progressData.overall.overallSuccessRate)}`}>
                {progressData.overall.overallSuccessRate}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {progressData.overall.totalInProgress}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Validation Progress</span>
              <span>{progressData.overall.overallValidationRate}%</span>
            </div>
            <Progress value={progressData.overall.overallValidationRate} />
          </div>
        </CardContent>
      </Card>

      {/* Ideas Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Validation by Idea</h3>
        
        {progressData.ideaProgress.map((ideaData) => {
          const validationStatus = getValidationStatus(ideaData);
          
          return (
            <Card key={ideaData.idea.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">{ideaData.idea.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ideaData.idea.status}</Badge>
                      {ideaData.idea.category && (
                        <Badge 
                          variant="secondary" 
                          style={{ backgroundColor: `${ideaData.idea.category.color}20`, color: ideaData.idea.category.color }}
                        >
                          {ideaData.idea.category.name}
                        </Badge>
                      )}
                      <Badge className={validationStatus.color}>
                        {validationStatus.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getProgressColor(ideaData.validationRate)}`}>
                      {ideaData.validationRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Validated</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {ideaData.total > 0 ? (
                  <>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600 flex items-center justify-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {ideaData.validated}
                        </div>
                        <div className="text-xs text-muted-foreground">Validated</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-600 flex items-center justify-center gap-1">
                          <Clock className="h-4 w-4" />
                          {ideaData.inProgress}
                        </div>
                        <div className="text-xs text-muted-foreground">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600 flex items-center justify-center gap-1">
                          <XCircle className="h-4 w-4" />
                          {ideaData.invalidated}
                        </div>
                        <div className="text-xs text-muted-foreground">Invalidated</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-600 flex items-center justify-center gap-1">
                          <Target className="h-4 w-4" />
                          {ideaData.unvalidated}
                        </div>
                        <div className="text-xs text-muted-foreground">Unvalidated</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Validation Progress</span>
                        <span>{ideaData.validationRate}%</span>
                      </div>
                      <Progress value={ideaData.validationRate} />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hypotheses created yet</p>
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