
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Tools: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketing Tools</h1>
        <p className="text-gray-600">Access powerful marketing utilities</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tools Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Marketing tools coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tools;
