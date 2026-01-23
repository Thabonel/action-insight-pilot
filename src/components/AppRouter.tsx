import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import PageLoader from '@/components/common/PageLoader'

// Lazy load all page components for better code splitting
const ConversationalDashboard = lazy(() => import('@/pages/ConversationalDashboard'))
const ActionInsightQuickStart = lazy(() => import('@/components/ActionInsightQuickStart'))
const ViralVideoMarketing = lazy(() => import('@/pages/ViralVideoMarketing'))
const CampaignBriefGenerator = lazy(() => import('@/components/CampaignBriefGenerator'))
const AICampaignCopilotPage = lazy(() => import('@/pages/AICampaignCopilotPage'))
const Campaigns = lazy(() => import('@/pages/Campaigns'))
const CampaignManagement = lazy(() => import('@/pages/CampaignManagement'))
const Leads = lazy(() => import('@/pages/Leads'))
const LeadCaptureForms = lazy(() => import('@/pages/LeadCaptureForms'))
const Content = lazy(() => import('@/pages/Content'))
const Email = lazy(() => import('@/pages/Email'))
const Analytics = lazy(() => import('@/pages/Analytics'))
const Settings = lazy(() => import('@/pages/Settings'))
const CampaignDetails = lazy(() => import('@/pages/CampaignDetails'))
const Social = lazy(() => import('@/pages/Social'))
const Proposals = lazy(() => import('@/pages/Proposals'))
const UserManual = lazy(() => import('@/pages/UserManual'))
const ConnectPlatforms = lazy(() => import('@/pages/ConnectPlatforms'))
const LandingPageBuilder = lazy(() => import('@/pages/LandingPageBuilder'))
const KeywordResearch = lazy(() => import('@/pages/KeywordResearch').then(m => ({ default: m.KeywordResearch })))
const KnowledgeManagement = lazy(() => import('@/components/knowledge/KnowledgeManagement'))
const SimpleDashboard = lazy(() => import('@/pages/SimpleDashboard'))
const AutopilotSetup = lazy(() => import('@/pages/AutopilotSetup'))
const OrganicMarketingPage = lazy(() => import('@/pages/OrganicMarketingPage'))
const RemotionStudio = lazy(() => import('@/pages/RemotionStudio'))
const AIVideoStudio = lazy(() => import('@/pages/AIVideoStudio'))

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="autopilot" replace />} />

        {/* Autopilot Routes */}
        <Route path="autopilot" element={
          <Suspense fallback={<PageLoader />}>
            <SimpleDashboard />
          </Suspense>
        } />
        <Route path="autopilot/setup" element={
          <Suspense fallback={<PageLoader />}>
            <AutopilotSetup />
          </Suspense>
        } />

        {/* Advanced Mode Routes */}
        <Route path="conversational-dashboard" element={
          <Suspense fallback={<PageLoader />}>
            <ConversationalDashboard />
          </Suspense>
        } />
        <Route path="getting-started" element={
          <Suspense fallback={<PageLoader />}>
            <ActionInsightQuickStart />
          </Suspense>
        } />
        <Route path="campaigns" element={
          <Suspense fallback={<PageLoader />}>
            <Campaigns />
          </Suspense>
        } />
        <Route path="campaign-management" element={
          <Suspense fallback={<PageLoader />}>
            <CampaignManagement />
          </Suspense>
        } />
        <Route path="campaigns/ai-generator" element={
          <Suspense fallback={<PageLoader />}>
            <CampaignBriefGenerator />
          </Suspense>
        } />
        <Route path="campaigns/copilot" element={
          <Suspense fallback={<PageLoader />}>
            <AICampaignCopilotPage />
          </Suspense>
        } />
        <Route path="campaigns/new" element={
          <Suspense fallback={<PageLoader />}>
            <CampaignDetails />
          </Suspense>
        } />
        <Route path="campaigns/:id" element={
          <Suspense fallback={<PageLoader />}>
            <CampaignDetails />
          </Suspense>
        } />
        <Route path="leads" element={
          <Suspense fallback={<PageLoader />}>
            <Leads />
          </Suspense>
        } />
        <Route path="lead-capture-forms" element={
          <Suspense fallback={<PageLoader />}>
            <LeadCaptureForms />
          </Suspense>
        } />
        <Route path="content" element={
          <Suspense fallback={<PageLoader />}>
            <Content />
          </Suspense>
        } />
        <Route path="organic" element={
          <Suspense fallback={<PageLoader />}>
            <OrganicMarketingPage />
          </Suspense>
        } />
        <Route path="social" element={
          <Suspense fallback={<PageLoader />}>
            <Social />
          </Suspense>
        } />
        <Route path="email" element={
          <Suspense fallback={<PageLoader />}>
            <Email />
          </Suspense>
        } />
        <Route path="analytics" element={
          <Suspense fallback={<PageLoader />}>
            <Analytics />
          </Suspense>
        } />
        <Route path="viral-video-marketing" element={
          <Suspense fallback={<PageLoader />}>
            <ViralVideoMarketing />
          </Suspense>
        } />
        <Route path="video-studio" element={
          <Suspense fallback={<PageLoader />}>
            <RemotionStudio />
          </Suspense>
        } />
        <Route path="ai-video-studio" element={
          <Suspense fallback={<PageLoader />}>
            <AIVideoStudio />
          </Suspense>
        } />
        <Route path="proposals" element={
          <Suspense fallback={<PageLoader />}>
            <Proposals />
          </Suspense>
        } />
        <Route path="knowledge" element={
          <Suspense fallback={<PageLoader />}>
            <KnowledgeManagement />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        } />
        <Route path="user-manual" element={
          <Suspense fallback={<PageLoader />}>
            <UserManual />
          </Suspense>
        } />
        <Route path="connect-platforms" element={
          <Suspense fallback={<PageLoader />}>
            <ConnectPlatforms />
          </Suspense>
        } />
        <Route path="landing-page-builder" element={
          <Suspense fallback={<PageLoader />}>
            <LandingPageBuilder />
          </Suspense>
        } />
        <Route path="keyword-research" element={
          <Suspense fallback={<PageLoader />}>
            <KeywordResearch />
          </Suspense>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/app/autopilot" replace />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
