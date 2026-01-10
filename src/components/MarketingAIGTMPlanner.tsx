import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GTMInputs {
  productName: string;
  productCategory: string;
  productSubCategory: string;
  targetLaunchDate: string;
  primaryMarkets: string[];
  coreValueProposition: string;
  budgetCeiling: number;
}

interface GTMResearchData {
  marketAnalysis?: Record<string, unknown>;
  competitorData?: Record<string, unknown>;
  targetAudience?: Record<string, unknown>;
  channels?: Record<string, unknown>;
}

interface GTMStrategy {
  id: string;
  strategy_content: string;
  research_data: GTMResearchData;
  created_at: string;
  product_name: string;
}

export const MarketingAIGTMPlanner = () => {
  const [inputs, setInputs] = useState<GTMInputs>({
    productName: '',
    productCategory: '',
    productSubCategory: '',
    targetLaunchDate: '',
    primaryMarkets: [],
    coreValueProposition: '',
    budgetCeiling: 0
  });
  const [newMarket, setNewMarket] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategy, setStrategy] = useState<GTMStrategy | null>(null);
  const [activeTab, setActiveTab] = useState<'inputs' | 'strategy'>('inputs');
  const { toast } = useToast();

  const productCategories = [
    'SaaS/Software', 'E-commerce', 'FinTech', 'HealthTech', 'EdTech', 
    'Marketing Technology', 'AI/ML Platform', 'Mobile App', 'Hardware', 'Services'
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
    'Australia', 'Japan', 'Singapore', 'India', 'Brazil', 'Mexico'
  ];

  const addMarket = () => {
    if (newMarket && !inputs.primaryMarkets.includes(newMarket)) {
      setInputs({
        ...inputs,
        primaryMarkets: [...inputs.primaryMarkets, newMarket]
      });
      setNewMarket('');
    }
  };

  const removeMarket = (market: string) => {
    setInputs({
      ...inputs,
      primaryMarkets: inputs.primaryMarkets.filter(m => m !== market)
    });
  };

  const validateInputs = (): boolean => {
    if (!inputs.productName.trim()) {
      toast({ title: "Error", description: "Product name is required", variant: "destructive" });
      return false;
    }
    if (!inputs.productCategory) {
      toast({ title: "Error", description: "Product category is required", variant: "destructive" });
      return false;
    }
    if (!inputs.coreValueProposition.trim()) {
      toast({ title: "Error", description: "Core value proposition is required", variant: "destructive" });
      return false;
    }
    if (inputs.budgetCeiling <= 0) {
      toast({ title: "Error", description: "Budget ceiling must be greater than 0", variant: "destructive" });
      return false;
    }
    if (inputs.primaryMarkets.length === 0) {
      toast({ title: "Error", description: "At least one primary market is required", variant: "destructive" });
      return false;
    }
    return true;
  };

  const generateStrategy = async () => {
    if (!validateInputs()) return;

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "Please log in to generate a GTM strategy", variant: "destructive" });
        return;
      }

      const sessionId = crypto.randomUUID();
      
      const { data, error } = await supabase.functions.invoke('gtm-planner', {
        body: {
          inputs: { ...inputs, userId: user.id },
          sessionId
        }
      });

      if (error) throw error;

      if (data.success) {
        const newStrategy: GTMStrategy = {
          id: data.strategyId,
          strategy_content: data.strategy,
          research_data: data.researchData,
          created_at: new Date().toISOString(),
          product_name: inputs.productName
        };
        
        setStrategy(newStrategy);
        setActiveTab('strategy');
        toast({ 
          title: "Success", 
          description: "GTM strategy generated successfully!",
          variant: "default"
        });
      } else {
        throw new Error(data.error || 'Failed to generate strategy');
      }
    } catch (error) {
      console.error('Error generating strategy:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate GTM strategy. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadStrategy = () => {
    if (!strategy) return;
    
    const blob = new Blob([strategy.strategy_content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GTM_Strategy_${strategy.product_name.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">MarketingAI GTM Planner</h1>
          <p className="text-muted-foreground mt-2">
            Generate comprehensive, data-driven Go-to-Market strategies with AI-powered market research
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>AI-Powered Strategy</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Real-time Research</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <Button
          variant={activeTab === 'inputs' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('inputs')}
          className="px-6"
        >
          Strategy Inputs
        </Button>
        <Button
          variant={activeTab === 'strategy' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('strategy')}
          disabled={!strategy}
          className="px-6"
        >
          Generated Strategy
        </Button>
      </div>

      {/* Strategy Inputs Tab */}
      {activeTab === 'inputs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Product Information
              </CardTitle>
              <CardDescription>
                Define your product and core positioning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={inputs.productName}
                  onChange={(e) => setInputs({ ...inputs, productName: e.target.value })}
                  placeholder="e.g., TaskFlow Pro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productCategory">Category *</Label>
                  <Select 
                    value={inputs.productCategory} 
                    onValueChange={(value) => setInputs({ ...inputs, productCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subCategory">Sub-category</Label>
                  <Input
                    id="subCategory"
                    value={inputs.productSubCategory}
                    onChange={(e) => setInputs({ ...inputs, productSubCategory: e.target.value })}
                    placeholder="e.g., Project Management"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="valueProposition">Core Value Proposition * (1-2 sentences)</Label>
                <Textarea
                  id="valueProposition"
                  value={inputs.coreValueProposition}
                  onChange={(e) => setInputs({ ...inputs, coreValueProposition: e.target.value })}
                  placeholder="Describe the unique value your product provides to customers..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Market & Launch Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Market & Launch Details
              </CardTitle>
              <CardDescription>
                Define your target markets and launch timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="launchDate">Target Launch Date</Label>
                <Input
                  id="launchDate"
                  type="month"
                  value={inputs.targetLaunchDate}
                  onChange={(e) => setInputs({ ...inputs, targetLaunchDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="budgetCeiling">Budget Ceiling (USD) *</Label>
                <Input
                  id="budgetCeiling"
                  type="number"
                  value={inputs.budgetCeiling || ''}
                  onChange={(e) => setInputs({ ...inputs, budgetCeiling: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 250000"
                />
              </div>

              <div>
                <Label>Primary Markets *</Label>
                <div className="flex gap-2 mb-2">
                  <Select value={newMarket} onValueChange={setNewMarket}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.filter(country => !inputs.primaryMarkets.includes(country)).map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addMarket} size="icon" variant="outline">
                    +
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {inputs.primaryMarkets.map(market => (
                    <Badge key={market} variant="secondary" className="gap-2">
                      {market}
                      <span
                        className="ml-1 cursor-pointer"
                        onClick={() => removeMarket(market)}
                      >
                        x
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Strategy */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                  Ready to Generate Your GTM Strategy?
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Our AI will conduct comprehensive market research, analyze competitors, 
                  and create a detailed go-to-market strategy tailored to your product.
                </p>
                <Button
                  onClick={generateStrategy}
                  disabled={isGenerating}
                  size="lg"
                  className="gap-2"
                >
                  {isGenerating ? 'Generating Strategy...' : 'Generate GTM Strategy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generated Strategy Tab */}
      {activeTab === 'strategy' && strategy && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  GTM Strategy: {strategy.product_name}
                </CardTitle>
                <CardDescription>
                  Generated on {new Date(strategy.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button onClick={downloadStrategy} variant="outline" className="gap-2">
                Download Strategy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none">
              <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg overflow-auto">
                {strategy.strategy_content}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};