
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const LandingPageBuilder: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Landing Page Builder</h1>
        <p className="text-gray-600">Create high-converting landing pages</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Landing page builder coming soon...</p>
        </CardContent>
      </Card>
      <PageHelpModal helpKey="landingPageBuilder" />
    </div>
  );
};

export default LandingPageBuilder;
