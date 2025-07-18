
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, SearchIcon, FilterIcon, Zap, Settings, BarChart3 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Campaign } from '@/lib/api-client-interface';

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const result = await apiClient.getCampaigns();
        
        if (result.success && result.data) {
          setCampaigns(result.data);
        } else {
          setError(result.error || 'Failed to fetch campaigns');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns & Automation</h1>
            <p className="text-gray-600 mt-1">Manage campaigns and marketing automation</p>
          </div>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="campaigns">Campaign Management</TabsTrigger>
            <TabsTrigger value="automation">Marketing Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Campaign Creation Buttons */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" asChild>
                <Link to="/app/campaigns/ai-generator">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Quick Generator
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Link to="/app/campaigns/copilot">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  AI Co-pilot
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/app/campaigns/new">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Manual
                </Link>
              </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <p className="text-red-600">Error: {error}</p>
                </CardContent>
              </Card>
            )}

            {/* Campaigns Grid */}
            {filteredCampaigns.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your search'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {campaigns.length === 0 
                        ? 'Get started by creating your first campaign'
                        : 'Try adjusting your search or filter criteria'
                      }
                    </p>
                    {campaigns.length === 0 && (
                      <Button asChild>
                        <Link to="/app/campaigns/new">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Campaign
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {campaign.description || 'No description provided'}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Type</span>
                          <span className="font-medium">{campaign.type}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Created</span>
                          <span className="font-medium">
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <Button asChild variant="outline" className="w-full">
                            <Link to={`/app/campaigns/${campaign.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            {/* Marketing Automation Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Workflow Builder */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Workflow Builder</CardTitle>
                      <p className="text-sm text-gray-600">Create automated workflows</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Design multi-step automation workflows with triggers, conditions, and actions.
                  </p>
                  <Button className="w-full">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </CardContent>
              </Card>

              {/* Email Automation */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Settings className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Email Sequences</CardTitle>
                      <p className="text-sm text-gray-600">Automated email campaigns</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Set up drip campaigns, welcome series, and behavioral email triggers.
                  </p>
                  <Button className="w-full" variant="outline">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Setup Sequence
                  </Button>
                </CardContent>
              </Card>

              {/* Lead Scoring */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Lead Scoring</CardTitle>
                      <p className="text-sm text-gray-600">Automated lead qualification</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Automatically score and qualify leads based on behavior and attributes.
                  </p>
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Rules
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Active Automations */}
            <Card>
              <CardHeader>
                <CardTitle>Active Automations</CardTitle>
                <p className="text-gray-600">Monitor your running automation workflows</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active automations</h3>
                  <p className="text-gray-600 mb-4">
                    Start automating your marketing processes to save time and improve efficiency.
                  </p>
                  <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Your First Automation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Automation Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Automation Templates</CardTitle>
                <p className="text-gray-600">Quick start with pre-built automation workflows</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <h4 className="font-medium mb-2">Welcome Series</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Automatically send a series of welcome emails to new subscribers.
                    </p>
                    <Button size="sm" variant="outline">Use Template</Button>
                  </div>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <h4 className="font-medium mb-2">Abandoned Cart Recovery</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Re-engage customers who left items in their shopping cart.
                    </p>
                    <Button size="sm" variant="outline">Use Template</Button>
                  </div>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <h4 className="font-medium mb-2">Lead Nurturing</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Gradually move leads through your sales funnel with targeted content.
                    </p>
                    <Button size="sm" variant="outline">Use Template</Button>
                  </div>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <h4 className="font-medium mb-2">Customer Onboarding</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Help new customers get started with educational content and tips.
                    </p>
                    <Button size="sm" variant="outline">Use Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Campaigns;

