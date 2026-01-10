
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { behaviorTracker } from '@/lib/behavior-tracker';

interface SearchCriteria {
  industry: string;
  companySize: string;
  location: string;
  jobTitle: string;
  technology: string;
}

interface LeadSearchResult {
  id: number;
  name: string;
  company: string;
  title: string;
  score: number;
  conversionProbability: number;
  source: string;
  matchReason: string;
}

interface AISuggestion {
  criteria: string;
  conversionRate: string;
  reasoning: string;
}

const AdaptiveLeadSearch: React.FC = () => {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    industry: '',
    companySize: '',
    location: '',
    jobTitle: '',
    technology: ''
  });

  const [searchResults, setSearchResults] = useState<LeadSearchResult[]>([
    {
      id: 1,
      name: 'John Smith',
      company: 'TechCorp Inc.',
      title: 'VP of Marketing',
      score: 92,
      conversionProbability: 87,
      source: 'LinkedIn',
      matchReason: 'Similar to 3 successful conversions'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      company: 'StartupXYZ',
      title: 'Marketing Director',
      score: 88,
      conversionProbability: 82,
      source: 'Email List',
      matchReason: 'High-performing company size range'
    },
    {
      id: 3,
      name: 'Mike Davis',
      company: 'Enterprise Solutions',
      title: 'CMO',
      score: 85,
      conversionProbability: 79,
      source: 'Cold Outreach',
      matchReason: 'Optimal contact timing window'
    }
  ]);

  const [aiSuggestions] = useState<AISuggestion[]>([
    {
      criteria: 'SaaS companies, 50-200 employees, Marketing VP/Director',
      conversionRate: '34%',
      reasoning: 'Your top 5 conversions match this profile'
    },
    {
      criteria: 'Tech startups, Series A-B, CMO/Head of Growth',
      conversionRate: '28%',
      reasoning: 'High engagement rate in this segment'
    },
    {
      criteria: 'E-commerce, $10M+ revenue, Marketing Manager+',
      conversionRate: '31%',
      reasoning: 'Strong budget allocation patterns'
    }
  ]);

  const handleSearch = () => {
    behaviorTracker.trackAction('feature_use', 'adaptive_lead_search', {
      criteria: searchCriteria,
      timestamp: new Date().toISOString()
    });
  };

  const handleAISuggestionClick = (suggestion: AISuggestion) => {
    behaviorTracker.trackAction('feature_use', 'ai_search_suggestion', {
      criteria: suggestion.criteria,
      expectedConversionRate: suggestion.conversionRate
    });
  };

  return (
    <div className="space-y-6">
      {/* AI-Suggested Search Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>AI-Suggested Search Criteria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleAISuggestionClick(suggestion)}
                className="border rounded-lg p-4 cursor-pointer hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.conversionRate} conversion
                  </Badge>
                </div>
                <p className="text-sm font-medium mb-2">{suggestion.criteria}</p>
                <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Advanced Lead Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="fintech">Fintech</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Company Size</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">1-50 employees</SelectItem>
                  <SelectItem value="small">51-200 employees</SelectItem>
                  <SelectItem value="medium">201-1000 employees</SelectItem>
                  <SelectItem value="large">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Job Title</label>
              <Input placeholder="e.g., Marketing Director" />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button onClick={handleSearch} className="flex items-center space-x-2">
              <span>Search Leads</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>Use AI Suggestions</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Search Results (247 leads found)</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Avg. Score: 89</Badge>
              <Badge variant="outline">Est. Conversion: 24%</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchResults.map((lead) => (
              <div key={lead.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-medium">{lead.name}</h4>
                      <p className="text-sm text-gray-600">{lead.title} at {lead.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={lead.score >= 90 ? "default" : lead.score >= 80 ? "secondary" : "outline"}
                    >
                      Score: {lead.score}
                    </Badge>
                    <Badge variant="outline">
                      {lead.conversionProbability}% conversion
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Source: {lead.source}</span>
                    <span>•</span>
                    <span>{lead.matchReason}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">View Profile</Button>
                    <Button size="sm">Add to Campaign</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdaptiveLeadSearch;
