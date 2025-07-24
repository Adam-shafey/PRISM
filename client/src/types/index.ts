export type IdeaStatus = "New" | "In Discovery" | "Validated" | "Rejected" | "Prioritized" | "In Planning";

export type ExperimentType = "User Interview" | "Survey" | "Prototype Test" | "A/B Test" | "Data Analysis";

export type HypothesisStatus = "Unvalidated" | "Partially Validated" | "Validated" | "Invalidated";

export type InsightType = "file" | "url" | "note";

export type ActivityAction = "created" | "updated" | "commented" | "status_changed" | "hypothesis_added" | "insight_added";

export interface IdeaFilters {
  status?: IdeaStatus;
  categoryId?: number;
  ownerId?: number;
  search?: string;
}

export interface AIResponse {
  tags: string[];
  category: string;
  summary: string;
  scores: {
    impact: number;
    effort: number;
    confidence: number;
  };
}
