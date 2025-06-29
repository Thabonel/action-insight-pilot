import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useKeywordResearch } from '@/hooks/useKeywordResearch';
import { KeywordMetrics } from '@/lib/api/keyword-research-service';
import { Search, TrendingUp, Users, Globe, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export const KeywordResearchPanel: React.FC = () => {
  const {
    isLoading,
    researchKeywords,
    getCompetitorKeywords,
    getTrendingKeywords,
    lastResearchResult,
    lastCompetitorResult,
    lastTrendingResult,
    resetResults
  } = useKeywordResearch();

  const [seedKeywords, setSeedKeywords] = useState<string[]>(['']);
  const [location, setLocation] = useState('US');
  const [industry, setIndustry] = useState('marketing');
  const [competitorDomain, setCompetitorDomain] = useState('');
  const [activeTab, setActiveTab] = useState('research');

  const addKeywordField = () => {
    setSeedKeywords([...seedKeywords, '']);
  };

  const removeKeywordField = (index: number) => {
    if (seedKeywords.length > 1) {
      setSeedKeywords(seedKeywords.filter((_, i) => i !== index));
    }
  };

  const updateKeyword = (index: number, value: string) => {
    const updated = [...seedKeywords];
    updated[index] = value;
    setSeedKeywords(updated);
  };

  const handleResearchKeywords = () => {
    const validKeywords = seedKeywords.filter(k => k.trim());
    if (validKeywords.length === 0) {
      toast.error('Please enter at least one keyword');
      return;
    }

    resetResults();
    researchKeywords({
      seed_keywords: validKeywords,
      location,
      industry
    });
  };

  const handleCompetitorResearch = () => {
    if (!competitorDomain.trim()) {
      toast.error('Please enter a competitor domain');
      return;
    }

    resetResults();
    getCompetitorKeywords({
      competitor_domain: competitorDomain.trim()
    });
  };

  const handleTrendingResearch = () => {
    resetResults();
    getTrendingKeywords({
      industry
    });
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'bg-green-500';
    if (difficulty < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderKeywordTable = (keywords: KeywordMetrics[] | undefined, title: string) => {
    if (!keywords || keywords.length === 0) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {title} ({keywords.length} keywords)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Search Volume</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>CPC</TableHead>
                  <TableHead>Competition</TableHead>
                  <TableHead>SERP Features</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((keyword, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{keyword.keyword}</TableCell>
                    <TableCell>{keyword.search_volume.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={keyword.difficulty} 
                          className="w-16 h-2"
                        />
                        <span className="text-sm">{keyword.difficulty}%</span>
                      </div>
                    </TableCell>
                    <TableCell>${keyword.cpc.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getCompetitionColor(keyword.competition)}>
                        {keyword.competition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {keyword.serp_features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {keyword.serp_features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{keyword.serp_features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keyword Research</h1>
        <p className="text-muted-foreground">
          Discover high-value keywords, analyze competition, and identify trending opportunities
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="research" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Keyword Research
          </TabsTrigger>
          <TabsTrigger value="competitor" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Competitor Analysis
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending Keywords
          </TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Keywords</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Seed Keywords</Label>
                <div className="space-y-2 mt-2">
                  {seedKeywords.map((keyword, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={keyword}
                        onChange={(e) => updateKeyword(index, e.target.value)}
                        placeholder="Enter a keyword"
                        className="flex-1"
                      />
                      {seedKeywords.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeKeywordField(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addKeywordField}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Keyword
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleResearchKeywords} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Researching...' : 'Research Keywords'}
              </Button>
            </CardContent>
          </Card>

          {renderKeywordTable(lastResearchResult?.keywords, 'Keyword Research Results')}
        </TabsContent>

        <TabsContent value="competitor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="competitor-domain">Competitor Domain</Label>
                <Input
                  id="competitor-domain"
                  value={competitorDomain}
                  onChange={(e) => setCompetitorDomain(e.target.value)}
                  placeholder="example.com"
                  className="mt-2"
                />
              </div>

              <Button 
                onClick={handleCompetitorResearch} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Competitor'}
              </Button>
            </CardContent>
          </Card>

          {renderKeywordTable(lastCompetitorResult?.keywords, 'Competitor Keywords')}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trending Keywords</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trending-industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleTrendingResearch} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Finding Trends...' : 'Get Trending Keywords'}
              </Button>
            </CardContent>
          </Card>

          {renderKeywordTable(lastTrendingResult?.keywords, 'Trending Keywords')}
        </TabsContent>
      </Tabs>
    </div>
  );
};