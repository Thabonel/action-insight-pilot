
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
  onTemplateChange
}) => {
  const hasTemplates = templates && Object.keys(templates).length > 0;
  const templateCount = Object.keys(templates || {}).length;

  // Group templates by category
  const templatesByCategory = Object.entries(templates).reduce((acc, [key, template]) => {
    const category = template.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ key, ...template });
    return acc;
  }, {} as Record<string, any[]>);

  const formatCategoryName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

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
              <span className="text-sm text-blue-700">Loading templates from Supabase...</span>
            </div>
          ) : !hasTemplates ? (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                No templates found. Please check your connection.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <Select value={selectedTemplate} onValueChange={onTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {formatCategoryName(category)}
                      </div>
                      {categoryTemplates.map((template) => (
                        <SelectItem key={template.key} value={template.key}>
                          <div className="flex flex-col">
                            <span className="font-medium">{template.name}</span>
                            {template.description && (
                              <span className="text-xs text-gray-500">{template.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                {templateCount} templates loaded from Supabase
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateSelection;
