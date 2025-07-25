import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Book, 
  Plus, 
  Search, 
  User,
  Flag,
  Clock,
  CheckCircle
} from "lucide-react";

export default function Stories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("backlog");

  // Mock story data
  const stories = [
    {
      id: 1,
      title: "As a user, I want to reset my password via email",
      description: "Users should be able to request password reset links through email for account recovery",
      status: "In Progress",
      priority: "High",
      storyPoints: 5,
      assignee: "Alice Johnson",
      epic: "User Authentication",
      sprint: "Sprint 23",
      acceptanceCriteria: [
        "User can enter email on reset form",
        "Reset link is sent to valid email addresses",
        "Link expires after 24 hours",
        "User can set new password using valid link"
      ]
    },
    {
      id: 2,
      title: "As a product manager, I want to view analytics dashboard",
      description: "Product managers need access to key metrics and KPIs in a centralized dashboard",
      status: "Backlog",
      priority: "Medium",
      storyPoints: 8,
      assignee: "Bob Smith",
      epic: "Analytics Platform",
      sprint: null,
      acceptanceCriteria: [
        "Dashboard shows user engagement metrics",
        "Data updates in real-time",
        "Filters available for date ranges",
        "Export functionality for reports"
      ]
    },
    {
      id: 3,
      title: "As a developer, I want API documentation auto-generated",
      description: "Automatically generate and maintain API documentation from code annotations",
      status: "Done",
      priority: "Low",
      storyPoints: 3,
      assignee: "Carol Wilson",
      epic: "Developer Experience",
      sprint: "Sprint 22",
      acceptanceCriteria: [
        "Docs generate from code comments",
        "Interactive API explorer included",
        "Version management for API changes",
        "Examples for all endpoints"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'in progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'backlog': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Book className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">User Stories</h1>
                <p className="text-muted-foreground">
                  Define and track user requirements and acceptance criteria
                </p>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Story
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Story Views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="backlog">Backlog</TabsTrigger>
              <TabsTrigger value="active">Active Sprint</TabsTrigger>
              <TabsTrigger value="done">Completed</TabsTrigger>
              <TabsTrigger value="all">All Stories</TabsTrigger>
            </TabsList>

            <TabsContent value="backlog">
              <div className="space-y-4">
                {filteredStories
                  .filter(story => story.status === "Backlog")
                  .map(story => (
                    <Card key={story.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium mb-2">{story.title}</h3>
                            <p className="text-muted-foreground mb-4">{story.description}</p>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <Badge className={getStatusColor(story.status)}>
                                {story.status}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Flag className={`h-4 w-4 ${getPriorityColor(story.priority)}`} />
                                <span className={getPriorityColor(story.priority)}>{story.priority}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{story.storyPoints}</span>
                                <span className="text-muted-foreground">points</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{story.assignee}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                          <ul className="space-y-1">
                            {story.acceptanceCriteria.map((criteria, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <span>{criteria}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="active">
              <div className="space-y-4">
                {filteredStories
                  .filter(story => story.status === "In Progress")
                  .map(story => (
                    <Card key={story.id} className="hover:shadow-md transition-shadow border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-medium">{story.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {story.sprint}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-4">{story.description}</p>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <Badge className={getStatusColor(story.status)}>
                                {story.status}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Flag className={`h-4 w-4 ${getPriorityColor(story.priority)}`} />
                                <span className={getPriorityColor(story.priority)}>{story.priority}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{story.storyPoints}</span>
                                <span className="text-muted-foreground">points</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{story.assignee}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                          <ul className="space-y-1">
                            {story.acceptanceCriteria.map((criteria, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{criteria}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="done">
              <div className="space-y-4">
                {filteredStories
                  .filter(story => story.status === "Done")
                  .map(story => (
                    <Card key={story.id} className="hover:shadow-md transition-shadow border-green-200 bg-green-50/50 dark:bg-green-950/20">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-medium">{story.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {story.sprint}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-4">{story.description}</p>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <Badge className={getStatusColor(story.status)}>
                                {story.status}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{story.storyPoints}</span>
                                <span className="text-muted-foreground">points</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{story.assignee}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="all">
              <div className="space-y-4">
                {filteredStories.map(story => (
                  <Card key={story.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-medium">{story.title}</h3>
                            {story.sprint && (
                              <Badge variant="outline" className="text-xs">
                                {story.sprint}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-4">{story.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <Badge className={getStatusColor(story.status)}>
                              {story.status}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Flag className={`h-4 w-4 ${getPriorityColor(story.priority)}`} />
                              <span className={getPriorityColor(story.priority)}>{story.priority}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{story.storyPoints}</span>
                              <span className="text-muted-foreground">points</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{story.assignee}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}