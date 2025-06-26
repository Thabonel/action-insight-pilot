import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BarChart3, Users, Target, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
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
import OAuthCallback from '@/pages/OAuthCallback'
import { useAuth } from '@/contexts/AuthContext'

const AppRouter: React.FC = () => {
  const { user } = useAuth()

  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Marketing with <span className="text-blue-600">AI-Powered</span> Intelligence
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline campaigns, convert leads, and amplify your brand with our comprehensive marketing platform
          </p>
          <Link to="/app">
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Smart Analytics</CardTitle>
              <CardDescription>
                Get real-time insights and predictive analytics to optimize your marketing performance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                Capture, score, and nurture leads with AI-powered automation and personalized experiences
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <Target className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Campaign Builder</CardTitle>
              <CardDescription>
                Create multi-channel campaigns with intelligent targeting and automated optimization
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/app/dashboard" replace />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
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
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default AppRouter