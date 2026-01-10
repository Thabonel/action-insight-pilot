import React, { useState, useMemo } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMode } from '@/hooks/useUserMode';
import ModeSwitcher from '@/components/layout/ModeSwitcher';
import NeuralFlowIcon, { NeuralFlowIconName } from '@/components/ui/NeuralFlowIcon';
import LogoMarkIcon from '@/components/LogoMarkIcon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PanelLeft, PanelRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const Layout: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { mode } = useUserMode();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Navigation item type
  type NavItem = {
    name: string;
    href: string;
    iconName?: NeuralFlowIconName;
    description: string;
    customIcon?: 'logo';
  };

  // Simple mode navigation items (3 items)
  const simpleNavItems: NavItem[] = [
    {
      name: 'Autopilot Dashboard',
      href: '/app/autopilot',
      iconName: 'autopilot',
      description: 'Your marketing results'
    },
    {
      name: 'AI Chat',
      href: '/app/conversational-dashboard',
      iconName: 'dashboard',
      description: 'Ask me anything'
    },
    {
      name: 'Settings',
      href: '/app/settings',
      iconName: 'settings',
      description: 'Configure autopilot'
    }
  ];

  // Advanced mode navigation items
  const advancedNavItems: NavItem[] = [
    {
      name: 'AI Dashboard',
      href: '/app/conversational-dashboard',
      iconName: 'dashboard',
      description: 'AI-powered insights'
    },
    {
      name: 'Campaigns',
      href: '/app/campaigns',
      iconName: 'campaigns',
      description: 'Marketing campaigns'
    },
    {
      name: 'Campaign Management',
      href: '/app/campaign-management',
      iconName: 'workflows',
      description: 'Advanced campaign tools'
    },
    {
      name: 'Leads',
      href: '/app/leads',
      iconName: 'leads',
      description: 'Lead management'
    },
    {
      name: 'Content',
      href: '/app/content',
      iconName: 'content',
      description: 'Content creation'
    },
    {
      name: 'Social',
      href: '/app/social',
      iconName: 'social',
      description: 'Social media'
    },
    {
      name: 'Email',
      href: '/app/email',
      iconName: 'email',
      description: 'Email automation'
    },
    {
      name: 'Analytics',
      href: '/app/analytics',
      iconName: 'analytics',
      description: 'Performance metrics'
    },
    {
      name: 'Viral Video Marketing',
      href: '/app/viral-video-marketing',
      iconName: 'video',
      description: 'Video content automation'
    },
    {
      name: 'Proposals',
      href: '/app/proposals',
      iconName: 'proposals',
      description: 'Proposal generation'
    },
    {
      name: 'Knowledge',
      href: '/app/knowledge',
      description: 'AI knowledge base',
      customIcon: 'logo'
    },
    {
      name: 'Settings',
      href: '/app/settings',
      iconName: 'settings',
      description: 'System configuration'
    },
    {
      name: 'User Manual',
      href: '/app/user-manual',
      iconName: 'documentation',
      description: 'Documentation'
    },
    {
      name: 'Connect Platforms',
      href: '/app/connect-platforms',
      iconName: 'integrations',
      description: 'Integration setup'
    }
  ];

  const navItems = mode === 'simple' ? simpleNavItems : advancedNavItems;

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('sidebarCollapsed') === '1'; } catch { return false; }
  });
  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem('sidebarCollapsed', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0B0D10]">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-[#0B0D10] shadow-sm dark:shadow-none border-r border-gray-200 dark:border-[#273140] flex flex-col transition-all duration-200`}>
        <div className={`${collapsed ? 'p-3' : 'p-6'} flex ${collapsed ? 'items-center justify-center' : 'items-start'} gap-2 flex-shrink-0 sidebar-header`}>
          {collapsed ? (
            <LogoMarkIcon className={`h-6 w-6`} />
          ) : (
            <div className="min-w-0 w-full">
              {/* Title row: logo + name on the same baseline */}
              <div className="flex items-baseline gap-2">
                <LogoMarkIcon className="h-[1.35em] w-[1.35em] align-baseline relative top-[2px]" />
                <h2 className="text-xl font-bold leading-tight text-gray-900 dark:text-[#E9EEF5] whitespace-normal">
                  I Boost Campaign
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#94A3B8] mt-1">
                {mode === 'simple' ? 'Autopilot Mode' : 'Intelligent Automation Platform'}
              </p>
            </div>
          )}
        </div>

        {/* Mode Switcher */}
        {!collapsed && (
          <div className="px-6 pb-2">
            <ModeSwitcher />
          </div>
        )}

        <nav className="flex-1 px-3 pb-2 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;

              const content = (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-[rgba(59,130,246,0.15)] text-blue-700 dark:text-[#60A5FA] border-r-2 border-blue-600 dark:border-[#3B82F6]'
                      : 'text-gray-700 dark:text-[#94A3B8] hover:bg-gray-50 dark:hover:bg-[#1C2430] hover:text-gray-900 dark:hover:text-[#E9EEF5]'
                  }`}
                >
                  <div className={`mr-3 flex-shrink-0 ${collapsed ? 'mr-0' : ''}`}>
                    {item.customIcon === 'logo' ? (
                      <LogoMarkIcon className={`${collapsed ? 'h-5 w-5' : 'h-6 w-6'}`} />
                    ) : item.iconName ? (
                      <NeuralFlowIcon name={item.iconName} size={collapsed ? 20 : 24} />
                    ) : null}
                  </div>
                  {!collapsed && (
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        {isActive && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                      </div>
                      <p className={`text-xs mt-0.5 truncate ${isActive ? 'text-blue-600 dark:text-[#60A5FA]' : 'text-gray-500 dark:text-[#64748B]'}`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </NavLink>
              );

              return (
                <TooltipProvider delayDuration={0} key={item.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {content}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </nav>

        {/* Sidebar actions (collapse/expand) */}
        <div className={`${collapsed ? 'p-2' : 'px-3 py-2'} border-t border-gray-200 dark:border-[#273140] flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`rounded-md p-2 hover:bg-gray-50 dark:hover:bg-[#1C2430] text-gray-600 dark:text-[#94A3B8]`}
          >
            {collapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User info and logout section - moved to bottom */}
        {user && (
          <div className={`${collapsed ? 'p-2' : 'p-4'} border-t border-gray-200 dark:border-[#273140] flex-shrink-0`}> 
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-[rgba(59,130,246,0.15)] rounded-full flex items-center justify-center">
                <NeuralFlowIcon name="profile" size={16} />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-[#E9EEF5] truncate">{user.email}</p>
                </div>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start text-gray-600 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-[#E9EEF5] hover:bg-gray-50 dark:hover:bg-[#1C2430] ${collapsed ? 'px-2' : ''}`}
                  disabled={isLoggingOut}
                >
                  <NeuralFlowIcon name="sign-out" size={16} className="mr-2" />
                  {!collapsed && (isLoggingOut ? 'Signing out...' : 'Sign out')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out of your account?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0B0D10]">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
