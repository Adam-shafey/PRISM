import { pgTable, text, serial, integer, boolean, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("Product Manager"),
  avatar: text("avatar"),
  discoveryPermissions: text("discovery_permissions").array().default(sql`'{}'`), // Discovery product permissions
  planningPermissions: text("planning_permissions").array().default(sql`'{}'`), // Planning product permissions
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  description: text("description"),
});

export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("New"), // New, In Discovery, Validated, Rejected, Prioritized, In Planning
  categoryId: integer("category_id").references(() => categories.id),
  ownerId: integer("owner_id").references(() => users.id),
  tags: text("tags").array(),
  impactScore: integer("impact_score"),
  effortScore: integer("effort_score"),
  confidenceScore: integer("confidence_score"),
  riceScore: integer("rice_score"),
  reachEstimate: integer("reach_estimate"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const hypotheses = pgTable("hypotheses", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id),
  statement: text("statement").notNull(),
  assumptions: text("assumptions").array(),
  validationMetrics: text("validation_metrics").array(),
  experimentType: text("experiment_type"), // User Interview, Survey, Prototype Test, A/B Test, Data Analysis
  results: text("results"),
  status: text("status").notNull().default("Unvalidated"), // Unvalidated, Partially Validated, Validated, Invalidated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id),
  type: text("type").notNull(), // file, url, note
  title: text("title").notNull(),
  content: text("content"),
  url: text("url"),
  fileUrl: text("file_url"),
  summary: text("summary"), // AI-generated summary
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  mentions: integer("mentions").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // created, updated, commented, status_changed, etc.
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions").array().notNull().default(sql`'{}'`), // Array of permission strings
  isSystemRole: boolean("is_system_role").default(false), // Pre-defined roles
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Team memberships table
export const teamMemberships = pgTable("team_memberships", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: integer("role_id").notNull().references(() => roles.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  uniqueMembership: unique().on(table.teamId, table.userId),
}));

// Features and Modules
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull().default("feature"), // feature, module
  status: text("status").notNull().default("Draft"), // Draft, Active, Deprecated, Archived
  problemStatement: text("problem_statement"),
  solutionOverview: text("solution_overview"),
  userStories: text("user_stories"),
  technicalConsiderations: text("technical_considerations"),
  designLinks: text("design_links"),
  keyMetrics: text("key_metrics"),
  releaseNotes: text("release_notes"),
  learnings: text("learnings"),
  tags: text("tags").array().default(sql`'{}'`),
  category: text("category"),
  parentModuleId: integer("parent_module_id").references(() => features.id),
  linkedIdeaId: integer("linked_idea_id").references(() => ideas.id),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  version: integer("version").default(1).notNull(),
});

export const featureVersions = pgTable("feature_versions", {
  id: serial("id").primaryKey(),
  featureId: integer("feature_id").references(() => features.id, { onDelete: "cascade" }).notNull(),
  version: integer("version").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  problemStatement: text("problem_statement"),
  solutionOverview: text("solution_overview"),
  userStories: text("user_stories"),
  technicalConsiderations: text("technical_considerations"),
  designLinks: text("design_links"),
  keyMetrics: text("key_metrics"),
  releaseNotes: text("release_notes"),
  learnings: text("learnings"),
  tags: text("tags").array().default(sql`'{}'`),
  category: text("category"),
  changedBy: integer("changed_by").references(() => users.id).notNull(),
  changeNotes: text("change_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const featureComments = pgTable("feature_comments", {
  id: serial("id").primaryKey(),
  featureId: integer("feature_id").references(() => features.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  mentionedUsers: integer("mentioned_users").array().default(sql`'{}'`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertIdeaSchema = createInsertSchema(ideas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHypothesisSchema = createInsertSchema(hypotheses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

export const insertTeamMembershipSchema = createInsertSchema(teamMemberships).omit({
  id: true,
  joinedAt: true,
});

export const insertFeatureSchema = createInsertSchema(features).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
});

export const insertFeatureVersionSchema = createInsertSchema(featureVersions).omit({
  id: true,
  createdAt: true,
});

export const insertFeatureCommentSchema = createInsertSchema(featureComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = z.infer<typeof insertIdeaSchema>;

export type Hypothesis = typeof hypotheses.$inferSelect;
export type InsertHypothesis = z.infer<typeof insertHypothesisSchema>;

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type TeamMembership = typeof teamMemberships.$inferSelect;
export type InsertTeamMembership = z.infer<typeof insertTeamMembershipSchema>;

export type Feature = typeof features.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;

export type FeatureVersion = typeof featureVersions.$inferSelect;
export type InsertFeatureVersion = z.infer<typeof insertFeatureVersionSchema>;

export type FeatureComment = typeof featureComments.$inferSelect;
export type InsertFeatureComment = z.infer<typeof insertFeatureCommentSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ideas: many(ideas),
  insights: many(insights),
  comments: many(comments),
  activities: many(activities),
  createdTeams: many(teams),
  teamMemberships: many(teamMemberships),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  ideas: many(ideas),
}));

export const ideasRelations = relations(ideas, ({ one, many }) => ({
  category: one(categories, {
    fields: [ideas.categoryId],
    references: [categories.id],
  }),
  owner: one(users, {
    fields: [ideas.ownerId],
    references: [users.id],
  }),
  hypotheses: many(hypotheses),
  insights: many(insights),
  comments: many(comments),
  activities: many(activities),
}));

export const hypothesesRelations = relations(hypotheses, ({ one }) => ({
  idea: one(ideas, {
    fields: [hypotheses.ideaId],
    references: [ideas.id],
  }),
}));

export const insightsRelations = relations(insights, ({ one }) => ({
  idea: one(ideas, {
    fields: [insights.ideaId],
    references: [ideas.id],
  }),
  createdByUser: one(users, {
    fields: [insights.createdBy],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  idea: one(ideas, {
    fields: [comments.ideaId],
    references: [ideas.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  idea: one(ideas, {
    fields: [activities.ideaId],
    references: [ideas.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [teams.createdBy],
    references: [users.id],
  }),
  memberships: many(teamMemberships),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  teamMemberships: many(teamMemberships),
}));

export const teamMembershipsRelations = relations(teamMemberships, ({ one }) => ({
  team: one(teams, {
    fields: [teamMemberships.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMemberships.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [teamMemberships.roleId],
    references: [roles.id],
  }),
}));

export const featuresRelations = relations(features, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [features.createdBy],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [features.updatedBy],
    references: [users.id],
  }),
  linkedIdea: one(ideas, {
    fields: [features.linkedIdeaId],
    references: [ideas.id],
  }),
  parentModule: one(features, {
    fields: [features.parentModuleId],
    references: [features.id],
  }),
  childFeatures: many(features),
  versions: many(featureVersions),
  comments: many(featureComments),
}));

export const featureVersionsRelations = relations(featureVersions, ({ one }) => ({
  feature: one(features, {
    fields: [featureVersions.featureId],
    references: [features.id],
  }),
  changedBy: one(users, {
    fields: [featureVersions.changedBy],
    references: [users.id],
  }),
}));

export const featureCommentsRelations = relations(featureComments, ({ one }) => ({
  feature: one(features, {
    fields: [featureComments.featureId],
    references: [features.id],
  }),
  user: one(users, {
    fields: [featureComments.userId],
    references: [users.id],
  }),
}));
