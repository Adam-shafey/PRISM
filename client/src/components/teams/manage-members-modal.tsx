import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTeam, useCreateTeamMembership, useRemoveTeamMembership } from "@/lib/api";
import { UserPlus, UserMinus, Crown, Shield, Edit, Eye } from "lucide-react";
import type { User, Role, TeamMembership } from "@shared/schema";

interface ManageMembersModalProps {
  teamId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  roles: Role[];
}

export function ManageMembersModal({ 
  teamId, 
  open, 
  onOpenChange, 
  users, 
  roles 
}: ManageMembersModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const { toast } = useToast();
  
  const { data: team } = useTeam(teamId);
  const createMembershipMutation = useCreateTeamMembership();
  const removeMembershipMutation = useRemoveTeamMembership();

  const currentMembers = team?.memberships || [];
  const memberUserIds = new Set(currentMembers.map((m: any) => m.userId));
  const availableUsers = users.filter(user => !memberUserIds.has(user.id));

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "Administrator":
        return <Crown className="h-3 w-3 text-yellow-600" />;
      case "Product Manager":
        return <Shield className="h-3 w-3 text-blue-600" />;
      case "Contributor":
        return <Edit className="h-3 w-3 text-green-600" />;
      case "Viewer":
        return <Eye className="h-3 w-3 text-gray-600" />;
      default:
        return <Shield className="h-3 w-3 text-purple-600" />;
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !selectedRoleId) {
      toast({
        title: "Error",
        description: "Please select both a user and role",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMembershipMutation.mutateAsync({
        teamId,
        userId: parseInt(selectedUserId),
        roleId: parseInt(selectedRoleId),
      });
      
      toast({
        title: "Success",
        description: "Member added to team successfully",
      });
      
      setSelectedUserId("");
      setSelectedRoleId("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member to team",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (membershipId: number) => {
    try {
      await removeMembershipMutation.mutateAsync(membershipId);
      
      toast({
        title: "Success",
        description: "Member removed from team",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member from team",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Team Members</DialogTitle>
          <DialogDescription>
            Add or remove members and manage their roles in {team?.name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add New Member */}
          <div className="space-y-4">
            <h4 className="font-medium">Add New Member</h4>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="user-select">Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {user.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label htmlFor="role-select">Select Role</Label>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role.name)}
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleAddMember}
                  disabled={!selectedUserId || !selectedRoleId || createMembershipMutation.isPending}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Current Members */}
          <div className="space-y-4">
            <h4 className="font-medium">Current Members ({currentMembers.length})</h4>
            {currentMembers.length === 0 ? (
              <p className="text-muted-foreground text-sm">No members in this team yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {currentMembers.map((membership: any) => (
                  <div key={membership.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={membership.user?.avatar} />
                        <AvatarFallback className="text-xs">
                          {membership.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{membership.user?.name}</div>
                        <div className="text-xs text-muted-foreground">{membership.user?.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {membership.role && getRoleIcon(membership.role.name)}
                        {membership.role?.name}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(membership.id)}
                        disabled={removeMembershipMutation.isPending}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}