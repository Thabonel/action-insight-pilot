
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

interface WorkspaceSettingsProps {
  name?: string;
  domain?: string;
  industry?: string;
  teamSize?: string;
}

const WorkspaceSettings: React.FC = () => {
  const [settings, setSettings] = useState<WorkspaceSettingsProps>({
    name: '',
    domain: '',
    industry: '',
    teamSize: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const updateSettings = async () => {
    try {
      const response = await apiClient.userPreferences.updateUserPreferences('workspace', settings) as ApiResponse<any>;
      
      if (response.success) {
        toast({
          title: "Settings Updated",
          description: "Workspace settings have been saved successfully.",
        });
      } else {
        throw new Error(response.error || 'Failed to update settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      toast({
        title: "Error",
        description: error || 'Failed to update settings',
        variant: "destructive",
      });
    }
  };

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.userPreferences.getUserPreferences('workspace') as ApiResponse<any>;
      
      if (response.success && response.data && response.data.length > 0) {
        const prefs = response.data[0].preference_data;
        setSettings(prev => ({ ...prev, ...prefs }));
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div>Loading settings...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={settings.name || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Input
                type="text"
                id="domain"
                name="domain"
                value={settings.domain || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                type="text"
                id="industry"
                name="industry"
                value={settings.industry || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                type="text"
                id="teamSize"
                name="teamSize"
                value={settings.teamSize || ''}
                onChange={handleInputChange}
              />
            </div>
            <Button onClick={updateSettings}>Update Settings</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkspaceSettings;
