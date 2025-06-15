
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import all pages
import AuthPage from '@/pages/auth/AuthPage';
import Dashboard from '@/pages/Dashboard';
import ConversationalDashboard from '@/pages/ConversationalDashboard';
import Campaigns from '@/pages/Campaigns';
import CampaignDetails from '@/pages/CampaignDetails';
import CampaignManagement from '@/pages/CampaignManagement';
import Leads from '@/pages/Leads';
import Content from '@/pages/Content';
import Social from '@/pages/Social';
import Email from '@/pages/Email';
import Analytics from '@/pages/Analytics';
import Workflows from '@/pages/Workflows';
import Proposals from '@/pages/Proposals';
import Settings from '@/pages/Settings';
import UserManual from '@/pages/UserManual';
import ConnectPlatforms from '@/pages/ConnectPlatforms';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const router = createBrowserRouter([
    {
      path: "/auth",
      element: <AuthPage />
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/conversational-dashboard" replace />
        },
        {
          path: "dashboard",
          element: <Dashboard />
        },
        {
          path: "conversational-dashboard",
          element: <ConversationalDashboard />
        },
        {
          path: "campaigns",
          element: <Campaigns />
        },
        {
          path: "campaigns/:id",
          element: <CampaignDetails />
        },
        {
          path: "campaign-management",
          element: <CampaignManagement />
        },
        {
          path: "leads",
          element: <Leads />
        },
        {
          path: "content",
          element: <Content />
        },
        {
          path: "social",
          element: <Social />
        },
        {
          path: "email",
          element: <Email />
        },
        {
          path: "analytics",
          element: <Analytics />
        },
        {
          path: "workflows",
          element: <Workflows />
        },
        {
          path: "proposals",
          element: <Proposals />
        },
        {
          path: "settings",
          element: <Settings />
        },
        {
          path: "user-manual",
          element: <UserManual />
        },
        {
          path: "connect-platforms",
          element: <ConnectPlatforms />
        }
      ]
    },
    {
      path: "*",
      element: <NotFound />
    }
  ]);

  return <RouterProvider router={router} />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
