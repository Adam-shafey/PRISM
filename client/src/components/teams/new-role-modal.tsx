import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateRole } from "@/lib/api";
import { PERMISSIONS } from "@shared/permissions";
import type { InsertRole } from "@shared/schema";

interface NewRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewRoleModal({ open, onOpenChange }: NewRoleModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { toast } = useToast();
  
  const createRoleMutation = useCreateRole();

  // Group permissions by module
  const permissionGroups = {
    "Team Management": Object.entries(PERMISSIONS).filter(([key]) => key.startsWith('TEAM_')),
    "Ideas & Problems": Object.entries(PERMISSIONS).filter(([key]) => key.startsWith('IDEAS_')),
    "Insights": Object.entries(PERMISSIONS).filter(([key]) => key.startsWith('INSIGHTS_')),
    "Validation": Object.entries(PERMISSIONS).filter(([key]) => key.startsWith('VALIDATION_')),
    "Prioritization": Object.entries(PERMISSIONS).filter(([key]) => key.startsWith('PRIORITIZATION_')),
    "AI Configuration": Object.entries(PERMISSIONS).filter(([key]) => key.startsWith('AI_')),
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    if (selectedPermissions.length === 0) {
      toast({
        title: "Error", 
        description: "At least one permission is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const roleData: InsertRole = {
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: selectedPermissions,
        isSystemRole: false,
      };

      await createRoleMutation.mutateAsync(roleData);
      
      toast({
        title: "Success",
        description: "Custom role created successfully",
      });
      
      setName("");
      setDescription("");
      setSelectedPermissions([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Role</DialogTitle>
          <DialogDescription>
            Create a custom role with specific permissions for your organization.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter role name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role-description">Description (Optional)</Label>
            <Textarea
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role's purpose and responsibilities"
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <Label>Permissions</Label>
            {Object.entries(permissionGroups).map(([groupName, permissions]) => (
              <div key={groupName} className="space-y-3">
                <h4 className="font-medium text-sm">{groupName}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                  {permissions.map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={selectedPermissions.includes(value)}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={key} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {value.replace(/^[^:]+:/, '').replace(/_/g, ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRoleMutation.isPending}>
              {createRoleMutation.isPending ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}