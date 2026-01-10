import React, { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMode } from '@/hooks/useUserMode';
import ModeSwitcher from '@/components/layout/ModeSwitcher';
import NeuralFlowIcon, { NeuralFlowIconName } from '@/components/ui/NeuralFlowIcon';
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
    iconName: NeuralFlowIconName;
    description: string;
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
      iconName: 'campaigns',
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
      iconName: 'content',
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
      iconName: 'dashboard',
      description: 'AI knowledge base'
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">AI Boost Campaign</h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'simple' ? 'Autopilot Mode' : 'Intelligent Automation Platform'}
          </p>

          {/* Mode Switcher */}
          <div className="mt-4">
            <ModeSwitcher />
          </div>
        </div>

        <nav className="flex-1 px-3 pb-6 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="mr-3 flex-shrink-0">
                    <NeuralFlowIcon name={item.iconName} size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User info and logout section - moved to bottom */}
        {user && (
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <NeuralFlowIcon name="profile" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  disabled={isLoggingOut}
                >
                  <NeuralFlowIcon name="sign-out" size={16} className="mr-2" />
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
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
      <main className="flex-1 overflow-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
