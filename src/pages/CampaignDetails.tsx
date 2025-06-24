import React, { useState, useEffect } from 'react';
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
import { apiClient } from '@/lib/api-client';
import { Campaign, ApiResponse } from '@/lib/api-client-interface';
import {
  Loader2,
  ArrowLeft,
  Save,
  Copy,
  Archive,
  Trash2,
  Edit3,
  Target,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  MessageSquare,
  Share2,
  FileText,
  Shield,
  Plus,
  X
} from 'lucide-react';

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Comprehensive form data state
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) {
        setIsEditing(true); // New campaign mode
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const result = await apiClient.getCampaignById(id) as ApiResponse<Campaign>;
        
        if (result.success && result.data) {
          setCampaign(result.data);
          // Map existing campaign data to comprehensive form
          setFormData(prev => ({
            ...prev,
            name: result.data.name,
            description: result.data.description || '',
            type: result.data.type,
            status: result.data.status
          }));
        } else {
          toast({
            title: "Error",
            description: "Failed to load campaign details",
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
    
    try {
      setSaving(true);
      
      const campaignData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        // Add more fields as your API supports them
      };

      let result;
      if (id) {
        result = await apiClient.updateCampaign(id, campaignData) as ApiResponse<Campaign>;
      } else {
        result = await apiClient.createCampaign(campaignData) as ApiResponse<Campaign>;
      }
      
      if (result.success) {
        setCampaign(result.data);
        setIsEditing(false);
        toast({
          title: "Success",
          description: id ? "Campaign updated successfully" : "Campaign created successfully",
        });
        
        if (!id && result.data?.id) {
          navigate(`/app/campaigns/${result.data.id}`, { replace: true });
        }
      } else {
        throw new Error('Operation failed');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({
        title: "Error",
        description: id ? "Failed to update campaign" : "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
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

  const handleDuplicate = () => {
    toast({
      title: "Campaign Duplicated",
      description: `"${formData.name}" has been duplicated.`,
    });
  };

  const handleArchive = () => {
    if (confirm('Are you sure you want to archive this campaign?')) {
      toast({
        title: "Campaign Archived",
        description: `"${formData.name}" has been archived.`,
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      toast({
        title: "Campaign Deleted",
        description: `"${formData.name}" has been deleted.`,
        variant: "destructive",
      });
      navigate('/app/campaign-management');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading campaign details...</span>
        </div>
      </div>
    );
  }

  const budgetUsed = formData.totalBudget ? 
    (Number(formData.budgetBreakdown.media) + Number(formData.budgetBreakdown.content)) / Number(formData.totalBudget) * 100 : 0;

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
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {id ? 'Campaign Details' : 'Create New Campaign'}
              </h1>
              <p className="text-gray-600">
                {id ? 'View and edit campaign information' : 'Set up your comprehensive marketing campaign'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing && id ? (
              <>
                <Button variant="outline" onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
                <Button variant="outline" onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                {id && (
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {id ? 'Save Changes' : 'Create Campaign'}
                    </>
                  )}
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
                      <FileText className="h-5 w-5" />
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
                        placeholder="Enter campaign name"
                        required
                        disabled={!isEditing && id}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Describe your campaign"
                        rows={4}
                        disabled={!isEditing && id}
                        className="bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Campaign Type *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => updateField('type', value)}
                          disabled={!isEditing && id}
                        >
                          <SelectTrigger className="bg-white">
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
                      </div>
                      
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => updateField('status', value)}
                          disabled={!isEditing && id}
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
                          disabled={!isEditing && id}
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
                          disabled={!isEditing && id}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
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
                        <p>• Status: {formData.status}</p>
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
                      <Target className="h-5 w-5" />
                      Campaign Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primaryObjective">Primary Objective *</Label>
                      <Select
                        value={formData.primaryObjective}
                        onValueChange={(value) => updateField('primaryObjective', value)}
                        disabled={!isEditing && id}
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

                    <div>
                      <Label htmlFor="smartGoals">SMART Goals</Label>
                      <Textarea
                        id="smartGoals"
                        value={formData.smartGoals}
                        onChange={(e) => updateField('smartGoals', e.target.value)}
                        placeholder="Define Specific, Measurable, Achievable, Relevant, Time-bound goals"
                        rows={4}
                        disabled={!isEditing && id}
                        className="bg-white"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Key Performance Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primaryKPI">Primary KPI</Label>
                      <Select
                        value={formData.primaryKPI}
                        onValueChange={(value) => updateField('primaryKPI', value)}
                        disabled={!isEditing && id}
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
                          disabled={!isEditing && id}
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
                          disabled={!isEditing && id}
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
                          disabled={!isEditing && id}
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
                          disabled={!isEditing && id}
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
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Target Audience & Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="targetAudience">Target Audience Description</Label>
                    <Textarea
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => updateField('targetAudience', e.target.value)}
                      placeholder="Describe your target audience in detail"
                      rows={3}
                      disabled={!isEditing && id}
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
                        disabled={!isEditing && id}
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
                        disabled={!isEditing && id}
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
                        disabled={!isEditing && id}
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
                        disabled={!isEditing && id}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Budget Tab */}
            <TabsContent value="budget" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
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
                        disabled={!isEditing && id}
                        className="bg-white"
                      />
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
                            disabled={!isEditing && id}
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
                            disabled={!isEditing && id}
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
                            disabled={!isEditing && id}
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
                            disabled={!isEditing && id}
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
                            disabled={!isEditing && id}
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
                      <Calendar className="h-5 w-5" />
                      Timeline & Milestones
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
                    <MessageSquare className="h-5 w-5" />
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
                      disabled={!isEditing && id}
                      className="bg-white"
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
                      disabled={!isEditing && id}
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
                      disabled={!isEditing && id}
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
                      disabled={!isEditing && id}
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
                    <Share2 className="h-5 w-5" />
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
                            disabled={!isEditing && id}
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
                      disabled={!isEditing && id}
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
                            disabled={!isEditing && id}
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
                    <Shield className="h-5 w-5" />
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
                            disabled={!isEditing && id}
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
                      disabled={!isEditing && id}
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
                      disabled={!isEditing && id}
                      className="bg-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );
};

export default CampaignDetails;