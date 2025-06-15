
import React from 'react';
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
  Link
} from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { 
      name: 'Conversational Dashboard', 
      href: '/conversational-dashboard', 
      icon: LayoutDashboard,
      description: 'AI-powered insights'
    },
    { 
      name: 'Classic Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Traditional view'
    },
    { 
      name: 'Campaigns', 
      href: '/campaigns', 
      icon: Zap,
      description: 'Marketing campaigns'
    },
    { 
      name: 'Campaign Management', 
      href: '/campaign-management', 
      icon: Zap,
      description: 'Advanced campaign tools'
    },
    { 
      name: 'Leads', 
      href: '/leads', 
      icon: Users,
      description: 'Lead management'
    },
    { 
      name: 'Content', 
      href: '/content', 
      icon: FileText,
      description: 'Content creation'
    },
    { 
      name: 'Social', 
      href: '/social', 
      icon: Share2,
      description: 'Social media'
    },
    { 
      name: 'Email', 
      href: '/email', 
      icon: Mail,
      description: 'Email automation'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3,
      description: 'Performance metrics'
    },
    { 
      name: 'Workflows', 
      href: '/workflows', 
      icon: Workflow,
      description: 'Automation workflows'
    },
    { 
      name: 'Proposals', 
      href: '/proposals', 
      icon: FileCheck,
      description: 'Proposal generation'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      description: 'System configuration'
    },
    { 
      name: 'User Manual', 
      href: '/user-manual', 
      icon: BookOpen,
      description: 'Documentation'
    },
    { 
      name: 'Connect Platforms', 
      href: '/connect-platforms', 
      icon: Link,
      description: 'Integration setup'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">AI Marketing Hub</h2>
          <p className="text-sm text-gray-600 mt-1">Intelligent Automation Platform</p>
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
