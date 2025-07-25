import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Crown, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  MoreVertical
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Role } from "@shared/schema";

interface RoleCardProps {
  role: Role;
  isSystem: boolean;
}

export function RoleCard({ role, isSystem }: RoleCardProps) {
  const permissionCount = role.permissions?.length || 0;

  const getRoleIcon = () => {
    if (isSystem) {
      switch (role.name) {
        case "Administrator":
          return <Crown className="h-4 w-4 text-yellow-600" />;
        case "Product Manager":
          return <Shield className="h-4 w-4 text-blue-600" />;
        case "Contributor":
          return <Edit className="h-4 w-4 text-green-600" />;
        case "Viewer":
          return <Eye className="h-4 w-4 text-gray-600" />;
        default:
          return <Shield className="h-4 w-4" />;
      }
    }
    return <Shield className="h-4 w-4 text-purple-600" />;
  };

  const getRoleColor = () => {
    if (isSystem) {
      switch (role.name) {
        case "Administrator":
          return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
        case "Product Manager":
          return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
        case "Contributor":
          return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
        case "Viewer":
          return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
        default:
          return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
      }
    }
    return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getRoleIcon()}
            <div>
              <CardTitle className="text-lg">{role.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getRoleColor()}>
                  {isSystem ? "System" : "Custom"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {permissionCount} permissions
                </Badge>
              </div>
            </div>
          </div>
          
          {!isSystem && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Role
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Role
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {role.description && (
          <p className="text-sm text-muted-foreground">{role.description}</p>
        )}
        
        {/* Key Permissions Preview */}
        {role.permissions && role.permissions.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-2">Key Permissions</div>
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 3).map((permission) => (
                <Badge key={permission} variant="secondary" className="text-xs">
                  {permission.replace(/^[^:]+:/, '').replace(/_/g, ' ')}
                </Badge>
              ))}
              {role.permissions.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{role.permissions.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Usage Count (placeholder for now) */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Used by 0 members
          </div>
          <span>
            Created {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}