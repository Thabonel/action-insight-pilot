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
import Login from '@/pages/Login';
import { useAuth } from '@/lib/auth';

const AppRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/dashboard" element={<Dashboard />} />
        
        {/* Redirect broken campaigns route to working Campaign Intelligence Hub */}
        <Route path="/app/campaigns" element={<Navigate to="/app/campaign-management" replace />} />
        <Route path="/app/campaign-management" element={<CampaignManagement />} />
        
        <Route path="/app/customer-segmentation" element={<CustomerSegmentation />} />
        <Route path="/app/content" element={<Content />} />
        <Route path="/app/analytics" element={<Analytics />} />
        <Route path="/app/landing-page-builder" element={<LandingPageBuilder />} />
        <Route path="/app/settings" element={<Settings />} />
        <Route path="/app/tools" element={<Tools />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default AppRouter;