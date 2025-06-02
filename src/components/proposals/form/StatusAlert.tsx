
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

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
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load proposal templates from database. Please check your connection and try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (backendAvailable && hasTemplates) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Connected to Supabase - {templateCount} templates loaded and ready to use
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default StatusAlert;
