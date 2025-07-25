import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Map, 
  Plus, 
  Search, 
  Calendar,
  Target,
  Zap,
  Clock,
  Users
} from "lucide-react";

export default function Roadmap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("quarters");

  // Mock roadmap data
  const roadmapItems = [
    {
      id: 1,
      title: "User Authentication System",
      description: "Complete overhaul of authentication with SSO integration",
      status: "In Progress",
      priority: "High",
      startDate: "2024-01-15",
      endDate: "2024-03-15",
      quarter: "Q1",
      assignedTeam: "Platform Team",
      progress: 65
    },
    {
      id: 2,
      title: "Mobile App Launch",
      description: "Native mobile applications for iOS and Android",
      status: "Planning",
      priority: "High",
      startDate: "2024-02-01",
      endDate: "2024-06-30",
      quarter: "Q2",
      assignedTeam: "Mobile Team",
      progress: 25
    },
    {
      id: 3,
      title: "Advanced Analytics Dashboard",
      description: "Real-time analytics and reporting capabilities",
      status: "Backlog",
      priority: "Medium",
      startDate: "2024-04-01",
      endDate: "2024-07-31",
      quarter: "Q2",
      assignedTeam: "Data Team",
      progress: 10
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'in progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'backlog': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': return <Zap className="h-4 w-4 text-red-500" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Clock className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredItems = roadmapItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Map className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Product Roadmap</h1>
                <p className="text-muted-foreground">
                  Plan and track feature delivery across quarters and releases
                </p>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Roadmap Item
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search roadmap items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Roadmap Views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="quarters">Quarterly View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              <TabsTrigger value="status">By Status</TabsTrigger>
            </TabsList>

            <TabsContent value="quarters">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {['Q1', 'Q2', 'Q3'].map(quarter => (
                  <Card key={quarter}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {quarter} 2024
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {filteredItems
                        .filter(item => item.quarter === quarter)
                        .map(item => (
                          <div key={item.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium line-clamp-1">{item.title}</h3>
                              {getPriorityIcon(item.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {item.assignedTeam}
                              </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{item.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="space-y-4">
                {filteredItems.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium">{item.title}</h3>
                            {getPriorityIcon(item.priority)}
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{item.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {item.startDate} - {item.endDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {item.assignedTeam}
                            </div>
                          </div>
                        </div>
                        <div className="w-32">
                          <div className="text-right text-sm mb-1">{item.progress}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="status">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {['In Progress', 'Planning', 'Backlog', 'Completed'].map(status => (
                  <Card key={status}>
                    <CardHeader>
                      <CardTitle className="text-base">{status}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {filteredItems
                        .filter(item => item.status === status)
                        .map(item => (
                          <div key={item.id} className="p-3 border rounded hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                              {getPriorityIcon(item.priority)}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              {item.assignedTeam} • {item.progress}%
                            </div>
                          </div>
                        ))}
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