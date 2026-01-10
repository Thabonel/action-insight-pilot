import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BrandSafetyFilter {
  id: string
  user_id: string
  filter_type: 'blocked_handle' | 'blocked_keyword' | 'blocked_domain'
  filter_value: string
  reason: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export const BrandSafetySettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<BrandSafetyFilter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newFilter, setNewFilter] = useState({
    type: 'blocked_handle' as const,
    value: '',
    reason: ''
  });

  useEffect(() => {
    if (user) {
      fetchFilters();
    }
  }, [user]);

  const fetchFilters = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('brand_safety_filters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFilters(data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Failed to load brand safety filters',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFilter = async () => {
    if (!user || !newFilter.value) {
      toast({
        title: 'Missing information',
        description: 'Please enter a filter value',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('brand_safety_filters')
        .insert({
          user_id: user.id,
          filter_type: newFilter.type,
          filter_value: newFilter.value.toLowerCase(),
          reason: newFilter.reason || null,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Filter added',
        description: `${newFilter.value} has been blocked`
      });

      setNewFilter({ type: 'blocked_handle', value: '', reason: '' });
      setShowAddForm(false);
      await fetchFilters();
    } catch (error) {
      console.error('Error adding filter:', error);

      const isDuplicateError = error && typeof error === 'object' && 'code' in error && error.code === '23505';
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      if (isDuplicateError) {
        toast({
          title: 'Filter already exists',
          description: 'This filter has already been added',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Failed to add filter',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilter = async (filterId: string, isActive: boolean) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('brand_safety_filters')
        .update({ is_active: !isActive })
        .eq('id', filterId);

      if (error) throw error;

      toast({
        title: isActive ? 'Filter deactivated' : 'Filter activated',
        description: `Filter has been ${isActive ? 'deactivated' : 'activated'}`
      });

      await fetchFilters();
    } catch (error) {
      console.error('Error toggling filter:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Failed to toggle filter',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFilter = async (filterId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('brand_safety_filters')
        .delete()
        .eq('id', filterId);

      if (error) throw error;

      toast({
        title: 'Filter deleted',
        description: 'The filter has been removed'
      });

      await fetchFilters();
    } catch (error) {
      console.error('Error deleting filter:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Failed to delete filter',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilterTypeLabel = (type: string) => {
    switch (type) {
      case 'blocked_handle':
        return 'Blocked Handle';
      case 'blocked_keyword':
        return 'Blocked Keyword';
      case 'blocked_domain':
        return 'Blocked Domain';
      default:
        return type;
    }
  };

  const getFilterTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'blocked_handle':
        return 'bg-blue-100 text-blue-700';
      case 'blocked_keyword':
        return 'bg-purple-100 text-purple-700';
      case 'blocked_domain':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Brand Safety Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">
                Protect your brand reputation
              </p>
              <p className="text-sm text-blue-800">
                Add filters to prevent controversial mentions, keywords, or domains from appearing in your posts.
                Blocked items will be flagged when detected.
              </p>
            </div>
          </div>
        </div>

        {/* Add Filter Button */}
        <div className="mb-6">
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            Add Brand Safety Filter
          </Button>
        </div>

        {/* Add Filter Form */}
        {showAddForm && (
          <div className="bg-gray-50 border rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">New Brand Safety Filter</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Type
                </label>
                <Select
                  value={newFilter.type}
                  onValueChange={(value) =>
                    setNewFilter({ ...newFilter, type: value as typeof newFilter.type })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blocked_handle">Blocked Handle (e.g., @competitor)</SelectItem>
                    <SelectItem value="blocked_keyword">Blocked Keyword (e.g., scandal)</SelectItem>
                    <SelectItem value="blocked_domain">Blocked Domain (e.g., badsite.com)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Value
                </label>
                <Input
                  type="text"
                  placeholder={
                    newFilter.type === 'blocked_handle'
                      ? 'competitor_handle'
                      : newFilter.type === 'blocked_keyword'
                      ? 'controversial_keyword'
                      : 'domain.com'
                  }
                  value={newFilter.value}
                  onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newFilter.type === 'blocked_handle' && 'Enter without @ symbol'}
                  {newFilter.type === 'blocked_keyword' && 'Enter the exact keyword to block'}
                  {newFilter.type === 'blocked_domain' && 'Enter the domain without https://'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (optional)
                </label>
                <Textarea
                  placeholder="Why are you blocking this?"
                  value={newFilter.reason}
                  onChange={(e) => setNewFilter({ ...newFilter, reason: e.target.value })}
                  className="min-h-20"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={addFilter}
                  disabled={isLoading || !newFilter.value}
                >
                  Add Filter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewFilter({ type: 'blocked_handle', value: '', reason: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && filters.length === 0 && (
          <div className="text-center p-6 text-gray-500">
            <p className="text-sm">Loading brand safety filters...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filters.length === 0 && (
          <div className="text-center p-6 text-gray-500">
            <p className="text-sm">
              No brand safety filters configured yet. Add filters to protect your brand reputation.
            </p>
          </div>
        )}

        {/* Filters List */}
        {filters.length > 0 && (
          <div className="space-y-3">
            {filters.map((filter) => (
              <div
                key={filter.id}
                className={`border rounded-lg p-4 ${
                  filter.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={getFilterTypeBadgeColor(filter.filter_type)}
                      >
                        {getFilterTypeLabel(filter.filter_type)}
                      </Badge>
                      {!filter.is_active && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <p className="font-semibold text-gray-900 mb-1">
                      {filter.filter_value}
                    </p>

                    {filter.reason && (
                      <p className="text-sm text-gray-600 mb-2">
                        Reason: {filter.reason}
                      </p>
                    )}

                    <p className="text-xs text-gray-500">
                      Added {new Date(filter.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFilter(filter.id, filter.is_active)}
                      disabled={isLoading}
                    >
                      {filter.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFilter(filter.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
