import React, { useState, useMemo } from 'react';
import { Player } from '@remotion/player';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Pause,
  Download,
  Sparkles,
  Video,
  Type,
  ShoppingBag,
  Megaphone,
  RefreshCw,
} from 'lucide-react';

import { MarketingPromo, MarketingPromoProps } from '@/remotion/compositions/MarketingPromo';
import { SocialMediaAd, SocialMediaAdProps } from '@/remotion/compositions/SocialMediaAd';
import { ProductShowcase, ProductShowcaseProps } from '@/remotion/compositions/ProductShowcase';
import { TextReveal, TextRevealProps } from '@/remotion/compositions/TextReveal';

type TemplateType = 'marketing-promo' | 'social-ad' | 'product-showcase' | 'text-reveal';

interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'marketing-promo',
    name: 'Marketing Promo',
    description: 'Vertical promo video for stories and reels',
    icon: <Megaphone className="h-5 w-5" />,
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 150,
  },
  {
    id: 'social-ad',
    name: 'Social Media Ad',
    description: 'Square format for Instagram and Facebook',
    icon: <ShoppingBag className="h-5 w-5" />,
    width: 1080,
    height: 1080,
    fps: 30,
    durationInFrames: 180,
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Landscape format for YouTube and websites',
    icon: <Video className="h-5 w-5" />,
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 240,
  },
  {
    id: 'text-reveal',
    name: 'Text Animation',
    description: 'Animated text for intros and highlights',
    icon: <Type className="h-5 w-5" />,
    width: 1080,
    height: 1080,
    fps: 30,
    durationInFrames: 90,
  },
];

