
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingHelpButton } from '@/components/common/FloatingHelpButton';

const CustomerSegmentation: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Segmentation</h1>
        <p className="text-gray-600">Analyze and segment your customer base</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segmentation Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Customer segmentation features coming soon...</p>
        </CardContent>
      </Card>
      <FloatingHelpButton helpSection="customerSegmentation" />
    </div>
  );
};

export default CustomerSegmentation;
