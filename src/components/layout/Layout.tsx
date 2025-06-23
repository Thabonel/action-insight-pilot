
import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default Layout;
