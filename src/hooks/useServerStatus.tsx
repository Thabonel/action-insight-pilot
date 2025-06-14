
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ConversationalService } from '@/lib/services/conversational-service';

type ServerStatus = 'sleeping' | 'waking' | 'awake' | 'error';

export const useServerStatus = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus>('awake');
  const [serverError, setServerError] = useState<string>('');
  const { toast } = useToast();

  const wakeUpServer = async () => {
    setServerStatus('waking');
    setServerError('');
    
    try {
      const result = await ConversationalService.wakeUpServer();
      if (result.success) {
        setServerStatus('awake');
        toast({
          title: "Server Ready",
          description: "AI assistant is now active and ready to use.",
        });
      } else {
        setServerStatus('error');
        setServerError(result.error || 'Failed to wake up server');
        toast({
          title: "Wake Up Failed",
          description: result.error || "Failed to wake up the server",
          variant: "destructive",
        });
      }
    } catch (error) {
      setServerStatus('error');
      setServerError('Unexpected error during server wake-up');
      toast({
        title: "Wake Up Error",
        description: "An unexpected error occurred while waking up the server",
        variant: "destructive",
      });
    }
  };

  const setServerSleeping = () => {
    setServerStatus('sleeping');
  };

  const handleServerError = (error: string) => {
    setServerStatus('error');
    setServerError(error);
  };

  return {
    serverStatus,
    serverError,
    wakeUpServer,
    setServerSleeping,
    setServerError: handleServerError
  };
};
