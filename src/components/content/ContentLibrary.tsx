
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Clock,
  Tag,
  FileText,
  Archive
} from 'lucide-react';

export interface ContentLibraryProps {
  onPostSelect: (postId: string) => void;
}

export const ContentLibrary: React.FC<ContentLibraryProps> = ({ onPostSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const mockPosts = [
    {
      id: '1',
      title: 'Getting Started with AI Content Creation',
      category: 'tutorial',
      tags: ['AI', 'content', 'beginner'],
      performance: 'high',
      publishDate: '2024-01-15',
      status: 'published'
    },
    {
      id: '2', 
      title: 'Advanced Marketing Automation Strategies',
      category: 'strategy',
      tags: ['automation', 'marketing', 'advanced'],
      performance: 'medium',
      publishDate: '2024-01-10',
      status: 'published'
    }
  ];

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
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Content Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts by title, content, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
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
            {mockPosts.map((post) => (
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
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.publishDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {post.category}
                  </div>
                </div>

                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Knowledge Extraction Section */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Content Intelligence</h4>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate FAQ
              </Button>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Topic Clusters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
