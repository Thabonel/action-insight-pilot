
import React from 'react';
import SocialPlatformConnectors from './integrations/SocialPlatformConnectors';
import UserApiKeysSettings from './UserApiKeysSettings';
import ThirdPartyIntegrations from './integrations/ThirdPartyIntegrations';
import WebhookManagement from './integrations/WebhookManagement';
import ApiAccess from './integrations/ApiAccess';
import DataSyncSettings from './integrations/DataSyncSettings';

const IntegrationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
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
