import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Users,
  BarChart3,
  Zap,
  Settings,
  HelpCircle,
  Home,
  PlusCircle,
  TrendingUp,
  FileText,
  Bell
} from 'lucide-react';

// Navigation items grouped by user type and complexity
const navigationGroups = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: Home,
        description: 'Your marketing overview',
        userTypes: ['all'],
        complexity: 'beginner'
      }
    ]
  },
  {
    title: 'Core Features',
    items: [
      {
        title: 'Campaigns',
        url: '/campaigns',
        icon: Target,
        description: 'Create and manage marketing campaigns',
        userTypes: ['all'],
        complexity: 'beginner',
        badge: 'Popular'
      },
      {
        title: 'Leads',
        url: '/leads',
        icon: Users,
        description: 'Track and nurture your leads',
        userTypes: ['all'],
        complexity: 'beginner',
        badge: 'Essential'
      },
      {
        title: 'Analytics',
        url: '/analytics',
        icon: BarChart3,
        description: 'Performance insights and reports',
        userTypes: ['marketing', 'advanced'],
        complexity: 'intermediate'
      }
    ]
  },
  {
    title: 'Advanced Tools',
    items: [
      {
        title: 'Automation',
        url: '/automation',
        icon: Zap,
        description: 'Automate your workflows',
        userTypes: ['marketing', 'advanced'],
        complexity: 'advanced'
      },
      {
        title: 'Content',
        url: '/content',
        icon: FileText,
        description: 'Content creation and management',
        userTypes: ['marketing', 'content'],
        complexity: 'intermediate'
      },
      {
        title: 'Reports',
        url: '/reports',
        icon: TrendingUp,
        description: 'Detailed performance reports',
        userTypes: ['marketing', 'advanced'],
        complexity: 'advanced'
      }
    ]
  },
  {
    title: 'Support',
    items: [
      {
        title: 'Getting Started',
        url: '/help',
        icon: HelpCircle,
        description: 'Guides and tutorials',
        userTypes: ['all'],
        complexity: 'beginner',
        badge: 'New'
      },
      {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
        description: 'Account and preferences',
        userTypes: ['all'],
        complexity: 'beginner'
      }
    ]
  }
];

// Quick actions for easy access
const quickActions = [
  {
    title: 'New Campaign',
    url: '/campaigns/new',
    icon: PlusCircle,
    color: 'text-blue-600'
  },
  {
    title: 'Add Lead',
    url: '/leads/new',
    icon: Users,
    color: 'text-green-600'
  },
  {
    title: 'View Analytics',
    url: '/analytics',
    icon: BarChart3,
    color: 'text-purple-600'
  }
];

interface SimplifiedSidebarProps {
  userType?: 'beginner' | 'marketing' | 'advanced' | 'all';
  showComplexFeatures?: boolean;
}

export const SimplifiedSidebar: React.FC<SimplifiedSidebarProps> = ({
  userType = 'all',
  showComplexFeatures = true
}) => {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  interface NavigationItem {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    userTypes: string[];
    complexity: string;
    badge?: string;
  }

  const shouldShowItem = (item: NavigationItem) => {
    // Show if user type matches or item is for all users
    const userTypeMatch = item.userTypes.includes('all') || item.userTypes.includes(userType);

    // Filter complex features for beginners
    if (!showComplexFeatures && item.complexity === 'advanced') return false;

    return userTypeMatch;
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Popular': return 'bg-blue-100 text-blue-800';
      case 'Essential': return 'bg-green-100 text-green-800';
      case 'New': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Sidebar data-onboarding="navigation" className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Target className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-lg">Marketing Hub</h2>
              <p className="text-xs text-muted-foreground">Simplified for everyone</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Quick Actions */}
        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {quickActions.map((action) => (
                  <SidebarMenuItem key={action.url}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={action.url}
                        className="flex items-center gap-2 hover:bg-muted/50 rounded-md"
                      >
                        <action.icon className={`h-4 w-4 ${action.color}`} />
                        <span className="text-sm">{action.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Navigation */}
        {navigationGroups.map((group) => {
          const visibleItems = group.items.filter(shouldShowItem);
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.title}>
              {!isCollapsed && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url}
                          className={({ isActive: linkActive }) =>
                            `flex items-center gap-3 rounded-md p-2 transition-colors ${
                              linkActive || isActive(item.url)
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-muted/50'
                            }`
                          }
                          data-onboarding={item.url === '/campaigns' ? 'campaigns' : item.url === '/leads' ? 'leads' : undefined}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{item.title}</span>
                                {item.badge && (
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${getBadgeColor(item.badge)}`}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.description}
                              </p>
                            </div>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        {/* Help Section */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Need Help?</SidebarGroupLabel>}
          <SidebarGroupContent>
            <div className="p-2">
              {!isCollapsed ? (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <HelpCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground mb-2">
                    Need assistance? We're here to help!
                  </p>
                  <NavLink 
                    to="/help" 
                    className="text-xs text-primary hover:underline"
                    data-onboarding="help"
                  >
                    View Guides →
                  </NavLink>
                </div>
              ) : (
                <NavLink 
                  to="/help"
                  className="flex justify-center p-2 hover:bg-muted/50 rounded-md"
                  data-onboarding="help"
                >
                  <HelpCircle className="h-4 w-4 text-primary" />
                </NavLink>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};