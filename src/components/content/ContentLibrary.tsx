
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export interface ContentLibraryProps {
  onPostSelect: (postId: string) => void;
}

export const ContentLibrary: React.FC<ContentLibraryProps> = ({ onPostSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadContentPosts();
  }, []);

  const loadContentPosts = async () => {
    setLoading(true);
    try {
      // This would fetch from your content database
      // For now, return empty array since no content system is implemented yet
      setPosts([]);
    } catch (error) {
      console.error('Failed to load content posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'published') return post.status === 'published';
    if (selectedFilter === 'draft') return post.status === 'draft';
    if (selectedFilter === 'high-performance') return post.performance === 'high';
    if (selectedFilter === 'needs-update') return post.needsUpdate;
    return true;
  }).filter(post =>
    searchTerm === '' ||
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'high': return <Badge className="bg-green-100 text-green-800">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low': return <Badge className="bg-red-100 text-red-800">Low</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search posts by title, content, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              Filter
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'published', 'draft', 'high-performance', 'needs-update'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
              </Button>
            ))}
          </div>

          {/* Content List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading content...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No content found. Start creating content to build your library.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
              <div
                key={post.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onPostSelect(post.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{post.title}</h3>
                  {getPerformanceBadge(post.performance)}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span>{post.publishDate}</span>
                  <span>{post.category}</span>
                </div>

                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              ))
            )}
          </div>

          {/* Knowledge Extraction Section */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Content Intelligence</h4>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="sm">
                Generate FAQ
              </Button>
              <Button variant="outline" size="sm">
                Topic Clusters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
