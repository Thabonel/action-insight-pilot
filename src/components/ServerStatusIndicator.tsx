
import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ServerStatusIndicatorProps {
  status: 'sleeping' | 'waking' | 'awake' | 'error';
  onWakeUp?: () => void;
  errorMessage?: string;
}

const ServerStatusIndicator: React.FC<ServerStatusIndicatorProps> = ({
  status,
  onWakeUp,
  errorMessage
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'sleeping':
        return {
          icon: <WifiOff className="h-4 w-4 text-yellow-600" />,
          title: 'Server Sleeping',
          description: 'The backend server is inactive. Click to wake it up.',
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          showButton: true,
          buttonText: 'Wake Up Server'
        };
      case 'waking':
        return {
          icon: <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />,
          title: 'Waking Up Server',
          description: 'Starting up the backend server, this may take up to 60 seconds...',
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          showButton: false,
          buttonText: ''
        };
      case 'awake':
        return {
          icon: <Wifi className="h-4 w-4 text-green-600" />,
          title: 'Server Ready',
          description: 'Backend server is active and ready to process requests.',
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          showButton: false,
          buttonText: ''
        };
      case 'error':
        return {
          icon: <WifiOff className="h-4 w-4 text-red-600" />,
          title: 'Server Error',
          description: errorMessage || 'Failed to wake up the server. You can try again.',
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          showButton: true,
          buttonText: 'Retry Wake Up'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Alert className={`mb-4 ${config.bgColor}`}>
      {config.icon}
      <AlertDescription className={config.textColor}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{config.title}</div>
            <div className="text-sm mt-1">{config.description}</div>
          </div>
          {config.showButton && onWakeUp && (
            <button
              onClick={onWakeUp}
              className="ml-4 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              {config.buttonText}
            </button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ServerStatusIndicator;
