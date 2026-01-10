
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StatusAlertProps {
  backendAvailable: boolean;
  hasTemplates: boolean;
  templateCount: number;
  onRetryConnection?: () => void;
}

const StatusAlert: React.FC<StatusAlertProps> = ({
  backendAvailable,
  hasTemplates,
  templateCount
}) => {
  if (!backendAvailable) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Unable to load proposal templates from database. Please check your connection and try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (backendAvailable && hasTemplates) {
    return (
      <Alert>
        <AlertDescription>
          Connected to Supabase - {templateCount} templates loaded and ready to use
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default StatusAlert;
