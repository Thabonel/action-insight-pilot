
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Upload, 
  FileText, 
  Database, 
  Calendar,
  Shield,
  Clock,
  HardDrive,
  CheckCircle
} from 'lucide-react';

const ExportDataSettings: React.FC = () => {
  const [exportSettings, setExportSettings] = useState({
    autoBackup: true,
    includeAnalytics: true,
    includeContent: true,
    includeCampaigns: true,
    includeLeads: false,
    format: 'json'
  });

  const exportFormats = [
    { value: 'json', label: 'JSON', description: 'Machine-readable format for API integration' },
    { value: 'csv', label: 'CSV', description: 'Spreadsheet format for data analysis' },
    { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel workbook format' },
    { value: 'pdf', label: 'PDF', description: 'Human-readable report format' }
  ];

  const dataCategories = [
    { key: 'includeCampaigns', label: 'Campaigns', icon: Calendar, description: 'Campaign data, performance metrics, and settings' },
    { key: 'includeContent', label: 'Content', icon: FileText, description: 'Generated content, templates, and assets' },
    { key: 'includeAnalytics', label: 'Analytics', icon: Database, description: 'Performance data, insights, and reports' },
    { key: 'includeLeads', label: 'Leads', icon: Shield, description: 'Lead data and contact information (GDPR sensitive)' }
  ];

  const backupHistory = [
    { id: 1, date: '2024-01-15', size: '45.2 MB', format: 'JSON', status: 'completed', downloadUrl: '#' },
    { id: 2, date: '2024-01-08', size: '42.8 MB', format: 'JSON', status: 'completed', downloadUrl: '#' },
    { id: 3, date: '2024-01-01', size: '38.5 MB', format: 'JSON', status: 'completed', downloadUrl: '#' },
    { id: 4, date: '2023-12-25', size: '35.2 MB', format: 'CSV', status: 'expired', downloadUrl: null }
  ];

  const handleExport = (type: 'full' | 'selective') => {
    console.log(`Starting ${type} export with settings:`, exportSettings);
    // Implementation would trigger export process
  };

  const handleImport = () => {
    console.log('Starting import process');
    // Implementation would handle file upload and import
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Data Export Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Export Format</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportFormats.map(format => (
                <div
                  key={format.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    exportSettings.format === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setExportSettings(prev => ({ ...prev, format: format.value }))}
                >
                  <h5 className="font-medium">{format.label}</h5>
                  <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Data Categories</h4>
            <div className="space-y-3">
              {dataCategories.map(category => {
                const Icon = category.icon;
                return (
                  <div key={category.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">{category.label}</h5>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={exportSettings[category.key as keyof typeof exportSettings] as boolean}
                      onCheckedChange={(checked) => setExportSettings(prev => ({
                        ...prev,
                        [category.key]: checked
                      }))}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button onClick={() => handleExport('full')} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export All Data</span>
            </Button>
            <Button variant="outline" onClick={() => handleExport('selective')}>
              Export Selected
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Data Import</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h4 className="font-medium mb-2">Import Data</h4>
            <p className="text-sm text-gray-600 mb-4">
              Upload a previously exported file to restore your data
            </p>
            <Button variant="outline" onClick={handleImport}>
              Choose File
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-800">Import Warning</h5>
                <p className="text-sm text-yellow-700 mt-1">
                  Importing data will merge with existing data. Some settings may be overwritten. 
                  We recommend creating a backup before importing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automated Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Automated Backups</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Enable Auto-Backup</h4>
              <p className="text-sm text-gray-600">Automatically backup your data weekly</p>
            </div>
            <Switch
              checked={exportSettings.autoBackup}
              onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, autoBackup: checked }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-blue-800">Weekly</div>
              <div className="text-sm text-blue-600">Backup Frequency</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <HardDrive className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-green-800">30 Days</div>
              <div className="text-sm text-green-600">Retention Period</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-purple-800">Encrypted</div>
              <div className="text-sm text-purple-600">Secure Storage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Backup History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupHistory.map(backup => (
              <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {backup.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{backup.date}</div>
                    <div className="text-sm text-gray-600">
                      {backup.size} • {backup.format} format
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={`${
                    backup.status === 'completed' ? 'text-green-600 border-green-300' :
                    'text-gray-600 border-gray-300'
                  }`}>
                    {backup.status}
                  </Badge>
                  {backup.downloadUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportDataSettings;
