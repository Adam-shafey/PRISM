import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("Product Manager"),
  avatar: text("avatar"),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ideas: many(ideas),
  insights: many(insights),
  comments: many(comments),
  activities: many(activities),
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
