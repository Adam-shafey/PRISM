import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Plus } from "lucide-react";

export default function PlanningRoadmap() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Map className="h-8 w-8 text-blue-500" />
                Roadmap
              </h1>
              <p className="text-muted-foreground text-lg">
                Plan and track feature delivery across quarters and releases
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Roadmap Item
            </Button>
          </div>

          {/* Coming Soon */}
          <Card>
            <CardHeader>
              <CardTitle>Roadmap Module - Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The roadmap module will help you plan and track feature delivery across quarters and releases.
                Features will include timeline views, milestone tracking, and dependency management.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}