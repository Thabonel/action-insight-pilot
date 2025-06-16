
import React from 'react';
import SocialPlatformConnectors from './integrations/SocialPlatformConnectors';
import UserApiKeysSettings from './UserApiKeysSettings';
import ThirdPartyIntegrations from './integrations/ThirdPartyIntegrations';
import WebhookManagement from './integrations/WebhookManagement';
import ApiAccess from './integrations/ApiAccess';
import DataSyncSettings from './integrations/DataSyncSettings';
import PlatformCredentialsSetup from './integrations/PlatformCredentialsSetup';
import KnowledgeManagement from '../knowledge/KnowledgeManagement';
import MCPConnectors from './integrations/MCPConnectors';

const IntegrationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <MCPConnectors />
      <PlatformCredentialsSetup />
      <KnowledgeManagement />
      <SocialPlatformConnectors />
      <UserApiKeysSettings />
      <ThirdPartyIntegrations />
      <WebhookManagement />
      <ApiAccess />
      <DataSyncSettings />
    </div>
  );
};

export default IntegrationSettings;
