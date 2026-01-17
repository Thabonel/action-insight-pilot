import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { KnowledgeService } from '@/lib/services/knowledge-service';
import { logger } from '@/lib/logger';
import { Upload, FileText, ArrowRight, Check, Loader2, Rocket } from 'lucide-react';

interface QuickStartWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CreatedCampaign {
  id: string;
  name: string;
  type: string;
}

interface CreatedBucket {
  id: string;
  name: string;
}

interface UploadedDocument {
  title: string;
  status: 'uploading' | 'success' | 'error';
}

const CAMPAIGN_TYPES = [
  { value: 'multi_channel', label: 'Multi-Channel', description: 'Coordinate across multiple platforms' },
  { value: 'social', label: 'Social Media', description: 'Focus on social platforms' },
  { value: 'email', label: 'Email Marketing', description: 'Email campaigns and sequences' },
  { value: 'content', label: 'Content Marketing', description: 'Blog posts, articles, SEO' },
  { value: 'paid_ads', label: 'Paid Advertising', description: 'PPC and display ads' },
];

export const QuickStartWizard: React.FC<QuickStartWizardProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Campaign info
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('multi_channel');

  // Created resources
  const [createdCampaign, setCreatedCampaign] = useState<CreatedCampaign | null>(null);
  const [createdBucket, setCreatedBucket] = useState<CreatedBucket | null>(null);

  // Step 2: Documents
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setCampaignName('');
    setCampaignType('multi_channel');
    setCreatedCampaign(null);
    setCreatedBucket(null);
    setUploadedDocuments([]);
    setIsLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetWizard();
    onOpenChange(false);
  }, [resetWizard, onOpenChange]);

  // Step 1: Create campaign and bucket
  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      toast({
        title: 'Campaign name required',
        description: 'Please enter a name for your campaign',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the quick-start-campaign Edge Function
      const { data, error } = await supabase.functions.invoke('quick-start-campaign', {
        body: {
          campaignName: campaignName.trim(),
          campaignType,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create campaign');
      }

      setCreatedCampaign(data.campaign);
      setCreatedBucket(data.bucket);
      setCurrentStep(2);

      toast({
        title: 'Campaign created',
        description: `"${data.campaign.name}" is ready for documents`,
      });
    } catch (error) {
      logger.error('Campaign creation failed', { error, campaignName, campaignType });
      toast({
        title: 'Failed to create campaign',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !createdBucket) return;

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // Add to UI with uploading status
      const docEntry: UploadedDocument = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        status: 'uploading',
      };
      setUploadedDocuments(prev => [...prev, docEntry]);

      try {
        // Extract content from file
        const content = await KnowledgeService.extractTextFromFile(file);

        // Upload to bucket
        await KnowledgeService.uploadDocument(
          createdBucket.id,
          file.name.replace(/\.[^/.]+$/, ''),
          content,
          file.name,
          file.type,
          file.size
        );

        // Update status to success
        setUploadedDocuments(prev =>
          prev.map(doc =>
            doc.title === docEntry.title ? { ...doc, status: 'success' } : doc
          )
        );
      } catch (error) {
        logger.error('Document upload failed', { error, fileName: file.name, bucketId: createdBucket.id });
        setUploadedDocuments(prev =>
          prev.map(doc =>
            doc.title === docEntry.title ? { ...doc, status: 'error' } : doc
          )
        );
        toast({
          title: 'Upload failed',
          description: `Failed to upload ${file.name}`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Step 3: Navigate to AI Chat
  const handleStartPlanning = () => {
    if (!createdCampaign) return;

    handleClose();
    navigate(`/app/conversational-dashboard?campaignId=${createdCampaign.id}`);
  };

  const stepTitles = ['Name Your Campaign', 'Add Documents', 'Start Planning'];
  const progress = (currentStep / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-600" />
            Quick Start Campaign Wizard
          </DialogTitle>
          <DialogDescription>
            {stepTitles[currentStep - 1]}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Campaign Name */}
        {currentStep === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name *</Label>
              <Input
                id="campaignName"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Summer Product Launch"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaignType">Campaign Type (optional)</Label>
              <Select value={campaignType} onValueChange={setCampaignType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateCampaign}
              disabled={!campaignName.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Campaign
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Document Upload */}
        {currentStep === 2 && (
          <div className="space-y-4 py-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop files here, or click to browse
              </p>
              <input
                type="file"
                multiple
                accept=".txt,.md,.json,.csv"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="fileUpload"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="fileUpload" className="cursor-pointer">
                  Browse Files
                </label>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supported: .txt, .md, .json, .csv
              </p>
            </div>

            {/* Uploaded files list */}
            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Documents</Label>
                <div className="space-y-1">
                  {uploadedDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="flex-1 text-sm truncate">{doc.title}</span>
                      {doc.status === 'uploading' && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      )}
                      {doc.status === 'success' && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {doc.status === 'error' && (
                        <span className="text-xs text-red-500">Failed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                Skip for Now
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                className="flex-1"
                disabled={uploadedDocuments.some(d => d.status === 'uploading')}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {currentStep === 3 && (
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Campaign</Label>
                <p className="font-medium">{createdCampaign?.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <p className="font-medium capitalize">
                  {CAMPAIGN_TYPES.find(t => t.value === createdCampaign?.type)?.label || createdCampaign?.type}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Documents</Label>
                <p className="font-medium">
                  {uploadedDocuments.filter(d => d.status === 'success').length} document(s) uploaded
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Ready to plan your campaign!
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your AI assistant will have access to your campaign context and uploaded documents
                to help you create a comprehensive marketing strategy.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button onClick={handleStartPlanning} className="flex-1">
                <Rocket className="mr-2 h-4 w-4" />
                Start Planning with AI
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickStartWizard;
