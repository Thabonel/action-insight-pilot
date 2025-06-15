
import React from 'react';
import SocialPlatformConnectors from './integrations/SocialPlatformConnectors';
import UserApiKeysSettings from './UserApiKeysSettings';
import ThirdPartyIntegrations from './integrations/ThirdPartyIntegrations';
import WebhookManagement from './integrations/WebhookManagement';
import ApiAccess from './integrations/ApiAccess';
import DataSyncSettings from './integrations/DataSyncSettings';
import PlatformCredentialsSetup from './integrations/PlatformCredentialsSetup';

const IntegrationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <PlatformCredentialsSetup />
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
