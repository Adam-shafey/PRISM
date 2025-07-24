import { 
  users, ideas, categories, hypotheses, insights, comments, activities,
  type User, type InsertUser, type Idea, type InsertIdea, 
  type Category, type InsertCategory, type Hypothesis, type InsertHypothesis,
  type Insight, type InsertInsight, type Comment, type InsertComment,
  type Activity, type InsertActivity
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ideas: Map<number, Idea>;
  private categories: Map<number, Category>;
  private hypotheses: Map<number, Hypothesis>;
  private insights: Map<number, Insight>;
  private comments: Map<number, Comment>;
  private activities: Map<number, Activity>;
  
  private currentUserId: number;
  private currentIdeaId: number;
  private currentCategoryId: number;
  private currentHypothesisId: number;
  private currentInsightId: number;
  private currentCommentId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.ideas = new Map();
    this.categories = new Map();
    this.hypotheses = new Map();
    this.insights = new Map();
    this.comments = new Map();
    this.activities = new Map();
    
    this.currentUserId = 1;
    this.currentIdeaId = 1;
    this.currentCategoryId = 1;
    this.currentHypothesisId = 1;
    this.currentInsightId = 1;
    this.currentCommentId = 1;
    this.currentActivityId = 1;

    this.seedData();
  }

  private seedData() {
    // Seed users
    const user1: User = {
      id: this.currentUserId++,
      username: "sarah.chen",
      email: "sarah.chen@company.com",
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
      createdAt: new Date(),
    };

    const user2: User = {
      id: this.currentUserId++,
      username: "mike.johnson",
      email: "mike.johnson@company.com",
      name: "Mike Johnson",
      role: "Data Scientist",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
      createdAt: new Date(),
    };

    const user3: User = {
      id: this.currentUserId++,
      username: "emily.davis",
      email: "emily.davis@company.com",
      name: "Emily Davis",
      role: "UX Designer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b192?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
      createdAt: new Date(),
    };

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);

    // Seed categories
    const categories = [
      { name: "Growth", color: "purple", description: "User acquisition and growth initiatives" },
      { name: "Retention", color: "orange", description: "User retention and engagement features" },
      { name: "UX Improvement", color: "red", description: "User experience enhancements" },
      { name: "New Market", color: "blue", description: "New market opportunities and expansion" },
    ];

    categories.forEach(cat => {
      const category: Category = {
        id: this.currentCategoryId++,
        ...cat,
      };
      this.categories.set(category.id, category);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  // Ideas
  async getAllIdeas(): Promise<(Idea & { category?: Category; owner?: User; hypothesesCount: number; commentsCount: number })[]> {
    const ideas = Array.from(this.ideas.values());
    return ideas.map(idea => ({
      ...idea,
      category: idea.categoryId ? this.categories.get(idea.categoryId) : undefined,
      owner: idea.ownerId ? this.users.get(idea.ownerId) : undefined,
      hypothesesCount: Array.from(this.hypotheses.values()).filter(h => h.ideaId === idea.id).length,
      commentsCount: Array.from(this.comments.values()).filter(c => c.ideaId === idea.id).length,
    }));
  }

  async getIdeaById(id: number): Promise<(Idea & { category?: Category; owner?: User }) | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;

    return {
      ...idea,
      category: idea.categoryId ? this.categories.get(idea.categoryId) : undefined,
      owner: idea.ownerId ? this.users.get(idea.ownerId) : undefined,
    };
  }

  async createIdea(insertIdea: InsertIdea): Promise<Idea> {
    const id = this.currentIdeaId++;
    const now = new Date();
    const idea: Idea = { 
      ...insertIdea, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.ideas.set(id, idea);
    return idea;
  }

  async updateIdea(id: number, updateData: Partial<InsertIdea>): Promise<Idea | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;

    const updatedIdea: Idea = {
      ...idea,
      ...updateData,
      updatedAt: new Date(),
    };
    this.ideas.set(id, updatedIdea);
    return updatedIdea;
  }

  async deleteIdea(id: number): Promise<boolean> {
    return this.ideas.delete(id);
  }

  // Hypotheses
  async getHypothesesByIdeaId(ideaId: number): Promise<Hypothesis[]> {
    return Array.from(this.hypotheses.values()).filter(h => h.ideaId === ideaId);
  }

  async createHypothesis(insertHypothesis: InsertHypothesis): Promise<Hypothesis> {
    const id = this.currentHypothesisId++;
    const now = new Date();
    const hypothesis: Hypothesis = { 
      ...insertHypothesis, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.hypotheses.set(id, hypothesis);
    return hypothesis;
  }

  async updateHypothesis(id: number, updateData: Partial<InsertHypothesis>): Promise<Hypothesis | undefined> {
    const hypothesis = this.hypotheses.get(id);
    if (!hypothesis) return undefined;

    const updatedHypothesis: Hypothesis = {
      ...hypothesis,
      ...updateData,
      updatedAt: new Date(),
    };
    this.hypotheses.set(id, updatedHypothesis);
    return updatedHypothesis;
  }

  async deleteHypothesis(id: number): Promise<boolean> {
    return this.hypotheses.delete(id);
  }

  // Insights
  async getInsightsByIdeaId(ideaId: number): Promise<(Insight & { createdByUser?: User })[]> {
    const insights = Array.from(this.insights.values()).filter(i => i.ideaId === ideaId);
    return insights.map(insight => ({
      ...insight,
      createdByUser: insight.createdBy ? this.users.get(insight.createdBy) : undefined,
    }));
  }

  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const id = this.currentInsightId++;
    const insight: Insight = { 
      ...insertInsight, 
      id, 
      createdAt: new Date() 
    };
    this.insights.set(id, insight);
    return insight;
  }

  async deleteInsight(id: number): Promise<boolean> {
    return this.insights.delete(id);
  }

  // Comments
  async getCommentsByIdeaId(ideaId: number): Promise<(Comment & { user?: User })[]> {
    const comments = Array.from(this.comments.values()).filter(c => c.ideaId === ideaId);
    return comments.map(comment => ({
      ...comment,
      user: comment.userId ? this.users.get(comment.userId) : undefined,
    }));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const now = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.comments.set(id, comment);
    return comment;
  }

  async updateComment(id: number, updateData: Partial<InsertComment>): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;

    const updatedComment: Comment = {
      ...comment,
      ...updateData,
      updatedAt: new Date(),
    };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Activities
  async getActivitiesByIdeaId(ideaId: number): Promise<(Activity & { user?: User })[]> {
    const activities = Array.from(this.activities.values()).filter(a => a.ideaId === ideaId);
    return activities.map(activity => ({
      ...activity,
      user: activity.userId ? this.users.get(activity.userId) : undefined,
    }));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: new Date() 
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
