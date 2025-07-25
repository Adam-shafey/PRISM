import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Settings, 
  Calendar,
  MoreVertical
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Team, User, TeamMembership, Role } from "@shared/schema";

interface TeamCardProps {
  team: Team & { 
    createdBy?: User; 
    memberships?: (TeamMembership & { user?: User; role?: Role })[] 
  };
  onManageMembers: (teamId: number) => void;
}

export function TeamCard({ team, onManageMembers }: TeamCardProps) {
  const memberCount = team.memberships?.length || 0;
  const recentMembers = team.memberships?.slice(0, 3) || [];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{team.name}</CardTitle>
            {team.description && (
              <p className="text-sm text-muted-foreground">{team.description}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onManageMembers(team.id)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Manage Members
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Team Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Member Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{memberCount} Members</span>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onManageMembers(team.id)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Manage
          </Button>
        </div>

        {/* Recent Members */}
        {recentMembers.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-2">Recent Members</div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {recentMembers.map((membership) => (
                  <Avatar key={membership.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={membership.user?.avatar} />
                    <AvatarFallback className="text-xs">
                      {membership.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {memberCount > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{memberCount - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Team Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : 'Unknown'}
          </div>
          {team.createdBy && (
            <span>by {team.createdBy.name}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}