import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Feature, InsertFeature, FeatureComment, InsertFeatureComment, FeatureVersion } from "@shared/schema";

// Features
export function useFeatures(search?: string) {
  return useQuery({
    queryKey: ["/api/features", search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const response = await fetch(`/api/features${params}`);
      if (!response.ok) throw new Error("Failed to fetch features");
      return response.json();
    },
  });
}

export function useFeature(slug: string) {
  return useQuery({
    queryKey: ["/api/features", slug],
    queryFn: async () => {
      const response = await fetch(`/api/features/${slug}`);
      if (!response.ok) throw new Error("Failed to fetch feature");
      return response.json();
    },
    enabled: !!slug,
  });
}

export function useCreateFeature() {
  return useMutation({
    mutationFn: async (feature: InsertFeature) => {
      return apiRequest("/api/features", "POST", feature);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/features"] });
    },
  });
}

export function useUpdateFeature() {
  return useMutation({
    mutationFn: async ({ id, feature }: { id: number; feature: Partial<InsertFeature> }) => {
      return apiRequest(`/api/features/${id}`, "PUT", feature);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/features"] });
      queryClient.invalidateQueries({ queryKey: ["/api/features", id] });
    },
  });
}

// Feature Versions
export function useFeatureVersions(featureId: number) {
  return useQuery({
    queryKey: ["/api/features", featureId, "versions"],
    queryFn: async () => {
      const response = await fetch(`/api/features/${featureId}/versions`);
      if (!response.ok) throw new Error("Failed to fetch feature versions");
      return response.json();
    },
    enabled: !!featureId,
  });
}

// Feature Comments
export function useCreateFeatureComment() {
  return useMutation({
    mutationFn: async ({ featureId, comment }: { featureId: number; comment: InsertFeatureComment }) => {
      return apiRequest(`/api/features/${featureId}/comments`, "POST", comment);
    },
    onSuccess: (_, { featureId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/features", featureId] });
    },
  });
}