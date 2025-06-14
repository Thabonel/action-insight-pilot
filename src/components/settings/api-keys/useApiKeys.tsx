
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SecretsService, SecretMetadata } from '@/lib/services/secrets-service';

export const useApiKeys = () => {
  const [secrets, setSecrets] = useState<SecretMetadata[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSecrets();
  }, []);

  const fetchSecrets = async () => {
    try {
      setLoading(true);
      const secretsList = await SecretsService.listSecrets();
      setSecrets(secretsList);
    } catch (error) {
      console.error('Failed to fetch secrets:', error);
      toast({
        title: "Error",
        description: "Failed to load API keys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async (serviceId: string, value: string) => {
    setSaving(prev => ({ ...prev, [serviceId]: true }));
    
    try {
      await SecretsService.saveSecret(serviceId, value);
      await fetchSecrets();
      setInputValues(prev => ({ ...prev, [serviceId]: '' }));
      
      toast({
        title: "API Key Saved",
        description: `Successfully saved ${serviceId} API key`,
      });
    } catch (error) {
      console.error('Failed to save API key:', error);
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const deleteApiKey = async (serviceId: string) => {
    try {
      await SecretsService.deleteSecret(serviceId);
      await fetchSecrets();
      
      toast({
        title: "API Key Deleted",
        description: `Successfully deleted ${serviceId} API key`,
      });
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleVisibility = (service: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const handleInputChange = (serviceId: string, value: string) => {
    setInputValues(prev => ({ ...prev, [serviceId]: value }));
  };

  return {
    secrets,
    visibleKeys,
    saving,
    loading,
    inputValues,
    fetchSecrets,
    saveApiKey,
    deleteApiKey,
    toggleVisibility,
    handleInputChange
  };
};
