
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

// Pages
import Index from '@/pages/Index';
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
import AuthPage from '@/pages/auth/AuthPage';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="conversational-dashboard" element={
                    <ProtectedRoute>
                      <ConversationalDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="campaigns" element={
                    <ProtectedRoute>
                      <Campaigns />
                    </ProtectedRoute>
                  } />
                  <Route path="campaigns/:id" element={
                    <ProtectedRoute>
                      <CampaignDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="campaign-management" element={
                    <ProtectedRoute>
                      <CampaignManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="leads" element={
                    <ProtectedRoute>
                      <Leads />
                    </ProtectedRoute>
                  } />
                  <Route path="content" element={
                    <ProtectedRoute>
                      <Content />
                    </ProtectedRoute>
                  } />
                  <Route path="social" element={
                    <ProtectedRoute>
                      <Social />
                    </ProtectedRoute>
                  } />
                  <Route path="email" element={
                    <ProtectedRoute>
                      <Email />
                    </ProtectedRoute>
                  } />
                  <Route path="analytics" element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  <Route path="workflows" element={
                    <ProtectedRoute>
                      <Workflows />
                    </ProtectedRoute>
                  } />
                  <Route path="proposals" element={
                    <ProtectedRoute>
                      <Proposals />
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="user-manual" element={<UserManual />} />
                  <Route path="connect-platforms" element={
                    <ProtectedRoute>
                      <ConnectPlatforms />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </div>
            <Toaster />
          </Router>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
