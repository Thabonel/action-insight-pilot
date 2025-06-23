
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

const CampaignCreator: React.FC = () => {
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateCampaign = () => {
    console.log('Creating campaign:', { campaignName, campaignType, description });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create New Campaign</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="Enter campaign name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campaign-type">Campaign Type</Label>
              <Select value={campaignType} onValueChange={setCampaignType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Marketing</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="content">Content Marketing</SelectItem>
                  <SelectItem value="paid">Paid Advertising</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your campaign goals and strategy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          
          <Button onClick={handleCreateCampaign} className="w-full">
            Create Campaign
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <h3 className="font-medium">Product Launch</h3>
              <p className="text-sm text-muted-foreground mt-1">Multi-channel product introduction campaign</p>
            </div>
            <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <h3 className="font-medium">Lead Generation</h3>
              <p className="text-sm text-muted-foreground mt-1">Capture and nurture potential customers</p>
            </div>
            <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <h3 className="font-medium">Brand Awareness</h3>
              <p className="text-sm text-muted-foreground mt-1">Increase visibility and recognition</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignCreator;
