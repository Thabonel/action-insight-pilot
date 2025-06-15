
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Heart, Users, TrendingUp } from 'lucide-react';

interface SocialStatsCardsProps {
  connectedPlatforms: number;
}

const SocialStatsCards: React.FC<SocialStatsCardsProps> = ({ connectedPlatforms }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Connected Platforms</p>
              <p className="text-2xl font-bold">{connectedPlatforms}</p>
              <p className="text-xs text-blue-600">
                {connectedPlatforms > 0 ? 'Active integrations' : 'Ready to connect'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold">8.4%</p>
              <p className="text-xs text-green-600">Above avg: 4.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Followers</p>
              <p className="text-2xl font-bold">45.2K</p>
              <p className="text-xs text-purple-600">Growth: +12% month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">AI Posts This Week</p>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-green-600">+18% vs last week</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialStatsCards;
