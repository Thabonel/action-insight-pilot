
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const CustomerSegmentation: React.FC = () => {
  return (
    <div className="space-y-6 bg-white dark:bg-[#0B0D10] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E9EEF5]">Customer Segmentation</h1>
        <p className="text-gray-600 dark:text-[#94A3B8]">Analyze and segment your customer base</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segmentation Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Customer segmentation features coming soon...</p>
        </CardContent>
      </Card>
      <PageHelpModal helpKey="customerSegmentation" />
    </div>
  );
};

export default CustomerSegmentation;
