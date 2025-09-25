
// Backend deployment fix - moved render.yaml to root for proper monorepo setup

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppRouter from '@/components/AppRouter';
import Index from '@/pages/Index';
import AuthPage from '@/pages/auth/AuthPage';
import OAuthCallback from '@/pages/auth/OAuthCallback';
import HelpPage from '@/pages/HelpPage';
import { Toaster } from "@/components/ui/toaster";
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { OnboardingOverlay } from '@/components/onboarding/OnboardingOverlay';
import { ContentIdeasProvider } from '@/contexts/ContentIdeasContext';

function App() {
  return (
    <OnboardingProvider>
      <ContentIdeasProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/app/*" element={<AppRouter />} />
        </Routes>
        <OnboardingOverlay />
        <Toaster />
      </ContentIdeasProvider>
    </OnboardingProvider>
  );
}

export default App;
