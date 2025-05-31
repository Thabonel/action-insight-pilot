
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  Smartphone,
  Mail,
  MessageSquare,
  Calendar
} from 'lucide-react';

const SystemPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: false,
      desktop: true,
      slack: false
    },
    appearance: {
      darkMode: false,
      compactView: false,
      animations: true
    },
    privacy: {
      analytics: true,
      marketing: false,
      thirdParty: false
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false
    }
  });

  const notificationTypes = [
    { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Receive updates via email' },
    { key: 'push', label: 'Push Notifications', icon: Smartphone, description: 'Browser push notifications' },
    { key: 'desktop', label: 'Desktop Notifications', icon: Bell, description: 'System desktop notifications' },
    { key: 'slack', label: 'Slack Integration', icon: MessageSquare, description: 'Notifications in Slack channels' }
  ];

  const appearanceSettings = [
    { key: 'darkMode', label: 'Dark Mode', icon: Moon, description: 'Use dark theme across the interface' },
    { key: 'compactView', label: 'Compact View', icon: Globe, description: 'Show more content in less space' },
    { key: 'animations', label: 'Animations', icon: Calendar, description: 'Enable smooth transitions and animations' }
  ];

  const privacySettings = [
    { key: 'analytics', label: 'Usage Analytics', icon: Shield, description: 'Help improve the product with usage data' },
    { key: 'marketing', label: 'Marketing Communications', icon: Mail, description: 'Receive product updates and tips' },
    { key: 'thirdParty', label: 'Third-party Integrations', icon: Globe, description: 'Allow data sharing with connected services' }
  ];

  const accessibilitySettings = [
    { key: 'highContrast', label: 'High Contrast', icon: Shield, description: 'Increase color contrast for better visibility' },
    { key: 'largeText', label: 'Large Text', icon: Globe, description: 'Increase font size throughout the interface' },
    { key: 'screenReader', label: 'Screen Reader Support', icon: Bell, description: 'Optimize for screen reader software' }
  ];

  const updatePreference = (category: string, key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="mt-8 pt-8 border-t">
      <h3 className="text-lg font-semibold mb-4">System Preferences</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notificationTypes.map(type => {
              const Icon = type.icon;
              return (
                <div key={type.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">{type.label}</div>
                      <div className="text-xs text-gray-600">{type.description}</div>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications[type.key as keyof typeof preferences.notifications]}
                    onCheckedChange={(checked) => updatePreference('notifications', type.key, checked)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base">
              <Globe className="h-4 w-4" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appearanceSettings.map(setting => {
              const Icon = setting.icon;
              return (
                <div key={setting.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">{setting.label}</div>
                      <div className="text-xs text-gray-600">{setting.description}</div>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.appearance[setting.key as keyof typeof preferences.appearance]}
                    onCheckedChange={(checked) => updatePreference('appearance', setting.key, checked)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base">
              <Shield className="h-4 w-4" />
              <span>Privacy & Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {privacySettings.map(setting => {
              const Icon = setting.icon;
              return (
                <div key={setting.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">{setting.label}</div>
                      <div className="text-xs text-gray-600">{setting.description}</div>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.privacy[setting.key as keyof typeof preferences.privacy]}
                    onCheckedChange={(checked) => updatePreference('privacy', setting.key, checked)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base">
              <Bell className="h-4 w-4" />
              <span>Accessibility</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {accessibilitySettings.map(setting => {
              const Icon = setting.icon;
              return (
                <div key={setting.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">{setting.label}</div>
                      <div className="text-xs text-gray-600">{setting.description}</div>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.accessibility[setting.key as keyof typeof preferences.accessibility]}
                    onCheckedChange={(checked) => updatePreference('accessibility', setting.key, checked)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          Reset to Defaults
        </Button>
        <Button variant="outline" size="sm">
          Export Settings
        </Button>
        <Button variant="outline" size="sm">
          Import Settings
        </Button>
        <Badge variant="secondary" className="ml-auto">
          Auto-saved
        </Badge>
      </div>
    </div>
  );
};

export default SystemPreferences;
