
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PublicHomepage from './PublicHomepage';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show public homepage for unauthenticated users, redirect authenticated users to dashboard
  return user ? <Navigate to="/dashboard" replace /> : <PublicHomepage />;
};

export default Index;
