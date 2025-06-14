
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Save, 
  Check,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { ApiKeyConfig } from './ApiKeyConfig';
import { SecretMetadata } from '@/lib/services/secrets-service';

interface ApiKeyRowProps {
  config: ApiKeyConfig;
  inputValue: string;
  isVisible: boolean;
  isSaving: boolean;
  secretExists: boolean;
  secretMeta?: SecretMetadata;
  onInputChange: (value: string) => void;
  onToggleVisibility: () => void;
  onSave: () => void;
  onDelete: () => void;
}

const ApiKeyRow: React.FC<ApiKeyRowProps> = ({
  config,
  inputValue,
  isVisible,
  isSaving,
  secretExists,
  secretMeta,
  onInputChange,
  onToggleVisibility,
  onSave,
  onDelete
}) => {
  const validateApiKey = (config: ApiKeyConfig, value: string) => {
    if (config.required && !value) return false;
    if (value && config.validation) return config.validation(value);
    return true;
  };

  const isValid = validateApiKey(config, inputValue);
  const hasChanges = inputValue.length > 0;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{config.icon}</span>
            <Label htmlFor={config.id} className="font-medium">
              {config.name}
            </Label>
            {config.required && (
              <Badge variant="outline" className="text-xs">Required</Badge>
            )}
            {secretExists && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <div className="flex-1">
          <Input
            id={config.id}
            type={isVisible ? "text" : "password"}
            placeholder={secretExists ? "Key is saved securely" : config.placeholder}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            className={!isValid && inputValue ? "border-red-300" : ""}
          />
          {!isValid && inputValue && (
            <div className="flex items-center space-x-1 mt-1 text-red-600 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>Invalid format</span>
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleVisibility}
          disabled={!inputValue}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        
        <Button
          size="sm"
          onClick={onSave}
          disabled={!isValid || !hasChanges || isSaving}
        >
          {isSaving ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>

        {secretExists && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {secretMeta && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>Last updated: {new Date(secretMeta.updated_at).toLocaleDateString()}</p>
          {secretMeta.last_used_at && (
            <p>Last used: {new Date(secretMeta.last_used_at).toLocaleDateString()}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiKeyRow;
