import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PageHelpModal } from '@/components/common/PageHelpModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LeadCaptureForms: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forms, setForms] = useState<LeadCaptureForm[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<LeadCaptureForm | null>(null);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [embedCode, setEmbedCode] = useState({ embed_code: '', iframe_code: '', direct_url: '' });

  // New form dialog state
  const [showNewFormDialog, setShowNewFormDialog] = useState(false);
  const [newFormData, setNewFormData] = useState({
    name: '',
    campaign_id: '',
    button_color: '#3B82F6',
    button_text: 'Submit',
    success_message: 'Thank you! We\'ll be in touch soon.'
  });

  useEffect(() => {
    fetchForms();
    fetchCampaigns();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/lead-capture/forms`, {
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setForms(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns`, {
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setCampaigns(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const getToken = async () => {
    const { supabase } = await import('@/lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const createForm = async () => {
    try {
      const campaign = campaigns.find(c => c.id === newFormData.campaign_id);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/lead-capture/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          name: newFormData.name,
          campaign_id: newFormData.campaign_id,
          campaign_name: campaign?.name || '',
          styling: {
            button_color: newFormData.button_color,
            button_text: newFormData.button_text,
            success_message: newFormData.success_message
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Form Created",
          description: "Your lead capture form is ready to embed!"
        });

        setForms([result.data, ...forms]);
        setShowNewFormDialog(false);
        setNewFormData({
          name: '',
          campaign_id: '',
          button_color: '#3B82F6',
          button_text: 'Submit',
          success_message: 'Thank you! We\'ll be in touch soon.'
        });
      } else {
        throw new Error(result.error || 'Failed to create form');
      }
    } catch (error) {
      toast({
        title: "Could Not Create Form",
        description: error instanceof Error ? error.message : "Your lead capture form could not be created. Please check your inputs and try again.",
        variant: "destructive"
      });
    }
  };

  const getEmbedCode = async (formId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/lead-capture/forms/${formId}/embed-code`, {
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setEmbedCode(result.data);
        setShowEmbedCode(true);
      }
    } catch (error) {
      toast({
        title: "Embed Code Unavailable",
        description: "Could not generate embed code for this form. Please try again in a moment.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`
    });
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/lead-capture/forms/${formId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setForms(forms.filter(f => f.id !== formId));
        toast({
          title: "Form Deleted",
          description: "The form has been removed"
        });
      }
    } catch (error) {
      toast({
        title: "Could Not Delete Form",
        description: "The form could not be deleted. It may still be in use. Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D10] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E9EEF5]">Lead Capture Forms</h1>
            <p className="text-gray-600 dark:text-[#94A3B8]">Create embeddable forms to capture leads from your landing pages</p>
          </div>

          <Dialog open={showNewFormDialog} onOpenChange={setShowNewFormDialog}>
            <DialogTrigger asChild>
              <Button>
                Create Form
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Lead Capture Form</DialogTitle>
                <DialogDescription>
                  Set up a new form to embed on your website or landing pages
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="form-name">Form Name</Label>
                  <Input
                    id="form-name"
                    value={newFormData.name}
                    onChange={(e) => setNewFormData({ ...newFormData, name: e.target.value })}
                    placeholder="e.g., Product Launch Signup"
                  />
                </div>

                <div>
                  <Label htmlFor="campaign">Associate with Campaign</Label>
                  <Select
                    value={newFormData.campaign_id}
                    onValueChange={(value) => setNewFormData({ ...newFormData, campaign_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map(campaign => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="button-color">Button Color</Label>
                    <Input
                      id="button-color"
                      type="color"
                      value={newFormData.button_color}
                      onChange={(e) => setNewFormData({ ...newFormData, button_color: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="button-text">Button Text</Label>
                    <Input
                      id="button-text"
                      value={newFormData.button_text}
                      onChange={(e) => setNewFormData({ ...newFormData, button_text: e.target.value })}
                      placeholder="Submit"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="success-message">Success Message</Label>
                  <Input
                    id="success-message"
                    value={newFormData.success_message}
                    onChange={(e) => setNewFormData({ ...newFormData, success_message: e.target.value })}
                    placeholder="Thank you! We'll be in touch soon."
                  />
                </div>

                <Button onClick={createForm} className="w-full">
                  Create Form
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Forms Grid */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : forms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
              <p className="text-gray-600 dark:text-[#94A3B8] mb-4">Create your first lead capture form to start collecting leads</p>
              <Button onClick={() => setShowNewFormDialog(true)}>
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map(form => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{form.name}</CardTitle>
                      {form.campaign_name && (
                        <Badge variant="secondary" className="mt-2">
                          {form.campaign_name}
                        </Badge>
                      )}
                    </div>
                    {form.active ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-[#94A3B8]">Submissions:</span>
                      <span className="font-semibold">{form.submissions_count || 0}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => getEmbedCode(form.id)}
                      >
                        Get Code
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL}/form/${form.id}`, '_blank')}
                      >
                        View
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteForm(form.id)}
                      >
                        Delete
                      </Button>
                    </div>

                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => navigate(`/app/leads?form_id=${form.id}`)}
                    >
                      View Leads
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Embed Code Dialog */}
        <Dialog open={showEmbedCode} onOpenChange={setShowEmbedCode}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Embed Your Form</DialogTitle>
              <DialogDescription>
                Choose your preferred embedding method
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* JavaScript Embed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>JavaScript Embed (Recommended)</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(embedCode.embed_code, 'Embed code')}
                  >
                    Copy
                  </Button>
                </div>
                <pre className="bg-gray-100 dark:bg-[#1C2430] dark:text-[#E9EEF5] p-4 rounded-lg text-xs overflow-x-auto">
                  {embedCode.embed_code}
                </pre>
              </div>

              {/* iframe Embed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>iframe Embed</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(embedCode.iframe_code, 'iframe code')}
                  >
                    Copy
                  </Button>
                </div>
                <pre className="bg-gray-100 dark:bg-[#1C2430] dark:text-[#E9EEF5] p-4 rounded-lg text-xs overflow-x-auto">
                  {embedCode.iframe_code}
                </pre>
              </div>

              {/* Direct URL */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Direct URL</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(embedCode.direct_url, 'URL')}
                    >
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(embedCode.direct_url, '_blank')}
                    >
                      Open
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-[#1C2430] dark:text-[#E9EEF5] p-4 rounded-lg text-sm">
                  {embedCode.direct_url}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <PageHelpModal helpKey="leadCaptureForms" />
    </div>
  );
};

export default LeadCaptureForms;