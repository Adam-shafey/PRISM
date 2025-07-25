import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Lightbulb, 
  ChartLine, 
  FlaskConical, 
  MessageSquare, 
  Users, 
  Settings,
  Zap,
  Book,
  Map,
  Calendar,
  List,
  Target
} from "lucide-react";
import { useIdeas } from "@/lib/api";
import { ProductSwitcher } from "./product-switcher";

const discoveryNavigationItems = [
  {
    title: "Discovery",
    items: [
      {
        title: "Ideas",
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
      {
        title: "Features",
        href: "/wiki",
        icon: Book,
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        title: "Teams",
        href: "/teams",
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

const planningNavigationItems = [
  {
    title: "Planning",
    items: [
      {
        title: "Roadmap",
        href: "/planning/roadmap",
        icon: Map,
      },
      {
        title: "Stories",
        href: "/planning/stories",
        icon: Book,
      },
      {
        title: "Tasks", 
        href: "/planning/tasks",
        icon: List,
      },
      {
        title: "Sprints",
        href: "/planning/sprints",
        icon: Calendar,
      },
      {
        title: "Releases",
        href: "/planning/releases",
        icon: Target,
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        title: "Teams",
        href: "/teams",
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
  
  // Mock user permissions - in a real app this would come from auth context
  const userPermissions = {
    discoveryPermissions: ['ideas:view', 'ideas:create', 'features:view'],
    planningPermissions: ['roadmap:view', 'stories:view', 'tasks:view']
  };
  
  // Determine which navigation items to show based on current product
  const isPlanning = location.startsWith('/planning');
  const navigationItems = isPlanning ? planningNavigationItems : discoveryNavigationItems;

  const activeIdeasCount = ideas.filter((idea) => 
    idea.status === "New" || idea.status === "In Discovery"
  ).length;

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Product Switcher Header */}
      <ProductSwitcher userPermissions={userPermissions} />

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
