
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRouter from '@/components/AppRouter';
import Index from '@/pages/Index';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/app/*" element={<AppRouter />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
