import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Axis3d } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi, usersApi } from "@/lib/api";
import type { IdeaFilters } from "@/types";

interface FilterBarProps {
  filters: IdeaFilters;
  onFiltersChange: (filters: IdeaFilters) => void;
  view: "grid" | "list" | "matrix";
  onViewChange: (view: "grid" | "list" | "matrix") => void;
}

export function FilterBar({ filters, onFiltersChange, view, onViewChange }: FilterBarProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const updateFilter = (key: keyof IdeaFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Status:</label>
          <Select 
            value={filters.status || "all"} 
            onValueChange={(value) => updateFilter("status", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="In Discovery">In Discovery</SelectItem>
              <SelectItem value="Validated">Validated</SelectItem>
              <SelectItem value="Prioritized">Prioritized</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Category:</label>
          <Select 
            value={filters.categoryId?.toString() || "all"} 
            onValueChange={(value) => updateFilter("categoryId", value === "all" ? undefined : parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Owner:</label>
          <Select 
            value={filters.ownerId?.toString() || "all"} 
            onValueChange={(value) => updateFilter("ownerId", value === "all" ? undefined : parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant={view === "grid" ? "default" : "ghost"} 
          size="icon"
          onClick={() => onViewChange("grid")}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button 
          variant={view === "list" ? "default" : "ghost"} 
          size="icon"
          onClick={() => onViewChange("list")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          variant={view === "matrix" ? "default" : "ghost"} 
          size="icon"
          onClick={() => onViewChange("matrix")}
        >
          <Axis3d className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
