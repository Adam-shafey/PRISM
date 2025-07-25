import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Map, 
  Book, 
  List, 
  Calendar, 
  Target,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

export default function PlanningDashboard() {
  const modules = [
    {
      title: "Roadmap",
      description: "Plan and track feature delivery across quarters and releases",
      icon: Map,
      href: "/planning/roadmap",
      color: "bg-blue-500",
      stats: "5 active items"
    },
    {
      title: "Stories",
      description: "Define and track user requirements and acceptance criteria",
      icon: Book,
      href: "/planning/stories",
      color: "bg-green-500",
      stats: "12 active stories"
    },
    {
      title: "Tasks",
      description: "Break down stories into actionable development tasks",
      icon: List,
      href: "/planning/tasks",
      color: "bg-purple-500",
      stats: "24 open tasks"
    },
    {
      title: "Sprints",
      description: "Organize work into time-boxed development cycles",
      icon: Calendar,
      href: "/planning/sprints",
      color: "bg-orange-500",
      stats: "Sprint 23 active"
    },
    {
      title: "Releases",
      description: "Plan and track product releases and deployments",
      icon: Target,
      href: "/planning/releases",
      color: "bg-red-500",
      stats: "3 upcoming"
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">PRISM Product Planning</h1>
            <p className="text-muted-foreground text-lg">
              Plan, track, and deliver product features and roadmaps
            </p>
          </div>

          {/* Planning Modules */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.href} href={module.href}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${module.color} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {module.description}
                      </p>
                      <div className="text-sm font-medium text-primary">
                        {module.stats}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex gap-4">
              <Button size="lg">
                <Map className="h-4 w-4 mr-2" />
                Create Roadmap Item
              </Button>
              <Button variant="outline" size="lg">
                <Book className="h-4 w-4 mr-2" />
                Write User Story
              </Button>
              <Button variant="outline" size="lg">
                <Calendar className="h-4 w-4 mr-2" />
                Plan Sprint
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}