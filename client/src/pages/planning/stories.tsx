import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Plus } from "lucide-react";

export default function PlanningStories() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Book className="h-8 w-8 text-green-500" />
                Stories
              </h1>
              <p className="text-muted-foreground text-lg">
                Define and track user requirements and acceptance criteria
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Story
            </Button>
          </div>

          {/* Coming Soon */}
          <Card>
            <CardHeader>
              <CardTitle>Stories Module - Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The stories module will help you define and track user requirements and acceptance criteria.
                Features will include story templates, acceptance criteria tracking, and story point estimation.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}