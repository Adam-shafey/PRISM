import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/pages/dashboard";
import IdeaDetail from "@/pages/idea-detail";
import Prioritization from "@/pages/prioritization";
import Validation from "@/pages/validation";
import Insights from "@/pages/insights";
import Teams from "@/pages/teams";
import Wiki from "@/pages/wiki";
import NotFound from "@/pages/not-found";
import { lazy } from "react";

// Planning pages
const PlanningDashboard = lazy(() => import("@/pages/planning/index"));
const PlanningRoadmap = lazy(() => import("@/pages/planning/roadmap"));
const PlanningStories = lazy(() => import("@/pages/planning/stories"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/ideas/:id" component={IdeaDetail} />
      <Route path="/prioritization" component={Prioritization} />
      <Route path="/validation" component={Validation} />
      <Route path="/insights" component={Insights} />
      <Route path="/teams" component={Teams} />
      <Route path="/wiki" component={Wiki} />
      <Route path="/planning" component={PlanningDashboard} />
      <Route path="/planning/roadmap" component={PlanningRoadmap} />
      <Route path="/planning/stories" component={PlanningStories} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="prism-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
