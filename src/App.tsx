
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Campaigns from "@/pages/Campaigns";
import Settings from "@/pages/Settings";
import AuthPage from "@/pages/auth/AuthPage";
import NotFound from "./pages/NotFound";

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
              <Route index element={<Dashboard />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="leads" element={<div className="p-6">Leads page coming soon...</div>} />
              <Route path="content" element={<div className="p-6">Content page coming soon...</div>} />
              <Route path="social" element={<div className="p-6">Social page coming soon...</div>} />
              <Route path="email" element={<div className="p-6">Email page coming soon...</div>} />
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
