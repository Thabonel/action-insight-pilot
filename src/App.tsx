
// Backend deployment fix - fixed router imports in main.py

import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import PageLoader from '@/components/common/PageLoader';
import { Toaster } from "@/components/ui/toaster";
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { OnboardingOverlay } from '@/components/onboarding/OnboardingOverlay';
import { ContentIdeasProvider } from '@/contexts/ContentIdeasContext';
import { UserModeProvider } from '@/hooks/useUserMode';

// Lazy load all non-critical routes
const AppRouter = lazy(() => import('@/components/AppRouter'));
const AuthPage = lazy(() => import('@/pages/auth/AuthPage'));
const OAuthCallback = lazy(() => import('@/pages/auth/OAuthCallback'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const CookiePolicy = lazy(() => import('@/pages/CookiePolicy'));
const AcceptableUsePolicy = lazy(() => import('@/pages/AcceptableUsePolicy'));
const PublicAssessmentPage = lazy(() => import('@/pages/PublicAssessmentPage'));

function App() {
  return (
    <OnboardingProvider>
      <ContentIdeasProvider>
        <UserModeProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={
              <Suspense fallback={<PageLoader />}>
                <AuthPage />
              </Suspense>
            } />
            <Route path="/oauth/callback" element={
              <Suspense fallback={<PageLoader />}>
                <OAuthCallback />
              </Suspense>
            } />
            <Route path="/help" element={
              <Suspense fallback={<PageLoader />}>
                <HelpPage />
              </Suspense>
            } />
            <Route path="/privacy" element={
              <Suspense fallback={<PageLoader />}>
                <PrivacyPolicy />
              </Suspense>
            } />
            <Route path="/terms" element={
              <Suspense fallback={<PageLoader />}>
                <TermsOfService />
              </Suspense>
            } />
            <Route path="/cookies" element={
              <Suspense fallback={<PageLoader />}>
                <CookiePolicy />
              </Suspense>
            } />
            <Route path="/acceptable-use" element={
              <Suspense fallback={<PageLoader />}>
                <AcceptableUsePolicy />
              </Suspense>
            } />
            <Route path="/a/:assessmentId" element={
              <Suspense fallback={<PageLoader />}>
                <PublicAssessmentPage />
              </Suspense>
            } />
            <Route path="/app/*" element={
              <Suspense fallback={<PageLoader />}>
                <AppRouter />
              </Suspense>
            } />
          </Routes>
          <OnboardingOverlay />
          <Toaster />
        </UserModeProvider>
      </ContentIdeasProvider>
    </OnboardingProvider>
  );
}

export default App;
