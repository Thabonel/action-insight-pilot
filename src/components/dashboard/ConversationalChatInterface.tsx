
import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Loader2, AlertTriangle, RotateCcw, Save, CheckCircle, Edit, X, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseCampaignFromConversation } from '@/lib/campaign-parser';
import { apiClient } from '@/lib/api-client';
import { findRelevantTemplates, applyCampaignTemplate, type CampaignTemplate } from '@/lib/campaign-templates';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  query?: string;
  response?: string;
}

interface ConversationalChatInterfaceProps {
  chatHistory: ChatMessage[];
  isProcessing: boolean;
  query: string;
  setQuery: (query: string) => void;
  handleQuerySubmit: (e: React.FormEvent) => void;
  handleSuggestionClick: (suggestion: string) => void;
  user: any;
  latestMetadata?: any;
  // Campaign flow props
  isCampaignFlow?: boolean;
  currentQuestion?: string;
  progress?: { current: number; total: number; percentage: number };
  campaignCreationStatus?: 'idle' | 'in_progress' | 'creating' | 'completed' | 'error';
  collectedAnswers?: Record<string, any>;
  onAnswerProvided?: (answer: string) => void;
  onCampaignFlowReset?: () => void;
}

const ConversationalChatInterface: React.FC<ConversationalChatInterfaceProps> = ({
  chatHistory,
  isProcessing,
  query,
  setQuery,
  handleQuerySubmit,
  handleSuggestionClick,
  user,
  latestMetadata,
  // Campaign flow props
  isCampaignFlow = false,
  currentQuestion = '',
  progress = { current: 0, total: 0, percentage: 0 },
  campaignCreationStatus = 'idle',
  collectedAnswers = {},
  onAnswerProvided,
  onCampaignFlowReset
}) => {
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campaignCreated, setCampaignCreated] = useState(false);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [failedCampaignData, setFailedCampaignData] = useState<any>(null);
  const [showCampaignPreview, setShowCampaignPreview] = useState(false);
  const [previewCampaignData, setPreviewCampaignData] = useState<any>(null);
  const [suggestedTemplates, setSuggestedTemplates] = useState<CampaignTemplate[]>([]);

  // Function to detect if conversation contains enough campaign information
  const detectCampaignReady = (messages: ChatMessage[]) => {
    const conversationText = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join(' ')
      .toLowerCase();

    // Enhanced detection for campaign readiness
    const readyPhrases = [
      'ready to create',
      'create the campaign',
      'create your campaign',
      'enough information',
      'build your campaign',
      'create your campaign now',
      'shall we create',
      "let's create the campaign",
      'generate a complete campaign plan',
      'comprehensive campaign plan',
      'ready to create your multi-channel campaign'
    ];

    // Also check if user explicitly confirms
    const userConfirmations = messages
      .filter(m => m.role === 'user')
      .map(m => m.content.toLowerCase());
    
    const hasUserConfirmation = userConfirmations.some(msg => 
      msg.includes('yes, create') || 
      msg.includes('create the campaign') ||
      msg.includes('go ahead') ||
      msg.includes('proceed')
    );

    return readyPhrases.some(phrase => conversationText.includes(phrase)) || hasUserConfirmation;
  };

  // Show campaign preview instead of creating immediately
  const showCampaignPreviewForApproval = () => {
    if (!user) return;

    try {
      // Extract conversation text for parsing
      const conversationText = chatHistory
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      // Parse campaign data from conversation
      const parsedCampaign = parseCampaignFromConversation(conversationText);
      setPreviewCampaignData(parsedCampaign);
      setShowCampaignPreview(true);
    } catch (error) {
      console.error('Error parsing campaign data for preview:', error);
    }
  };

  // Handle campaign approval actions
  const handleCampaignApproval = (action: 'yes' | 'edit' | 'cancel') => {
    switch (action) {
      case 'yes':
        if (previewCampaignData) {
          createCampaignFromData(previewCampaignData);
        }
        setShowCampaignPreview(false);
        break;
      case 'edit':
        setShowCampaignPreview(false);
        // Keep the conversation going for edits
        break;
      case 'cancel':
        setShowCampaignPreview(false);
        setPreviewCampaignData(null);
        break;
    }
  };

  // Save failed campaign data to localStorage
  const saveFailedCampaignToStorage = (campaignData: any, conversationText: string) => {
    const failedAttempt = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      campaignData,
      conversationText,
      userId: user?.id
    };

    const existingAttempts = JSON.parse(localStorage.getItem('failedCampaignAttempts') || '[]');
    existingAttempts.push(failedAttempt);
    
    // Keep only the last 5 attempts to avoid storage bloat
    if (existingAttempts.length > 5) {
      existingAttempts.splice(0, existingAttempts.length - 5);
    }
    
    localStorage.setItem('failedCampaignAttempts', JSON.stringify(existingAttempts));
  };

  // Retry campaign creation
  const retryCampaignCreation = async () => {
    if (!failedCampaignData) return;
    
    setCampaignError(null);
    setIsCreatingCampaign(true);
    
    try {
      const result = await apiClient.createCampaignFromAI(failedCampaignData);
      
      if (result.success) {
        setCampaignCreated(true);
        setFailedCampaignData(null);
        console.log('Campaign created successfully on retry:', result.data);
      } else {
        setCampaignError(result.error || 'Failed to create campaign. Please try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setCampaignError(errorMessage);
      console.error('Error retrying campaign creation:', error);
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // Save answers for later
  const saveAnswersForLater = () => {
    if (!failedCampaignData) return;
    
    const conversationText = chatHistory
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
    
    saveFailedCampaignToStorage(failedCampaignData, conversationText);
    setCampaignError(null);
    setFailedCampaignData(null);
    
    // Show success message temporarily
    setTimeout(() => {
      setCampaignCreated(false);
    }, 3000);
  };

  // Function to create campaign from parsed data with brief generation
  const createCampaignFromData = async (campaignData: any) => {
    setIsCreatingCampaign(true);
    setCampaignError(null);
    
    try {
      // Generate campaign brief
      const { generateCampaignBrief } = await import('@/lib/campaign-brief-generator');
      const brief = generateCampaignBrief(campaignData);
      
      // Add brief to campaign content
      const updatedCampaignData = {
        ...campaignData,
        content: {
          ...campaignData.content,
          brief: brief
        }
      };

      const result = await apiClient.createCampaignFromAI(updatedCampaignData);

      if (result.success) {
        setCampaignCreated(true);
        setCreatedCampaignId(result.data?.id || null);
        
        // Trigger campaigns list refresh by setting a refresh flag in localStorage
        localStorage.setItem('campaignsListNeedsRefresh', 'true');
        
        console.log('Campaign created successfully:', result.data);
      } else {
        const errorMessage = result.error || 'Failed to create campaign. Please try again.';
        setCampaignError(errorMessage);
        setFailedCampaignData(campaignData);
        
        const conversationText = chatHistory
          .map(m => `${m.role}: ${m.content}`)
          .join('\n');
        saveFailedCampaignToStorage(campaignData, conversationText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while creating the campaign.';
      setCampaignError(errorMessage);
      setFailedCampaignData(campaignData);
      
      const conversationText = chatHistory
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');
      saveFailedCampaignToStorage(campaignData, conversationText);
      
      console.error('Error creating campaign:', error);
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // Function to create campaign from conversation
  const createCampaignFromConversation = async () => {
    // Show preview instead of creating immediately
    showCampaignPreviewForApproval();
  };

  // Check for template suggestions when user input changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      const latestUserMessage = chatHistory
        .filter(m => m.role === 'user')
        .slice(-1)[0]?.content || '';
      
      if (latestUserMessage.length > 10) {
        const templates = findRelevantTemplates(latestUserMessage);
        setSuggestedTemplates(templates);
      }
    }
  }, [chatHistory]);

  // Check if campaign should be created when chat history updates
  useEffect(() => {
    if (chatHistory.length > 0 && !campaignCreated && !isCreatingCampaign && !showCampaignPreview) {
      const shouldCreate = detectCampaignReady(chatHistory);
      if (shouldCreate) {
        createCampaignFromConversation();
      }
    }
  }, [chatHistory, campaignCreated, isCreatingCampaign, showCampaignPreview]);

  // Handle template selection
  const handleTemplateSelection = (template: CampaignTemplate) => {
    const templateCampaign = applyCampaignTemplate(template);
    setPreviewCampaignData(templateCampaign);
    setShowCampaignPreview(true);
    setSuggestedTemplates([]); // Clear suggestions after selection
  };

  // Enhanced campaign preview formatting
  const formatCampaignPreview = (campaign: any) => {
    const formatBudget = (amount: number) => `$${amount.toLocaleString()}`;
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
    const formatKPITargets = (kpiTargets: Record<string, any>) => {
      if (!kpiTargets || Object.keys(kpiTargets).length === 0) return 'Not specified';
      
      const formattedTargets = [];
      if (kpiTargets.leads) formattedTargets.push(`${kpiTargets.leads} leads ${kpiTargets.leads_period ? `per ${kpiTargets.leads_period}` : ''}`);
      if (kpiTargets.conversion_rate) formattedTargets.push(`${kpiTargets.conversion_rate}% conversion rate`);
      if (kpiTargets.engagement_rate) formattedTargets.push(`${kpiTargets.engagement_rate}% engagement rate`);
      if (kpiTargets.email_open_rate) formattedTargets.push(`${kpiTargets.email_open_rate}% email open rate`);
      if (kpiTargets.email_click_rate) formattedTargets.push(`${kpiTargets.email_click_rate}% email click rate`);
      
      return formattedTargets.length > 0 ? formattedTargets.join(', ') : 'Not specified';
    };

    return {
      name: campaign.name || 'Untitled Campaign',
      type: campaign.type || 'other',
      budget: campaign.total_budget ? formatBudget(campaign.total_budget) : 'Not specified',
      startDate: campaign.start_date ? formatDate(campaign.start_date) : 'Not specified',
      endDate: campaign.end_date ? formatDate(campaign.end_date) : 'Not specified',
      targetAudience: campaign.target_audience || 'Not specified',
      objective: campaign.primary_objective || 'Not specified',
      channel: campaign.channel || 'Not specified',
      channels: Array.isArray(campaign.channels) ? campaign.channels.join(', ') : campaign.channel || 'Not specified',
      kpiTargets: formatKPITargets(campaign.kpi_targets),
      isMultiChannel: Array.isArray(campaign.channels) && campaign.channels.length > 1
    };
  };

  const suggestions = [
    "I want to create a new marketing campaign",
    "Help me plan a campaign strategy",
    "What industry are you in?",
    "Let's start building your campaign",
    "Guide me through campaign creation",
    "I need help with my marketing campaign"
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Progress Bar */}
        {isCampaignFlow && progress.total > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                Campaign Creation Progress
              </span>
              <span className="text-sm text-blue-600">
                {progress.current}/{progress.total} questions completed
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Campaign Creation Assistant</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Ready to build your campaign</span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to create your marketing campaign?</h4>
              <p className="text-gray-600 mb-6">I'll guide you through building a comprehensive campaign step-by-step</p>
              
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700 mb-3">Try asking:</p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                 <div
                   className={`max-w-[80%] p-3 rounded-lg ${
                     message.role === 'user'
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-100 text-gray-900'
                   }`}
                 >
                   <p className="text-sm">{message.content}</p>
                   <p className="text-xs mt-1 opacity-70">
                     {message.timestamp.toLocaleTimeString()}
                   </p>
                   
                   {/* Campaign Type Selection Buttons */}
                   {message.role === 'assistant' && latestMetadata?.campaignTypeOptions && (
                     <div className="mt-3 pt-3 border-t border-gray-200">
                       <p className="text-xs font-medium text-gray-700 mb-2">Select a campaign type:</p>
                       <div className="grid grid-cols-2 gap-2">
                         {latestMetadata.campaignTypeOptions.map((option: any) => (
                           <button
                             key={option.value}
                             onClick={() => handleSuggestionClick(`${option.label} campaign - ${option.description}`)}
                             className="text-left p-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-xs transition-colors"
                           >
                             <div className="font-medium text-gray-800">{option.label}</div>
                             <div className="text-gray-600 text-xs">{option.description}</div>
                           </button>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
              </div>
            ))
          )}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {showCampaignPreview && previewCampaignData && (
            <div className="flex justify-start">
              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-lg max-w-[90%]">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-semibold">Campaign Preview</span>
                </div>
                
                {(() => {
                  const preview = formatCampaignPreview(previewCampaignData);
                  return (
                     <div className="space-y-3 mb-4">
                       <div>
                         <span className="font-medium text-blue-800">Campaign Name:</span>
                         <span className="ml-2 text-blue-700">{preview.name}</span>
                       </div>
                       <div>
                         <span className="font-medium text-blue-800">Type:</span>
                         <span className="ml-2 text-blue-700 capitalize">{preview.type.replace('_', ' ')}</span>
                         {preview.isMultiChannel && (
                           <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                             Multi-Channel
                           </span>
                         )}
                       </div>
                       <div>
                         <span className="font-medium text-blue-800">
                           {preview.isMultiChannel ? 'Channels:' : 'Channel:'}
                         </span>
                         <span className="ml-2 text-blue-700 capitalize">{preview.channels}</span>
                       </div>
                       <div>
                         <span className="font-medium text-blue-800">Budget:</span>
                         <span className="ml-2 text-blue-700">{preview.budget}</span>
                       </div>
                       <div>
                         <span className="font-medium text-blue-800">Duration:</span>
                         <span className="ml-2 text-blue-700">{preview.startDate} - {preview.endDate}</span>
                       </div>
                       <div>
                         <span className="font-medium text-blue-800">Target Audience:</span>
                         <span className="ml-2 text-blue-700">{preview.targetAudience}</span>
                       </div>
                       <div>
                         <span className="font-medium text-blue-800">Objective:</span>
                         <span className="ml-2 text-blue-700">{preview.objective}</span>
                       </div>
                       {preview.kpiTargets !== 'Not specified' && (
                         <div>
                           <span className="font-medium text-blue-800">KPI Targets:</span>
                           <span className="ml-2 text-blue-700">{preview.kpiTargets}</span>
                         </div>
                       )}
                     </div>
                  );
                })()}
                
                <div className="border-t border-blue-200 pt-3">
                  <p className="text-blue-800 font-medium mb-3">Shall I create this campaign for you?</p>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleCampaignApproval('yes')}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Yes, Create It
                    </Button>
                    <Button 
                      onClick={() => handleCampaignApproval('edit')}
                      size="sm"
                      variant="outline"
                      className="text-blue-700 border-blue-300 hover:bg-blue-50"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit Details
                    </Button>
                    <Button 
                      onClick={() => handleCampaignApproval('cancel')}
                      size="sm"
                      variant="outline"
                      className="text-red-700 border-red-300 hover:bg-red-50"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isCreatingCampaign && (
            <div className="flex justify-start">
              <div className="bg-green-100 text-green-900 p-3 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Loader2 className="animate-spin w-4 h-4 text-green-600" />
                  <span className="text-sm">Creating your campaign...</span>
                </div>
              </div>
            </div>
          )}

          {campaignError && (
            <div className="flex justify-start">
              <div className="bg-red-100 text-red-900 p-3 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Campaign Creation Failed</span>
                </div>
                <p className="text-sm mb-3">{campaignError}</p>
                <div className="flex space-x-2">
                  <Button 
                    onClick={retryCampaignCreation}
                    disabled={isCreatingCampaign}
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                  <Button 
                    onClick={saveAnswersForLater}
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save for Later
                  </Button>
                </div>
              </div>
            </div>
          )}

          {campaignCreated && (
            <div className="flex justify-start">
              <div className="bg-green-100 text-green-900 p-4 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-semibold">Campaign Created Successfully! 🎉</span>
                </div>
                <p className="text-sm text-green-800 mb-3">
                  Your campaign has been created and is ready to launch. You can now view and manage it from your campaigns dashboard.
                </p>
                <div className="flex space-x-2">
                  {createdCampaignId && (
                    <Link to={`/app/campaigns/${createdCampaignId}`}>
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Campaign
                      </Button>
                    </Link>
                  )}
                  <Link to="/app/campaign-management">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                      View All Campaigns
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Template Suggestions */}
          {suggestedTemplates.length > 0 && !showCampaignPreview && !campaignCreated && (
            <div className="flex justify-start">
              <div className="bg-purple-50 border border-purple-200 text-purple-900 p-4 rounded-lg max-w-[90%]">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="text-lg font-semibold">Suggested Campaign Templates</span>
                </div>
                <p className="text-sm text-purple-800 mb-4">
                  Based on your requirements, here are some pre-built templates that might work for you:
                </p>
                <div className="space-y-3">
                  {suggestedTemplates.map((template) => (
                    <div key={template.id} className="bg-white border border-purple-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-900 mb-1">{template.name}</h4>
                          <p className="text-sm text-purple-700 mb-2">{template.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-purple-600">
                            <span>Type: {template.template.type.replace('_', ' ')}</span>
                            <span>Duration: {template.template.duration_days} days</span>
                            <span>Budget: ${template.template.budget_range.min.toLocaleString()} - ${template.template.budget_range.max.toLocaleString()}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleTemplateSelection(template)}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white ml-3"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <Button
                    onClick={() => setSuggestedTemplates([])}
                    size="sm"
                    variant="outline"
                    className="text-purple-700 border-purple-300 hover:bg-purple-50"
                  >
                    Continue Custom Campaign
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleQuerySubmit} className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={user ? "How can I help optimize your marketing today?" : "Please log in to chat..."}
            disabled={!user || isProcessing}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-black placeholder-gray-500"
          />
          <Button
            type="submit"
            disabled={!query.trim() || isProcessing || !user}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* More Suggestions */}
        {chatHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">More suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationalChatInterface;
