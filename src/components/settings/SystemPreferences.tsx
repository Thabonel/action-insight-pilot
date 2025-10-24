
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { userPreferencesService } from '@/lib/services/user-preferences-service';
import { 
  Settings, 
  Bell, 
  Globe, 
  Palette, 
  Shield, 
  Database,
  Clock,
  Download,
  Trash2
} from 'lucide-react';

interface SystemPreference {
  id: string;
  category: string;
  name: string;
  description: string;
  type: 'boolean' | 'select' | 'number';
  value: any;
  options?: string[];
}

const SystemPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<SystemPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const result = await userPreferencesService.getGeneralPreferences();
      
      if (result.success && result.data) {
        // Transform the preferences data into our SystemPreference format
        const systemPrefs: SystemPreference[] = [
          {
            id: 'notifications',
            category: 'Notifications',
            name: 'Push Notifications',
            description: 'Receive push notifications for important updates',
            type: 'boolean',
            value: result.data.notifications ?? true
          },
          {
            id: 'theme',
            category: 'Appearance',
            name: 'Theme',
            description: 'Choose your preferred color theme',
            type: 'select',
            value: result.data.theme ?? 'light',
            options: ['light', 'dark', 'auto']
          },
          {
            id: 'language',
            category: 'Localization',
            name: 'Language',
            description: 'Select your preferred language',
            type: 'select',
            value: result.data.language ?? 'en',
            options: ['en', 'es', 'fr', 'de', 'ja']
          },
          {
            id: 'timezone',
            category: 'Localization',
            name: 'Timezone',
            description: 'Set your local timezone',
            type: 'select',
            value: result.data.timezone ?? 'UTC',
            options: ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']
          }
        ];
        setPreferences(systemPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Could Not Load Preferences",
        description: "Your system preferences could not be loaded. Default settings will be used. Please refresh the page or contact support if this continues.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (id: string, value: any) => {
    try {
      setSaving(id);
      
      const updatedPrefs = preferences.map(pref => 
        pref.id === id ? { ...pref, value } : pref
      );
      setPreferences(updatedPrefs);

      const prefData: Record<string, any> = {};
      updatedPrefs.forEach(pref => {
        prefData[pref.id] = pref.value;
      });

      await userPreferencesService.updateGeneralPreferences(prefData);
      
      toast({
        title: "Preferences Updated",
        description: "Your system preferences have been saved",
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Update Failed",
        description: "Your preference change could not be saved. Please try again or contact support if the problem continues.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'system-preferences.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetPreferences = async () => {
    if (confirm('Are you sure you want to reset all preferences to default values?')) {
      try {
        const defaultPrefs = preferences.map(pref => ({
          ...pref,
          value: getDefaultValue(pref.type)
        }));
        
        setPreferences(defaultPrefs);
        
        const prefData: Record<string, any> = {};
        defaultPrefs.forEach(pref => {
          prefData[pref.id] = pref.value;
        });

        await userPreferencesService.updateGeneralPreferences(prefData);
        
        toast({
          title: "Preferences Reset",
          description: "All preferences have been reset to default values",
        });
      } catch (error) {
        console.error('Error resetting preferences:', error);
        toast({
          title: "Reset Failed",
          description: "Could not reset your preferences to defaults. Your current settings remain unchanged. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getDefaultValue = (type: string) => {
    switch (type) {
      case 'boolean': return true;
      case 'select': return '';
      case 'number': return 0;
      default: return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Notifications': return Bell;
      case 'Appearance': return Palette;
      case 'Localization': return Globe;
      case 'Security': return Shield;
      case 'Data': return Database;
      default: return Settings;
    }
  };

  const groupedPreferences = preferences.reduce((groups, pref) => {
    if (!groups[pref.category]) {
      groups[pref.category] = [];
    }
    groups[pref.category].push(pref);
    return groups;
  }, {} as Record<string, SystemPreference[]>);

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
          <h2 className="text-2xl font-bold">System Preferences</h2>
          <p className="text-gray-600">Customize your system settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportPreferences}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={resetPreferences}>
            <Trash2 className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>
      </div>

      {Object.entries(groupedPreferences).map(([category, prefs]) => {
        const IconComponent = getCategoryIcon(category);
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconComponent className="h-5 w-5" />
                <span>{category}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {prefs.map((pref, index) => (
                <div key={pref.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor={pref.id} className="text-sm font-medium">
                        {pref.name}
                      </Label>
                      <p className="text-sm text-gray-600">{pref.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {saving === pref.id && (
                        <Clock className="h-4 w-4 animate-spin text-gray-400" />
                      )}
                      
                      {pref.type === 'boolean' && (
                        <Switch
                          id={pref.id}
                          checked={Boolean(pref.value)}
                          onCheckedChange={(checked) => updatePreference(pref.id, checked)}
                          disabled={saving === pref.id}
                        />
                      )}
                      
                      {pref.type === 'select' && (
                        <Select
                          value={pref.value}
                          onValueChange={(value) => updatePreference(pref.id, value)}
                          disabled={saving === pref.id}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {pref.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  
                  {index < prefs.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SystemPreferences;
