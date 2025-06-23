
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Campaigns from '@/pages/Campaigns';
import CampaignManagement from '@/pages/CampaignManagement';
import CustomerSegmentation from '@/pages/CustomerSegmentation';
import Content from '@/pages/Content';
import Analytics from '@/pages/Analytics';
import LandingPageBuilder from '@/pages/LandingPageBuilder';
import Settings from '@/pages/Settings';
import Tools from '@/pages/Tools';
import { useAuth } from '@/contexts/AuthContext';

const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/campaigns" element={<Navigate to="/campaign-management" replace />} />
        <Route path="/campaign-management" element={<CampaignManagement />} />
        <Route path="/customer-segmentation" element={<CustomerSegmentation />} />
        <Route path="/content" element={<Content />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/landing-page-builder" element={<LandingPageBuilder />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default AppRouter;
