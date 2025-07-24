import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Lightbulb, 
  ChartLine, 
  FlaskConical, 
  MessageSquare, 
  Users, 
  Settings,
  Zap
} from "lucide-react";
import { useIdeas } from "@/lib/api";

const navigationItems = [
  {
    title: "Discovery",
    items: [
      {
        title: "Ideas & Problems",
        href: "/",
        icon: Lightbulb,
        badge: true,
      },
      {
        title: "Prioritization",
        href: "/prioritization",
        icon: ChartLine,
      },
      {
        title: "Validation Hub",
        href: "/validation",
        icon: FlaskConical,
      },
      {
        title: "Insights",
        href: "/insights",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        title: "Team",
        href: "/team",
        icon: Users,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { data: ideas = [] } = useIdeas();

  const activeIdeasCount = ideas.filter((idea) => 
    idea.status === "New" || idea.status === "In Discovery"
  ).length;

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Logo and workspace */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">PRISM</h1>
            <p className="text-xs text-muted-foreground">Product Discovery</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {navigationItems.map((section) => (
          <div key={section.title}>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && activeIdeasCount > 0 && (
                        <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                          {activeIdeasCount}
                        </span>
                      )}
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" 
            alt="User avatar" 
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">Sarah Chen</p>
            <p className="text-xs text-muted-foreground">Product Manager</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
