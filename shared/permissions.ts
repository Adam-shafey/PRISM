// Permission constants for role-based access control
export const PERMISSIONS = {
  // Team Management
  TEAM_MANAGE: "team:manage",
  TEAM_VIEW: "team:view",
  
  // Ideas & Problems Module
  IDEAS_VIEW: "ideas:view",
  IDEAS_CREATE: "ideas:create", 
  IDEAS_EDIT: "ideas:edit",
  IDEAS_DELETE: "ideas:delete",
  
  // Insights Module
  INSIGHTS_VIEW: "insights:view",
  INSIGHTS_ADD: "insights:add",
  INSIGHTS_EDIT: "insights:edit", 
  INSIGHTS_DELETE: "insights:delete",
  INSIGHTS_VIEW_AI_SUMMARIES: "insights:view_ai_summaries",
  
  // Validation Module
  VALIDATION_VIEW: "validation:view",
  VALIDATION_DEFINE_HYPOTHESES: "validation:define_hypotheses",
  VALIDATION_RECORD_RESULTS: "validation:record_results",
  VALIDATION_UPDATE_STATUS: "validation:update_status",
  
  // Prioritization Module
  PRIORITIZATION_VIEW: "prioritization:view",
  PRIORITIZATION_ASSIGN_SCORES: "prioritization:assign_scores",
  PRIORITIZATION_VIEW_AI_SCORES: "prioritization:view_ai_scores",
  PRIORITIZATION_MARK_PLANNING: "prioritization:mark_planning",
  
  // AI Configuration
  AI_CONFIG: "ai:config",
} as const;

// Pre-defined roles with their permissions
export const SYSTEM_ROLES = {
  ADMINISTRATOR: {
    name: "Administrator",
    description: "Full system access with all permissions",
    permissions: Object.values(PERMISSIONS),
  },
  PRODUCT_MANAGER: {
    name: "Product Manager", 
    description: "Can manage ideas, validation, and prioritization",
    permissions: [
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.IDEAS_VIEW,
      PERMISSIONS.IDEAS_CREATE,
      PERMISSIONS.IDEAS_EDIT,
      PERMISSIONS.INSIGHTS_VIEW,
      PERMISSIONS.INSIGHTS_ADD,
      PERMISSIONS.INSIGHTS_EDIT,
      PERMISSIONS.INSIGHTS_VIEW_AI_SUMMARIES,
      PERMISSIONS.VALIDATION_VIEW,
      PERMISSIONS.VALIDATION_DEFINE_HYPOTHESES,
      PERMISSIONS.VALIDATION_RECORD_RESULTS,
      PERMISSIONS.VALIDATION_UPDATE_STATUS,
      PERMISSIONS.PRIORITIZATION_VIEW,
      PERMISSIONS.PRIORITIZATION_ASSIGN_SCORES,
      PERMISSIONS.PRIORITIZATION_VIEW_AI_SCORES,
      PERMISSIONS.PRIORITIZATION_MARK_PLANNING,
    ],
  },
  CONTRIBUTOR: {
    name: "Contributor",
    description: "Can contribute ideas and validation data",
    permissions: [
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.IDEAS_VIEW,
      PERMISSIONS.IDEAS_CREATE,
      PERMISSIONS.IDEAS_EDIT,
      PERMISSIONS.INSIGHTS_VIEW,
      PERMISSIONS.INSIGHTS_ADD,
      PERMISSIONS.INSIGHTS_EDIT,
      PERMISSIONS.INSIGHTS_VIEW_AI_SUMMARIES,
      PERMISSIONS.VALIDATION_VIEW,
      PERMISSIONS.VALIDATION_RECORD_RESULTS,
      PERMISSIONS.PRIORITIZATION_VIEW,
      PERMISSIONS.PRIORITIZATION_VIEW_AI_SCORES,
    ],
  },
  VIEWER: {
    name: "Viewer", 
    description: "Read-only access to all modules",
    permissions: [
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.IDEAS_VIEW,
      PERMISSIONS.INSIGHTS_VIEW,
      PERMISSIONS.VALIDATION_VIEW,
      PERMISSIONS.PRIORITIZATION_VIEW,
    ],
  },
} as const;

// Permission utilities
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

// Get user's effective permissions from their team memberships
export function getUserEffectivePermissions(teamMemberships: Array<{ role: { permissions: string[] } }>): string[] {
  const allPermissions = new Set<string>();
  
  teamMemberships.forEach(membership => {
    membership.role.permissions.forEach(permission => {
      allPermissions.add(permission);
    });
  });
  
  return Array.from(allPermissions);
}