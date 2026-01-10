
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CampaignFormProps {
  newCampaign: {
    name: string;
    type: string;
    status: string;
    description: string;
  };
  setNewCampaign: React.Dispatch<React.SetStateAction<{
    name: string;
    type: string;
    status: string;
    description: string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading?: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  newCampaign,
  setNewCampaign,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newCampaign.name.trim()) {
      return;
    }
    
    onSubmit(e);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Campaign Name *
            </label>
            <Input
              type="text"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={loading}
              placeholder="Campaign name"
              className="bg-white text-black border-gray-300"
            />
            {!newCampaign.name.trim() && (
              <p className="text-sm text-red-600 mt-1">Campaign name is required</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Campaign Type
            </label>
            <Select
              value={newCampaign.type}
              onValueChange={(value) => setNewCampaign(prev => ({ ...prev, type: value }))}
              disabled={loading}
            >
              <SelectTrigger className="bg-white text-black border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <Textarea
              value={newCampaign.description}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              disabled={loading}
              placeholder="Campaign description and objectives"
              className="bg-white text-black border-gray-300"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={loading || !newCampaign.name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Creating Campaign...' : 'Create Campaign'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="bg-white text-slate-700 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CampaignForm;
