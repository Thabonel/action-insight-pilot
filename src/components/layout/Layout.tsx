
import React, { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Users,
  FileText,
  Share2,
  Mail,
  BarChart3,
  Workflow,
  FileCheck,
  Settings,
  BookOpen,
  Link,
  LogOut,
  User,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMode } from '@/hooks/useUserMode';
import ModeSwitcher from '@/components/layout/ModeSwitcher';
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

  // Simple Mode Navigation (3 items)
  const simpleNavItems = [
    {
      name: 'Autopilot Dashboard',
      href: '/app/autopilot',
      icon: Sparkles,
      description: 'Your marketing results'
    },
    {
      name: 'AI Chat',
      href: '/app/conversational-dashboard',
      icon: LayoutDashboard,
      description: 'Ask me anything'
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: Settings,
      description: 'Configure autopilot'
    }
  ];

  // Advanced Mode Navigation (All items)
  const advancedNavItems = [
    {
      name: 'Autopilot',
      href: '/app/autopilot',
      icon: Sparkles,
      description: 'Marketing automation'
    },
    {
      name: 'AI Dashboard',
      href: '/app/conversational-dashboard',
      icon: LayoutDashboard,
      description: 'AI-powered insights & chat'
    },
    {
      name: 'Admin Dashboard',
      href: '/app/admin',
      icon: Shield,
      description: 'Business metrics & system'
    },
    {
      name: 'Campaign Management',
      href: '/app/campaign-management',
      icon: Zap,
      description: 'Advanced campaign tools'
    },
    {
      name: 'Leads',
      href: '/app/leads',
      icon: Users,
      description: 'Lead management'
    },
    {
      name: 'Content',
      href: '/app/content',
      icon: FileText,
      description: 'Content creation'
    },
    {
      name: 'Social',
      href: '/app/social',
      icon: Share2,
      description: 'Social media'
    },
    {
      name: 'Email',
      href: '/app/email',
      icon: Mail,
      description: 'Email automation'
    },
    {
      name: 'Analytics',
      href: '/app/analytics',
      icon: BarChart3,
      description: 'Performance metrics'
    },
    {
      name: 'Workflows',
      href: '/app/workflows',
      icon: Workflow,
      description: 'Automation workflows'
    },
    {
      name: 'Proposals',
      href: '/app/proposals',
      icon: FileCheck,
      description: 'Proposal generation'
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: Settings,
      description: 'System configuration'
    },
    {
      name: 'User Manual',
      href: '/app/user-manual',
      icon: BookOpen,
      description: 'Documentation'
    },
    {
      name: 'Connect Platforms',
      href: '/app/connect-platforms',
      icon: Link,
      description: 'Integration setup'
    }
  ];

  // Select navigation items based on current mode
  const navItems = mode === 'simple' ? simpleNavItems : advancedNavItems;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">AI Marketing Hub</h2>
          <p className="text-sm text-gray-600 mt-1">Intelligent Automation Platform</p>

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
                  <User className="h-4 w-4 text-blue-600" />
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
                    <LogOut className="h-4 w-4 mr-2" />
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
              const Icon = item.icon;
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
                  <Icon 
                    className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
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
