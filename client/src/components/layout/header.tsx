import { Search, Bell, Plus, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { ideasApi } from "@/lib/api";
import { useState } from "react";

interface HeaderProps {
  onNewIdea: () => void;
}

export function Header({ onNewIdea }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: ideas = [] } = useQuery({
    queryKey: ["/api/ideas"],
  });

  const activeCount = ideas.filter((idea: any) => 
    idea.status === "New" || idea.status === "In Discovery"
  ).length;

  const validatedCount = ideas.filter((idea: any) => 
    idea.status === "Validated"
  ).length;

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Ideas & Problems</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {activeCount} Active
            </Badge>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              {validatedCount} Validated
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Search ideas..." 
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
          
          {/* New Idea Button */}
          <Button onClick={onNewIdea} className="gap-2">
            <Plus className="h-4 w-4" />
            New Idea
          </Button>
        </div>
      </div>
    </header>
  );
}
