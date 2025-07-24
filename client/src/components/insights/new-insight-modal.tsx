import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Globe, MessageSquare, Upload, Link as LinkIcon, BarChart3 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Idea, Category, User } from "@shared/schema";

const insightSchema = z.object({
  type: z.enum(["file", "url", "note"]),
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  fileUrl: z.string().optional(),
  summary: z.string().optional(),
});

type InsightFormData = z.infer<typeof insightSchema>;

interface NewInsightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideas: (Idea & { category?: Category; owner?: User })[];
  selectedIdeaId: number | null;
  onIdeaSelect: (ideaId: number) => void;
  onSubmit: (data: InsightFormData & { ideaId: number }) => Promise<void>;
  isSubmitting: boolean;
}

export function NewInsightModal({
  open,
  onOpenChange,
  ideas,
  selectedIdeaId,
  onIdeaSelect,
  onSubmit,
  isSubmitting
}: NewInsightModalProps) {
  const [activeTab, setActiveTab] = useState("file");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generateSummary, setGenerateSummary] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    clearErrors
  } = useForm<InsightFormData>({
    resolver: zodResolver(insightSchema),
    defaultValues: {
      type: "file",
      title: "",
      content: "",
      url: "",
      fileUrl: "",
      summary: ""
    }
  });

  const watchedType = watch("type");
  const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);

  useEffect(() => {
    if (!open) {
      reset();
      setUploadedFile(null);
      setGenerateSummary(false);
    }
  }, [open, reset]);

  useEffect(() => {
    setValue("type", activeTab as "file" | "url" | "note");
    clearErrors();
  }, [activeTab, setValue, clearErrors]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setValue("title", file.name);
      // In a real implementation, you would upload the file to a storage service
      // and set the fileUrl to the uploaded file's URL
      setValue("fileUrl", `uploads/${file.name}`);
    }
  };

  const handleUrlAnalysis = async () => {
    const url = watch("url");
    if (url) {
      // In a real implementation, you would fetch the URL content
      // and extract the title and possibly generate a summary
      try {
        // Mock URL analysis
        const domain = new URL(url).hostname;
        setValue("title", `Resource from ${domain}`);
        if (generateSummary) {
          setValue("summary", "AI-generated summary would be created from the URL content...");
        }
      } catch (error) {
        console.error("Invalid URL:", error);
      }
    }
  };

  const handleFormSubmit = async (data: InsightFormData) => {
    if (!selectedIdeaId) return;
    
    let finalData = { ...data };
    
    // Generate AI summary if requested
    if (generateSummary && data.content && !data.summary) {
      // In a real implementation, this would call an AI service
      finalData.summary = "AI-generated summary: " + data.content.substring(0, 100) + "...";
    }
    
    await onSubmit({
      ...finalData,
      ideaId: selectedIdeaId
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Add New Insight
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Idea Selection */}
          <div className="space-y-3">
            <Label>Link to Idea</Label>
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
                  <SelectValue placeholder="Choose an idea to link this insight to..." />
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

          {/* Insight Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                URL/Link
              </TabsTrigger>
              <TabsTrigger value="note" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Note
              </TabsTrigger>
            </TabsList>

            {/* File Upload Tab */}
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="file-upload">Upload File</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm font-medium">Click to upload</span>
                    <span className="text-sm text-muted-foreground block">
                      or drag and drop files here
                    </span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.csv,.xlsx"
                  />
                </div>
                {uploadedFile && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                  </div>
                )}
              </div>
            </TabsContent>

            {/* URL Tab */}
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    {...register("url")}
                    placeholder="https://example.com/research-article"
                    className={errors.url ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUrlAnalysis}
                    disabled={!watch("url")}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </div>
                {errors.url && (
                  <p className="text-sm text-destructive">{errors.url.message}</p>
                )}
              </div>
            </TabsContent>

            {/* Note Tab */}
            <TabsContent value="note" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a text-based insight with your research findings, observations, or analysis.
              </p>
            </TabsContent>
          </Tabs>

          {/* Common Fields */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Give your insight a descriptive title..."
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Description/Notes</Label>
              <Textarea
                id="content"
                {...register("content")}
                placeholder="Add your analysis, key findings, or notes about this insight..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Provide context, key takeaways, or analysis related to this insight.
              </p>
            </div>

            {/* AI Summary Option */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="generate-summary"
                checked={generateSummary}
                onChange={(e) => setGenerateSummary(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="generate-summary" className="flex items-center gap-2 cursor-pointer">
                <BarChart3 className="h-4 w-4" />
                Generate AI summary
              </Label>
            </div>

            {/* Manual Summary */}
            {!generateSummary && (
              <div className="space-y-2">
                <Label htmlFor="summary">Summary (Optional)</Label>
                <Textarea
                  id="summary"
                  {...register("summary")}
                  placeholder="Provide a concise summary of the key insights..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedIdeaId}>
              {isSubmitting ? "Adding..." : "Add Insight"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}