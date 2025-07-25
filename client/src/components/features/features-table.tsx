import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ChevronUp, 
  ChevronDown, 
  MessageSquare,
  ExternalLink,
  GitBranch,
  User,
  Calendar,
  Package,
  Component
} from "lucide-react";
import { useUpdateFeature } from "@/lib/features";
import type { Feature } from "@shared/schema";

interface FeaturesTableProps {
  features: (Feature & { createdBy?: { name: string; email: string }; linkedIdea?: { title: string; id: number } })[];
  onFeatureClick: (feature: Feature) => void;
}

export function FeaturesTable({ features, onFeatureClick }: FeaturesTableProps) {
  const [sortField, setSortField] = useState<string>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [editingField, setEditingField] = useState<{ id: number; field: string } | null>(null);

  const updateFeature = useUpdateFeature();

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedFeatures = [...features].sort((a, b) => {
    const aValue = a[sortField as keyof Feature] || "";
    const bValue = b[sortField as keyof Feature] || "";
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleFieldUpdate = async (featureId: number, field: string, value: string | number) => {
    try {
      await updateFeature.mutateAsync({
        id: featureId,
        feature: { [field]: value }
      });
      setEditingField(null);
    } catch (error) {
      console.error("Failed to update feature:", error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Draft": return "secondary";
      case "Deprecated": return "outline";
      case "Archived": return "outline";
      default: return "secondary";
    }
  };

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th 
      className="p-4 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          sortDirection === "asc" ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </th>
  );

  return (
    <div className="border rounded-lg bg-card">
      <table className="w-full">
        <thead className="border-b">
          <tr>
            <SortHeader field="title">Feature</SortHeader>
            <SortHeader field="status">Status</SortHeader>
            <SortHeader field="category">Category</SortHeader>
            <SortHeader field="createdBy">Owner</SortHeader>
            <SortHeader field="version">Version</SortHeader>
            <SortHeader field="updatedAt">Updated</SortHeader>
            <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedFeatures.map((feature, index) => (
            <tr 
              key={feature.id} 
              className={`border-b hover:bg-muted/50 transition-colors ${
                index % 2 === 0 ? "bg-background" : "bg-muted/25"
              }`}
            >
              {/* Feature Title */}
              <td className="p-4">
                <div className="space-y-1">
                  {editingField?.id === feature.id && editingField?.field === "title" ? (
                    <Input
                      value={feature.title}
                      onChange={(e) => handleFieldUpdate(feature.id, "title", e.target.value)}
                      onBlur={() => setEditingField(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleFieldUpdate(feature.id, "title", e.currentTarget.value);
                        } else if (e.key === "Escape") {
                          setEditingField(null);
                        }
                      }}
                      autoFocus
                      className="h-8"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {feature.type === "module" ? (
                        <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      ) : (
                        <Component className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      )}
                      <div
                        className="font-medium cursor-pointer hover:text-primary line-clamp-1"
                        onClick={() => onFeatureClick(feature)}
                      >
                        {feature.title}
                      </div>
                      {feature.type === "module" && (
                        <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700">
                          Module
                        </Badge>
                      )}
                    </div>
                  )}
                  {feature.problemStatement && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {feature.problemStatement}
                    </div>
                  )}
                  {feature.linkedIdea && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      Linked to: {feature.linkedIdea.title}
                    </div>
                  )}
                </div>
              </td>

              {/* Status */}
              <td className="p-4">
                {editingField?.id === feature.id && editingField?.field === "status" ? (
                  <Select
                    value={feature.status}
                    onValueChange={(value) => handleFieldUpdate(feature.id, "status", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Deprecated">Deprecated</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge 
                    variant={getStatusBadgeVariant(feature.status)}
                    className="cursor-pointer"
                    onClick={() => setEditingField({ id: feature.id, field: "status" })}
                  >
                    {feature.status}
                  </Badge>
                )}
              </td>

              {/* Category */}
              <td className="p-4">
                {editingField?.id === feature.id && editingField?.field === "category" ? (
                  <Input
                    value={feature.category || ""}
                    onChange={(e) => handleFieldUpdate(feature.id, "category", e.target.value)}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleFieldUpdate(feature.id, "category", e.currentTarget.value);
                      } else if (e.key === "Escape") {
                        setEditingField(null);
                      }
                    }}
                    autoFocus
                    className="h-8"
                    placeholder="Category"
                  />
                ) : (
                  <span 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => setEditingField({ id: feature.id, field: "category" })}
                  >
                    {feature.category || "No category"}
                  </span>
                )}
              </td>

              {/* Owner */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {feature.createdBy?.name || "Unknown"}
                  </span>
                </div>
              </td>

              {/* Version */}
              <td className="p-4">
                <div className="flex items-center gap-1">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">v{feature.version}</span>
                </div>
              </td>

              {/* Updated */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(feature.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </td>

              {/* Actions */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onFeatureClick(feature)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}