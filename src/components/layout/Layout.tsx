
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
  const { mode, isLoading: modeLoading } = useUserMode();
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
    description: string;
    icon: NeuralFlowIconName;
  };

  // Simple Mode Navigation (3 items)
  const simpleNavItems: NavItem[] = [
    {
      name: 'Autopilot Dashboard',
      href: '/app/autopilot',
      icon: 'autopilot',
      description: 'Your marketing results'
    },
    {
      name: 'AI Chat',
      href: '/app/conversational-dashboard',
      icon: 'dashboard',
      description: 'Ask me anything'
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: 'settings',
      description: 'Configure autopilot'
    }
  ];

  // Advanced Mode Navigation (All items)
  const advancedNavItems: NavItem[] = [
    {
      name: 'Autopilot',
      href: '/app/autopilot',
      icon: 'autopilot',
      description: 'Marketing automation'
    },
    {
      name: 'AI Dashboard',
      href: '/app/conversational-dashboard',
      icon: 'dashboard',
      description: 'AI-powered insights & chat'
    },
    {
      name: 'Admin Dashboard',
      href: '/app/admin',
      icon: 'admin',
      description: 'Business metrics & system'
    },
    {
      name: 'Campaign Management',
      href: '/app/campaign-management',
      icon: 'campaigns',
      description: 'Advanced campaign tools'
    },
    {
      name: 'Leads',
      href: '/app/leads',
      icon: 'leads',
      description: 'Lead management'
    },
    {
      name: 'Content',
      href: '/app/content',
      icon: 'content',
      description: 'Content creation'
    },
    {
      name: 'Social',
      href: '/app/social',
      icon: 'social',
      description: 'Social media'
    },
    {
      name: 'Email',
      href: '/app/email',
      icon: 'email',
      description: 'Email automation'
    },
    {
      name: 'Analytics',
      href: '/app/analytics',
      icon: 'analytics',
      description: 'Performance metrics'
    },
    {
      name: 'Workflows',
      href: '/app/workflows',
      icon: 'workflows',
      description: 'Automation workflows'
    },
    {
      name: 'Proposals',
      href: '/app/proposals',
      icon: 'proposals',
      description: 'Proposal generation'
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: 'settings',
      description: 'System configuration'
    },
    {
      name: 'User Manual',
      href: '/app/user-manual',
      icon: 'documentation',
      description: 'Documentation'
    },
    {
      name: 'Connect Platforms',
      href: '/app/connect-platforms',
      icon: 'integrations',
      description: 'Integration setup'
    }
  ];

  // Select navigation items based on current mode
  const navItems = mode === 'simple' ? simpleNavItems : advancedNavItems;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0B0D10]">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#0B0D10] shadow-sm dark:shadow-none border-r border-gray-200 dark:border-[#273140] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#E9EEF5]">AI Boost Campaign</h2>
          <p className="text-sm text-gray-600 dark:text-[#94A3B8] mt-1">Intelligent Automation Platform</p>

          {/* Mode Switcher */}
          {!modeLoading && (
            <div className="mt-4">
              <ModeSwitcher />
            </div>
          )}

          {/* User info and logout section */}
          {user && (
            <div className="mt-4 pt-4 border-t border-gray-200">
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
                    className="w-full justify-start text-gray-600 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-[#E9EEF5] hover:bg-gray-50 dark:hover:bg-[#1C2430]"
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
        </div>
        
        <nav className="px-3 pb-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-[rgba(59,130,246,0.15)] text-blue-700 dark:text-[#60A5FA] border-r-2 border-blue-600 dark:border-[#3B82F6]'
                      : 'text-gray-700 dark:text-[#94A3B8] hover:bg-gray-50 dark:hover:bg-[#1C2430] hover:text-gray-900 dark:hover:text-[#E9EEF5]'
                  }`}
                >
                  <div className="mr-3 flex-shrink-0">
                    <NeuralFlowIcon name={item.icon} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${
                      isActive ? 'text-blue-600 dark:text-[#60A5FA]' : 'text-gray-500 dark:text-[#64748B]'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </nav>
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
