
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { ProposalFormData } from '@/types/proposals';
import { useProposals } from '@/hooks/useProposals';
import ProposalForm from '@/components/proposals/ProposalForm';
import ProposalPreview from '@/components/proposals/ProposalPreview';
import ProposalsList from '@/components/proposals/ProposalsList';

const Proposals: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ProposalFormData>({
    template_type: '',
    client_info: {
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      industry: ''
    },
    project_details: {
      description: '',
      scope: '',
      services: [],
      duration: 8,
      features: []
    },
    call_transcript: '',
    budget_range: {
      min: 5000,
      max: 10000
    }
  });

  const {
    templates,
    proposals,
    generatedProposal,
    loading,
    templatesLoading,
    backendAvailable,
    generateProposal,
    exportProposal,
    retryConnection
  } = useProposals();

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof ProposalFormData] as object),
        [field]: value
      }
    }));
  };

  const handleFormDataChange = (updates: Partial<ProposalFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleGenerateProposal = async () => {
    const success = await generateProposal(formData);
    if (success) {
      setActiveTab('preview');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Proposal Generator</h1>
          <p className="text-slate-600 mt-2">Create professional proposals with AI assistance</p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Proposal
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="create">Create Proposal</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="manage">Manage Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <ProposalForm
            formData={formData}
            templates={templates}
            loading={loading}
            templatesLoading={templatesLoading}
            backendAvailable={backendAvailable}
            onInputChange={handleInputChange}
            onFormDataChange={handleFormDataChange}
            onSubmit={handleGenerateProposal}
            onRetryConnection={retryConnection}
          />
        </TabsContent>

        <TabsContent value="preview">
          <ProposalPreview
            proposal={generatedProposal}
            onExport={exportProposal}
          />
        </TabsContent>

        <TabsContent value="manage">
          <ProposalsList
            proposals={proposals}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onExport={exportProposal}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Proposals;
