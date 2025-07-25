import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Settings, 
  UserPlus, 
  Shield,
  Crown,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useTeams, useRoles, useUsers } from "@/lib/api";
import { TeamCard } from "@/components/teams/team-card";
import { RoleCard } from "@/components/teams/role-card";
import { NewTeamModal } from "@/components/teams/new-team-modal";
import { NewRoleModal } from "@/components/teams/new-role-modal";
import { ManageMembersModal } from "@/components/teams/manage-members-modal";
import type { Team, Role, User } from "@shared/schema";

export default function Teams() {
  const [activeTab, setActiveTab] = useState("teams");
  const [isNewTeamOpen, setIsNewTeamOpen] = useState(false);
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false);
  const [managingTeamId, setManagingTeamId] = useState<number | null>(null);

  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const isLoading = teamsLoading || rolesLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading teams...</p>
          </div>
        </div>
      </div>
    );
  }

  const systemRoles = roles.filter(role => role.isSystemRole);
  const customRoles = roles.filter(role => !role.isSystemRole);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </h2>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {teams.length} Teams
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsNewRoleOpen(true)} variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                New Role
              </Button>
              <Button onClick={() => setIsNewTeamOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Team
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-border">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="teams" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Teams
                </TabsTrigger>
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Roles & Permissions
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 p-6">
              <TabsContent value="teams" className="space-y-6 mt-0">
                {teams.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Teams Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first team to start organizing users and managing permissions.
                    </p>
                    <Button onClick={() => setIsNewTeamOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Team
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        onManageMembers={(teamId) => setManagingTeamId(teamId)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="roles" className="space-y-6 mt-0">
                {/* System Roles */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-lg font-medium">System Roles</h3>
                    <Badge variant="outline">Pre-defined</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {systemRoles.map((role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        isSystem={true}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Roles */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-medium">Custom Roles</h3>
                    </div>
                    <Button onClick={() => setIsNewRoleOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Role
                    </Button>
                  </div>
                  
                  {customRoles.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="text-center py-8">
                        <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          No custom roles created yet. Create custom roles to fit your organization's needs.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {customRoles.map((role) => (
                        <RoleCard
                          key={role.id}
                          role={role}
                          isSystem={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>

      {/* Modals */}
      <NewTeamModal
        open={isNewTeamOpen}
        onOpenChange={setIsNewTeamOpen}
      />

      <NewRoleModal
        open={isNewRoleOpen}
        onOpenChange={setIsNewRoleOpen}
      />

      {managingTeamId && (
        <ManageMembersModal
          teamId={managingTeamId}
          open={!!managingTeamId}
          onOpenChange={() => setManagingTeamId(null)}
          users={users}
          roles={roles}
        />
      )}
    </div>
  );
}