const RemotionStudio: React.FC = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('marketing-promo');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Marketing Promo Props
  const [promoProps, setPromoProps] = useState<MarketingPromoProps>({
    headline: 'Grow Your Business',
    subheadline: 'AI-powered marketing that works while you sleep',
    ctaText: 'Start Free Trial',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    logoUrl: '',
    backgroundType: 'gradient',
  });

  // Social Ad Props
  const [adProps, setAdProps] = useState<SocialMediaAdProps>({
    productName: 'Marketing Autopilot',
    tagline: 'Set it and forget it',
    features: ['AI-powered campaigns', 'Auto-optimization', '24/7 lead generation'],
    price: '$99/mo',
    ctaText: 'Get Started',
    primaryColor: '#10B981',
    imageUrl: '',
  });

  // Product Showcase Props
  const [showcaseProps, setShowcaseProps] = useState<ProductShowcaseProps>({
    productName: 'AI Marketing Suite',
    description: 'The complete solution for automated marketing',
    features: [
      { title: 'Autopilot Mode', description: 'AI handles everything automatically' },
      { title: 'Smart Analytics', description: 'Real-time insights and optimization' },
      { title: 'Multi-Channel', description: 'Reach customers everywhere' },
    ],
    primaryColor: '#6366F1',
    accentColor: '#F59E0B',
    imageUrl: '',
  });

  // Text Reveal Props
  const [textProps, setTextProps] = useState<TextRevealProps>({
    text: 'Your Message Here',
    fontSize: 80,
    color: '#FFFFFF',
    backgroundColor: '#1F2937',
    animationType: 'typewriter',
  });

  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplate)!;

  const renderPlayer = useMemo(() => {
    const commonProps = {
      fps: currentTemplate.fps,
      durationInFrames: currentTemplate.durationInFrames,
      compositionWidth: currentTemplate.width,
      compositionHeight: currentTemplate.height,
      style: {
        width: '100%',
        maxHeight: 500,
      },
      controls: true,
      autoPlay: isPlaying,
    };

    switch (selectedTemplate) {
      case 'marketing-promo':
        return <Player component={MarketingPromo} inputProps={promoProps} {...commonProps} />;
      case 'social-ad':
        return <Player component={SocialMediaAd} inputProps={adProps} {...commonProps} />;
      case 'product-showcase':
        return <Player component={ProductShowcase} inputProps={showcaseProps} {...commonProps} />;
      case 'text-reveal':
        return <Player component={TextReveal} inputProps={textProps} {...commonProps} />;
      default:
        return null;
    }
  }, [selectedTemplate, promoProps, adProps, showcaseProps, textProps, isPlaying, currentTemplate]);

  const handleExport = async () => {
    setIsExporting(true);
    toast({
      title: 'Export Started',
      description: 'Video rendering will take a few moments...',
    });

    // Note: Full rendering requires @remotion/renderer and a backend service
    // For now, we show a demo message
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: 'Export Ready',
        description: 'To render full videos, set up Remotion Lambda or a render server.',
      });
    }, 2000);
  };

  const renderPromoEditor = () => (
    <div className="space-y-4">
      <div>
        <Label>Headline</Label>
        <Input
          value={promoProps.headline}
          onChange={(e) => setPromoProps({ ...promoProps, headline: e.target.value })}
          placeholder="Your main headline"
        />
      </div>
      <div>
        <Label>Subheadline</Label>
        <Textarea
          value={promoProps.subheadline}
          onChange={(e) => setPromoProps({ ...promoProps, subheadline: e.target.value })}
          placeholder="Supporting message"
          rows={2}
        />
      </div>
      <div>
        <Label>Call to Action</Label>
        <Input
          value={promoProps.ctaText}
          onChange={(e) => setPromoProps({ ...promoProps, ctaText: e.target.value })}
          placeholder="Button text"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Primary Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={promoProps.primaryColor}
              onChange={(e) => setPromoProps({ ...promoProps, primaryColor: e.target.value })}
              className="w-12 h-10 p-1"
            />
            <Input
              value={promoProps.primaryColor}
              onChange={(e) => setPromoProps({ ...promoProps, primaryColor: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>Secondary Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={promoProps.secondaryColor}
              onChange={(e) => setPromoProps({ ...promoProps, secondaryColor: e.target.value })}
              className="w-12 h-10 p-1"
            />
            <Input
              value={promoProps.secondaryColor}
              onChange={(e) => setPromoProps({ ...promoProps, secondaryColor: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div>
        <Label>Background Style</Label>
        <Select
          value={promoProps.backgroundType}
          onValueChange={(value) =>
            setPromoProps({ ...promoProps, backgroundType: value as 'gradient' | 'solid' | 'animated' })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="animated">Animated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderAdEditor = () => (
    <div className="space-y-4">
      <div>
        <Label>Product Name</Label>
        <Input
          value={adProps.productName}
          onChange={(e) => setAdProps({ ...adProps, productName: e.target.value })}
        />
      </div>
      <div>
        <Label>Tagline</Label>
        <Input
          value={adProps.tagline}
          onChange={(e) => setAdProps({ ...adProps, tagline: e.target.value })}
        />
      </div>
      <div>
        <Label>Features (one per line)</Label>
        <Textarea
          value={adProps.features.join('\n')}
          onChange={(e) => setAdProps({ ...adProps, features: e.target.value.split('\n').filter(Boolean) })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price</Label>
          <Input
            value={adProps.price}
            onChange={(e) => setAdProps({ ...adProps, price: e.target.value })}
          />
        </div>
        <div>
          <Label>CTA Text</Label>
          <Input
            value={adProps.ctaText}
            onChange={(e) => setAdProps({ ...adProps, ctaText: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Primary Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="color"
            value={adProps.primaryColor}
            onChange={(e) => setAdProps({ ...adProps, primaryColor: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            value={adProps.primaryColor}
            onChange={(e) => setAdProps({ ...adProps, primaryColor: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  const renderShowcaseEditor = () => (
    <div className="space-y-4">
      <div>
        <Label>Product Name</Label>
        <Input
          value={showcaseProps.productName}
          onChange={(e) => setShowcaseProps({ ...showcaseProps, productName: e.target.value })}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={showcaseProps.description}
          onChange={(e) => setShowcaseProps({ ...showcaseProps, description: e.target.value })}
          rows={2}
        />
      </div>
      <div>
        <Label>Features</Label>
        {showcaseProps.features.map((feature, index) => (
          <div key={index} className="grid grid-cols-2 gap-2 mt-2">
            <Input
              value={feature.title}
              onChange={(e) => {
                const newFeatures = [...showcaseProps.features];
                newFeatures[index] = { ...feature, title: e.target.value };
                setShowcaseProps({ ...showcaseProps, features: newFeatures });
              }}
              placeholder="Feature title"
            />
            <Input
              value={feature.description}
              onChange={(e) => {
                const newFeatures = [...showcaseProps.features];
                newFeatures[index] = { ...feature, description: e.target.value };
                setShowcaseProps({ ...showcaseProps, features: newFeatures });
              }}
              placeholder="Feature description"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Primary Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={showcaseProps.primaryColor}
              onChange={(e) => setShowcaseProps({ ...showcaseProps, primaryColor: e.target.value })}
              className="w-12 h-10 p-1"
            />
            <Input
              value={showcaseProps.primaryColor}
              onChange={(e) => setShowcaseProps({ ...showcaseProps, primaryColor: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>Accent Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={showcaseProps.accentColor}
              onChange={(e) => setShowcaseProps({ ...showcaseProps, accentColor: e.target.value })}
              className="w-12 h-10 p-1"
            />
            <Input
              value={showcaseProps.accentColor}
              onChange={(e) => setShowcaseProps({ ...showcaseProps, accentColor: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTextEditor = () => (
    <div className="space-y-4">
      <div>
        <Label>Text</Label>
        <Textarea
          value={textProps.text}
          onChange={(e) => setTextProps({ ...textProps, text: e.target.value })}
          rows={2}
        />
      </div>
      <div>
        <Label>Font Size: {textProps.fontSize}px</Label>
        <Slider
          value={[textProps.fontSize]}
          onValueChange={(value) => setTextProps({ ...textProps, fontSize: value[0] })}
          min={24}
          max={150}
          step={4}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Animation Type</Label>
        <Select
          value={textProps.animationType}
          onValueChange={(value) =>
            setTextProps({
              ...textProps,
              animationType: value as TextRevealProps['animationType'],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="typewriter">Typewriter</SelectItem>
            <SelectItem value="fade">Fade In</SelectItem>
            <SelectItem value="slide">Slide Up</SelectItem>
            <SelectItem value="scale">Scale In</SelectItem>
            <SelectItem value="word-by-word">Word by Word</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Text Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={textProps.color}
              onChange={(e) => setTextProps({ ...textProps, color: e.target.value })}
              className="w-12 h-10 p-1"
            />
            <Input
              value={textProps.color}
              onChange={(e) => setTextProps({ ...textProps, color: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>Background</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={textProps.backgroundColor}
              onChange={(e) => setTextProps({ ...textProps, backgroundColor: e.target.value })}
              className="w-12 h-10 p-1"
            />
            <Input
              value={textProps.backgroundColor}
              onChange={(e) => setTextProps({ ...textProps, backgroundColor: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditor = () => {
    switch (selectedTemplate) {
      case 'marketing-promo':
        return renderPromoEditor();
      case 'social-ad':
        return renderAdEditor();
      case 'product-showcase':
        return renderShowcaseEditor();
      case 'text-reveal':
        return renderTextEditor();
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-[#0B0D10] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E9EEF5] flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            Remotion Video Studio
          </h1>
          <p className="text-gray-600 dark:text-[#94A3B8] mt-1">
            Create professional marketing videos with React-powered animations
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {currentTemplate.width}x{currentTemplate.height} @ {currentTemplate.fps}fps
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Choose a video template to customize</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTemplate === template.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedTemplate === template.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {template.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{template.name}</p>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
              {renderPlayer}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Customize</CardTitle>
            <CardDescription>Edit the content and styling of your video</CardDescription>
          </CardHeader>
          <CardContent>{renderEditor()}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RemotionStudio;
