import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/sidebar";
import { ArrowLeft, Edit, MessageSquare, FlaskConical, FileText } from "lucide-react";
import { useIdea, useHypotheses, useInsights, useComments } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function IdeaDetail() {
  const { id } = useParams();
  const ideaId = parseInt(id as string);

  const { data: idea, isLoading: ideaLoading } = useIdea(ideaId);
  const { data: hypotheses = [] } = useHypotheses(ideaId);
  const { data: insights = [] } = useInsights(ideaId);
  const { data: comments = [] } = useComments(ideaId);

  if (ideaLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading idea...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Idea Not Found</h1>
            <p className="text-muted-foreground mb-4">The idea you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{idea.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{idea.status}</Badge>
                {idea.category && (
                  <Badge variant="outline">{idea.category.name}</Badge>
                )}
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{idea.description}</p>
                </CardContent>
              </Card>

              {/* Hypotheses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    Hypotheses ({hypotheses.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hypotheses.length > 0 ? (
                    <div className="space-y-4">
                      {hypotheses.map((hypothesis: any) => (
                        <div key={hypothesis.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{hypothesis.status}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(hypothesis.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{hypothesis.statement}</p>
                          {hypothesis.results && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <strong>Results:</strong> {hypothesis.results}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hypotheses yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment: any) => (
                        <div key={comment.id} className="flex gap-3">
                          {comment.user?.avatar && (
                            <img 
                              src={comment.user.avatar} 
                              alt={comment.user.name}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.user?.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No comments yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Owner</label>
                    <div className="flex items-center gap-2 mt-1">
                      {idea.owner?.avatar && (
                        <img 
                          src={idea.owner.avatar} 
                          alt={idea.owner.name}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-sm">{idea.owner?.name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-muted-foreground">
                      {idea.createdAt ? formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true }) : 'Unknown'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Last Updated</label>
                    <p className="text-sm text-muted-foreground">
                      {idea.updatedAt ? formatDistanceToNow(new Date(idea.updatedAt), { addSuffix: true }) : 'Unknown'}
                    </p>
                  </div>

                  {idea.tags && idea.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Tags</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {idea.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Scoring */}
              {(idea.impactScore || idea.effortScore || idea.confidenceScore) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Scoring</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {idea.impactScore && (
                      <div className="flex justify-between">
                        <span className="text-sm">Impact</span>
                        <span className="text-sm font-medium">{idea.impactScore}/5</span>
                      </div>
                    )}
                    {idea.effortScore && (
                      <div className="flex justify-between">
                        <span className="text-sm">Effort</span>
                        <span className="text-sm font-medium">{idea.effortScore}/5</span>
                      </div>
                    )}
                    {idea.confidenceScore && (
                      <div className="flex justify-between">
                        <span className="text-sm">Confidence</span>
                        <span className="text-sm font-medium">{idea.confidenceScore}/5</span>
                      </div>
                    )}
                    {idea.riceScore && (
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium">RICE Score</span>
                        <span className="text-sm font-bold">{idea.riceScore}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Insights ({insights.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insights.length > 0 ? (
                    <div className="space-y-3">
                      {insights.map((insight: any) => (
                        <div key={insight.id} className="border rounded p-3">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {insight.type} • {insight.createdByUser?.name}
                          </p>
                          {insight.summary && (
                            <p className="text-sm mt-2">{insight.summary}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No insights yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
