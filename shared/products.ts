// Product permissions for PRISM suite
export const DISCOVERY_PERMISSIONS = {
  IDEAS_VIEW: 'ideas:view',
  IDEAS_CREATE: 'ideas:create', 
  IDEAS_EDIT: 'ideas:edit',
  IDEAS_DELETE: 'ideas:delete',
  INSIGHTS_VIEW: 'insights:view',
  INSIGHTS_CREATE: 'insights:create',
  INSIGHTS_EDIT: 'insights:edit',
  INSIGHTS_DELETE: 'insights:delete',
  FEATURES_VIEW: 'features:view',
  FEATURES_CREATE: 'features:create',
  FEATURES_EDIT: 'features:edit',
  FEATURES_DELETE: 'features:delete',
  TEAMS_MANAGE: 'teams:manage',
  VALIDATION_VIEW: 'validation:view',
  VALIDATION_CREATE: 'validation:create',
  PRIORITIZATION_VIEW: 'prioritization:view',
  PRIORITIZATION_EDIT: 'prioritization:edit',
} as const;

export const PLANNING_PERMISSIONS = {
  ROADMAP_VIEW: 'roadmap:view',
  ROADMAP_CREATE: 'roadmap:create',
  ROADMAP_EDIT: 'roadmap:edit',
  ROADMAP_DELETE: 'roadmap:delete',
  STORIES_VIEW: 'stories:view',
  STORIES_CREATE: 'stories:create',
  STORIES_EDIT: 'stories:edit',
  STORIES_DELETE: 'stories:delete',
  TASKS_VIEW: 'tasks:view',
  TASKS_CREATE: 'tasks:create',
  TASKS_EDIT: 'tasks:edit',
  TASKS_DELETE: 'tasks:delete',
  SPRINTS_VIEW: 'sprints:view',
  SPRINTS_CREATE: 'sprints:create',
  SPRINTS_EDIT: 'sprints:edit',
  TEAMS_MANAGE: 'teams:manage',
  RELEASES_VIEW: 'releases:view',
  RELEASES_CREATE: 'releases:create',
} as const;

export const PRODUCTS = {
  DISCOVERY: 'discovery',
  PLANNING: 'planning',
} as const;

export type Product = typeof PRODUCTS[keyof typeof PRODUCTS];
export type DiscoveryPermission = typeof DISCOVERY_PERMISSIONS[keyof typeof DISCOVERY_PERMISSIONS];
export type PlanningPermission = typeof PLANNING_PERMISSIONS[keyof typeof PLANNING_PERMISSIONS];

// Product configurations
export const PRODUCT_CONFIG = {
  [PRODUCTS.DISCOVERY]: {
    name: 'PRISM Product Discovery',
    shortName: 'Discovery',
    description: 'Capture, validate, and analyze product ideas and insights',
    basePath: '/',
    permissions: DISCOVERY_PERMISSIONS,
  },
  [PRODUCTS.PLANNING]: {
    name: 'PRISM Product Planning',
    shortName: 'Planning', 
    description: 'Plan, track, and deliver product features and roadmaps',
    basePath: '/planning',
    permissions: PLANNING_PERMISSIONS,
  },
} as const;