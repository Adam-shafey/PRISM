import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  FileText, 
  FlaskConical, 
  BarChart3, 
  Target,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import type { Hypothesis, Idea, Category, User } from "@shared/schema";

interface ExperimentTrackerProps {
  hypotheses: (Hypothesis & { idea?: Idea & { category?: Category; owner?: User } })[];
  onUpdate: (id: number, data: Partial<Hypothesis>) => Promise<void>;
}

export function ExperimentTracker({ hypotheses, onUpdate }: ExperimentTrackerProps) {
  const [experimentFilter, setExperimentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const experimentTypes = [
    { type: "User Interview", icon: Users, color: "bg-blue-100 text-blue-800" },
    { type: "Survey", icon: FileText, color: "bg-green-100 text-green-800" },
    { type: "Prototype Test", icon: FlaskConical, color: "bg-purple-100 text-purple-800" },
    { type: "A/B Test", icon: BarChart3, color: "bg-orange-100 text-orange-800" },
    { type: "Data Analysis", icon: BarChart3, color: "bg-gray-100 text-gray-800" },
  ];

  const filteredHypotheses = useMemo(() => {
    let filtered = hypotheses;

    if (experimentFilter !== "all") {
      filtered = filtered.filter(h => h.experimentType === experimentFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(h => h.status === statusFilter);
    }

    return filtered;
  }, [hypotheses, experimentFilter, statusFilter]);

  // Group experiments by type
  const experimentGroups = useMemo(() => {
    const groups = experimentTypes.map(expType => {
      const experiments = filteredHypotheses.filter(h => h.experimentType === expType.type);
      const total = experiments.length;
      const completed = experiments.filter(h => h.status === "Validated" || h.status === "Invalidated").length;
      const inProgress = experiments.filter(h => h.status === "Partially Validated").length;
      const pending = experiments.filter(h => h.status === "Unvalidated").length;

      return {
        ...expType,
        experiments,
        stats: { total, completed, inProgress, pending }
      };
    });

    return groups.filter(group => group.experiments.length > 0);
  }, [filteredHypotheses]);

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
      case "Validated": return "bg-green-100 text-green-800";
      case "Invalidated": return "bg-red-100 text-red-800";
      case "Partially Validated": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (hypotheses.length === 0) {
    return (
      <div className="text-center py-12">
        <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Experiments to Track</h3>
        <p className="text-muted-foreground">Create hypotheses with experiment types to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={experimentFilter} onValueChange={setExperimentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by experiment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Experiment Types</SelectItem>
            {experimentTypes.map((type) => (
              <SelectItem key={type.type} value={type.type}>
                {type.type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Unvalidated">Pending</SelectItem>
            <SelectItem value="Partially Validated">In Progress</SelectItem>
            <SelectItem value="Validated">Completed - Validated</SelectItem>
            <SelectItem value="Invalidated">Completed - Invalidated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Experiment Groups */}
      {experimentGroups.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Experiments Match Filters</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see experiments.</p>
        </div>
      ) : (
        experimentGroups.map((group) => {
          const Icon = group.icon;
          const completionRate = group.stats.total > 0 ? 
            Math.round((group.stats.completed / group.stats.total) * 100) : 0;

          return (
            <Card key={group.type}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${group.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{group.type}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {group.stats.total} experiments • {completionRate}% complete
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{group.stats.completed}</div>
                      <div className="text-muted-foreground">Done</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">{group.stats.inProgress}</div>
                      <div className="text-muted-foreground">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-600">{group.stats.pending}</div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {group.experiments.map((hypothesis) => (
                    <div
                      key={hypothesis.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-1">
                        {getStatusIcon(hypothesis.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {hypothesis.statement}
                          </h4>
                          <Badge className={`ml-2 ${getStatusColor(hypothesis.status)}`}>
                            {hypothesis.status.replace("Partially Validated", "In Progress")}
                          </Badge>
                        </div>
                        
                        {hypothesis.idea && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-muted-foreground">Idea:</span>
                            <Badge variant="outline" className="text-xs">
                              {hypothesis.idea.title}
                            </Badge>
                            {hypothesis.idea.category && (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: hypothesis.idea.category.color }}
                                title={hypothesis.idea.category.name}
                              />
                            )}
                          </div>
                        )}

                        {hypothesis.validationMetrics && hypothesis.validationMetrics.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs text-muted-foreground">Success Metrics:</span>
                            <ul className="text-xs text-muted-foreground mt-1">
                              {hypothesis.validationMetrics.slice(0, 2).map((metric, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span>•</span>
                                  <span className="line-clamp-1">{metric}</span>
                                </li>
                              ))}
                              {hypothesis.validationMetrics.length > 2 && (
                                <li className="text-muted-foreground">
                                  +{hypothesis.validationMetrics.length - 2} more...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {hypothesis.results && (
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded line-clamp-2">
                            <strong>Results:</strong> {hypothesis.results}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>
                            Created: {hypothesis.createdAt ? new Date(hypothesis.createdAt).toLocaleDateString() : "Unknown"}
                          </span>
                          {hypothesis.updatedAt && hypothesis.updatedAt !== hypothesis.createdAt && (
                            <span>
                              Updated: {new Date(hypothesis.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}