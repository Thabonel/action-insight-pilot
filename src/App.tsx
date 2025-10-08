
// Backend deployment fix - fixed router imports in main.py

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
import { UserModeProvider } from '@/hooks/useUserMode';

function App() {
  return (
    <OnboardingProvider>
      <ContentIdeasProvider>
        <UserModeProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/app/*" element={<AppRouter />} />
          </Routes>
          <OnboardingOverlay />
          <Toaster />
        </UserModeProvider>
      </ContentIdeasProvider>
    </OnboardingProvider>
  );
}

export default App;
