import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video,
  Sparkles,
  Image as ImageIcon,
  Play,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Settings2,
  Palette,
  Upload,
  GripVertical,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PageHelpModal } from '@/components/common/PageHelpModal';

interface Scene {
  visual: string;
  text_overlay?: string;
  duration: number;
  audio_cue?: string;
}

interface BrandKit {
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  font_family: string;
}

const AIVideoStudio: React.FC = () => {
  const { toast } = useToast();
  const [activePanel, setActivePanel] = useState<'prompt' | 'scenes' | 'preview'>('prompt');

  // Panel 1: Prompt & Brand
  const [goal, setGoal] = useState('');
  const [platform, setPlatform] = useState<'YouTubeShort' | 'TikTok' | 'Reels' | 'Landscape'>('YouTubeShort');
  const [duration, setDuration] = useState(8);
  const [brandKit, setBrandKit] = useState<BrandKit>({
    primary_color: '#FF5722',
    secondary_color: '#FFC107',
    logo_url: '',
    font_family: 'Inter'
  });

  // Panel 2: Scene Board
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  // Panel 3: Preview & Export
  const [projectId, setProjectId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'planning' | 'generating_images' | 'generating_video' | 'completed' | 'failed'>('idle');
  const [operationId, setOperationId] = useState<string | null>(null);

  // Loading states
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // ============================================================================
  // PANEL 1: GENERATE VIDEO PLAN
  // ============================================================================

  const handleGeneratePlan = async () => {
    if (!goal.trim()) {
      toast({
        title: "Goal Required",
        description: "Please enter your video goal",
        variant: "destructive"
      });
      return;
    }

    setGeneratingPlan(true);
    setStatus('planning');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${backendUrl}/ai-video/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          goal,
          platform,
          duration_s: duration,
          brand_kit: brandKit
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate plan');
      }

      const data = await response.json();

      setProjectId(data.project_id);
      setScenes(data.scenes);
      setActivePanel('scenes');

      toast({
        title: "Plan Generated! 🎬",
        description: `Created ${data.scenes.length} scenes. Estimated cost: $${data.estimated_cost.toFixed(2)}`,
      });

    } catch (error: any) {
      console.error('Error generating plan:', error);
      toast({
        title: "Generation Failed",
        description: error.message || 'Failed to generate video plan',
        variant: "destructive"
      });
      setStatus('failed');
    } finally {
      setGeneratingPlan(false);
    }
  };

  // ============================================================================
  // PANEL 2: GENERATE SCENE IMAGES
  // ============================================================================

  const handleGenerateImages = async () => {
    if (!projectId || scenes.length === 0) return;

    setGeneratingImages(true);
    setStatus('generating_images');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const sceneDescriptions = scenes.map(scene => scene.visual);

      const response = await fetch(`${backendUrl}/ai-video/generate-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          project_id: projectId,
          scene_descriptions: sceneDescriptions
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate images');
      }

      const data = await response.json();

      setGeneratedImages(data.image_urls);

      toast({
        title: "Images Generated! 🖼️",
        description: `Created ${data.image_urls.length} images. Cost: $${data.cost_usd.toFixed(2)}`,
      });

    } catch (error: any) {
      console.error('Error generating images:', error);
      toast({
        title: "Image Generation Failed",
        description: error.message || 'Failed to generate images',
        variant: "destructive"
      });
    } finally {
      setGeneratingImages(false);
      setStatus('planning');
    }
  };

  // ============================================================================
  // PANEL 3: GENERATE VIDEO
  // ============================================================================

  const handleGenerateVideo = async () => {
    if (!projectId || scenes.length === 0) return;

    setGeneratingVideo(true);
    setStatus('generating_video');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      // Build final prompt from scenes
      const finalPrompt = scenes.map((scene, idx) =>
        `Scene ${idx + 1}: ${scene.visual} (${scene.duration}s). ${scene.text_overlay ? `Text: "${scene.text_overlay}"` : ''}`
      ).join(' ');

      const response = await fetch(`${backendUrl}/ai-video/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          project_id: projectId,
          final_prompt: finalPrompt,
          image_url: generatedImages[0] || null,
          use_veo_fast: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to start video generation');
      }

      const data = await response.json();

      setOperationId(data.operation_id);

      toast({
        title: "Video Generation Started! 🎬",
        description: `Estimated time: ${data.estimated_time_minutes} minutes`,
      });

      // Start polling for status
      pollVideoStatus(projectId);

    } catch (error: any) {
      console.error('Error generating video:', error);
      toast({
        title: "Video Generation Failed",
        description: error.message || 'Failed to start video generation',
        variant: "destructive"
      });
      setStatus('failed');
    } finally {
      setGeneratingVideo(false);
    }
  };

  const pollVideoStatus = async (projectId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return;

        const response = await fetch(`${backendUrl}/ai-video/status/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) return;

        const data = await response.json();

        setStatus(data.status);

        if (data.status === 'completed') {
          setVideoUrl(data.video_url);
          setActivePanel('preview');
          clearInterval(pollInterval);

          toast({
            title: "Video Ready! 🎉",
            description: "Your video has been generated successfully",
          });
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          toast({
            title: "Generation Failed",
            description: data.error_message || 'Video generation failed',
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 600000);
  };

  // ============================================================================
  // SCENE EDITING
  // ============================================================================

  const updateScene = (index: number, field: keyof Scene, value: any) => {
    const updatedScenes = [...scenes];
    updatedScenes[index] = { ...updatedScenes[index], [field]: value };
    setScenes(updatedScenes);
  };

  const deleteScene = (index: number) => {
    setScenes(scenes.filter((_, i) => i !== index));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="h-8 w-8 text-blue-600" />
            AI Video Studio
          </h1>
          <p className="text-gray-600 mt-1">Create professional marketing videos with AI</p>
        </div>

        <div className="flex gap-2">
          <Badge variant={status === 'completed' ? 'default' : 'secondary'} className="px-3 py-1">
            {status === 'idle' && 'Ready'}
            {status === 'planning' && 'Planning...'}
            {status === 'generating_images' && 'Creating Images...'}
            {status === 'generating_video' && 'Generating Video...'}
            {status === 'completed' && '✓ Completed'}
            {status === 'failed' && '✗ Failed'}
          </Badge>
        </div>
      </div>

      {/* Check for Gemini API Key */}
      {status === 'idle' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Make sure you've added your <strong>Gemini API Key</strong> in Settings → Integrations to use AI video generation.
          </AlertDescription>
        </Alert>
      )}

      {/* 3-Panel Tabs */}
      <Tabs value={activePanel} onValueChange={(value: any) => setActivePanel(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Prompt & Brand
          </TabsTrigger>
          <TabsTrigger value="scenes" disabled={scenes.length === 0} className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Scene Board ({scenes.length})
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!videoUrl} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Preview & Export
          </TabsTrigger>
        </TabsList>

        {/* PANEL 1: PROMPT & BRAND */}
        <TabsContent value="prompt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Goal & Platform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">What's your video goal?</Label>
                <Textarea
                  id="goal"
                  placeholder="e.g., Promote Unimog recovery tips for off-road enthusiasts..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YouTubeShort">YouTube Shorts (9:16)</SelectItem>
                      <SelectItem value="TikTok">TikTok (9:16)</SelectItem>
                      <SelectItem value="Reels">Instagram Reels (9:16)</SelectItem>
                      <SelectItem value="Landscape">Landscape (16:9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="8"
                    max="120"
                    step="8"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">Veo 3 works best with 8-second clips</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Kit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={brandKit.primary_color}
                      onChange={(e) => setBrandKit({ ...brandKit, primary_color: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={brandKit.primary_color}
                      onChange={(e) => setBrandKit({ ...brandKit, primary_color: e.target.value })}
                      placeholder="#FF5722"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={brandKit.secondary_color}
                      onChange={(e) => setBrandKit({ ...brandKit, secondary_color: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={brandKit.secondary_color}
                      onChange={(e) => setBrandKit({ ...brandKit, secondary_color: e.target.value })}
                      placeholder="#FFC107"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo URL (optional)</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={brandKit.logo_url}
                  onChange={(e) => setBrandKit({ ...brandKit, logo_url: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleGeneratePlan}
            disabled={generatingPlan || !goal.trim()}
            className="w-full"
            size="lg"
          >
            {generatingPlan ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Video Plan
              </>
            )}
          </Button>
        </TabsContent>

        {/* PANEL 2: SCENE BOARD */}
        <TabsContent value="scenes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Scene Breakdown</h3>
            <Button
              onClick={handleGenerateImages}
              disabled={generatingImages}
              variant="outline"
            >
              {generatingImages ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Generate Images
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {scenes.map((scene, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <GripVertical className="h-5 w-5 text-gray-400 mt-2" />
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <Label className="text-sm font-semibold">Scene {index + 1}</Label>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{scene.duration}s</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteScene(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Textarea
                        placeholder="Visual description..."
                        value={scene.visual}
                        onChange={(e) => updateScene(index, 'visual', e.target.value)}
                        rows={2}
                      />

                      <Input
                        placeholder="Text overlay (optional)"
                        value={scene.text_overlay || ''}
                        onChange={(e) => updateScene(index, 'text_overlay', e.target.value)}
                      />

                      {generatedImages[index] && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Image generated
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={() => setActivePanel('preview')}
            className="w-full"
            size="lg"
            disabled={scenes.length === 0}
          >
            Continue to Video Generation →
          </Button>
        </TabsContent>

        {/* PANEL 3: PREVIEW & EXPORT */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Final Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!videoUrl && (
                <div className="text-center py-8">
                  <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Ready to generate your video?</p>

                  <Button
                    onClick={handleGenerateVideo}
                    disabled={generatingVideo || status === 'generating_video'}
                    size="lg"
                  >
                    {generatingVideo || status === 'generating_video' ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Video... (2-6 min)
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Generate Video with Veo 3
                      </>
                    )}
                  </Button>
                </div>
              )}

              {videoUrl && (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full rounded-lg"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" asChild>
                      <a href={videoUrl} download>
                        <Download className="mr-2 h-4 w-4" />
                        Download Video
                      </a>
                    </Button>
                    <Button variant="outline" onClick={handleGenerateVideo}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <PageHelpModal helpKey="aiVideoStudio" />
    </div>
  );
};

export default AIVideoStudio;
