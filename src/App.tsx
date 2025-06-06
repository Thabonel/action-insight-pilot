
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ConversationalDashboard from "@/pages/ConversationalDashboard";
import Campaigns from "@/pages/Campaigns";
import CampaignManagement from "@/pages/CampaignManagement";
import Settings from "@/pages/Settings";
import AuthPage from "@/pages/auth/AuthPage";
import NotFound from "./pages/NotFound";
import Leads from "@/pages/Leads";
import Content from "@/pages/Content";
import Social from "@/pages/Social";
import Email from "@/pages/Email";
import Analytics from "@/pages/Analytics";
import Workflows from "@/pages/Workflows";
import UserManual from "@/pages/UserManual";
import Proposals from "@/pages/Proposals";
import ConnectPlatforms from "@/pages/ConnectPlatforms";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<ConversationalDashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="campaign-management" element={<CampaignManagement />} />
                <Route path="leads" element={<Leads />} />
                <Route path="content" element={<Content />} />
                <Route path="social" element={<Social />} />
                <Route path="email" element={<Email />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="workflows" element={<Workflows />} />
                <Route path="proposals" element={<Proposals />} />
                <Route path="connect-platforms" element={<ConnectPlatforms />} />
                <Route path="settings" element={<Settings />} />
                <Route path="user-manual" element={<UserManual />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
