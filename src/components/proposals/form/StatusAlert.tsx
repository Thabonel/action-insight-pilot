
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface StatusAlertProps {
  backendAvailable: boolean;
  hasTemplates: boolean;
  templateCount: number;
  onRetryConnection?: () => void;
}

const StatusAlert: React.FC<StatusAlertProps> = ({
  backendAvailable,
  hasTemplates,
  templateCount,
  onRetryConnection
}) => {
  if (!backendAvailable) {
    return (
      <Alert variant="destructive">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Backend server is not responding - templates cannot be loaded</span>
          {onRetryConnection && (
            <Button variant="outline" size="sm" onClick={onRetryConnection} className="ml-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (backendAvailable && hasTemplates) {
    return (
      <Alert>
        <Wifi className="h-4 w-4" />
        <AlertDescription>
          Connected to backend server - {templateCount} templates loaded
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default StatusAlert;
