
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Globe, 
  Palette, 
  Save,
  Crown,
  Upload
} from 'lucide-react';

const WorkspaceSettings: React.FC = () => {
  const [workspaceData, setWorkspaceData] = useState({
    name: 'MarketingAI Pro',
    domain: 'marketingai.company.com',
    industry: 'Software & Technology',
    teamSize: '25-50',
    branding: {
      primaryColor: '#3B82F6',
      logo: null,
      favicon: null,
      whiteLabel: true
    },
    features: {
      multiTenant: true,
      customDomain: true,
      advancedAnalytics: true,
      prioritySupport: true
    }
  });

  const handleSave = () => {
    console.log('Saving workspace settings:', workspaceData);
    // Implementation would save to backend
  };

  const handleFileUpload = (type: 'logo' | 'favicon') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setWorkspaceData(prev => ({
        ...prev,
        branding: {
          ...prev.branding,
          [type]: file
        }
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Workspace Information</span>
            <Badge className="bg-green-100 text-green-800">Enterprise</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={workspaceData.name}
                onChange={(e) => setWorkspaceData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="custom-domain">Custom Domain</Label>
              <Input
                id="custom-domain"
                value={workspaceData.domain}
                onChange={(e) => setWorkspaceData(prev => ({ ...prev, domain: e.target.value }))}
                className="mt-1"
                placeholder="your-company.com"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={workspaceData.industry}
                onChange={(e) => setWorkspaceData(prev => ({ ...prev, industry: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="team-size">Team Size</Label>
              <Input
                id="team-size"
                value={workspaceData.teamSize}
                onChange={(e) => setWorkspaceData(prev => ({ ...prev, teamSize: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* White-Label Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>White-Label Branding</span>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable White-Label Mode</h4>
              <p className="text-sm text-gray-600">Hide MarketingAI branding and use your own</p>
            </div>
            <Switch
              checked={workspaceData.branding.whiteLabel}
              onCheckedChange={(checked) => setWorkspaceData(prev => ({
                ...prev,
                branding: { ...prev.branding, whiteLabel: checked }
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Company Logo</Label>
              <div className="mt-2 flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {workspaceData.branding.logo ? (
                    <img src={URL.createObjectURL(workspaceData.branding.logo)} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload('logo')}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </label>
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Primary Color</Label>
              <div className="mt-2 flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: workspaceData.branding.primaryColor }}
                />
                <Input
                  type="color"
                  value={workspaceData.branding.primaryColor}
                  onChange={(e) => setWorkspaceData(prev => ({
                    ...prev,
                    branding: { ...prev.branding, primaryColor: e.target.value }
                  }))}
                  className="w-20 h-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span>Enterprise Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(workspaceData.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <p className="text-sm text-gray-600">
                    {feature === 'multiTenant' && 'Isolate data between workspaces'}
                    {feature === 'customDomain' && 'Use your own domain name'}
                    {feature === 'advancedAnalytics' && 'Detailed performance insights'}
                    {feature === 'prioritySupport' && '24/7 priority customer support'}
                  </p>
                </div>
                <Badge variant={enabled ? 'default' : 'secondary'}>
                  {enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Workspace Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">42</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1,247</div>
              <div className="text-sm text-gray-600">Campaigns Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">89%</div>
              <div className="text-sm text-gray-600">AI Optimization Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">$24.5K</div>
              <div className="text-sm text-gray-600">Revenue Generated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
