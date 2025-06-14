
import React from 'react';
import { ApiKeyConfig } from './ApiKeyConfig';
import { SecretMetadata } from '@/lib/services/secrets-service';
import ApiKeyRow from './ApiKeyRow';

interface ApiKeySectionProps {
  configs: ApiKeyConfig[];
  secrets: SecretMetadata[];
  inputValues: Record<string, string>;
  visibleKeys: Record<string, boolean>;
  saving: Record<string, boolean>;
  onInputChange: (serviceId: string, value: string) => void;
  onToggleVisibility: (serviceId: string) => void;
  onSave: (serviceId: string, value: string) => void;
  onDelete: (serviceId: string) => void;
}

const ApiKeySection: React.FC<ApiKeySectionProps> = ({
  configs,
  secrets,
  inputValues,
  visibleKeys,
  saving,
  onInputChange,
  onToggleVisibility,
  onSave,
  onDelete
}) => {
  const hasSecret = (serviceId: string) => {
    return secrets.some(secret => secret.service_name === serviceId);
  };

  const getSecretMetadata = (serviceId: string) => {
    return secrets.find(secret => secret.service_name === serviceId);
  };

  return (
    <div className="space-y-4">
      {configs.map((config) => (
        <ApiKeyRow
          key={config.id}
          config={config}
          inputValue={inputValues[config.id] || ''}
          isVisible={visibleKeys[config.id] || false}
          isSaving={saving[config.id] || false}
          secretExists={hasSecret(config.id)}
          secretMeta={getSecretMetadata(config.id)}
          onInputChange={(value) => onInputChange(config.id, value)}
          onToggleVisibility={() => onToggleVisibility(config.id)}
          onSave={() => onSave(config.id, inputValues[config.id] || '')}
          onDelete={() => onDelete(config.id)}
        />
      ))}
    </div>
  );
};

export default ApiKeySection;
