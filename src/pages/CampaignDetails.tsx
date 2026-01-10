import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useAnalytics } from '@/hooks/useAnalytics';
import AIAssistanceButton from '@/components/AIAssistanceButton';
import { PageHelpModal } from '@/components/common/PageHelpModal';
import { apiClient } from '@/lib/api-client';
import { Campaign, ApiResponse } from '@/lib/api-client-interface';

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generateKeyMessages, generateTargetPersonas, loading: aiLoading } = useAIAssistant();
  const { trackFieldFocus, trackFieldBlur, trackAIAssistanceUsed, trackFormSubmit } = useAnalytics();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fieldTimers = useRef<{ [key: string]: number }>({});

  // Comprehensive form data state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: string;
    status: Campaign['status'];
    primaryObjective: string;
    secondaryObjectives: string[];
    smartGoals: string;
    primaryKPI: string;
    kpiTargets: {
      revenue: string;
      leads: string;
      conversion: string;
      roi: string;
      impressions: string;
      clicks: string;
    };
    totalBudget: string;
    budgetBreakdown: {
      [key: string]: string;
    };
    startDate: string;
    endDate: string;
    targetAudience: string;
    audienceSegments: string[];
    buyerPersonas: { name: string; description: string }[];
    demographics: {
      [key: string]: string;
    };
    valueProposition: string;
    keyMessages: string[];
    contentStrategy: string;
    creativeRequirements: string;
    brandGuidelines: string;
    channels: string[];
    channelStrategy: string;
    contentTypes: string[];
    complianceChecklist: {
      [key: string]: boolean;
    };
    legalNotes: string;
    analyticsTools: string[];
    reportingFrequency: string;
    stakeholders: string[];
    successCriteria: string;
  }>({
    // Basic Information
    name: '',
    description: '',
    type: 'email',
    status: 'draft' as Campaign['status'],
    
    // Objectives & Goals
    primaryObjective: '',
    secondaryObjectives: [] as string[],
    smartGoals: '',
    
    // KPIs & Targets
    primaryKPI: '',
    kpiTargets: {
      revenue: '',
      leads: '',
      conversion: '',
      roi: '',
      impressions: '',
      clicks: ''
    },
    
    // Budget & Timeline
    totalBudget: '',
    budgetBreakdown: {
      media: '',
      content: '',
      technology: '',
      personnel: '',
      contingency: ''
    },
    startDate: '',
    endDate: '',
    
    // Target Audience
    targetAudience: '',
    audienceSegments: [] as string[],
    buyerPersonas: [] as { name: string; description: string }[],
    demographics: {
      ageRange: '',
      location: '',
      income: '',
      interests: ''
    },
    
    // Messaging & Content
    valueProposition: '',
    keyMessages: [] as string[],
    contentStrategy: '',
    creativeRequirements: '',
    brandGuidelines: '',
    
    // Channels & Distribution
    channels: [] as string[],
    channelStrategy: '',
    contentTypes: [] as string[],
    
    // Legal & Compliance
    complianceChecklist: {
      dataProtection: false,
      advertisingStandards: false,
      industryRegulations: false,
      termsOfService: false,
      privacyPolicy: false
    },
    legalNotes: '',
    
    // Monitoring & Reporting
    analyticsTools: [] as string[],
    reportingFrequency: '',
    stakeholders: [] as string[],
    successCriteria: ''
  });

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Campaign type is required';
    }

    if (formData.totalBudget && isNaN(Number(formData.totalBudget))) {
      newErrors.totalBudget = 'Budget must be a valid number';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id || id === 'new') {
        setIsEditing(true);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const result = await apiClient.getCampaignById(id) as ApiResponse<Campaign>;
        
        if (result.success && result.data) {
          setCampaign(result.data);
          // Map existing campaign data to comprehensive form
          setFormData({
            name: result.data.name || '',
            description: result.data.description || '',
            type: result.data.type || 'email',
            status: result.data.status || 'draft',
            
            primaryObjective: result.data.primaryObjective || '',
            secondaryObjectives: result.data.secondaryObjectives || [],
            smartGoals: result.data.smartGoals || '',
            
            primaryKPI: result.data.primaryKPI || '',
            kpiTargets: {
              revenue: (result.data.kpiTargets as KPITargets)?.revenue?.toString() || '',
              leads: (result.data.kpiTargets as KPITargets)?.leads?.toString() || '',
              conversion: (result.data.kpiTargets as KPITargets)?.conversion?.toString() || '',
              roi: (result.data.kpiTargets as KPITargets)?.roi?.toString() || '',
              impressions: (result.data.kpiTargets as KPITargets)?.impressions?.toString() || '',
              clicks: (result.data.kpiTargets as KPITargets)?.clicks?.toString() || ''
            },

            totalBudget: result.data.totalBudget?.toString() || '',
            budgetBreakdown: {
              media: (result.data.budgetBreakdown as BudgetBreakdown)?.media?.toString() || '',
              content: (result.data.budgetBreakdown as BudgetBreakdown)?.content?.toString() || '',
              technology: (result.data.budgetBreakdown as BudgetBreakdown)?.technology?.toString() || '',
              personnel: (result.data.budgetBreakdown as BudgetBreakdown)?.personnel?.toString() || '',
              contingency: (result.data.budgetBreakdown as BudgetBreakdown)?.contingency?.toString() || ''
            },
            startDate: result.data.startDate || '',
            endDate: result.data.endDate || '',
            
            targetAudience: result.data.targetAudience || '',
            audienceSegments: result.data.audienceSegments || [],
            buyerPersonas: result.data.buyerPersonas || [],
            demographics: result.data.demographics || {
              ageRange: '',
              location: '',
              income: '',
              interests: ''
            },
            
            valueProposition: result.data.valueProposition || '',
            keyMessages: result.data.keyMessages || [],
            contentStrategy: result.data.contentStrategy || '',
            creativeRequirements: result.data.creativeRequirements || '',
            brandGuidelines: result.data.brandGuidelines || '',
            
            channels: result.data.channels || [],
            channelStrategy: result.data.channelStrategy || '',
            contentTypes: result.data.contentTypes || [],
            
            complianceChecklist: result.data.complianceChecklist || {
              dataProtection: false,
              advertisingStandards: false,
              industryRegulations: false,
              termsOfService: false,
              privacyPolicy: false
            },
            legalNotes: result.data.legalNotes || '',
            
            analyticsTools: result.data.analyticsTools || [],
            reportingFrequency: result.data.reportingFrequency || '',
            stakeholders: result.data.stakeholders || [],
            successCriteria: result.data.successCriteria || ''
          });
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to load campaign details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
        toast({
          title: "Error",
          description: "Failed to load campaign details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors and try again",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const campaignData = {
        name: formData.name,
        description: formData.description,
        type: formData.type as 'email' | 'social_media' | 'other' | 'seo' | 'content' | 'paid_ads',
        status: formData.status,
        
        primaryObjective: formData.primaryObjective,
        secondaryObjectives: formData.secondaryObjectives,
        smartGoals: formData.smartGoals,
        
        primaryKPI: formData.primaryKPI,
        kpiTargets: formData.kpiTargets,
        
        totalBudget: formData.totalBudget ? Number(formData.totalBudget) : 0,
        budgetBreakdown: formData.budgetBreakdown,
        startDate: formData.startDate,
        endDate: formData.endDate,
        
        targetAudience: formData.targetAudience,
        audienceSegments: formData.audienceSegments,
        buyerPersonas: formData.buyerPersonas,
        demographics: formData.demographics,
        
        valueProposition: formData.valueProposition,
        keyMessages: formData.keyMessages,
        contentStrategy: formData.contentStrategy,
        creativeRequirements: formData.creativeRequirements,
        brandGuidelines: formData.brandGuidelines,
        
        channels: formData.channels,
        channelStrategy: formData.channelStrategy,
        contentTypes: formData.contentTypes,
        
        complianceChecklist: formData.complianceChecklist,
        legalNotes: formData.legalNotes,
        
        analyticsTools: formData.analyticsTools,
        reportingFrequency: formData.reportingFrequency,
        stakeholders: formData.stakeholders,
        successCriteria: formData.successCriteria
      };

      let result;
      if (id && id !== 'new') {
        result = await apiClient.updateCampaign(id, campaignData) as ApiResponse<Campaign>;
      } else {
        result = await apiClient.createCampaign(campaignData) as ApiResponse<Campaign>;
      }
      
      if (result.success) {
        setCampaign(result.data);
        setIsEditing(false);
        trackFormSubmit(true);
        toast({
          title: "Success",
          description: id && id !== 'new' ? "Campaign updated successfully" : "Campaign created successfully",
        });
        
        if ((!id || id === 'new') && result.data?.id) {
          navigate(`/app/campaigns/${result.data.id}`, { replace: true });
        }
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      trackFormSubmit(false, error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: "Error",
        description: id && id !== 'new' ? "Failed to update campaign" : "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string | number | string[] | Record<string, unknown>) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Field tracking functions for analytics
  const handleFieldFocus = useCallback((fieldName: string) => {
    fieldTimers.current[fieldName] = Date.now();
    trackFieldFocus(fieldName);
  }, [trackFieldFocus]);

  const handleFieldBlur = useCallback((fieldName: string, value: string | number | string[] | Record<string, unknown>) => {
    const startTime = fieldTimers.current[fieldName];
    if (startTime) {
      const timeSpent = Date.now() - startTime;
      const isEmpty = !value || (Array.isArray(value) && value.length === 0) || value.toString().trim() === '';
      trackFieldBlur(fieldName, isEmpty, timeSpent);
      delete fieldTimers.current[fieldName];
    }
  }, [trackFieldBlur]);

  // AI assistance functions
  const handleGenerateKeyMessages = async () => {
    trackAIAssistanceUsed('key-messages', 'keyMessages');
    try {
      const context = {
        campaignName: formData.name,
        campaignType: formData.type,
        targetAudience: formData.targetAudience,
        primaryObjective: formData.primaryObjective,
        valueProposition: formData.valueProposition
      };

      const generatedMessages = await generateKeyMessages(context);
      
      if (Array.isArray(generatedMessages)) {
        setFormData(prev => ({
          ...prev,
          keyMessages: [...prev.keyMessages, ...generatedMessages]
        }));
        toast({
          title: "Key Messages Generated",
          description: `Added ${generatedMessages.length} new key messages to your campaign.`,
        });
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleGenerateTargetPersonas = async () => {
    trackAIAssistanceUsed('target-personas', 'buyerPersonas');
    try {
      const context = {
        campaignName: formData.name,
        campaignType: formData.type,
        targetAudience: formData.targetAudience,
        demographics: formData.demographics,
        industry: formData.type // Use campaign type as industry hint
      };

      const generatedPersonas = await generateTargetPersonas(context);
      
      if (Array.isArray(generatedPersonas)) {
        setFormData(prev => ({
          ...prev,
          buyerPersonas: [...prev.buyerPersonas, ...generatedPersonas]
        }));
        toast({
          title: "Target Personas Generated",
          description: `Added ${generatedPersonas.length} new buyer personas to your campaign.`,
        });
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const updateNestedField = (parent: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const addArrayItem = (field: string, item: string) => {
    if (item.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], item.trim()]
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleDuplicate = async () => {
    if (!campaign?.id) return;
    
    try {
      const result = await apiClient.duplicateCampaign(campaign.id);
      if (result.success) {
        toast({
          title: "Campaign Duplicated",
          description: `"${campaign.name}" has been duplicated successfully.`,
        });
        navigate('/app/campaign-management');
      } else {
        throw new Error(result.message || 'Duplication failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate campaign",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async () => {
    if (!campaign?.id) return;
    
    if (confirm('Are you sure you want to archive this campaign?')) {
      try {
        const result = await apiClient.archiveCampaign(campaign.id);
        if (result.success) {
          toast({
            title: "Campaign Archived",
            description: `"${campaign.name}" has been archived.`,
          });
          navigate('/app/campaign-management');
        } else {
          throw new Error(result.message || 'Archive failed');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to archive campaign",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!campaign?.id) return;

    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        const result = await apiClient.deleteCampaign(campaign.id);
        if (result.success) {
          toast({
            title: "Campaign Deleted",
            description: `"${campaign.name}" has been deleted.`,
            variant: "destructive",
          });
          navigate('/app/campaign-management');
        } else {
          throw new Error(result.message || 'Delete failed');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete campaign",
          variant: "destructive",
        });
      }
    }
  };

  const handleLaunch = async () => {
    if (!campaign?.id) return;

    if (confirm(`Are you sure you want to launch "${campaign.name}"? This will activate the campaign and begin execution.`)) {
      try {
        setLaunching(true);
        const result = await apiClient.launchCampaign(campaign.id);

        if (result.success) {
          // Update local campaign state to reflect active status
          setCampaign(prev => prev ? { ...prev, status: 'active' } : null);
          setFormData(prev => ({ ...prev, status: 'active' }));

          toast({
            title: "Campaign Launched! 🚀",
            description: result.data?.summary || `"${campaign.name}" is now active and executing.`,
          });
        } else {
          throw new Error(result.message || 'Launch failed');
        }
      } catch (error) {
        toast({
          title: "Launch Failed",
          description: error instanceof Error ? error.message : "Failed to launch campaign",
          variant: "destructive",
        });
      } finally {
        setLaunching(false);
      }
    }
  };

  const handlePause = async () => {
    if (!campaign?.id) return;

    try {
      setLaunching(true);
      const result = await apiClient.pauseCampaign(campaign.id);

      if (result.success) {
        setCampaign(prev => prev ? { ...prev, status: 'paused' } : null);
        setFormData(prev => ({ ...prev, status: 'paused' }));

        toast({
          title: "Campaign Paused",
          description: `"${campaign.name}" has been paused.`,
        });
      } else {
        throw new Error(result.message || 'Pause failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause campaign",
        variant: "destructive",
      });
    } finally {
      setLaunching(false);
    }
  };

  const handleResume = async () => {
    if (!campaign?.id) return;

    try {
      setLaunching(true);
      const result = await apiClient.resumeCampaign(campaign.id);

      if (result.success) {
        setCampaign(prev => prev ? { ...prev, status: 'active' } : null);
        setFormData(prev => ({ ...prev, status: 'active' }));

        toast({
          title: "Campaign Resumed",
          description: `"${campaign.name}" is now active again.`,
        });
      } else {
        throw new Error(result.message || 'Resume failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resume campaign",
        variant: "destructive",
      });
    } finally {
      setLaunching(false);
    }
  };

  const handleStop = async () => {
    if (!campaign?.id) return;

    if (confirm(`Are you sure you want to stop "${campaign.name}"? This will mark the campaign as completed.`)) {
      try {
        setLaunching(true);
        const result = await apiClient.stopCampaign(campaign.id);

        if (result.success) {
          setCampaign(prev => prev ? { ...prev, status: 'completed' } : null);
          setFormData(prev => ({ ...prev, status: 'completed' }));

          toast({
            title: "Campaign Stopped",
            description: `"${campaign.name}" has been marked as completed.`,
          });
        } else {
          throw new Error(result.message || 'Stop failed');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to stop campaign",
          variant: "destructive",
        });
      } finally {
        setLaunching(false);
      }
    }
  };

  // Array management components
  const ArrayManager = ({ 
    label, 
    items, 
    onAdd, 
    onRemove, 
    placeholder,
    disabled = false 
  }: {
    label: string;
    items: string[];
    onAdd: (item: string) => void;
    onRemove: (index: number) => void;
    placeholder: string;
    disabled?: boolean;
  }) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
      if (newItem.trim()) {
        onAdd(newItem);
        setNewItem('');
      }
    };

    return (
      <div>
        <Label>{label}</Label>
        <div className="space-y-2 mt-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Badge variant="secondary" className="flex-1">{item}</Badge>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="h-6 w-6 p-0"
                >
                  x
                </Button>
              )}
            </div>
          ))}
          {!disabled && (
            <div className="flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={placeholder}
                className="bg-white"
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
                +
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2">
          <span>Loading campaign details...</span>
        </div>
      </div>
    );
  }

  const budgetUsed = formData.totalBudget ? 
    (Number(formData.budgetBreakdown.media || 0) + Number(formData.budgetBreakdown.content || 0)) / Number(formData.totalBudget) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/app/campaign-management')}
              className="p-2"
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {(!id || id === 'new') ? 'Create New Campaign' : 'Campaign Details'}
              </h1>
              <p className="text-gray-600">
                {(!id || id === 'new') ? 'Set up your comprehensive marketing campaign' : 'View and edit campaign information'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Campaign Control Buttons - Always visible, disabled when editing */}
            {id && id !== 'new' && (
              <>
                {formData.status === 'draft' && (
                  <Button
                    onClick={handleLaunch}
                    disabled={launching || isEditing}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                    size="lg"
                    title={isEditing ? "Save changes before launching" : "Launch this campaign"}
                  >
                    {launching ? 'Launching...' : 'Launch Campaign'}
                  </Button>
                )}

                {formData.status === 'active' && (
                  <>
                    <Button
                      onClick={handlePause}
                      disabled={launching || isEditing}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      size="lg"
                      title={isEditing ? "Save changes before pausing" : "Pause this campaign"}
                    >
                      Pause Campaign
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleStop}
                      disabled={launching || isEditing}
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      title={isEditing ? "Save changes before stopping" : "Stop this campaign"}
                    >
                      Stop
                    </Button>
                  </>
                )}

                {formData.status === 'paused' && (
                  <>
                    <Button
                      onClick={handleResume}
                      disabled={launching || isEditing}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      size="lg"
                      title={isEditing ? "Save changes before resuming" : "Resume this campaign"}
                    >
                      {launching ? 'Resuming...' : 'Resume Campaign'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleStop}
                      disabled={launching || isEditing}
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      title={isEditing ? "Save changes before stopping" : "Stop this campaign"}
                    >
                      Stop
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Edit Mode vs View Mode Buttons */}
            {!isEditing && id && id !== 'new' ? (
              <>
                <Button variant="outline" onClick={() => navigate(`/app/campaigns/${id}/dashboard`)}>
                  View Dashboard
                </Button>
                <Button variant="outline" onClick={handleDuplicate}>
                  Duplicate
                </Button>
                <Button variant="outline" onClick={handleArchive}>
                  Archive
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </>
            ) : (
              <>
                {id && id !== 'new' && (
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? 'Saving...' : ((!id || id === 'new') ? 'Create Campaign' : 'Save Changes')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="objectives">Objectives</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Campaign Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        onFocus={() => handleFieldFocus('campaignName')}
                        onBlur={() => handleFieldBlur('campaignName', formData.name)}
                        placeholder="Enter campaign name"
                        required
                        disabled={!isEditing && id && id !== 'new'}
                        className={`bg-white ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Describe your campaign"
                        rows={4}
                        disabled={!isEditing && id && id !== 'new'}
                        className="bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Campaign Type *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => updateField('type', value)}
                          disabled={!isEditing && id && id !== 'new'}
                        >
                          <SelectTrigger className={`bg-white ${errors.type ? 'border-red-500' : ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email Marketing</SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                            <SelectItem value="content">Content Marketing</SelectItem>
                            <SelectItem value="paid_ads">Paid Advertising</SelectItem>
                            <SelectItem value="lead_generation">Lead Generation</SelectItem>
                            <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                            <SelectItem value="product_launch">Product Launch</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => updateField('status', value)}
                          disabled={!isEditing && id && id !== 'new'}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => updateField('startDate', e.target.value)}
                          disabled={!isEditing && id && id !== 'new'}
                          className="bg-white"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => updateField('endDate', e.target.value)}
                          disabled={!isEditing && id && id !== 'new'}
                          className={`bg-white ${errors.endDate ? 'border-red-500' : ''}`}
                        />
                        {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Campaign Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-700">Total Budget</p>
                        <p className="text-xl font-bold text-blue-800">
                          ${formData.totalBudget ? Number(formData.totalBudget).toLocaleString() : '0'}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-700">Duration</p>
                        <p className="text-xl font-bold text-green-800">
                          {formData.startDate && formData.endDate ? 
                            Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24)) + ' days'
                            : 'Not set'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {formData.totalBudget && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Budget Allocation</span>
                          <span>{budgetUsed.toFixed(1)}% planned</span>
                        </div>
                        <Progress value={budgetUsed} className="h-3" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Key Information:</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• Type: {formData.type.replace('_', ' ')}</p>
                        <p>• Status: <Badge className={`ml-1 ${getStatusColor(formData.status)}`}>{formData.status}</Badge></p>
                        <p>• Objectives: {formData.secondaryObjectives.length} defined</p>
                        <p>• Channels: {formData.channels.length} selected</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Objectives Tab */}
            <TabsContent value="objectives" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Campaign Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primaryObjective">Primary Objective *</Label>
                      <Select
                        value={formData.primaryObjective}
                        onValueChange={(value) => updateField('primaryObjective', value)}
                        disabled={!isEditing && id && id !== 'new'}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select primary objective" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brand_awareness">Increase Brand Awareness</SelectItem>
                          <SelectItem value="lead_generation">Generate Leads</SelectItem>
                          <SelectItem value="sales_conversion">Drive Sales Conversions</SelectItem>
                          <SelectItem value="customer_retention">Improve Customer Retention</SelectItem>
                          <SelectItem value="market_expansion">Expand Market Reach</SelectItem>
                          <SelectItem value="product_launch">Product/Service Launch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <ArrayManager
                      label="Secondary Objectives"
                      items={formData.secondaryObjectives}
                      onAdd={(item) => addArrayItem('secondaryObjectives', item)}
                      onRemove={(index) => removeArrayItem('secondaryObjectives', index)}
                      placeholder="Add secondary objective"
                      disabled={!isEditing && id && id !== 'new'}
                    />

                    <div>
                      <Label htmlFor="smartGoals">SMART Goals</Label>
                      <Textarea
                        id="smartGoals"
                        value={formData.smartGoals}
                        onChange={(e) => updateField('smartGoals', e.target.value)}
                        placeholder="Define Specific, Measurable, Achievable, Relevant, Time-bound goals"
                        rows={4}
                        disabled={!isEditing && id && id !== 'new'}
                        className="bg-white"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Key Performance Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primaryKPI">Primary KPI</Label>
                      <Select
                        value={formData.primaryKPI}
                        onValueChange={(value) => updateField('primaryKPI', value)}
                        disabled={!isEditing && id && id !== 'new'}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select primary KPI" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Revenue Generated</SelectItem>
                          <SelectItem value="leads">Number of Leads</SelectItem>
                          <SelectItem value="conversion">Conversion Rate</SelectItem>
                          <SelectItem value="roi">Return on Investment</SelectItem>
                          <SelectItem value="impressions">Impressions/Reach</SelectItem>
                          <SelectItem value="engagement">Engagement Rate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="revenueTarget">Revenue Target ($)</Label>
                        <Input
                          id="revenueTarget"
                          type="number"
                          value={formData.kpiTargets.revenue}
                          onChange={(e) => updateNestedField('kpiTargets', 'revenue', e.target.value)}
                          placeholder="0"
                          disabled={!isEditing && id && id !== 'new'}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="leadsTarget">Leads Target</Label>
                        <Input
                          id="leadsTarget"
                          type="number"
                          value={formData.kpiTargets.leads}
                          onChange={(e) => updateNestedField('kpiTargets', 'leads', e.target.value)}
                          placeholder="0"
                          disabled={!isEditing && id && id !== 'new'}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="conversionTarget">Conversion Rate (%)</Label>
                        <Input
                          id="conversionTarget"
                          type="number"
                          value={formData.kpiTargets.conversion}
                          onChange={(e) => updateNestedField('kpiTargets', 'conversion', e.target.value)}
                          placeholder="0"
                          disabled={!isEditing && id && id !== 'new'}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="roiTarget">ROI Target (%)</Label>
                        <Input
                          id="roiTarget"
                          type="number"
                          value={formData.kpiTargets.roi}
                          onChange={(e) => updateNestedField('kpiTargets', 'roi', e.target.value)}
                          placeholder="0"
                          disabled={!isEditing && id && id !== 'new'}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Audience Tab */}
            <TabsContent value="audience" className="space-y-6">
                <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      Target Audience & Demographics
                    </div>
                    {(isEditing || (!id || id === 'new')) && (
                      <AIAssistanceButton
                        type="target-personas"
                        onClick={handleGenerateTargetPersonas}
                        loading={aiLoading}
                        disabled={!formData.targetAudience && !formData.primaryObjective}
                      />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="targetAudience">Target Audience Description</Label>
                    <Textarea
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => updateField('targetAudience', e.target.value)}
                      onFocus={() => handleFieldFocus('targetAudience')}
                      onBlur={() => handleFieldBlur('targetAudience', formData.targetAudience)}
                      placeholder="Describe your target audience in detail"
                      rows={3}
                      disabled={!isEditing && id && id !== 'new'}
                      className="bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ageRange">Age Range</Label>
                      <Input
                        id="ageRange"
                        value={formData.demographics.ageRange}
                        onChange={(e) => updateNestedField('demographics', 'ageRange', e.target.value)}
                        placeholder="e.g., 25-45"
                        disabled={!isEditing && id && id !== 'new'}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Geographic Location</Label>
                      <Input
                        id="location"
                        value={formData.demographics.location}
                        onChange={(e) => updateNestedField('demographics', 'location', e.target.value)}
                        placeholder="e.g., North America, Urban areas"
                        disabled={!isEditing && id && id !== 'new'}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="income">Income Level</Label>
                      <Input
                        id="income"
                        value={formData.demographics.income}
                        onChange={(e) => updateNestedField('demographics', 'income', e.target.value)}
                        placeholder="e.g., $50k-$100k annually"
                        disabled={!isEditing && id && id !== 'new'}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="interests">Key Interests</Label>
                      <Input
                        id="interests"
                        value={formData.demographics.interests}
                        onChange={(e) => updateNestedField('demographics', 'interests', e.target.value)}
                        placeholder="e.g., Technology, Fitness, Travel"
                        disabled={!isEditing && id && id !== 'new'}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <ArrayManager
                    label="Audience Segments"
                    items={formData.audienceSegments}
                    onAdd={(item) => addArrayItem('audienceSegments', item)}
                    onRemove={(index) => removeArrayItem('audienceSegments', index)}
                    placeholder="Add audience segment"
                    disabled={!isEditing && id && id !== 'new'}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Budget Tab */}
            <TabsContent value="budget" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Budget Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="totalBudget">Total Campaign Budget ($) *</Label>
                      <Input
                        id="totalBudget"
                        type="number"
                        value={formData.totalBudget}
                        onChange={(e) => updateField('totalBudget', e.target.value)}
                        placeholder="0"
                        disabled={!isEditing && id && id !== 'new'}
                        className={`bg-white ${errors.totalBudget ? 'border-red-500' : ''}`}
                      />
                      {errors.totalBudget && <p className="text-red-500 text-sm mt-1">{errors.totalBudget}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label>Budget Breakdown</Label>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label htmlFor="mediaBudget">Media Spend ($)</Label>
                          <Input
                            id="mediaBudget"
                            type="number"
                            value={formData.budgetBreakdown.media}
                            onChange={(e) => updateNestedField('budgetBreakdown', 'media', e.target.value)}
                            placeholder="0"
                            disabled={!isEditing && id && id !== 'new'}
                            className="bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contentBudget">Content Creation ($)</Label>
                          <Input
                            id="contentBudget"
                            type="number"
                            value={formData.budgetBreakdown.content}
                            onChange={(e) => updateNestedField('budgetBreakdown', 'content', e.target.value)}
                            placeholder="0"
                            disabled={!isEditing && id && id !== 'new'}
                            className="bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="technologyBudget">Technology & Tools ($)</Label>
                          <Input
                            id="technologyBudget"
                            type="number"
                            value={formData.budgetBreakdown.technology}
                            onChange={(e) => updateNestedField('budgetBreakdown', 'technology', e.target.value)}
                            placeholder="0"
                            disabled={!isEditing && id && id !== 'new'}
                            className="bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="personnelBudget">Personnel ($)</Label>
                          <Input
                            id="personnelBudget"
                            type="number"
                            value={formData.budgetBreakdown.personnel}
                            onChange={(e) => updateNestedField('budgetBreakdown', 'personnel', e.target.value)}
                            placeholder="0"
                            disabled={!isEditing && id && id !== 'new'}
                            className="bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contingencyBudget">Contingency (10-15%) ($)</Label>
                          <Input
                            id="contingencyBudget"
                            type="number"
                            value={formData.budgetBreakdown.contingency}
                            onChange={(e) => updateNestedField('budgetBreakdown', 'contingency', e.target.value)}
                            placeholder="0"
                            disabled={!isEditing && id && id !== 'new'}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Timeline & Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Campaign Timeline</p>
                      {formData.startDate && formData.endDate && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">
                            <strong>Duration:</strong> {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24))} days
                          </p>
                          <p className="text-sm">
                            <strong>Start:</strong> {new Date(formData.startDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm">
                            <strong>End:</strong> {new Date(formData.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium">Budget Summary</p>
                      <div className="space-y-2">
                        {formData.totalBudget && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Total Budget:</span>
                              <span className="font-medium">${Number(formData.totalBudget).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Allocated:</span>
                              <span>${(
                                Number(formData.budgetBreakdown.media || 0) +
                                Number(formData.budgetBreakdown.content || 0) +
                                Number(formData.budgetBreakdown.technology || 0) +
                                Number(formData.budgetBreakdown.personnel || 0) +
                                Number(formData.budgetBreakdown.contingency || 0)
                              ).toLocaleString()}</span>
                            </div>
                            <Progress 
                              value={Math.min(
                                ((Number(formData.budgetBreakdown.media || 0) +
                                  Number(formData.budgetBreakdown.content || 0) +
                                  Number(formData.budgetBreakdown.technology || 0) +
                                  Number(formData.budgetBreakdown.personnel || 0) +
                                  Number(formData.budgetBreakdown.contingency || 0)
                                ) / Number(formData.totalBudget)) * 100,
                                100
                              )} 
                              className="h-2" 
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Messaging & Content Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="valueProposition">Value Proposition</Label>
                    <Textarea
                      id="valueProposition"
                      value={formData.valueProposition}
                      onChange={(e) => updateField('valueProposition', e.target.value)}
                      placeholder="What unique value does your campaign offer to customers?"
                      rows={3}
                      disabled={!isEditing && id && id !== 'new'}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Key Messages</Label>
                      {(isEditing || (!id || id === 'new')) && (
                        <AIAssistanceButton
                          type="key-messages"
                          onClick={handleGenerateKeyMessages}
                          loading={aiLoading}
                          disabled={!formData.name && !formData.primaryObjective}
                        />
                      )}
                    </div>
                    <ArrayManager
                      label=""
                      items={formData.keyMessages}
                      onAdd={(item) => addArrayItem('keyMessages', item)}
                      onRemove={(index) => removeArrayItem('keyMessages', index)}
                      placeholder="Add key message"
                      disabled={!isEditing && id && id !== 'new'}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contentStrategy">Content Strategy</Label>
                    <Textarea
                      id="contentStrategy"
                      value={formData.contentStrategy}
                      onChange={(e) => updateField('contentStrategy', e.target.value)}
                      placeholder="Describe your overall content approach and strategy"
                      rows={4}
                      disabled={!isEditing && id && id !== 'new'}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="creativeRequirements">Creative Requirements</Label>
                    <Textarea
                      id="creativeRequirements"
                      value={formData.creativeRequirements}
                      onChange={(e) => updateField('creativeRequirements', e.target.value)}
                      placeholder="Specify creative assets needed (videos, images, copy, etc.)"
                      rows={3}
                      disabled={!isEditing && id && id !== 'new'}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="brandGuidelines">Brand Guidelines</Label>
                    <Textarea
                      id="brandGuidelines"
                      value={formData.brandGuidelines}
                      onChange={(e) => updateField('brandGuidelines', e.target.value)}
                      placeholder="Key brand guidelines and requirements for this campaign"
                      rows={3}
                      disabled={!isEditing && id && id !== 'new'}
                      className="bg-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Channels Tab */}
            <TabsContent value="channels" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Marketing Channels & Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Marketing Channels</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Email Marketing', 'Social Media', 'Paid Search', 'Display Advertising', 'Content Marketing', 'Influencer Marketing', 'PR/Media', 'Direct Mail'].map((channel) => (
                        <div key={channel} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.channels.includes(channel)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateField('channels', [...formData.channels, channel]);
                              } else {
                                updateField('channels', formData.channels.filter(c => c !== channel));
                              }
                            }}
                            disabled={!isEditing && id && id !== 'new'}
                          />
                          <label className="text-sm">{channel}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="channelStrategy">Channel Strategy</Label>
                    <Textarea
                      id="channelStrategy"
                      value={formData.channelStrategy}
                      onChange={(e) => updateField('channelStrategy', e.target.value)}
                      placeholder="Explain how you'll use each selected channel"
                      rows={4}
                      disabled={!isEditing && id && id !== 'new'}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label>Content Types</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Blog Posts', 'Videos', 'Infographics', 'Email Newsletters', 'Social Posts', 'Webinars', 'Whitepapers', 'Case Studies'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.contentTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateField('contentTypes', [...formData.contentTypes, type]);
                              } else {
                                updateField('contentTypes', formData.contentTypes.filter(t => t !== type));
                              }
                            }}
                            disabled={!isEditing && id && id !== 'new'}
                          />
                          <label className="text-sm">{type}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Legal & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Compliance Checklist</Label>
                    <div className="space-y-3 mt-3">
                      {[
                        { key: 'dataProtection', label: 'Data Protection (GDPR, CCPA)' },
                        { key: 'advertisingStandards', label: 'Advertising Standards Compliance' },
                        { key: 'industryRegulations', label: 'Industry-Specific Regulations' },
                        { key: 'termsOfService', label: 'Terms of Service Updated' },
                        { key: 'privacyPolicy', label: 'Privacy Policy Current' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.complianceChecklist[item.key]}
                            onCheckedChange={(checked) => 
                              updateNestedField('complianceChecklist', item.key, checked)
                            }
                            disabled={!isEditing && id && id !== 'new'}
                          />
                          <label className="text-sm">{item.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="legalNotes">Legal Notes & Requirements</Label>
                    <Textarea
                      id="legalNotes"
                      value={formData.legalNotes}
                      onChange={(e) => updateField('legalNotes', e.target.value)}
                      placeholder="Any specific legal requirements or notes for this campaign"
                      rows={4}
                      disabled={!isEditing && id && id !== 'new'}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="successCriteria">Success Criteria & Measurement</Label>
                    <Textarea
                      id="successCriteria"
                      value={formData.successCriteria}
                      onChange={(e) => updateField('successCriteria', e.target.value)}
                      placeholder="Define what success looks like and how it will be measured"
                      rows={3}
                      disabled={!isEditing && id && id !== 'new'}
                      className="bg-white"
                    />
                  </div>

                  <ArrayManager
                    label="Stakeholders"
                    items={formData.stakeholders}
                    onAdd={(item) => addArrayItem('stakeholders', item)}
                    onRemove={(index) => removeArrayItem('stakeholders', index)}
                    placeholder="Add stakeholder email"
                    disabled={!isEditing && id && id !== 'new'}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
      <PageHelpModal helpKey="campaigns" />
    </div>
  );
};

export default CampaignDetails;