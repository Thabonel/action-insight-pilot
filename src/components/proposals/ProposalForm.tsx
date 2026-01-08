
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { ProposalFormData } from '@/types/proposals';
import TemplateSelection from './form/TemplateSelection';
import ClientInformation from './form/ClientInformation';
import ProjectDetails from './form/ProjectDetails';
import BudgetAndTranscript from './form/BudgetAndTranscript';
import StatusAlert from './form/StatusAlert';

interface ProposalTemplate {
  name: string;
  description?: string;
  category?: string;
  content?: string;
}

interface ProposalFormProps {
  formData: ProposalFormData;
  templates: Record<string, ProposalTemplate>;
  loading: boolean;
  templatesLoading: boolean;
  backendAvailable?: boolean;
  onInputChange: (section: string, field: string, value: string | number) => void;
  onFormDataChange: (data: Partial<ProposalFormData>) => void;
  onSubmit: () => void;
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  formData,
  templates,
  loading,
  templatesLoading,
  backendAvailable = true,
  onInputChange,
  onFormDataChange,
  onSubmit
}) => {
  const hasTemplates = templates && Object.keys(templates).length > 0;
  const templateCount = Object.keys(templates || {}).length;

  const handleClientInfoChange = (field: string, value: string) => {
    onInputChange('client_info', field, value);
  };

  const handleProjectDetailsChange = (field: string, value: string | number) => {
    onInputChange('project_details', field, value);
  };

  const handleBudgetChange = (field: 'min' | 'max', value: number) => {
    onInputChange('budget_range', field, value);
  };

  const handleTranscriptChange = (value: string) => {
    onFormDataChange({ call_transcript: value });
  };

  const handleTemplateChange = (value: string) => {
    onFormDataChange({ template_type: value });
  };

  return (
    <div className="space-y-6">
      <StatusAlert
        backendAvailable={backendAvailable}
        hasTemplates={hasTemplates}
        templateCount={templateCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemplateSelection
          selectedTemplate={formData.template_type}
          templates={templates}
          loading={templatesLoading}
          backendAvailable={backendAvailable}
          onTemplateChange={handleTemplateChange}
        />

        <ClientInformation
          clientInfo={formData.client_info}
          onInputChange={handleClientInfoChange}
        />

        <ProjectDetails
          projectDetails={formData.project_details}
          onInputChange={handleProjectDetailsChange}
        />

        <BudgetAndTranscript
          budgetRange={formData.budget_range}
          callTranscript={formData.call_transcript}
          onBudgetChange={handleBudgetChange}
          onTranscriptChange={handleTranscriptChange}
        />
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
