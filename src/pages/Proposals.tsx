import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Send, Eye, Plus, Search, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface ProposalFormData {
  template_type: string;
  client_info: {
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    industry: string;
  };
  project_details: {
    description: string;
    scope: string;
    services: string[];
    duration: number;
    features: string[];
  };
  call_transcript: string;
  budget_range: {
    min: number;
    max: number;
  };
}

interface Proposal {
  id: string;
  client_name: string;
  template_type: string;
  status: string;
  created_at: string;
  value: number;
}

const Proposals: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
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
  const [templates, setTemplates] = useState<Record<string, any>>({});
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [generatedProposal, setGeneratedProposal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadProposals();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await apiClient.getProposalTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadProposals = async () => {
    try {
      const response = await apiClient.getProposals();
      if (response.success) {
        setProposals(response.data);
      }
    } catch (error) {
      console.error('Error loading proposals:', error);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof ProposalFormData] as object),
        [field]: value
      }
    }));
  };

  const handleGenerateProposal = async () => {
    setLoading(true);
    try {
      const response = await apiClient.generateProposal(formData);
      if (response.success) {
        setGeneratedProposal(response.data);
        setActiveTab('preview');
        toast({
          title: "Proposal Generated",
          description: "Your proposal has been successfully generated!",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to generate proposal",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportProposal = async (proposalId: string, format: string) => {
    try {
      const response = await apiClient.exportProposal(proposalId, format);
      if (response.success) {
        toast({
          title: "Export Started",
          description: `Your proposal is being exported as ${format.toUpperCase()}`,
        });
        // In a real implementation, trigger download
        window.open(response.data.download_url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredProposals = proposals.filter(proposal =>
    proposal.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.template_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <TabsContent value="create" className="space-y-6">
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
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(templates).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      onChange={(e) => handleInputChange('client_info', 'company_name', e.target.value)}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_name">Contact Name</Label>
                    <Input
                      id="contact_name"
                      value={formData.client_info.contact_name}
                      onChange={(e) => handleInputChange('client_info', 'contact_name', e.target.value)}
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
                      onChange={(e) => handleInputChange('client_info', 'email', e.target.value)}
                      placeholder="john@acme.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.client_info.phone}
                      onChange={(e) => handleInputChange('client_info', 'phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.client_info.industry}
                    onChange={(e) => handleInputChange('client_info', 'industry', e.target.value)}
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
                    onChange={(e) => handleInputChange('project_details', 'description', e.target.value)}
                    placeholder="Describe the project requirements..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="scope">Project Scope</Label>
                  <Textarea
                    id="scope"
                    value={formData.project_details.scope}
                    onChange={(e) => handleInputChange('project_details', 'scope', e.target.value)}
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
                      onChange={(e) => handleInputChange('project_details', 'duration', parseInt(e.target.value))}
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
                      onChange={(e) => handleInputChange('budget_range', 'min', parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_budget">Maximum Budget ($)</Label>
                    <Input
                      id="max_budget"
                      type="number"
                      value={formData.budget_range.max}
                      onChange={(e) => handleInputChange('budget_range', 'max', parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="call_transcript">Call Transcript (Optional)</Label>
                  <Textarea
                    id="call_transcript"
                    value={formData.call_transcript}
                    onChange={(e) => setFormData(prev => ({ ...prev, call_transcript: e.target.value }))}
                    placeholder="Paste call transcript here to help AI generate more accurate proposals..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleGenerateProposal} 
              disabled={!formData.template_type || !formData.client_info.company_name || loading}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {loading ? 'Generating...' : 'Generate Proposal'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {generatedProposal ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Generated Proposal</CardTitle>
                  <CardDescription>Review and customize your proposal before sending</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleExportProposal(generatedProposal.id, 'pdf')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleExportProposal(generatedProposal.id, 'docx')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Word
                  </Button>
                  <Button className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Proposal
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Executive Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-700">{generatedProposal.content.executive_summary}</p>
                  </div>
                </div>

                {/* Pricing Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Pricing Breakdown</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Item</th>
                          <th className="text-left p-3 font-medium">Description</th>
                          <th className="text-right p-3 font-medium">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedProposal.pricing.map((item: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 font-medium">{item.item}</td>
                            <td className="p-3 text-slate-600">{item.description}</td>
                            <td className="p-3 text-right font-medium">${item.price.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="border-t bg-slate-50">
                          <td colSpan={2} className="p-3 font-semibold">Total</td>
                          <td className="p-3 text-right font-semibold">
                            ${generatedProposal.pricing.reduce((sum: number, item: any) => sum + item.price, 0).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Project Timeline</h3>
                  <div className="space-y-3">
                    {generatedProposal.timeline.map((phase: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{phase.phase}</h4>
                          <span className="text-sm text-slate-600">{phase.duration}</span>
                        </div>
                        <div className="text-sm text-slate-600">
                          <strong>Deliverables:</strong> {phase.deliverables.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No proposal generated yet. Create a proposal first.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredProposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{proposal.client_name}</h3>
                      <p className="text-slate-600 capitalize">{proposal.template_type.replace('_', ' ')}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>Created: {new Date(proposal.created_at).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          proposal.status === 'sent' ? 'bg-green-100 text-green-800' :
                          proposal.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {proposal.status}
                        </span>
                        <span className="font-medium">${proposal.value.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportProposal(proposal.id, 'pdf')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Proposals;
