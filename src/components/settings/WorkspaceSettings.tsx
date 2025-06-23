import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { UserPreferences } from '@/lib/api-client-interface';
import { Building2, Palette, Settings, Save } from 'lucide-react';

const WorkspaceSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const result = await apiClient.getUserPreferences();
      if (result.success && result.data) {
        setPreferences(result.data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const result = await apiClient.updateUserPreferences(preferences);
      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Your workspace settings have been updated successfully.",
        });
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedPreference = (key: keyof UserPreferences, nestedKey: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] as any),
        [nestedKey]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workspace Settings</h2>
          <p className="text-gray-600">Customize your workspace preferences and branding</p>
        </div>
        <Button onClick={savePreferences} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              value={preferences.name || ''}
              onChange={(e) => updatePreference('name', e.target.value)}
              placeholder="Enter workspace name"
            />
          </div>
          
          <div>
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={preferences.domain || ''}
              onChange={(e) => updatePreference('domain', e.target.value)}
              placeholder="yourdomain.com"
            />
          </div>
          
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={preferences.industry || ''}
              onChange={(e) => updatePreference('industry', e.target.value)}
              placeholder="e.g., Technology, Healthcare, Retail"
            />
          </div>
          
          <div>
            <Label htmlFor="team-size">Team Size</Label>
            <Input
              id="team-size"
              value={preferences.teamSize || ''}
              onChange={(e) => updatePreference('teamSize', e.target.value)}
              placeholder="e.g., 1-10, 11-50, 51-200"
            />
          </div>
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Branding</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input
              id="logo-url"
              value={preferences.branding?.logo || ''}
              onChange={(e) => updateNestedPreference('branding', 'logo', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={preferences.branding?.primaryColor || '#3B82F6'}
                  onChange={(e) => updateNestedPreference('branding', 'primaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={preferences.branding?.primaryColor || '#3B82F6'}
                  onChange={(e) => updateNestedPreference('branding', 'primaryColor', e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={preferences.branding?.secondaryColor || '#6B7280'}
                  onChange={(e) => updateNestedPreference('branding', 'secondaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={preferences.branding?.secondaryColor || '#6B7280'}
                  onChange={(e) => updateNestedPreference('branding', 'secondaryColor', e.target.value)}
                  placeholder="#6B7280"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Feature Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'emailMarketing', label: 'Email Marketing', description: 'Enable email campaign features' },
              { key: 'socialMedia', label: 'Social Media', description: 'Enable social media management' },
              { key: 'analytics', label: 'Advanced Analytics', description: 'Enable detailed analytics and reporting' },
              { key: 'automation', label: 'Marketing Automation', description: 'Enable automated workflows' },
              { key: 'aiAssistant', label: 'AI Assistant', description: 'Enable AI-powered assistance' },
            ].map((feature) => (
              <div key={feature.key} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">{feature.label}</div>
                  <div className="text-sm text-gray-500">{feature.description}</div>
                </div>
                <Switch
                  checked={preferences.features?.[feature.key] || false}
                  onCheckedChange={(checked) => updateNestedPreference('features', feature.key, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceSettings;
