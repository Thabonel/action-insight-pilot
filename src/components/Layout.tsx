import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  PlusCircle, 
  Users, 
  Share2, 
  Calendar, 
  Mail, 
  TrendingUp, 
  GitBranch,
  Settings as SettingsIcon, 
  LogOut,
  BookOpen,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navigation = [
    { name: 'AI Dashboard', href: '/conversational-dashboard', icon: BarChart3, description: 'Conversational AI interface' },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, description: 'Performance overview' },
    { name: 'Campaigns', href: '/campaigns', icon: PlusCircle, description: 'Marketing campaigns' },
    { name: 'Leads', href: '/leads', icon: Users, description: 'Lead generation & scoring' },
    { name: 'Content', href: '/content', icon: Share2, description: 'AI content creation' },
    { name: 'Social', href: '/social', icon: Calendar, description: 'Social media management' },
    { name: 'Email', href: '/email', icon: Mail, description: 'Email automation' },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp, description: 'Performance insights' },
    { name: 'Workflows', href: '/workflows', icon: GitBranch, description: 'Automation workflows' },
    { name: 'Proposals', href: '/proposals', icon: FileText, description: 'AI proposal generator' },
  ];

  const bottomNavigation = [
    { name: 'User Manual', href: '/user-manual', icon: BookOpen, description: 'Complete platform guide' },
    { name: 'Settings', href: '/settings', icon: SettingsIcon, description: 'Account settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const NavLink = ({ item, onClick }: { item: any; onClick?: () => void }) => (
    <Link
      to={item.href}
      onClick={onClick}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        isActive(item.href)
          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <item.icon
        className={`mr-3 h-5 w-5 transition-colors duration-200 ${
          isActive(item.href) ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'
        }`}
      />
      <div className="flex-1">
        <div className="font-medium">{item.name}</div>
        <div className="text-xs text-slate-500 group-hover:text-slate-600">
          {item.description}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Agentic AI</h1>
                <p className="text-xs text-slate-500">Marketing Platform</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} onClick={() => setSidebarOpen(false)} />
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-slate-200 px-4 py-4 space-y-1">
            {bottomNavigation.map((item) => (
              <NavLink key={item.name} item={item} onClick={() => setSidebarOpen(false)} />
            ))}
          </div>

          {/* User section */}
          <div className="border-t border-slate-200 px-4 py-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-slate-600 font-medium text-sm">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-slate-500">Marketing Manager</p>
              </div>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-slate-600 hover:text-slate-900"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <span className="font-semibold text-slate-900">Agentic AI</span>
            </div>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
