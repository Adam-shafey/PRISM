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
                  <div className="bg-card rounded-lg border">
                    <div className="overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr className="border-b">
                            <th className="text-left p-4 font-medium">Role</th>
                            <th className="text-left p-4 font-medium">Description</th>
                            <th className="text-left p-4 font-medium">Permissions</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {systemRoles.map((role, index) => (
                            <tr key={role.id} className={`border-b last:border-b-0 hover:bg-muted/20 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Crown className="h-4 w-4 text-yellow-600" />
                                  <span className="font-medium">{role.name}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="text-muted-foreground">{role.description}</span>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {role.permissions.slice(0, 3).map((permission: string) => (
                                    <Badge key={permission} variant="outline" className="text-xs">
                                      {permission.split(':')[0]}
                                    </Badge>
                                  ))}
                                  {role.permissions.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{role.permissions.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                    <div className="bg-card rounded-lg border">
                      <div className="overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr className="border-b">
                              <th className="text-left p-4 font-medium">Role</th>
                              <th className="text-left p-4 font-medium">Description</th>
                              <th className="text-left p-4 font-medium">Permissions</th>
                              <th className="text-right p-4 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customRoles.map((role, index) => (
                              <tr key={role.id} className={`border-b last:border-b-0 hover:bg-muted/20 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium">{role.name}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="text-muted-foreground">{role.description}</span>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {role.permissions.slice(0, 3).map((permission: string) => (
                                      <Badge key={permission} variant="outline" className="text-xs">
                                        {permission.split(':')[0]}
                                      </Badge>
                                    ))}
                                    {role.permissions.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{role.permissions.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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