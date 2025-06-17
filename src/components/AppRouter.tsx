import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Settings from '@/pages/Settings';
import Dashboard from '@/pages/Dashboard';
import ConversationalDashboard from '@/pages/ConversationalDashboard';
import Campaigns from '@/pages/Campaigns';
import CampaignManagement from '@/pages/CampaignManagement';
import Leads from '@/pages/Leads';
import Content from '@/pages/Content';
import Social from '@/pages/Social';
import Email from '@/pages/Email';
import Analytics from '@/pages/Analytics';
import Workflows from '@/pages/Workflows';
import Proposals from '@/pages/Proposals';
import UserManual from '@/pages/UserManual';
import ConnectPlatforms from '@/pages/ConnectPlatforms';
import AuthPage from '@/pages/auth/AuthPage';
import Index from '@/pages/Index';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Index />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="conversational-dashboard" element={<ConversationalDashboard />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaign-management" element={<CampaignManagement />} />
          <Route path="leads" element={<Leads />} />
          <Route path="content" element={<Content />} />
          <Route path="social" element={<Social />} />
          <Route path="email" element={<Email />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="settings" element={<Settings />} />
          <Route path="user-manual" element={<UserManual />} />
          <Route path="connect-platforms" element={<ConnectPlatforms />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
