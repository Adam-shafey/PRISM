import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type { 
  Idea, 
  InsertIdea, 
  Category, 
  User, 
  Hypothesis, 
  InsertHypothesis,
  Insight,
  InsertInsight,
  Comment,
  InsertComment
} from "@shared/schema";

// Ideas API
export function useIdeas() {
  return useQuery<(Idea & { category?: Category; owner?: User; hypothesesCount: number; commentsCount: number })[]>({
    queryKey: ["/api/ideas"],
  });
}

export function useIdea(id: number) {
  return useQuery<Idea & { category?: Category; owner?: User }>({
    queryKey: ["/api/ideas", id],
    enabled: !!id,
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertIdea) => {
      const response = await apiRequest("POST", "/api/ideas", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertIdea> }) => {
      const response = await apiRequest("PUT", `/api/ideas/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", id] });
    },
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/ideas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
  });
}

// Categories API
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["/api/users"],
  });
}

// Hypotheses API
export function useHypotheses(ideaId: number) {
  return useQuery<Hypothesis[]>({
    queryKey: ["/api/ideas", ideaId, "hypotheses"],
    enabled: !!ideaId,
  });
}

export function useCreateHypothesis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ideaId, data }: { ideaId: number; data: Omit<InsertHypothesis, 'ideaId'> }) => {
      const response = await apiRequest("POST", `/api/ideas/${ideaId}/hypotheses`, data);
      return response.json();
    },
    onSuccess: (_, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", ideaId, "hypotheses"] });
    },
  });
}

export function useUpdateHypothesis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertHypothesis> }) => {
      const response = await apiRequest("PUT", `/api/hypotheses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      // Invalidate all hypothesis queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.includes("hypotheses");
        }
      });
    },
  });
}

// Insights API
export function useInsights(ideaId: number) {
  return useQuery<(Insight & { createdByUser?: User })[]>({
    queryKey: ["/api/ideas", ideaId, "insights"],
    enabled: !!ideaId,
  });
}

export function useCreateInsight() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ideaId, data }: { ideaId: number; data: Omit<InsertInsight, 'ideaId' | 'createdBy'> }) => {
      const response = await apiRequest("POST", `/api/ideas/${ideaId}/insights`, data);
      return response.json();
    },
    onSuccess: (_, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", ideaId, "insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
  });
}

export function useDeleteInsight() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/insights/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      // Invalidate all insight queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.includes("insights");
        }
      });
    },
  });
}



// Comments API
export function useComments(ideaId: number) {
  return useQuery<(Comment & { user?: User })[]>({
    queryKey: ["/api/ideas", ideaId, "comments"],
    enabled: !!ideaId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ideaId, data }: { ideaId: number; data: Omit<InsertComment, 'ideaId' | 'userId'> }) => {
      const response = await apiRequest("POST", `/api/ideas/${ideaId}/comments`, data);
      return response.json();
    },
    onSuccess: (_, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", ideaId, "comments"] });
    },
  });
}

// AI API
export function useAISuggestions() {
  return useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const response = await apiRequest("POST", "/api/ai/process-discovery-data", data);
      return response.json();
    },
  });
}

// Teams API hooks
export function useTeams() {
  return useQuery<any[]>({
    queryKey: ["/api/teams"],
  });
}

export function useTeam(id: number) {
  return useQuery<any>({
    queryKey: ["/api/teams", id],
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (team: any) => 
      apiRequest("POST", "/api/teams", team),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
  });
}

// Roles API hooks
export function useRoles() {
  return useQuery<any[]>({
    queryKey: ["/api/roles"],
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (role: any) => 
      apiRequest("POST", "/api/roles", role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
    },
  });
}

// Team Memberships API hooks
export function useCreateTeamMembership() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (membership: any) => 
      apiRequest("POST", "/api/team-memberships", membership),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
  });
}

export function useRemoveTeamMembership() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (membershipId: number) => 
      apiRequest("DELETE", `/api/team-memberships/${membershipId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
  });
}
