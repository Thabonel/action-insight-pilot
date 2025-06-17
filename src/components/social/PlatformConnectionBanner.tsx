
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, Link } from 'lucide-react';

interface PlatformConnectionBannerProps {
  connectedPlatforms: number;
}

const PlatformConnectionBanner: React.FC<PlatformConnectionBannerProps> = ({ connectedPlatforms }) => {
  const navigate = useNavigate();

  if (connectedPlatforms > 0) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Link className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Connect Your Social Media Tools</h3>
            <p className="text-blue-800 mb-4">
              Connect Buffer, Hootsuite, Later, or Sprout Social to push AI-generated content directly to your existing workflow.
            </p>
            <Button onClick={() => navigate('/connect-platforms')}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Platform
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformConnectionBanner;
