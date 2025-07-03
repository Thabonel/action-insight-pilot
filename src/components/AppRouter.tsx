import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BarChart3, Users, Target, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import ConversationalDashboard from '@/pages/ConversationalDashboard'
import Campaigns from '@/pages/Campaigns'
import Leads from '@/pages/Leads'
import Content from '@/pages/Content'
import Analytics from '@/pages/Analytics'
import Tools from '@/pages/Tools'
import Settings from '@/pages/Settings'
import CampaignDetails from '@/pages/CampaignDetails'
import Social from '@/pages/Social'
import Proposals from '@/pages/Proposals'
import UserManual from '@/pages/UserManual'
import ConnectPlatforms from '@/pages/ConnectPlatforms'
import LandingPageBuilder from '@/pages/LandingPageBuilder'
import { KeywordResearch } from '@/pages/KeywordResearch'
import { useAuth } from '@/contexts/AuthContext'

const AppRouter: React.FC = () => {
  const { user } = useAuth()


  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="conversational-dashboard" replace />} />
        <Route path="conversational-dashboard" element={<ConversationalDashboard />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="campaigns/:id" element={<CampaignDetails />} />
        <Route path="leads" element={<Leads />} />
        <Route path="content" element={<Content />} />
        <Route path="social" element={<Social />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="proposals" element={<Proposals />} />
        <Route path="settings" element={<Settings />} />
        <Route path="tools" element={<Tools />} />
        <Route path="user-manual" element={<UserManual />} />
        <Route path="connect-platforms" element={<ConnectPlatforms />} />
        <Route path="landing-page-builder" element={<LandingPageBuilder />} />
        <Route path="keyword-research" element={<KeywordResearch />} />
        <Route path="*" element={<Navigate to="/app/conversational-dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default AppRouter