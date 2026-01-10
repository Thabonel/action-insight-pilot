
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import WorkspaceSettings from '@/components/settings/WorkspaceSettings';
import UserRoleManagement from '@/components/settings/UserRoleManagement';
import AIBehaviorSettings from '@/components/settings/AIBehaviorSettings';
import IntegrationSettings from '@/components/settings/IntegrationSettings';
import ExportDataSettings from '@/components/settings/ExportDataSettings';
import AdminDashboard from '@/components/settings/AdminDashboard';
import OnboardingFlow from '@/components/settings/OnboardingFlow';
import SystemPreferences from '@/components/settings/SystemPreferences';
import AccountSettings from '@/components/settings/AccountSettings';
import { useUserRole } from '@/hooks/useUserRole';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workspace');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { role: userRole, loading } = useUserRole();

  const settingsSections = [
    {
      id: 'workspace',
      name: 'Workspace',
      description: 'Company settings and configuration',
      enterprise: false
    },
    {
      id: 'account',
      name: 'Account & Privacy',
      description: 'Account settings and data management',
      enterprise: false
    },
    {
      id: 'users',
      name: 'Users & Roles',
      description: 'Manage team members and permissions',
      enterprise: true
    },
    {
      id: 'ai-behavior',
      name: 'AI Behavior',
      description: 'Customize AI responses and workflows',
      enterprise: false
    },
    {
      id: 'integrations',
      name: 'Integrations',
      description: 'Connect external services and APIs',
      enterprise: false
    },
    {
      id: 'export',
      name: 'Export & Backup',
      description: 'Data portability and backup options',
      enterprise: true
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      description: 'System administration and monitoring',
      enterprise: true,
      adminOnly: true
    }
  ];

  const availableSections = settingsSections.filter(section => {
    if (section.adminOnly && userRole !== 'admin') return false;
    return true;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your workspace, integrations, and AI behavior</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Setup Guide
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-fit bg-gray-100">
          {availableSections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="flex items-center space-x-2 text-black data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <span>{section.name}</span>
              {section.enterprise && (
                <Badge variant="outline" className="text-xs ml-1">Pro</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Settings Sections Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {availableSections.map((section) => (
            <Card
              key={section.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md bg-white border-gray-200 ${
                activeTab === section.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setActiveTab(section.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-black">{section.name}</h3>
                  {section.enterprise && (
                    <Badge variant="secondary" className="text-xs">
                      Enterprise
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Settings Content */}
        <TabsContent value="workspace">
          <WorkspaceSettings />
        </TabsContent>

        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="users">
          <UserRoleManagement />
        </TabsContent>

        <TabsContent value="ai-behavior">
          <AIBehaviorSettings />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationSettings />
        </TabsContent>

        <TabsContent value="export">
          <ExportDataSettings />
        </TabsContent>

        <TabsContent value="admin">
          <AdminDashboard />
        </TabsContent>
      </Tabs>

      {/* Onboarding Flow Modal */}
      {showOnboarding && (
        <OnboardingFlow onClose={() => setShowOnboarding(false)} />
      )}

      {/* System Preferences Footer */}
      <SystemPreferences />
      <PageHelpModal helpKey="settings" />
    </div>
  );
};

export default Settings;
