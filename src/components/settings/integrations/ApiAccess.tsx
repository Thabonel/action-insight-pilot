
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ApiEndpoint {
  method: string;
  endpoint: string;
  description: string;
}

const ApiAccess: React.FC = () => {
  const [showApiKeys, setShowApiKeys] = useState(false);

  const apiEndpoints: ApiEndpoint[] = [
    { method: 'GET', endpoint: '/api/campaigns', description: 'List all campaigns' },
    { method: 'POST', endpoint: '/api/campaigns', description: 'Create new campaign' },
    { method: 'GET', endpoint: '/api/leads', description: 'Retrieve leads data' },
    { method: 'POST', endpoint: '/api/content', description: 'Generate content' },
    { method: 'GET', endpoint: '/api/analytics', description: 'Get analytics data' },
    { method: 'POST', endpoint: '/api/social-post', description: 'Push content to social platforms' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Access and Documentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">API Keys</h4>
            <p className="text-sm text-gray-600">Manage your API authentication keys</p>
          </div>
          <Button variant="outline" onClick={() => setShowApiKeys(!showApiKeys)}>
            {showApiKeys ? 'Hide' : 'Show'} Keys
          </Button>
        </div>

        {showApiKeys && (
          <div className="space-y-3">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">Production API Key</h5>
                <Button variant="outline" size="sm">Regenerate</Button>
              </div>
              <code className="text-sm bg-gray-100 p-2 rounded block">mk_prod_12345...abcdef</code>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">Development API Key</h5>
                <Button variant="outline" size="sm">Regenerate</Button>
              </div>
              <code className="text-sm bg-gray-100 p-2 rounded block">mk_dev_67890...uvwxyz</code>
            </div>
          </div>
        )}

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">API Endpoints</h4>
            <Button variant="outline" size="sm">
              Full Documentation
            </Button>
          </div>
          <div className="space-y-2">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center space-x-4 p-2 bg-gray-50 rounded">
                <Badge variant="outline" className={`${
                  endpoint.method === 'GET' ? 'text-green-600 border-green-300' :
                  endpoint.method === 'POST' ? 'text-blue-600 border-blue-300' :
                  'text-orange-600 border-orange-300'
                }`}>
                  {endpoint.method}
                </Badge>
                <code className="text-sm font-mono">{endpoint.endpoint}</code>
                <span className="text-sm text-gray-600 flex-1">{endpoint.description}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiAccess;
