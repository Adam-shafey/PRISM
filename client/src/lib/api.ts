import { apiRequest } from "./queryClient";
import type { InsertIdea, InsertHypothesis, InsertInsight, InsertComment, InsertCategory } from "@shared/schema";
import type { AIResponse } from "@/types";

// Ideas API
export const ideasApi = {
  getAll: () => fetch("/api/ideas").then(res => res.json()),
  getById: (id: number) => fetch(`/api/ideas/${id}`).then(res => res.json()),
  create: (data: InsertIdea) => apiRequest("POST", "/api/ideas", data),
  update: (id: number, data: Partial<InsertIdea>) => apiRequest("PUT", `/api/ideas/${id}`, data),
  delete: (id: number) => apiRequest("DELETE", `/api/ideas/${id}`),
};

// Hypotheses API
export const hypothesesApi = {
  getByIdeaId: (ideaId: number) => fetch(`/api/ideas/${ideaId}/hypotheses`).then(res => res.json()),
  create: (ideaId: number, data: Omit<InsertHypothesis, 'ideaId'>) => 
    apiRequest("POST", `/api/ideas/${ideaId}/hypotheses`, data),
  update: (id: number, data: Partial<InsertHypothesis>) => 
    apiRequest("PUT", `/api/hypotheses/${id}`, data),
};

// Insights API
export const insightsApi = {
  getByIdeaId: (ideaId: number) => fetch(`/api/ideas/${ideaId}/insights`).then(res => res.json()),
  create: (ideaId: number, data: Omit<InsertInsight, 'ideaId'>) => 
    apiRequest("POST", `/api/ideas/${ideaId}/insights`, data),
  delete: (id: number) => apiRequest("DELETE", `/api/insights/${id}`),
};

// Comments API
export const commentsApi = {
  getByIdeaId: (ideaId: number) => fetch(`/api/ideas/${ideaId}/comments`).then(res => res.json()),
  create: (ideaId: number, data: Omit<InsertComment, 'ideaId'>) => 
    apiRequest("POST", `/api/ideas/${ideaId}/comments`, data),
  update: (id: number, data: Partial<InsertComment>) => 
    apiRequest("PUT", `/api/comments/${id}`, data),
  delete: (id: number) => apiRequest("DELETE", `/api/comments/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => fetch("/api/categories").then(res => res.json()),
  create: (data: InsertCategory) => apiRequest("POST", "/api/categories", data),
};

// Users API
export const usersApi = {
  getAll: () => fetch("/api/users").then(res => res.json()),
};

// Activities API
export const activitiesApi = {
  getByIdeaId: (ideaId: number) => fetch(`/api/ideas/${ideaId}/activities`).then(res => res.json()),
};

// AI API
export const aiApi = {
  processDiscoveryData: (data: { description: string; title: string }): Promise<AIResponse> =>
    apiRequest("POST", "/api/ai/process-discovery-data", data).then(res => res.json()),
};
