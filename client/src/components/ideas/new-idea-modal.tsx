import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { insertIdeaSchema } from "@shared/schema";
import { useCreateIdea, useCategories, useUsers, useAISuggestions } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertIdeaSchema.extend({
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewIdeaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewIdeaModal({ open, onOpenChange }: NewIdeaModalProps) {
  const { toast } = useToast();
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const { data: categories = [] } = useCategories();
  const { data: users = [] } = useUsers();
  
  const createIdeaMutation = useCreateIdea();
  const aiMutation = useAISuggestions();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "New",
      tags: "",
    },
  });



  const onSubmit = (data: FormData) => {
    const { tags, ...ideaData } = data;
    const processedData = {
      ...ideaData,
      tags: tags ? tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      categoryId: data.categoryId ? parseInt(data.categoryId.toString()) : undefined,
      ownerId: data.ownerId ? parseInt(data.ownerId.toString()) : undefined,
    };

    createIdeaMutation.mutate(processedData, {
      onSuccess: () => {
        toast({ title: "Success", description: "Idea created successfully!" });
        onOpenChange(false);
        form.reset();
        setAiSuggestions(null);
      },
      onError: () => {
        toast({ 
          title: "Error", 
          description: "Failed to create idea. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const generateAISuggestions = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    
    if (!title || !description) {
      toast({
        title: "Error",
        description: "Please enter a title and description first.",
        variant: "destructive",
      });
      return;
    }

    setLoadingAI(true);
    try {
      const response = await aiMutation.mutateAsync({ title, description });
      setAiSuggestions(response);
      
      // Auto-apply suggestions
      if (response.tags.length > 0) {
        form.setValue("tags", response.tags.join(", "));
      }
      
      const suggestedCategory = categories.find((cat) => cat.name === response.category);
      if (suggestedCategory) {
        form.setValue("categoryId", suggestedCategory.id);
      }

      toast({
        title: "AI Suggestions Generated",
        description: "Review and modify the suggestions as needed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions.",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Idea</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter idea title..."
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe the problem, solution idea, and initial hypothesis..."
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={generateAISuggestions}
              disabled={loadingAI}
              className="w-full"
            >
              {loadingAI ? "Generating..." : "Generate AI Suggestions"}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={form.watch("categoryId")?.toString()}
                onValueChange={(value) => form.setValue("categoryId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="ownerId">Owner</Label>
              <Select
                value={form.watch("ownerId")?.toString()}
                onValueChange={(value) => form.setValue("ownerId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Enter tags separated by commas..."
              {...form.register("tags")}
            />
            <p className="text-xs text-muted-foreground mt-1">
              AI will suggest relevant tags based on your description
            </p>
          </div>

          {aiSuggestions && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">AI Suggestions Applied:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Category:</strong> {aiSuggestions.category}</p>
                <p><strong>Tags:</strong> {aiSuggestions.tags.join(", ")}</p>
                <p><strong>Suggested Scores:</strong> Impact: {aiSuggestions.scores.impact}, Effort: {aiSuggestions.scores.effort}, Confidence: {aiSuggestions.scores.confidence}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createIdeaMutation.isPending}>
              {createIdeaMutation.isPending ? "Creating..." : "Create Idea"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
