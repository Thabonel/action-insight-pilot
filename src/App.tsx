
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppRouter from '@/components/AppRouter';
import Index from '@/pages/Index';
import AuthPage from '@/pages/auth/AuthPage';
import OAuthCallback from '@/pages/auth/OAuthCallback';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/app/*" element={<AppRouter />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
