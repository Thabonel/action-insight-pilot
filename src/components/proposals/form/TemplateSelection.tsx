
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface TemplateSelectionProps {
  selectedTemplate: string;
  templates: Record<string, any>;
  loading: boolean;
  backendAvailable?: boolean;
  onTemplateChange: (value: string) => void;
  onRetryConnection?: () => void;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({
  selectedTemplate,
  templates,
  loading,
  backendAvailable = true,
  onTemplateChange,
  onRetryConnection
}) => {
  const hasTemplates = templates && Object.keys(templates).length > 0;
  const templateCount = Object.keys(templates || {}).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Selection</CardTitle>
        <CardDescription>Choose a proposal template that matches your service type</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="template">Proposal Template</Label>
          {loading ? (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-700">Loading templates from backend...</span>
            </div>
          ) : !hasTemplates ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  {backendAvailable ? 'No templates found on server' : 'Cannot connect to backend server'}
                </span>
              </div>
              {onRetryConnection && (
                <Button variant="outline" size="sm" onClick={onRetryConnection} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Loading Templates
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Select value={selectedTemplate} onValueChange={onTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templates).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        {template.description && (
                          <span className="text-xs text-gray-500">{template.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Wifi className="h-3 w-3 text-green-600" />
                {templateCount} templates loaded from backend
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateSelection;
