
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlatformCredential {
  platform: string;
  name: string;
  clientIdSecret: string;
  clientSecretSecret: string;
  docsUrl: string;
  setupInstructions: string[];
}

const PlatformCredentialsSetup: React.FC = () => {
  const platforms: PlatformCredential[] = [
    {
      platform: 'Buffer',
      name: 'buffer',
      clientIdSecret: 'BUFFER_CLIENT_ID',
      clientSecretSecret: 'BUFFER_CLIENT_SECRET',
      docsUrl: 'https://buffer.com/developers/api',
      setupInstructions: [
        'Go to Buffer Developer Portal',
        'Create a new application',
        'Set redirect URI to your Supabase function URL',
        'Copy Client ID and Client Secret'
      ]
    },
    {
      platform: 'Hootsuite',
      name: 'hootsuite',
      clientIdSecret: 'HOOTSUITE_CLIENT_ID',
      clientSecretSecret: 'HOOTSUITE_CLIENT_SECRET',
      docsUrl: 'https://developer.hootsuite.com/',
      setupInstructions: [
        'Access Hootsuite Developer Portal',
        'Register your application',
        'Configure OAuth redirect URI',
        'Note down your app credentials'
      ]
    },
    {
      platform: 'Later',
      name: 'later',
      clientIdSecret: 'LATER_CLIENT_ID',
      clientSecretSecret: 'LATER_CLIENT_SECRET',
      docsUrl: 'https://developers.later.com/',
      setupInstructions: [
        'Visit Later Developer Console',
        'Create new API application',
        'Set up OAuth configuration',
        'Save your API credentials'
      ]
    },
    {
      platform: 'Sprout Social',
      name: 'sprout_social',
      clientIdSecret: 'SPROUT_SOCIAL_CLIENT_ID',
      clientSecretSecret: 'SPROUT_SOCIAL_CLIENT_SECRET',
      docsUrl: 'https://developers.sproutsocial.com/',
      setupInstructions: [
        'Go to Sprout Social Developer Portal',
        'Register your application',
        'Configure OAuth settings',
        'Get your client credentials'
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform API Credentials Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            To enable OAuth integrations with social media platforms, you need to configure API credentials 
            for each platform in your Supabase project settings. These credentials are stored securely 
            and encrypted.
          </AlertDescription>
        </Alert>

        {platforms.map((platform) => (
          <div key={platform.name} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{platform.platform}</h3>
              <a
                href={platform.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                API Docs
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  {platform.setupInstructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Required Secrets:</h4>
                <div className="space-y-1 text-sm font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600">{platform.clientIdSecret}</span>
                    <span className="text-gray-500">- Client ID from {platform.platform}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600">{platform.clientSecretSecret}</span>
                    <span className="text-gray-500">- Client Secret from {platform.platform}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <strong>Redirect URI:</strong> Set this in your {platform.platform} app configuration:<br/>
                <code className="bg-gray-100 px-1 rounded">
                  https://kciuuxoqxfsogjuqflou.supabase.co/functions/v1/social-oauth-callback
                </code>
              </div>
            </div>
          </div>
        ))}

        <Alert>
          <AlertDescription>
            After setting up credentials in each platform's developer portal, add them to your 
            Supabase project's Edge Function secrets. The OAuth integration will only work once 
            all required credentials are configured.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PlatformCredentialsSetup;
