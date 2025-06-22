import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from './Layout';
import ProtectedRoute from './ProtectedRoute';
import PublicHomepage from '@/pages/PublicHomepage';
import AuthPage from '@/pages/auth/AuthPage';
import Dashboard from '@/pages/Dashboard';
import ConversationalDashboard from '@/pages/ConversationalDashboard';
import Campaigns from '@/pages/Campaigns';
import CampaignDetails from '@/pages/CampaignDetails';
import CampaignManagement from '@/pages/CampaignManagement';
import Leads from '@/pages/Leads';
import Email from '@/pages/Email';
import Social from '@/pages/Social';
import Content from '@/pages/Content';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Workflows from '@/pages/Workflows';
import ConnectPlatforms from '@/pages/ConnectPlatforms';
import NotFound from '@/pages/NotFound';
import Proposals from '@/pages/Proposals';
import UserManual from '@/pages/UserManual';
import CompetitiveIntelligence from '@/pages/CompetitiveIntelligence';
import CreativeWorkflow from '@/pages/CreativeWorkflow';

const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/app/dashboard" replace /> : <PublicHomepage />} />
      <Route path="/auth" element={user ? <Navigate to="/app/dashboard" replace /> : <AuthPage />} />
      
      {/* Protected app routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="chat" element={<ConversationalDashboard />} />
        <Route path="conversational-dashboard" element={<ConversationalDashboard />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="campaigns/:id" element={<CampaignDetails />} />
        <Route path="campaign-management" element={<CampaignManagement />} />
        <Route path="leads" element={<Leads />} />
        <Route path="email" element={<Email />} />
        <Route path="social" element={<Social />} />
        <Route path="content" element={<Content />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="workflows" element={<Workflows />} />
        <Route path="competitive-intelligence" element={<CompetitiveIntelligence />} />
        <Route path="creative-workflow" element={<CreativeWorkflow />} />
        <Route path="connect-platforms" element={<ConnectPlatforms />} />
        <Route path="proposals" element={<Proposals />} />
        <Route path="settings" element={<Settings />} />
        <Route path="user-manual" element={<UserManual />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;