
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Database } from 'lucide-react';

const DataSyncSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Data Synchronization</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Real-time Sync</h4>
              <p className="text-sm text-gray-600">Sync data immediately when changes occur</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Batch Processing</h4>
              <p className="text-sm text-gray-600">Process data in scheduled batches</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Data Validation</h4>
              <p className="text-sm text-gray-600">Validate data integrity during sync</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Error Retry</h4>
              <p className="text-sm text-gray-600">Automatically retry failed syncs</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSyncSettings;
