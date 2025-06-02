
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, AlertCircle } from 'lucide-react';
import { ProposalFormData } from '@/types/proposals';

interface ProposalFormProps {
  formData: ProposalFormData;
  templates: Record<string, any>;
  loading: boolean;
  onInputChange: (section: string, field: string, value: any) => void;
  onFormDataChange: (data: Partial<ProposalFormData>) => void;
  onSubmit: () => void;
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  formData,
  templates,
  loading,
  onInputChange,
  onFormDataChange,
  onSubmit
}) => {
  const hasTemplates = templates && Object.keys(templates).length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Template Selection</CardTitle>
            <CardDescription>Choose a proposal template that matches your service type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template">Proposal Template</Label>
              {!hasTemplates ? (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700">Loading templates...</span>
                </div>
              ) : (
                <Select 
                  value={formData.template_type} 
                  onValueChange={(value) => onFormDataChange({ template_type: value })}
                >
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Enter details about your client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.client_info.company_name}
                  onChange={(e) => onInputChange('client_info', 'company_name', e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={formData.client_info.contact_name}
                  onChange={(e) => onInputChange('client_info', 'contact_name', e.target.value)}
                  placeholder="John Smith"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.client_info.email}
                  onChange={(e) => onInputChange('client_info', 'email', e.target.value)}
                  placeholder="john@acme.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.client_info.phone}
                  onChange={(e) => onInputChange('client_info', 'phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.client_info.industry}
                onChange={(e) => onInputChange('client_info', 'industry', e.target.value)}
                placeholder="Technology"
              />
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Describe the project requirements and scope</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={formData.project_details.description}
                onChange={(e) => onInputChange('project_details', 'description', e.target.value)}
                placeholder="Describe the project requirements..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="scope">Project Scope</Label>
              <Textarea
                id="scope"
                value={formData.project_details.scope}
                onChange={(e) => onInputChange('project_details', 'scope', e.target.value)}
                placeholder="Define the project scope..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (weeks)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.project_details.duration}
                  onChange={(e) => onInputChange('project_details', 'duration', parseInt(e.target.value))}
                  min="1"
                  max="52"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget & Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Budget & Additional Information</CardTitle>
            <CardDescription>Set budget range and add call transcript if available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_budget">Minimum Budget ($)</Label>
                <Input
                  id="min_budget"
                  type="number"
                  value={formData.budget_range.min}
                  onChange={(e) => onInputChange('budget_range', 'min', parseInt(e.target.value))}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="max_budget">Maximum Budget ($)</Label>
                <Input
                  id="max_budget"
                  type="number"
                  value={formData.budget_range.max}
                  onChange={(e) => onInputChange('budget_range', 'max', parseInt(e.target.value))}
                  min="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="call_transcript">Call Transcript (Optional)</Label>
              <Textarea
                id="call_transcript"
                value={formData.call_transcript}
                onChange={(e) => onFormDataChange({ call_transcript: e.target.value })}
                placeholder="Paste call transcript here to help AI generate more accurate proposals..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={onSubmit} 
          disabled={!formData.template_type || !formData.client_info.company_name || loading || !hasTemplates}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          {loading ? 'Generating...' : 'Generate Proposal'}
        </Button>
      </div>
    </div>
  );
};

export default ProposalForm;
