import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertIdeaSchema, insertHypothesisSchema, insertInsightSchema, insertCommentSchema, insertCategorySchema } from "@shared/schema";
import { requireAuth, getCurrentUser } from "./auth";
import passport from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/login", passport.authenticate('local'), (req, res) => {
    res.json({ user: req.user, message: "Logged in successfully" });
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err: any) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      // Auto-login first user for development
      storage.getAllUsers().then(users => {
        if (users.length > 0) {
          req.login(users[0], (err: any) => {
            if (err) return res.status(401).json({ user: null });
            return res.json({ user: req.user });
          });
        } else {
          res.status(401).json({ user: null });
        }
      }).catch(() => {
        res.status(401).json({ user: null });
      });
    }
  });

  // Ideas endpoints
  app.get("/api/ideas", requireAuth, async (req, res) => {
    try {
      const ideas = await storage.getAllIdeas();
      res.json(ideas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ideas" });
    }
  });

  app.get("/api/ideas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const idea = await storage.getIdeaById(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      res.json(idea);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch idea" });
    }
  });

  app.post("/api/ideas", requireAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      const validatedData = insertIdeaSchema.parse({
        ...req.body,
        ownerId: currentUser?.id
      });
      const idea = await storage.createIdea(validatedData);
      
      // Create activity record
      if (currentUser) {
        await storage.createActivity({
          ideaId: idea.id,
          userId: currentUser.id,
          action: "created",
          details: { title: idea.title }
        });
      }
      
      res.status(201).json(idea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create idea" });
    }
  });

  app.put("/api/ideas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const validatedData = insertIdeaSchema.partial().parse(req.body);
      const idea = await storage.updateIdea(id, validatedData);
      
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      res.json(idea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update idea" });
    }
  });

  app.delete("/api/ideas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const deleted = await storage.deleteIdea(id);
      if (!deleted) {
        return res.status(404).json({ message: "Idea not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete idea" });
    }
  });

  // Hypotheses endpoints
  app.get("/api/ideas/:ideaId/hypotheses", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.ideaId);
      if (isNaN(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const hypotheses = await storage.getHypothesesByIdeaId(ideaId);
      res.json(hypotheses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hypotheses" });
    }
  });

  app.post("/api/ideas/:ideaId/hypotheses", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.ideaId);
      if (isNaN(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const validatedData = insertHypothesisSchema.parse({ ...req.body, ideaId });
      const hypothesis = await storage.createHypothesis(validatedData);
      res.status(201).json(hypothesis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create hypothesis" });
    }
  });

  app.put("/api/hypotheses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hypothesis ID" });
      }

      const validatedData = insertHypothesisSchema.partial().parse(req.body);
      const hypothesis = await storage.updateHypothesis(id, validatedData);
      
      if (!hypothesis) {
        return res.status(404).json({ message: "Hypothesis not found" });
      }

      res.json(hypothesis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update hypothesis" });
    }
  });

  // Insights endpoints
  app.get("/api/ideas/:ideaId/insights", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.ideaId);
      if (isNaN(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const insights = await storage.getInsightsByIdeaId(ideaId);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  app.post("/api/ideas/:ideaId/insights", requireAuth, async (req, res) => {
    try {
      const ideaId = parseInt(req.params.ideaId);
      if (isNaN(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const currentUser = getCurrentUser(req);
      const validatedData = insertInsightSchema.parse({ 
        ...req.body, 
        ideaId,
        createdBy: currentUser?.id
      });
      const insight = await storage.createInsight(validatedData);
      
      // Create activity record
      if (currentUser) {
        await storage.createActivity({
          ideaId,
          userId: currentUser.id,
          action: "insight_added",
          details: { title: insight.title, type: insight.type }
        });
      }
      
      res.status(201).json(insight);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create insight" });
    }
  });

  // Comments endpoints
  app.get("/api/ideas/:ideaId/comments", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.ideaId);
      if (isNaN(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const comments = await storage.getCommentsByIdeaId(ideaId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/ideas/:ideaId/comments", requireAuth, async (req, res) => {
    try {
      const ideaId = parseInt(req.params.ideaId);
      if (isNaN(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const currentUser = getCurrentUser(req);
      const validatedData = insertCommentSchema.parse({ 
        ...req.body, 
        ideaId,
        userId: currentUser?.id
      });
      const comment = await storage.createComment(validatedData);
      
      // Create activity record
      if (currentUser) {
        await storage.createActivity({
          ideaId,
          userId: currentUser.id,
          action: "commented",
          details: { content: req.body.content }
        });
      }
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Users endpoints
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Activities endpoints
  app.get("/api/ideas/:ideaId/activities", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.ideaId);
      if (isNaN(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const activities = await storage.getActivitiesByIdeaId(ideaId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // AI suggestions endpoint (mocked for now)
  app.post("/api/ai/process-discovery-data", async (req, res) => {
    try {
      const { description, title } = req.body;
      
      // Mock AI suggestions based on content analysis
      const suggestions = {
        tags: mockGenerateTags(description, title),
        category: mockSuggestCategory(description, title),
        summary: mockGenerateSummary(description),
        scores: {
          impact: Math.floor(Math.random() * 5) + 1,
          effort: Math.floor(Math.random() * 5) + 1,
          confidence: Math.floor(Math.random() * 5) + 1,
        }
      };

      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to process AI suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Mock AI functions
function mockGenerateTags(description: string, title: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];
  
  if (text.includes('user') || text.includes('customer')) tags.push('user-focused');
  if (text.includes('mobile') || text.includes('app')) tags.push('mobile');
  if (text.includes('dashboard') || text.includes('analytics')) tags.push('analytics');
  if (text.includes('ai') || text.includes('machine learning')) tags.push('ai');
  if (text.includes('onboarding') || text.includes('signup')) tags.push('onboarding');
  if (text.includes('enterprise') || text.includes('business')) tags.push('enterprise');
  
  return tags.length > 0 ? tags : ['general'];
}

function mockSuggestCategory(description: string, title: string): string {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('growth') || text.includes('acquisition') || text.includes('viral')) return 'Growth';
  if (text.includes('retention') || text.includes('engagement') || text.includes('gamification')) return 'Retention';
  if (text.includes('ux') || text.includes('design') || text.includes('interface')) return 'UX Improvement';
  if (text.includes('enterprise') || text.includes('market') || text.includes('business')) return 'New Market';
  
  return 'Growth';
}

function mockGenerateSummary(description: string): string {
  if (description.length < 100) return description;
  
  const sentences = description.split('.').filter(s => s.trim().length > 0);
  return sentences.slice(0, 2).join('.') + '.';
}
