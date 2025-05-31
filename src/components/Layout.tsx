
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { 
  Home, 
  Settings as SettingsIcon, 
  Calendar, 
  MessageSquare, 
  ChevronDown 
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string, feature: string) => {
    behaviorTracker.trackAction('navigation', feature, { from: location.pathname, to: path });
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, feature: 'dashboard' },
    { name: 'Campaigns', href: '/campaigns', icon: Calendar, feature: 'campaigns' },
    { name: 'Leads', href: '/leads', icon: MessageSquare, feature: 'leads' },
    { name: 'Content', href: '/content', icon: Calendar, feature: 'content' },
    { name: 'Social', href: '/social', icon: MessageSquare, feature: 'social' },
    { name: 'Email', href: '/email', icon: MessageSquare, feature: 'email' },
    { name: 'Analytics', href: '/analytics', icon: Calendar, feature: 'analytics' },
    { name: 'Workflows', href: '/workflows', icon: SettingsIcon, feature: 'workflows' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-slate-900">MarketingAI</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href, item.feature)}
                    className={`${
                      location.pathname === item.href
                        ? 'border-blue-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="relative ml-3">
                <div className="relative">
                  <button
                    onClick={() => handleNavigation('/settings', 'settings')}
                    className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
