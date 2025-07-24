import { 
  users, ideas, categories, hypotheses, insights, comments, activities,
  type User, type InsertUser, type Idea, type InsertIdea, 
  type Category, type InsertCategory, type Hypothesis, type InsertHypothesis,
  type Insight, type InsertInsight, type Comment, type InsertComment,
  type Activity, type InsertActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  getCategoryById(id: number): Promise<Category | undefined>;

  // Ideas
  getAllIdeas(): Promise<(Idea & { category?: Category; owner?: User; hypothesesCount: number; commentsCount: number })[]>;
  getIdeaById(id: number): Promise<(Idea & { category?: Category; owner?: User }) | undefined>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  updateIdea(id: number, idea: Partial<InsertIdea>): Promise<Idea | undefined>;
  deleteIdea(id: number): Promise<boolean>;

  // Hypotheses
  getHypothesesByIdeaId(ideaId: number): Promise<Hypothesis[]>;
  createHypothesis(hypothesis: InsertHypothesis): Promise<Hypothesis>;
  updateHypothesis(id: number, hypothesis: Partial<InsertHypothesis>): Promise<Hypothesis | undefined>;
  deleteHypothesis(id: number): Promise<boolean>;

  // Insights
  getInsightsByIdeaId(ideaId: number): Promise<(Insight & { createdByUser?: User })[]>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  deleteInsight(id: number): Promise<boolean>;

  // Comments
  getCommentsByIdeaId(ideaId: number): Promise<(Comment & { user?: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;

  // Activities
  getActivitiesByIdeaId(ideaId: number): Promise<(Activity & { user?: User })[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

// Database Storage replaces MemStorage for PostgreSQL database integration

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || "Product Manager"
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values({
        ...insertCategory,
        description: insertCategory.description || null
      })
      .returning();
    return category;
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  // Ideas
  async getAllIdeas(): Promise<(Idea & { category?: Category; owner?: User; hypothesesCount: number; commentsCount: number })[]> {
    const result = await db
      .select({
        idea: ideas,
        category: categories,
        owner: users,
        hypothesesCount: sql<number>`cast(count(distinct ${hypotheses.id}) as int)`,
        commentsCount: sql<number>`cast(count(distinct ${comments.id}) as int)`,
      })
      .from(ideas)
      .leftJoin(categories, eq(ideas.categoryId, categories.id))
      .leftJoin(users, eq(ideas.ownerId, users.id))
      .leftJoin(hypotheses, eq(ideas.id, hypotheses.ideaId))
      .leftJoin(comments, eq(ideas.id, comments.ideaId))
      .groupBy(ideas.id, categories.id, users.id);

    return result.map(row => ({
      ...row.idea,
      category: row.category || undefined,
      owner: row.owner || undefined,
      hypothesesCount: row.hypothesesCount || 0,
      commentsCount: row.commentsCount || 0,
    }));
  }

  async getIdeaById(id: number): Promise<(Idea & { category?: Category; owner?: User }) | undefined> {
    const result = await db
      .select({
        idea: ideas,
        category: categories,
        owner: users,
      })
      .from(ideas)
      .leftJoin(categories, eq(ideas.categoryId, categories.id))
      .leftJoin(users, eq(ideas.ownerId, users.id))
      .where(eq(ideas.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.idea,
      category: row.category || undefined,
      owner: row.owner || undefined,
    };
  }

  async createIdea(insertIdea: InsertIdea): Promise<Idea> {
    const [idea] = await db
      .insert(ideas)
      .values({
        ...insertIdea,
        status: insertIdea.status || "New"
      })
      .returning();
    return idea;
  }

  async updateIdea(id: number, updateData: Partial<InsertIdea>): Promise<Idea | undefined> {
    const [idea] = await db
      .update(ideas)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(ideas.id, id))
      .returning();
    return idea || undefined;
  }

  async deleteIdea(id: number): Promise<boolean> {
    const result = await db.delete(ideas).where(eq(ideas.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Hypotheses
  async getHypothesesByIdeaId(ideaId: number): Promise<Hypothesis[]> {
    return await db.select().from(hypotheses).where(eq(hypotheses.ideaId, ideaId));
  }

  async createHypothesis(insertHypothesis: InsertHypothesis): Promise<Hypothesis> {
    const [hypothesis] = await db
      .insert(hypotheses)
      .values({
        ...insertHypothesis,
        status: insertHypothesis.status || "Unvalidated"
      })
      .returning();
    return hypothesis;
  }

  async updateHypothesis(id: number, updateData: Partial<InsertHypothesis>): Promise<Hypothesis | undefined> {
    const [hypothesis] = await db
      .update(hypotheses)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(hypotheses.id, id))
      .returning();
    return hypothesis || undefined;
  }

  async deleteHypothesis(id: number): Promise<boolean> {
    const result = await db.delete(hypotheses).where(eq(hypotheses.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Insights
  async getInsightsByIdeaId(ideaId: number): Promise<(Insight & { createdByUser?: User })[]> {
    const result = await db
      .select({
        insight: insights,
        createdByUser: users,
      })
      .from(insights)
      .leftJoin(users, eq(insights.createdBy, users.id))
      .where(eq(insights.ideaId, ideaId));

    return result.map(row => ({
      ...row.insight,
      createdByUser: row.createdByUser || undefined,
    }));
  }

  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const [insight] = await db
      .insert(insights)
      .values(insertInsight)
      .returning();
    return insight;
  }

  async deleteInsight(id: number): Promise<boolean> {
    const result = await db.delete(insights).where(eq(insights.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Comments
  async getCommentsByIdeaId(ideaId: number): Promise<(Comment & { user?: User })[]> {
    const result = await db
      .select({
        comment: comments,
        user: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.ideaId, ideaId));

    return result.map(row => ({
      ...row.comment,
      user: row.user || undefined,
    }));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async updateComment(id: number, updateData: Partial<InsertComment>): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return comment || undefined;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Activities
  async getActivitiesByIdeaId(ideaId: number): Promise<(Activity & { user?: User })[]> {
    const result = await db
      .select({
        activity: activities,
        user: users,
      })
      .from(activities)
      .leftJoin(users, eq(activities.userId, users.id))
      .where(eq(activities.ideaId, ideaId));

    return result.map(row => ({
      ...row.activity,
      user: row.user || undefined,
    }));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }
}

export const storage = new DatabaseStorage();
