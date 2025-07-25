import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  GitBranch, 
  Calendar, 
  User, 
  ExternalLink,
  Edit3,
  Save,
  X,
  MessageSquare,
  Send
} from "lucide-react";
import { useUpdateFeature, useFeatureVersions, useCreateFeatureComment } from "@/lib/features";
import type { Feature, FeatureComment } from "@shared/schema";

interface FeatureDetailModalProps {
  feature: (Feature & { 
    createdBy?: { name: string; email: string }; 
    updatedBy?: { name: string; email: string };
    linkedIdea?: { title: string; id: number };
    comments?: (FeatureComment & { user?: { name: string; email: string } })[];
  }) | null;
  open: boolean;
  onClose: () => void;
}

export function FeatureDetailModal({ feature, open, onClose }: FeatureDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFeature, setEditedFeature] = useState(feature);
  const [newComment, setNewComment] = useState("");

  const updateFeature = useUpdateFeature();
  const createComment = useCreateFeatureComment();
  const { data: versions = [] } = useFeatureVersions(feature?.id || 0);

  useEffect(() => {
    if (feature) {
      setEditedFeature(feature);
    }
  }, [feature]);

  const handleSave = async () => {
    if (!feature || !editedFeature) return;

    try {
      await updateFeature.mutateAsync({
        id: feature.id,
        feature: {
          title: editedFeature.title,
          problemStatement: editedFeature.problemStatement,
          solutionOverview: editedFeature.solutionOverview,
          userStories: editedFeature.userStories,
          technicalConsiderations: editedFeature.technicalConsiderations,
          designLinks: editedFeature.designLinks,
          keyMetrics: editedFeature.keyMetrics,
          releaseNotes: editedFeature.releaseNotes,
          learnings: editedFeature.learnings,
          status: editedFeature.status,
          category: editedFeature.category,
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update feature:", error);
    }
  };

  const handleAddComment = async () => {
    if (!feature || !newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        featureId: feature.id,
        comment: { content: newComment }
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
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

  if (!feature) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              {isEditing ? (
                <Input
                  value={editedFeature?.title || ""}
                  onChange={(e) => setEditedFeature(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="text-lg font-semibold"
                />
              ) : (
                <DialogTitle className="text-lg font-semibold">{feature.title}</DialogTitle>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GitBranch className="h-4 w-4" />
                  v{feature.version}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Updated {new Date(feature.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {feature.createdBy?.name || "Unknown"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Select
                    value={editedFeature?.status || ""}
                    onValueChange={(value) => setEditedFeature(prev => prev ? { ...prev, status: value } : null)}
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
                  <Button size="sm" onClick={handleSave} disabled={updateFeature.isPending}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(feature.status)}>
                    {feature.status}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
            <TabsTrigger value="comments">Comments ({feature.comments?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              {/* Category and Linked Idea */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  {isEditing ? (
                    <Input
                      value={editedFeature?.category || ""}
                      onChange={(e) => setEditedFeature(prev => prev ? { ...prev, category: e.target.value } : null)}
                      placeholder="Feature category"
                    />
                  ) : (
                    <div className="text-sm">{feature.category || "No category"}</div>
                  )}
                </div>
                {feature.linkedIdea && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Linked Idea</label>
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4" />
                      {feature.linkedIdea.title}
                    </div>
                  </div>
                )}
              </div>

              {/* Problem Statement */}
              <div>
                <label className="text-sm font-medium mb-2 block">Problem Statement</label>
                {isEditing ? (
                  <Textarea
                    value={editedFeature?.problemStatement || ""}
                    onChange={(e) => setEditedFeature(prev => prev ? { ...prev, problemStatement: e.target.value } : null)}
                    placeholder="Describe the problem this feature solves"
                    rows={3}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {feature.problemStatement || "No problem statement provided"}
                  </div>
                )}
              </div>

              {/* Solution Overview */}
              <div>
                <label className="text-sm font-medium mb-2 block">Solution Overview</label>
                {isEditing ? (
                  <Textarea
                    value={editedFeature?.solutionOverview || ""}
                    onChange={(e) => setEditedFeature(prev => prev ? { ...prev, solutionOverview: e.target.value } : null)}
                    placeholder="Describe the proposed solution"
                    rows={3}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {feature.solutionOverview || "No solution overview provided"}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4">
              {/* User Stories */}
              <div>
                <label className="text-sm font-medium mb-2 block">User Stories</label>
                {isEditing ? (
                  <Textarea
                    value={editedFeature?.userStories || ""}
                    onChange={(e) => setEditedFeature(prev => prev ? { ...prev, userStories: e.target.value } : null)}
                    placeholder="User stories and requirements"
                    rows={4}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {feature.userStories || "No user stories provided"}
                  </div>
                )}
              </div>

              {/* Technical Considerations */}
              <div>
                <label className="text-sm font-medium mb-2 block">Technical Considerations</label>
                {isEditing ? (
                  <Textarea
                    value={editedFeature?.technicalConsiderations || ""}
                    onChange={(e) => setEditedFeature(prev => prev ? { ...prev, technicalConsiderations: e.target.value } : null)}
                    placeholder="Technical implementation details"
                    rows={4}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {feature.technicalConsiderations || "No technical considerations provided"}
                  </div>
                )}
              </div>

              {/* Design Links */}
              <div>
                <label className="text-sm font-medium mb-2 block">Design Links</label>
                {isEditing ? (
                  <Textarea
                    value={editedFeature?.designLinks || ""}
                    onChange={(e) => setEditedFeature(prev => prev ? { ...prev, designLinks: e.target.value } : null)}
                    placeholder="Design mockups and documentation links"
                    rows={2}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {feature.designLinks || "No design links provided"}
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              <div>
                <label className="text-sm font-medium mb-2 block">Key Metrics</label>
                {isEditing ? (
                  <Textarea
                    value={editedFeature?.keyMetrics || ""}
                    onChange={(e) => setEditedFeature(prev => prev ? { ...prev, keyMetrics: e.target.value } : null)}
                    placeholder="Success metrics and KPIs"
                    rows={3}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {feature.keyMetrics || "No key metrics provided"}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="versions" className="space-y-4">
            <div className="space-y-3">
              {versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No version history available
                </div>
              ) : (
                versions.map((version) => (
                  <div key={version.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <span className="font-medium">v{version.version}</span>
                        <Badge variant="outline">{version.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{version.changedBy?.name || "Unknown"}</span>
                      {version.changeNotes && (
                        <>
                          <span className="mx-2">•</span>
                          {version.changeNotes}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {/* Add Comment */}
            <div className="space-y-3 border rounded-lg p-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim() || createComment.isPending}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Add Comment
                </Button>
              </div>
            </div>

            <Separator />

            {/* Comments List */}
            <div className="space-y-4">
              {feature.comments && feature.comments.length > 0 ? (
                feature.comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{comment.user?.name || "Unknown"}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No comments yet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}