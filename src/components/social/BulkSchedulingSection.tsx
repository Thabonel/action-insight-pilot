
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BulkSchedulingSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Schedule Optimization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <span className="text-sm">Schedule Week</span>
            <span className="text-xs text-gray-600">AI-optimized times</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <span className="text-sm">Batch Upload</span>
            <span className="text-xs text-gray-600">Multiple posts</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <span className="text-sm">Auto-Optimize</span>
            <span className="text-xs text-gray-600">Platform variations</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkSchedulingSection;
