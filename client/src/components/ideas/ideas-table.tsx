import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronUp, 
  ChevronDown, 
  Edit2, 
  Check, 
  X, 
  MoreVertical,
  Calendar,
  User,
  Target,
  TrendingUp
} from "lucide-react";
import { useUpdateIdea } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Idea, Category, User as UserType } from "@shared/schema";

interface IdeasTableProps {
  ideas: (Idea & { category?: Category; owner?: UserType })[];
  categories: Category[];
  users: UserType[];
  onIdeaClick: (idea: Idea) => void;
}

type SortField = "title" | "status" | "createdAt" | "category" | "owner" | "reachEstimate";
type SortOrder = "asc" | "desc";

interface EditingCell {
  ideaId: number;
  field: string;
}

export function IdeasTable({ ideas, categories, users, onIdeaClick }: IdeasTableProps) {
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState("");

  const updateIdeaMutation = useUpdateIdea();
  const { toast } = useToast();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedIdeas = useMemo(() => {
    return [...ideas].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "createdAt":
          aValue = a.createdAt ? new Date(a.createdAt) : new Date(0);
          bValue = b.createdAt ? new Date(b.createdAt) : new Date(0);
          break;
        case "category":
          aValue = a.category?.name || "";
          bValue = b.category?.name || "";
          break;
        case "owner":
          aValue = a.owner?.name || "";
          bValue = b.owner?.name || "";
          break;
        case "reachEstimate":
          aValue = a.reachEstimate || 0;
          bValue = b.reachEstimate || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [ideas, sortField, sortOrder]);

  const startEditing = (ideaId: number, field: string, currentValue: string) => {
    setEditingCell({ ideaId, field });
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = async (ideaId: number, field: string) => {
    try {
      const updateData: any = {};
      
      if (field === "categoryId") {
        updateData.categoryId = parseInt(editValue) || null;
      } else if (field === "ownerId") {
        updateData.ownerId = parseInt(editValue) || null;
      } else if (field === "reachEstimate") {
        updateData.reachEstimate = parseInt(editValue) || null;
      } else {
        updateData[field] = editValue;
      }

      await updateIdeaMutation.mutateAsync({ id: ideaId, data: updateData });
      
      toast({
        title: "Success",
        description: "Idea updated successfully!"
      });
      
      setEditingCell(null);
      setEditValue("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "In Discovery": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "Validated": return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "Rejected": return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "Prioritized": return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "In Planning": return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      default: return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-2 font-medium text-left justify-start hover:bg-muted/50"
    >
      {children}
      <div className="ml-2 flex flex-col">
        <ChevronUp 
          className={`h-3 w-3 ${sortField === field && sortOrder === "asc" ? "text-primary" : "text-muted-foreground"}`} 
        />
        <ChevronDown 
          className={`h-3 w-3 -mt-1 ${sortField === field && sortOrder === "desc" ? "text-primary" : "text-muted-foreground"}`} 
        />
      </div>
    </Button>
  );

  const EditableCell = ({ 
    idea, 
    field, 
    value, 
    type = "text" 
  }: { 
    idea: Idea; 
    field: string; 
    value: string; 
    type?: "text" | "textarea" | "select" | "number";
  }) => {
    const isEditing = editingCell?.ideaId === idea.id && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          {type === "textarea" ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-[60px] text-xs"
              autoFocus
            />
          ) : type === "select" && field === "status" ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="In Discovery">In Discovery</SelectItem>
                <SelectItem value="Validated">Validated</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Prioritized">Prioritized</SelectItem>
                <SelectItem value="In Planning">In Planning</SelectItem>
              </SelectContent>
            </Select>
          ) : type === "select" && field === "categoryId" ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === "select" && field === "ownerId" ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Owner</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-xs"
              type={type}
              autoFocus
            />
          )}
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => saveEdit(idea.id, field)}
              className="h-6 w-6"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={cancelEditing}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="group flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
        onClick={() => startEditing(idea.id, field, value)}
      >
        <span className="text-xs flex-1">{value || "-"}</span>
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground" />
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-3 min-w-[300px]">
                  <SortButton field="title">Title</SortButton>
                </th>
                <th className="text-left p-3 min-w-[130px]">
                  <SortButton field="status">Status</SortButton>
                </th>
                <th className="text-left p-3 min-w-[120px]">
                  <SortButton field="category">Category</SortButton>
                </th>
                <th className="text-left p-3 min-w-[120px]">
                  <SortButton field="owner">Owner</SortButton>
                </th>
                <th className="text-left p-3 min-w-[100px]">
                  <SortButton field="reachEstimate">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Reach
                    </div>
                  </SortButton>
                </th>
                <th className="text-left p-3 min-w-[120px]">
                  <SortButton field="createdAt">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created
                    </div>
                  </SortButton>
                </th>
                <th className="text-left p-3 w-[300px]">Description</th>
                <th className="text-left p-3 w-[50px]"></th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {sortedIdeas.map((idea, index) => (
                <tr 
                  key={idea.id} 
                  className={`border-b hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  {/* Title */}
                  <td className="p-3">
                    <EditableCell
                      idea={idea}
                      field="title"
                      value={idea.title}
                    />
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <div 
                      className="group flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                      onClick={() => startEditing(idea.id, "status", idea.status)}
                    >
                      <Badge className={`text-xs ${getStatusColor(idea.status)}`}>
                        {idea.status}
                      </Badge>
                      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground" />
                    </div>
                    {editingCell?.ideaId === idea.id && editingCell?.field === "status" && (
                      <div className="mt-2">
                        <EditableCell
                          idea={idea}
                          field="status"
                          value={idea.status}
                          type="select"
                        />
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="p-3">
                    <div 
                      className="group flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                      onClick={() => startEditing(idea.id, "categoryId", idea.categoryId?.toString() || "")}
                    >
                      {idea.category ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: idea.category.color }}
                          />
                          <span className="text-xs">{idea.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No category</span>
                      )}
                      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground" />
                    </div>
                    {editingCell?.ideaId === idea.id && editingCell?.field === "categoryId" && (
                      <div className="mt-2">
                        <EditableCell
                          idea={idea}
                          field="categoryId"
                          value={idea.categoryId?.toString() || ""}
                          type="select"
                        />
                      </div>
                    )}
                  </td>

                  {/* Owner */}
                  <td className="p-3">
                    <div 
                      className="group flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                      onClick={() => startEditing(idea.id, "ownerId", idea.ownerId?.toString() || "")}
                    >
                      {idea.owner ? (
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{idea.owner.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No owner</span>
                      )}
                      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground" />
                    </div>
                    {editingCell?.ideaId === idea.id && editingCell?.field === "ownerId" && (
                      <div className="mt-2">
                        <EditableCell
                          idea={idea}
                          field="ownerId"
                          value={idea.ownerId?.toString() || ""}
                          type="select"
                        />
                      </div>
                    )}
                  </td>

                  {/* Reach Estimate */}
                  <td className="p-3">
                    <EditableCell
                      idea={idea}
                      field="reachEstimate"
                      value={idea.reachEstimate?.toString() || ""}
                      type="number"
                    />
                  </td>

                  {/* Created Date */}
                  <td className="p-3">
                    <span className="text-xs text-muted-foreground">
                      {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : "-"}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="p-3">
                    <EditableCell
                      idea={idea}
                      field="description"
                      value={idea.description}
                      type="textarea"
                    />
                  </td>

                  {/* Actions */}
                  <td className="p-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onIdeaClick(idea)}
                      className="h-6 w-6"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedIdeas.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Ideas Found</h3>
              <p className="text-muted-foreground">
                Start by creating your first product idea to begin the discovery process.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}