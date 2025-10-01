
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, TrendingUp, AlertCircle, Plus } from 'lucide-react';

interface CompetitorAd {
  id: string;
  competitorName: string;
  platform: string;
  adType: string;
  headline: string;
  copy: string;
  imageUrl?: string;
  performance: {
    estimatedReach: number;
    engagement: number;
    runDuration: string;
  };
  capturedAt: string;
}

const CompetitorTracker: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  
  // Competitor ads will come from database
  const [competitorAds] = useState<CompetitorAd[]>([]);

  const platforms = ['all', 'Facebook', 'LinkedIn', 'Google', 'TikTok', 'YouTube'];

  const filteredAds = competitorAds.filter(ad => {
    const matchesSearch = ad.competitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ad.headline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' || ad.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const getPlatformColor = (platform: string) => {
    const colors = {
      Facebook: 'bg-blue-100 text-blue-800',
      LinkedIn: 'bg-blue-600 text-white',
      Google: 'bg-green-100 text-green-800',
      TikTok: 'bg-black text-white',
      YouTube: 'bg-red-100 text-red-800'
    };
    return colors[platform as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-purple-600" />
          <span>Competitor Intelligence</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search competitors or ad content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {platforms.map(platform => (
              <Button
                key={platform}
                variant={selectedPlatform === platform ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform(platform)}
                className="capitalize"
              >
                {platform}
              </Button>
            ))}
          </div>
        </div>

        {/* Competitor Ads Grid */}
        <div className="space-y-4">
          {filteredAds.map(ad => (
            <div key={ad.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-gray-900">{ad.competitorName}</h3>
                  <Badge className={getPlatformColor(ad.platform)}>
                    {ad.platform}
                  </Badge>
                  <Badge variant="outline">{ad.adType}</Badge>
                </div>
                <span className="text-sm text-gray-500">{ad.capturedAt}</span>
              </div>

              <div className="mb-3">
                <h4 className="font-medium mb-1">{ad.headline}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{ad.copy}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{ad.performance.estimatedReach.toLocaleString()} reach</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{ad.performance.engagement} engagements</span>
                  </div>
                  <span>Running {ad.performance.runDuration}</span>
                </div>
                <Button size="sm" variant="outline">
                  Analyze
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Competitor Button */}
        <div className="text-center pt-4 border-t">
          <Button variant="outline" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Track New Competitor
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-3">Intelligence Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-purple-600">Tracked Competitors</p>
              <p className="font-bold text-purple-900">{competitorAds.length}</p>
            </div>
            <div>
              <p className="text-purple-600">Ads Captured</p>
              <p className="font-bold text-purple-900">{competitorAds.length}</p>
            </div>
            <div>
              <p className="text-purple-600">New This Week</p>
              <p className="font-bold text-purple-900">0</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorTracker;
