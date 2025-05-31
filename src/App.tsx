import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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

const queryClient = new QueryClient();

const App = () => (
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
              <Route path="analytics" element={<div className="p-6">Analytics page coming soon...</div>} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
